import pandas as pd


def summarize(results):
    """ Concatenate results and summarize """
    boxes_summary = []
    results = pd.DataFrame(results)
   
    for image_index ,image_box in results.iterrows():
        
        for box_index,box in enumerate(results.iloc[image_index]['boxes']):
          
            if "l" in box:
                boxes_summary.append({'image':image_index,
                                    'box_index': box_index,
                                    'life':box['l']})

    boxes_summary = sorted(boxes_summary,key=lambda d: d['life'])
    
    
    summary = {
        'name': 'total',
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