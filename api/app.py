from flask import Flask, request, render_template, send_from_directory
from flask_cors import CORS, cross_origin
from flask_basicauth import BasicAuth
from google.cloud import storage

import os

from collections import defaultdict
from pathlib import Path
import matplotlib
import warnings
import json
import datetime
matplotlib.use('Agg')
warnings.filterwarnings('ignore')

from programs.model import Model
from programs.result import Result
from programs.summarize import summarize

app = Flask(__name__, static_folder='../build', static_url_path='/')
app.config.from_object('config')
basic_auth = BasicAuth(app)
CORS(app, support_credentials=True)
model = Model()


def upload_to_cloud(file, fname, content_type, **kwargs):
    gcs = storage.Client()
    bucket = gcs.get_bucket(app.config['CLOUD_STORAGE_BUCKET'])
    blob = bucket.blob(fname)
    blob.upload_from_string(file, content_type, **kwargs)


def read_from_cloud(fname):
    gcs = storage.Client()
    bucket = gcs.get_bucket(app.config['CLOUD_STORAGE_BUCKET'])
    blob = bucket.get_blob(fname)
    if not blob:
        return None
    return blob.download_as_string()


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/example/<path:filename>')
def download_example(filename):
    return send_from_directory(app.config['EXAMPLE_FOLDER'], filename)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_FILE_EXTENSIONS']


@app.route('/api/get-url', methods=['POST'])
def get_signed_url():
    gcs = storage.Client()
    bucket = gcs.get_bucket(app.config['CLOUD_STORAGE_BUCKET'])
    blob = bucket.blob(request.form.get('fname'))
    url = blob.generate_signed_url(
        version='v4',
        expiration=datetime.timedelta(minutes=1),
        method='PUT',
        content_type='application/octet-stream')
    return url


@app.route('/api/model', methods=['POST'])
def run():
    job = {
        'id': request.form.get('id'),
        'date': request.form.get('date'),
        'email-address': request.form.get('email-address'),
        'has-gams': request.form.get('has-gams') == 'true',
        'data-contrib': request.form.get('data-contrib') == 'true',
        'cut-offs': [1.5, 2.5],
        'files': defaultdict()
    }

    # upload job data
    upload_to_cloud(json.dumps(job),
                    '%s/input.json' % job['id'],
                    content_type='application/json')

    gcs = storage.Client()
    bucket = gcs.get_bucket(app.config['CLOUD_STORAGE_BUCKET'])

    blob_name = '%s/files/' % job['id']

    blobs = list(bucket.list_blobs(prefix=blob_name))
    files = []
    if not blobs:
        return {'statusOK': False}
    tmp_dir = "/tmp/" + job['id']
    os.mkdir(tmp_dir)
    for b in blobs:
        local_filename = os.path.join(tmp_dir, b.name.split('/')[-1])
        b.download_to_filename(local_filename)
        files.append(local_filename)

    # start analysis
    results = []
    for i, filename in enumerate(files):
        if allowed_file(filename):
            img = model.load_image(filename)
            pred = model.predict(job['has-gams'])
            upload_to_cloud(pred.to_json(),
                            '%s/%s/result.json' % (job['id'], i),
                            content_type='application/json')
            result = Result(str(i), filename, img, pred)
            results.append(result.to_output())

            # upload associated buffers to cloud
            for fname, buf in result.files.items():
                upload_to_cloud(buf.getvalue(),
                                '%s/%s' % (job['id'], fname),
                                content_type='image/png')
                buf.close()
            os.remove(filename)
    os.rmdir(tmp_dir)

    output = {
        'data': {
            'results': results,
            'summary': summarize(results)
        },
        'statusOK': True
    }

    upload_to_cloud(json.dumps(output),
                    '%s/output.json' % job['id'],
                    content_type='application/json')

    return output


@app.route('/api/result', methods=['POST'])
def return_result():
    job_id = request.get_json()['id']
    if job_id == 'example':
        with open(Path(app.config['EXAMPLE_FOLDER']) / 'output.json') as f:
            return json.load(f)
    else:
        f = read_from_cloud('%s/output.json' % job_id)
        if not f:
            return {'statusOK': False}
        return json.loads(f)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=True)