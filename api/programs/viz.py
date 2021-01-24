import matplotlib.patches as patches
import matplotlib.pyplot as plt
import numpy as np
import pylab
import torch
from torchvision import transforms


def plot_labels(img,
                labels,
                color_dict={},
                cmap="rainbow",
                save_to=None,
                axis=False,
                **kwargs):
    img = transforms.ToPILImage()(img).convert("RGB")
    fig, ax = plt.subplots(1, **kwargs)
    ax.imshow(img)

    bboxes = labels["boxes"]
    categories = labels["labels"]
    if torch.is_tensor(bboxes):
        bboxes = bboxes.cpu().numpy()
    if torch.is_tensor(categories):
        categories = categories.cpu().numpy()

    # set colors
    if not color_dict:
        colors = {}
        cats_unique = np.unique(categories)
        for i, cat in enumerate(cats_unique):
            colors[cat] = pylab.get_cmap(cmap)(1.0 * i / len(cats_unique))
    else:
        colors = color_dict

    for i, (x1, y1, x2, y2) in enumerate(bboxes):
        cat = categories[i]
        bbox = patches.Rectangle(
            (x1, y1),
            x2 - x1,
            y2 - y1,
            linewidth=2,
            edgecolor=colors[cat],
            facecolor="none",
            alpha=0.5,
        )
        ax.add_patch(bbox)

    # remove axis
    if not axis:
        plt.axis("off")

    if save_to:
        plt.savefig(save_to, bbox_inches='tight', pad_inches=0)
    else:
        plt.show()


def make_crop(img, bbox, save_to):
    img = transforms.ToPILImage()(img).convert("RGB")
    crop = img.crop(bbox)
    crop.save(save_to, 'PNG')
