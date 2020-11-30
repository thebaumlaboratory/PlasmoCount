from flask import Flask, request, jsonify, render_template
from flask_cors import CORS, cross_origin
from pathlib import Path
import matplotlib
import warnings
import json
import time
from model import Model
from result import Result
from summary import summarize

matplotlib.use('Agg')
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app, support_credentials=True)


@app.route('/api/model', methods=['POST'])
def run_model(upload_folder='static/uploads/'):
    job_id = request.form['id']
    upload_folder = Path(upload_folder) / job_id
    upload_folder.mkdir(exist_ok=True)

    # get files
    files = request.files

    # load model
    has_gams = request.form.get('has-gams') == 'true'
    model = Model(has_gams=has_gams)

    results = []
    for i in files:
        # load result
        img = model.load_image(files[i])
        pred = model.predict()
        result = Result(i, files[i].filename, img, pred)
        result_dir = Path('%s/%s' % (upload_folder, i))
        result.run(save_to=result_dir)
        results.append(result.to_output())

    #get summary statistics
    summary = summarize(results)

    output = {
        'results': {
            'summary': summary,
            'results': results
        },
        'statusOK': True
    }

    with open(upload_folder / 'output.json', 'w') as f:
        json.dump(output, f)
    return output


@app.route('/api/result', methods=['POST'])
def return_result(upload_folder='static/uploads/',
                  example_folder='static/example'):
    job_id = request.get_json()['id']
    if job_id == 'example':
        result_dir = Path(example_folder)
    else:
        result_dir = Path(upload_folder) / job_id

    result_path = result_dir / 'output.json'
    if result_path.exists():
        with open(result_path) as f:
            return json.load(f)
    else:
        return {'statusOK': False}


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', threaded=True)
