from viz import plot_labels
import time


class Result:
    def __init__(self, id, fname, img, pred):
        self.id = id
        self.fname = fname
        self.img = img
        self.pred = pred

    def run(self, save_to):
        self.n_cells = len(self.pred)
        self.pred['category'] = self.pred['classes'].apply(lambda x: str(x[0]))
        self.counts = self.pred['category'].value_counts()
        self.n_infected = self.counts['infected']
        self.n_uninfected = self.counts['uninfected']
        self.parasitemia = round(self.n_infected / self.n_cells, 2)
        self.plot = self.plot_prediction(save_to=save_to)

    def to_output(self):
        return {
            'id': int(self.id),
            'name': str(self.fname),
            'n_cells': int(self.n_cells),
            'n_infected': int(self.n_infected),
            'n_uninfected': int(self.n_uninfected),
            'parasitemia': float(self.parasitemia),
            'plot': str(self.plot)
        }

    def plot_prediction(self, save_to, **kwargs):
        plot_labels(self.img, {
            'boxes': self.pred['boxes'].tolist(),
            'labels': self.pred.category
        },
                    save_to=save_to,
                    **kwargs)
        return save_to