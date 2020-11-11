from pathlib import Path
import pandas as pd
from PIL import Image as PILImage
import torch
from torchvision import transforms, ops
from fastai.basic_train import load_learner
from fastai.vision import Image
from fastai.core import FloatItem
import matplotlib.pyplot as plt
from scipy import stats


class Model:
    def __init__(self,
                 model_path='./models',
                 od_model='faster-rcnn.pt',
                 class_model='class_resnet.pkl',
                 ls_model='ls_resnet.pkl',
                 gam_model='gam_resnet.pkl'):
        model_path = Path(model_path)
        device = torch.device(
            'cuda') if torch.cuda.is_available() else torch.device('cpu')
        self.od_model = torch.load(str(model_path / od_model), device)
        self.od_model.eval()
        self.class_model = load_learner(path=model_path, file=class_model)
        self.ls_model = load_learner(path=model_path, file=ls_model)
        self.gam_model = load_learner(path=model_path, file=gam_model)

    def load_image(self, fileName):
        self.fileName = fileName
        img = PILImage.open(self.fileName).convert("RGB")
        tensor = transforms.ToTensor()(img)
        self.img = tensor
        return tensor

    def predict(self):
        with torch.no_grad():
            prediction = self.od_model([self.img])[0]
            prediction = self.post_processing(prediction)
            # get crops for class detection
            classes = []
            life_stages = []
            for bbox in prediction['boxes']:
                x0, y0, x1, y1 = bbox.int()
                bbox_img = Image(self.img[:, y0:y1, x0:x1])
                bbox_pred = self.class_model.predict(bbox_img)
                if str(bbox_pred[0]) == 'infected':
                    gam_pred = self.gam_model.predict(bbox_img)
                    if str(gam_pred[0]) == 'asexual':
                        ls_pred = self.ls_model.predict(bbox_img)
                    else:
                        ls_pred = [FloatItem(-1)]
                    life_stages.append(ls_pred)
                else:
                    life_stages.append(None)
                classes.append(bbox_pred)

        # format predictions
        prediction['boxes'] = prediction['boxes'].tolist()
        classes = pd.Series(classes)
        prediction['classes'] = classes.apply(lambda x: str(x[0]))
        prediction['p_classes'] = classes.apply(lambda x: x[2][x[1]])
        life_stages = pd.Series(life_stages)
        prediction['life_stage'] = life_stages.apply(
            lambda x: float(x[0].data) if x is not None else None)
        pred_df = pd.DataFrame.from_dict(prediction,
                                         orient='index').transpose()
        return pred_df

    def post_processing(self,
                        pred,
                        score_thresh=0.75,
                        iou_thresh=0.5,
                        z_thresh=4):
        pred = self.apply_score_filter(pred, score_thresh)
        pred = self.apply_nms(pred, iou_thresh)
        pred = self.apply_size_filter(pred, z_thresh)
        return pred

    def apply_nms(self, pred, iou_thresh):
        idx = ops.nms(pred["boxes"], pred["scores"], iou_thresh)
        for i in ["boxes", "labels", "scores"]:
            pred[i] = pred[i][idx]
        return pred

    def apply_score_filter(self, pred, thresh):
        idx = [i for i, score in enumerate(pred['scores']) if score > thresh]
        for i in ["boxes", "labels", "scores"]:
            pred[i] = pred[i][idx]
        return pred

    def calc_area(self, coods):
        return abs((coods[:, 2] - coods[:, 0]) * (coods[:, 3] - coods[:, 1]))

    def apply_size_filter(self, pred, z_thresh):
        area = self.calc_area(pred['boxes'])
        zscores = stats.zscore(area)
        idx = [i for i, score in enumerate(zscores) if abs(score) < z_thresh]
        for i in ["boxes", "labels", "scores"]:
            pred[i] = pred[i][idx]
        return pred
