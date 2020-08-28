from pathlib import Path

import imgaug.augmenters as iaa
import numpy as np
import pandas as pd
from PIL import Image
from imgaug.augmentables.bbs import BoundingBox, BoundingBoxesOnImage


def to_r_c_array(bbox):
    bbox_arr = bbox.to_xyxy_array().astype(int)
    cat = np.array([b.label for b in bbox])
    arr = np.column_stack((bbox_arr, cat))

    func = lambda x: {
        "bounding_box": {
            "minimum": {"r": int(x[1]), "c": int(x[0])},
            "maximum": {"r": int(x[3]), "c": int(x[2])},
        },
        "category": x[4],
    }

    r_c_arr = list(np.apply_along_axis(func, 1, arr))

    return r_c_arr


def make_crops(
    item, data_path, output_dir, size, n_objects_x=2, max_crops=100, oversample_x=4
):
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # open image
    img_path = Path(data_path) / item["image"]["pathname"].strip("/")
    img = Image.open(img_path).convert("RGB")
    img = np.array(img)

    # get bounding boxes
    obj = pd.DataFrame(item["objects"])
    boxes = obj.bounding_box.apply(split_boxes)
    labels = obj["category"]
    objects = [BoundingBox(*b, labels[i]) for i, b in enumerate(boxes)]
    bbs = BoundingBoxesOnImage(objects, shape=img.shape)

    n_objects = 0
    crops = []
    while n_objects < n_objects_x * len(objects) and len(crops) < max_crops:

        crop_img, bbox = iaa.CropToFixedSize(*size)(image=img, bounding_boxes=bbs)

        bbox.remove_out_of_image_()  # remove bounding boxes completely out of image
        if len(bbox) == 0:
            continue  # don't include crops without any cells
        n_objects += len(bbox)

        # oversample
        labels = [b.label for b in bbox.items]
        is_multiple = len(set(labels)) > 1
        if is_multiple:
            crops.extend(((crop_img, bbox),) * oversample_x)
        else:
            crops.append((crop_img, bbox))

    targets = []

    for i, (crop_img, bbox) in enumerate(crops):
        crop_filename = Path(img_path.name[:-4] + "_%s.png" % i)
        crop_pathname = str(output_dir / crop_filename)
        Image.fromarray(crop_img).save(crop_pathname, "PNG")
        objects = to_r_c_array(bbox)

        targets.append({"image": {"pathname": crop_pathname}, "objects": objects})

    return targets


def calc_area(bounding_box):
    maximum = bounding_box["maximum"]
    minimum = bounding_box["minimum"]

    r_delta = maximum["r"] - minimum["r"]
    c_delta = maximum["c"] - minimum["c"]

    return r_delta * c_delta


def split_boxes(bounding_box):
    r_max = bounding_box["maximum"]["r"]
    r_min = bounding_box["minimum"]["r"]
    c_max = bounding_box["maximum"]["c"]
    c_min = bounding_box["minimum"]["c"]

    return c_min, r_min, c_max, r_max
