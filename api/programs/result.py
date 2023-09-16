from programs.viz import plot_labels, make_crop
import pandas as pd
import numpy as np
from pathlib import Path
import time
import io


class Result:
    def __init__(
        self,
        id,
        fname,
        img,
        pred,
        n_digits=2,
        color_dict={
            'uninfected': '#808080',
            'ring': '#f77189',
            'trophozoite': '#50b131',
            'schizont': '#3ba3ec',
            'gametocyte': '#ffd92f'
        }):
        self.id = id
        self.fname = fname
        self.img = img
        self.pred = pred
        self.n_digits = n_digits
        self.color_dict = color_dict
        self.files = {}
        self.run()

    def __len__(self):
        return len(self.pred)

    def run(self):
        self.counts = self.pred['classes'].value_counts()
        self.n_infected = self.counts[
            'infected'] if 'infected' in self.counts.keys() else 0
        self.n_uninfected = self.counts[
            'uninfected'] if 'uninfected' in self.counts.keys() else 0
        self.parasitemia = round(self.n_infected / len(self), self.n_digits)
        self.life_stage_counts = self.pred['life_stage_c'].value_counts()
        self.asex = self.get_asexuals()
        #self.plot_prediction()

    def get_boxes(self):
        infected_rows =self.pred.loc[self.pred['classes']== 'infected']
        boxes = []
        infected_rows = infected_rows.sort_values(by=['life_stage'])
        
        for index, row in infected_rows.iterrows():
            
            boxes.append({
                'b': [round(i) for i in row['boxes']],
                'l': round(row['life_stage'],2)
            })
     
        return boxes
    
    def to_output(self):
        def _transform_name(fname):
            """Transforms local filename by removing prefix dir."""
            if fname.startswith('/'):
                fname = fname[1:]
            return '/'.join(fname.split('/')[1:])
        return {
            'id':  self.id,#int(self.id),
            'name': self.fname,
            'n_cells': int(len(self)),
            'n_infected': int(self.n_infected),
            'n_uninfected': int(self.n_uninfected),
            'parasitemia': float(self.parasitemia),
            'n_ring': int(self.life_stage_counts.get('ring', 0)),
            'n_troph': int(self.life_stage_counts.get('trophozoite', 0)),
            'n_schizont': int(self.life_stage_counts.get('schizont', 0)),
            'n_gam': int(self.life_stage_counts.get('gametocyte', 0)),
            'asex_stages': list(self.asex['life_stage']),
            'asex_images': list(self.asex['filename']),
            'boxes': self.get_boxes()
        }

    
    def get_asexuals(self, stages=['ring', 'trophozoite', 'schizont']):
        asex = self.pred.loc[self.pred['life_stage_c'].isin(
            stages)].reset_index()
        asex['filename'] = asex['index'].apply(
            lambda x: str(Path(self.id) / ('%s.png' % x)))
        for i, row in asex.T.iteritems():
            buf = io.BytesIO()
            make_crop(self.img, row['boxes'], buf)
            self.files[row['filename']] = buf
        asex.sort_values('life_stage', inplace=True)
        asex['life_stage'] = asex['life_stage'].apply(
            lambda x: round(x, self.n_digits))
        return asex[['filename', 'life_stage']]

    def plot_prediction(self, **kwargs):
        fname = str(Path(self.id) / 'result.png')
        buf = io.BytesIO()
        plot_labels(self.img, {
            'boxes': self.pred['boxes'].tolist(),
            'labels': self.pred['life_stage_c'].tolist()
        },
                    save_to=buf,
                    color_dict=self.color_dict,
                    **kwargs)
        self.files[fname] = buf
        