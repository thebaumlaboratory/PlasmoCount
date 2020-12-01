import numpy as np
from pathlib import Path
from torch import nn
from torch.utils.data.sampler import WeightedRandomSampler
from fastai.basic_train import Learner, LearnerCallback
from fastai.vision import ImageList, Tensor, DoubleTensor, Rank0Tensor


def split_boxes(bounding_box):
    r_max = bounding_box["maximum"]["r"]
    r_min = bounding_box["minimum"]["r"]
    c_max = bounding_box["maximum"]["c"]
    c_min = bounding_box["minimum"]["c"]

    return c_min, r_min, c_max, r_max


def crop_bbox(image, bbox, fixed_size=None):
    x0, y0, x1, y1 = split_boxes(bbox)

    if fixed_size:

        # don't draw bounding boxes outside
        _, max_y, max_x = image.shape

        centroid_x = int(np.mean([x0, x1]))
        if (centroid_x - fixed_size) < 0:
            x0 = 0
            x1 = fixed_size
        elif (centroid_x + fixed_size) > max_x:
            x0 = max_x - fixed_size
            x1 = max_x
        else:
            x0 = centroid_x - fixed_size
            x1 = centroid_x + fixed_size

        centroid_y = int(np.mean([y0, y1]))
        if (centroid_y - fixed_size) < 0:
            y0 = 0
            y1 = fixed_size
        elif (centroid_y + fixed_size) > max_y:
            y0 = max_y - fixed_size
            y1 = max_y
        else:
            y0 = centroid_y - fixed_size
            y1 = centroid_y + fixed_size

    return image[:, y0:y1, x0:x1]


class ImageCropList(ImageList):
    def __init__(self, items, images=None, fixed_size=None, **kwargs):
        super().__init__(items, **kwargs)
        self.images = images
        self.fixed_size = fixed_size
        self.copy_new.append('images')
        self.copy_new.append('fixed_size')

    def get(self, i):
        item = self.items[i]
        image = item[0]
        bbox = item[1]

        fn = self.images.loc[image].pathname[1:]
        res = self.open(bbox, fn)
        return res

    def open(self, bbox, fn):
        image = open_image(self.path / fn)
        image.px = crop_bbox(image.px, bbox, fixed_size=self.fixed_size)
        return image


def exp_from_path(path):
    path = Path(path)
    pathname = path.name
    split = pathname.split('_')
    experiment = split[1] if len(split) > 1 else 'external'
    return experiment


class SampleWeights():
    def __init__(self, data, n_classes, weights=None):
        self.data = data
        self.weights = weights
        self.n_classes = n_classes

    def by_class(self, oversample=False):
        labels = self.data.y.items
        _, label_counts = np.unique(labels, return_counts=True)
        if self.weights is None:
            weights = DoubleTensor((1 / label_counts)[labels])
        func = np.max if oversample else np.min
        total_len_undersample = int(self.n_classes * func(label_counts))
        return weights, total_len_undersample

    def by_experiment(self, oversample=True):
        imgs = self.data.x.items[:, 0]
        pathnames = self.data.x.images.pathname[imgs]
        experiments = pathnames.apply(exp_from_path)
        label_counts = experiments.value_counts()
        if self.weights is None:
            weights = DoubleTensor((1 / label_counts)[experiments])
        func = np.max if oversample else np.min
        total_len_oversample = int(len(label_counts) * func(label_counts))
        return weights, total_len_oversample

    def combine_weights(self):
        weights1, n_samples = self.by_class()
        weights2, _ = self.by_experiment()
        weights = weights1 * weights2
        return weights, n_samples


class ExperimentCallback(LearnerCallback):
    def __init__(self, learn: Learner, weights: Tensor = None):
        super().__init__(learn)
        self.weights = weights

    def on_train_begin(self, **kwargs):
        self.old_dl = self.data.train_dl
        weights, n_samples = SampleWeights(self.data.train_dl, self.data.c,
                                           self.weights).by_class()
        sampler = WeightedRandomSampler(weights, n_samples)
        self.data.train_dl = self.data.train_dl.new(shuffle=False,
                                                    sampler=sampler)

    def on_train_end(self, **kwargs):
        "Reset dataloader to its original state"
        self.data.train_dl = self.old_dl


class AgeModel(nn.Module):
    def __init__(self):
        super().__init__()
        layers = list(models.resnet34(pretrained=True).children())[:-2]
        layers += [AdaptiveConcatPool2d(), Flatten()]
        layers += [
            nn.BatchNorm1d(1024,
                           eps=1e-05,
                           momentum=0.1,
                           affine=True,
                           track_running_stats=True)
        ]
        layers += [nn.Dropout(p=0.50)]
        layers += [nn.Linear(1024, 512, bias=True), nn.ReLU(inplace=True)]
        layers += [
            nn.BatchNorm1d(512,
                           eps=1e-05,
                           momentum=0.1,
                           affine=True,
                           track_running_stats=True)
        ]
        layers += [nn.Dropout(p=0.50)]
        layers += [nn.Linear(512, 16, bias=True), nn.ReLU(inplace=True)]
        layers += [nn.Linear(16, 1)]
        self.agemodel = nn.Sequential(*layers)

    def forward(self, x):
        return self.agemodel(x).squeeze(-1)


class L1LossFlat(nn.SmoothL1Loss):
    def forward(self, input: Tensor, target: Tensor) -> Rank0Tensor:
        return super().forward(input.view(-1), target.view(-1))
