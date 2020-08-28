from pathlib import Path
import pandas as pd
from PIL import Image as PILImage
import torch
from torchvision import transforms
from fastai.basic_train import load_learner
from fastai.vision import Image


class Model:
    def __init__(self,
                 model_path='./models',
                 od_model='faster-rcnn.pt',
                 class_model='resnet.pkl'):
        model_path = Path(model_path)
        device = torch.device(
            'cuda') if torch.cuda.is_available() else torch.device('cpu')
        self.od_model = torch.load(model_path / od_model)
        self.od_model.eval()
        self.class_model = load_learner(path=model_path, file=class_model)

    def load_image(self, fileName):
        self.fileName = fileName
        img = PILImage.open(self.fileName).convert("RGB")
        tensor = transforms.ToTensor()(img)
        self.img = tensor
        return tensor

    def predict(self):
        prediction = self.od_model([self.img])[0]
        # get crops for class detection
        classes = []
        for bbox in prediction['boxes']:
            x0, y0, x1, y1 = bbox.int()
            bbox_img = Image(self.img[:, y0:y1, x0:x1])
            bbox_pred = self.class_model.predict(bbox_img)
            classes.append(bbox_pred)

        # make predictions
        prediction['classes'] = classes
        prediction['boxes'] = prediction['boxes'].tolist()
        pred_df = pd.DataFrame.from_dict(prediction,
                                         orient='index').transpose()
        return pred_df
