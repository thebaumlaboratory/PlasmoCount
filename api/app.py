from flask import Flask, request, jsonify, render_template
from flask_cors import CORS, cross_origin
from model import Model
from result import Result
from models.fastai_modules import ExperimentCallback  #TODO: this is awkward here
import matplotlib
matplotlib.use('Agg')
import json
import time
app = Flask(__name__)
CORS(app, support_credentials=True)


@app.route('/model', methods=['POST'])
def run_model(upload_folder='static/uploads/'):
    # get files
    files = request.files

    # load model
    model = Model()

    results = []
    for i in files:
        # load result
        img = model.load_image(files[i])
        pred = model.predict()
        result = Result(i, files[i].filename, img, pred)
        result.run(save_to='%s%s.png' % (upload_folder, time.time()))
        results.append(result.to_output())

    return {'results': results}


@app.route('/example', methods=['POST'])
def return_example():
    with open('static/example/example.json') as f:
        results = json.load(f)
    return {'results': results}


if __name__ == '__main__':
    app.run(debug=True)
