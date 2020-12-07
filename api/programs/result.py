from programs.viz import plot_labels, make_crop
import pandas as pd
from pathlib import Path
import time


class Result:
    def __init__(
            self,
            id,
            fname,
            img,
            pred,
            color_dict={
                'uninfected': '#808080',
                'ring': '#f77189',
                'trophozoite': '#50b131',
                'schizont': '#3ba3ec',
                'gametocyte': '#ffd92f'
            },
            cutoffs=[1.5, 2.5],
            asex_digits=2):
        self.id = id
        self.fname = fname
        self.img = img
        self.pred = pred
        self.color_dict = color_dict
        self.cutoffs = cutoffs
        self.asex_digits = asex_digits

    def run(self, upload_folder):
        self.path = upload_folder / self.id
        self.path.mkdir(exist_ok=True)

        # general measures
        self.n_cells = len(self.pred)

        # infected cells
        self.calc_parasitaemia()

        # life stages
        self.pred['life_stage_c'] = self.pred['life_stage'].apply(
            lambda x: self.calc_life_stages(x))
        self.life_stage_counts = self.pred['life_stage_c'].value_counts()
        self.asex = self.get_asexuals(upload_folder)

        # plotting
        self.plot = Path(self.id) / 'full.png'
        self.plot_prediction(save_to=upload_folder / self.plot)

    def to_output(self):
        return {
            'id': int(self.id),
            'name': str(self.fname),
            'n_cells': int(self.n_cells),
            'n_infected': int(self.n_infected),
            'n_uninfected': int(self.n_uninfected),
            'parasitemia': float(self.parasitemia),
            'plot': str(self.plot),
            'n_ring': int(self.life_stage_counts.get('ring', 0)),
            'n_troph': int(self.life_stage_counts.get('trophozoite', 0)),
            'n_schizont': int(self.life_stage_counts.get('schizont', 0)),
            'n_gam': int(self.life_stage_counts.get('gametocyte', 0)),
            'asex_stages': list(self.asex['life_stage']),
            'asex_images': list(self.asex['filename'])
        }

    def calc_life_stages(self, x):
        RT_cutoff, TS_cutoff = self.cutoffs
        if not x:
            return 'uninfected'
        elif (x >= 0) & (x <= RT_cutoff):
            return 'ring'
        elif (x > RT_cutoff) & (x <= TS_cutoff):
            return 'trophozoite'
        elif (x > TS_cutoff):
            return 'schizont'
        elif (x == -1):
            return 'gametocyte'
        else:
            return 'uninfected'

    def calc_parasitaemia(self):
        self.counts = self.pred['classes'].value_counts()
        self.n_infected = self.counts[
            'infected'] if 'infected' in self.counts.keys() else 0
        self.n_uninfected = self.counts[
            'uninfected'] if 'uninfected' in self.counts.keys() else 0
        self.parasitemia = round(self.n_infected / self.n_cells, 2)

    def get_asexuals(self,
                     upload_folder,
                     stages=['ring', 'trophozoite', 'schizont']):
        asex = self.pred.loc[self.pred['life_stage_c'].isin(
            stages)].reset_index()
        asex['filename'] = asex['index'].apply(
            lambda x: str(Path(self.id) / ('%s.png' % x)))
        asex.apply(lambda x: make_crop(self.img, x['boxes'], upload_folder / x[
            'filename']),
                   axis=1)
        asex.sort_values('life_stage', inplace=True)
        asex['life_stage'] = asex['life_stage'].apply(
            lambda x: round(x, self.asex_digits))
        return asex[['filename', 'life_stage']]

    def plot_prediction(self, save_to, **kwargs):
        plot_labels(self.img, {
            'boxes': self.pred['boxes'].tolist(),
            'labels': self.pred['life_stage_c'].tolist()
        },
                    color_dict=self.color_dict,
                    save_to=save_to,
                    **kwargs)
        return save_to
