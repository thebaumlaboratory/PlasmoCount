import pandas as pd
import itertools


def summarize(results):
    """ Concatenate results and summarize """
    results = pd.DataFrame(results)
    asex = pd.concat(
        [results['asex_stages'].explode(), results['asex_images'].explode()],
        axis=1).reset_index(drop=True).dropna()
    asex.sort_values('asex_stages', inplace=True)
    summary = {
        'name': 'total',
        'asex_stages': list(asex['asex_stages']),
        'asex_images': list(asex['asex_images']),
        'n_ring': sum(results['n_ring']),
        'n_troph': sum(results['n_troph']),
        'n_schizont': sum(results['n_schizont']),
        'n_gam': sum(results['n_gam']),
        'n_cells': sum(results['n_cells']),
        'n_uninfected': sum(results['n_uninfected']),
        'n_infected': sum(results['n_infected']),
        'parasitemia': results['parasitemia'].mean()
    }
    return summary
