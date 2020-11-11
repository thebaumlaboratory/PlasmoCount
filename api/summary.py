import pandas as pd


def summarize(results, life_stages):
    """ Concatenate results and summarize """
    results = pd.DataFrame(results)
    life_stages = pd.concat(life_stages).reset_index(drop=True)
    life_stages.sort_values('life_stage', inplace=True)
    summary = {
        'asex_total': list(life_stages['life_stage']),
        'asex_images': list(life_stages['filename']),
        'n_ring': sum(results['n_ring']),
        'n_troph': sum(results['n_troph']),
        'n_schizont': sum(results['n_schizont']),
        'n_gam': sum(results['n_gam']),
        'n_uninfected': sum(results['n_uninfected']),
        'n_infected': sum(results['n_infected']),
        'parasitemia': results['parasitemia'].mean()
    }
    return summary