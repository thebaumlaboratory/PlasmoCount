from ultralytics import YOLO
from ultralytics.utils.ops import non_max_suppression
from fastai import *
from fastai.vision.all import *
import torchvision.transforms as T
import timm
from PIL import Image as PILImage
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import time
import torch
from torchvision.ops import nms
CLASSICIFATION_IMAGE_SIZE = (70,70)
CLASSICIFATION_BATCH_SIZE = 16
IOU_THRESHOLD = 0.5
#convert and normalize image
preprocess = T.Compose([                                 
    T.ToTensor(),                       
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

class Model():
    def __init__(self):
        self.is_loaded = False
    def load(self):
        device = torch.device("cpu")
        self.od_model = YOLO('./models/yolov8n.pt')
        self.od_model.to(device)
        self.cls_model  = load_learner('./models/classification_model')
        self.cls_model.to(device)
        self.lifecycle_model= torch.load('./models/lifecycle_model')
        self.lifecycle_model.eval()
        self.gametocyte_model= torch.load('./models/gametocyte_model')
        self.gametocyte_model.eval()
        self.is_loaded = True

    def predict(self,image_file,image_id,check_for_gametoctyes,magnification=100):
        
        image_name = image_file.filename
        image = PILImage.open(image_file)
        t = time.time()
        bboxes = self.detect_RBCs_100x(image) if magnification == 100 else self.detect_RBCs_40x(image)
        print('object detection')
        print(time.time()-t)
        if len(bboxes) == 0:
            #then we have nothing to classify so we return
            return self.summarise_image([],image_name,image_id), image
        RBC_data = self.classify_RBCs(bboxes,image,check_for_gametoctyes)
        
        return self.summarise_image(RBC_data,image_name,image_id), image


    #returns a list of predicted bboxes in xyxy format
    def detect_RBCs_100x(self,image,get_conf_scores=False):
       
        results = self.od_model(image,iou=IOU_THRESHOLD,verbose=False)
        bboxes = []
        scores = []
        for result in results:
            for conf_scores,box_scaled_0_1, boxxyxy in zip(result.boxes.conf,result.boxes.xyxyn,result.boxes.xyxy):
                #exclude boxes partially outside of FOV
                if box_scaled_0_1[3] < .999 and box_scaled_0_1[2] < .999 and box_scaled_0_1[0] > 0.001 and box_scaled_0_1[1] > 0.001:
                    bboxes.append(boxxyxy.type(torch.int32).cpu().tolist())
                    if get_conf_scores:
                        scores.append(conf_scores.cpu().item())
        if get_conf_scores:
            return bboxes, scores
        return bboxes
    
    #crop the image into 9 separate sub-images 
    def detect_RBCs_40x(self,image):
        
        image_width, image_height = image.size
        def offset_boxes(x_off,y_off,subimage_bboxes):
            for box in subimage_bboxes:

                box[0] = (box[0] + x_off)* image_width / 1600  
                box[1] = (box[1] + y_off)* image_height / 1600  
                box[2] = (box[2] + x_off)* image_width / 1600  
                box[3] = (box[3] + y_off)* image_height / 1600  
            return subimage_bboxes
        
        bboxes, scores = [], []
        for x in range(0,1440,480):
            for y in range(0,1440,480):
                sub_image = image.resize((1600,1600)).crop((x,y,x+640,y+640))

                subimage_bboxes, subimage_scores = self.detect_RBCs_100x(sub_image,True)
                offset = offset_boxes(x,y,subimage_bboxes)
                bboxes += offset
                scores += subimage_scores

        good_indices = nms(torch.tensor(bboxes, dtype=torch.float32), torch.tensor(scores),iou_threshold=IOU_THRESHOLD)
        return [bboxes[i] for i in good_indices ]   
    # returns a list of dicts containing information about infection and lifestage
    def classify_RBCs(self,bboxes,PIL_image,check_for_gametoctyes):
        
        uninfected_dictionary = []
        infected_dictionary = []
        img_list = []
        infected_indices = []
        #load images into a list
        for bbox in bboxes:
            crop = PIL_image.crop(bbox).resize(CLASSICIFATION_IMAGE_SIZE).convert("RGB")
            img_list.append( [preprocess(crop)])

        #load the data into batches with the fastai Dataloader https://docs.fast.ai/data.load.html
        dl = DataLoader(img_list, batch_size=CLASSICIFATION_BATCH_SIZE, shuffle=False)
        print("classification")
        t = time.time()
        pred = self.cls_model.get_preds(dl=dl)
        
        print(time.time()-t)
        for index in range(0,len(pred[0])):
            if pred[0][index][0] < pred[0][index][1]:
                infected_indices.append(index)
                infected_dictionary.append({'b':bboxes[index]})
            else:
                uninfected_dictionary.append({'b':bboxes[index]})
        
        #get the images that are infected
        infected_image_list = [img_list[i][0] for i in infected_indices]
        #on each infected cell we predict if it's a gametocyte and its lifestage
        gametocytes = None
        if len(infected_indices) > 0:
            if check_for_gametoctyes:
                gametocytes = self.classify_gametocytes(infected_image_list)
            t= time.time()
            infected_lifestages = self.age_infected(infected_image_list)
            print("lifecycle")
            print(time.time()-t)
            for infected_index in range(0,len(infected_dictionary)):
                if check_for_gametoctyes and gametocytes[infected_index]:
                    infected_dictionary[infected_index]['l'] = -1
                else:
                    infected_dictionary[infected_index]['l'] = round(infected_lifestages[infected_index][0].item(),2)
            
            infected_dictionary.sort(key= lambda cell: cell['l'])
        
            return infected_dictionary + uninfected_dictionary 
        return uninfected_dictionary
    def age_infected(self,image_list):
        with torch.no_grad():
            t = torch.stack(image_list, dim=0)
            output = self.lifecycle_model(t)
            
        return output
    
    def classify_gametocytes(self,image_list):
        with torch.no_grad():
            t = torch.stack(image_list, dim=0)
            output = self.gametocyte_model(t)
            batch_prediction = torch.where(output[:,0] < output[:,1],True,False)
            
        return batch_prediction.tolist()

    def summarise_image(self,RBC_data,image_name,image_id,cutoffs=[1.5,2.5]):
        n_infected = 0
        n_uninfected = 0
        n_ring = 0
        n_troph = 0
        n_schizont = 0
        n_gam = 0
        parasitemia = 0
        n_cells = len(RBC_data)
        for cell in RBC_data:
            if "l" in cell:
                n_infected +=1
                if cell['l'] == -1:
                    n_gam+=1
                elif cell['l'] < cutoffs[0]:
                    n_ring +=1
                elif cell['l'] < cutoffs[1]:
                    n_troph +=1
                else:
                    n_schizont +=1

        n_uninfected = n_cells - n_infected
        if(n_cells > 0):
            parasitemia = round(n_infected / n_cells,3)
        else:
            parasitemia = 0
        result = {
            "id" : image_id,
            "name": image_name,
            "n_cells": n_cells,
            "n_infected": n_infected,
            "n_uninfected": n_uninfected,
            "parasitemia": parasitemia,
            "n_ring": n_ring,
            "n_troph": n_troph,
            "n_schizont": n_schizont,
            "n_gam" : n_gam,
            "boxes" : RBC_data,
        }
        return result

    #helper function for visualisation (never called in prod)
    def plot_boxes(self,image):
        
        boxes = self.detect_RBCs_40x(image)
        
        boxes = self.classify_RBCs(boxes,image,True)
        fig, ax = plt.subplots()
        
        plt.imshow(image)
        plt.axis('off')
        for box in boxes:
            
            if "l" in box:
                if box['l'] == -1:
                    rect = patches.Rectangle((box['b'][0],box['b'][1]),(box['b'][2]-box['b'][0]),(box['b'][3]-box['b'][1]), linewidth=2, edgecolor='pink', facecolor='none')
                    ax.add_patch(rect)
                elif box['l'] < 1.5:
                    rect = patches.Rectangle((box['b'][0],box['b'][1]),(box['b'][2]-box['b'][0]),(box['b'][3]-box['b'][1]), linewidth=2, edgecolor='r', facecolor='none')
                    ax.add_patch(rect)
                elif box['l'] < 2.5:
                    rect = patches.Rectangle((box['b'][0],box['b'][1]),(box['b'][2]-box['b'][0]),(box['b'][3]-box['b'][1]), linewidth=2, edgecolor='g', facecolor='none')
                    ax.add_patch(rect)
                else:
                    rect = patches.Rectangle((box['b'][0],box['b'][1]),(box['b'][2]-box['b'][0]),(box['b'][3]-box['b'][1]), linewidth=2, edgecolor='b', facecolor='none')
                    ax.add_patch(rect)
            else:
                rect = patches.Rectangle((box['b'][0],box['b'][1]),(box['b'][2]-box['b'][0]),(box['b'][3]-box['b'][1]), linewidth=1, edgecolor='grey', facecolor='none')
                ax.add_patch(rect)
        plt.show()

    
