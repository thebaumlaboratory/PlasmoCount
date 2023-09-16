import pandas as pd
import itertools


def summarize(results):
    """ Concatenate results and summarize """
    boxes_summary = []
    results = pd.DataFrame(results)
   
    for image_index ,image_box in results.iterrows():
        
        for box_index,box in enumerate(results.iloc[image_index]['boxes']):
          
            boxes_summary.append({'image':image_index,
                                  'box_index': box_index,
                                  'life':box['l']})

    asex = pd.concat(
        [results['asex_stages'].explode(), results['asex_images'].explode()],
        axis=1).reset_index(drop=True).dropna()
    asex.sort_values('asex_stages', inplace=True)
    boxes_summary = sorted(boxes_summary,key=lambda d: d['life'])
    
    
    summary = {
        'name': 'total',
        'asex_stages': list(asex['asex_stages']),
        'asex_images': list(asex['asex_images']),
        'boxes': boxes_summary,
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