import io
from flask import Flask, request, render_template, send_from_directory
from flask_cors import CORS, cross_origin
from flask_basicauth import BasicAuth
from google.cloud import storage
import google.auth
import time
from google.oauth2.service_account import Credentials
import os
os.environ["GCLOUD_PROJECT"] = "eastern-academy-198411"
keyfile = "eastern-academy-198411-1d3cb15977c1.json"
credentials = Credentials.from_service_account_file(keyfile)
from collections import defaultdict
from pathlib import Path
import matplotlib
import warnings
import json
import datetime
from io import BytesIO 
from PIL import Image
import threading
import sys
matplotlib.use('Agg')
warnings.filterwarnings('ignore')

from programs.model import Model
from programs.result import Result
from programs.summarize import summarize
from programs.sendEmail import email_user
import programs.requestProgress as requestProgress

app = Flask(__name__, static_folder='../build', static_url_path='/')
app.config.from_object('config')
basic_auth = BasicAuth(app)
CORS(app, support_credentials=True)
model = Model()

def upload_data(files, data):
    gcs = storage.Client()
    bucket = gcs.get_bucket(app.config['CLOUD_STORAGE_BUCKET'])
    blob = bucket.blob(data['request_info']['jobID']+ "/results.json")
    blob.upload_from_string(json.dumps(data),content_type='application/json')   
    for id,key in enumerate(files):
        #upload each image of giemsa smear to the cloud
        filename = data['request_info']['jobID'] + "/" + str(id)
        blob = bucket.blob(filename)
        blob.upload_from_file(files[id],rewind=True,content_type="image/"+files[id].name.split('.').pop())
    email_user(data['request_info']['email_address'],'https://plasmocount.org/'+data['request_info']['jobID'])
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


def invalid_file(filename):
    print(filename)
    return not ('.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_FILE_EXTENSIONS'])


@app.route('/api/new_model', methods=['POST'])
def new_run():
    
    
    data = {
        'id': request.form.get('id'),
        'date': request.form.get('date'),
        'email-address': request.form.get('email-address'),
        'has-gams': request.form.get('has-gams') == 'true',
        'data-contrib': request.form.get('data-contrib') == 'true',
        'cut-offs': [1.5, 2.5],
        'num-files': request.form.get('num-files'),
        'files': defaultdict(),
    }
    requestProgress.addJob(data['id'],int(request.form.get('num-files')))
    
    results = []

    for id,key in enumerate(request.files):
        requestProgress.updateJob(data['id'],id+1)
        print(key)
        current_file = request.files.get(key)
        if invalid_file(current_file):
            #do something  
            print("invalid_file")
        img = model.load_image(current_file)
        pred = model.predict(data['has-gams'])
        
        
        result = Result(str(id), current_file.filename, img, pred)
        results.append(result.to_output())

        # upload associated buffers to cloud
        #for fname, buf in result.files.items():
            #print(fname)
            #upload_to_cloud(buf.getvalue(),
            #                '%s/%s' % (data['id'], fname),
            #                content_type='image/png')
            #buf.close()

    summary = summarize(results)

    output = {
        "data": {
            "results": results,
            "summary": summary
        },
        "statusOK": True,
        
    }

    cloud_data = {
        "results": results,
        "summary": summary,
        "request_info": {
            "jobID": data['id'],
            "date": request.form.get('date'),
            "email_address": request.form.get('email-address')
        },
        "image_num": len(results) 
    }
    #upload_to_cloud(json.dumps(output),
    #                '%s/output.json' % job['id'],
    #                content_type='application/json')
    
    print("hi")
    copy_files = []
    for id,key in enumerate(request.files):
        request.files.get(key).seek(0)
        f = io.BytesIO(request.files.get(key).read())
        f.name = request.files.get(key).filename
        copy_files.append(f)
    t1 = threading.Thread(target=upload_data, args=(copy_files,cloud_data))
    t1.start()
    return output

@app.route('/api/get_stored_data')
def get_stored_data():
    print(request.args["ID"])
    gcs = storage.Client()
    bucket = gcs.get_bucket(app.config['CLOUD_STORAGE_BUCKET'])
    blob = bucket.get_blob(request.args["ID"]+'/results.json')

    if blob is not None:
        return json.loads(blob.download_as_string())
    else:
        return "Record not found", 400
   
@app.route('/api/get_request_progress')
def get_request_progress():
    progress = requestProgress.getJob(request.args["ID"])
    if progress is None:
        return "0"
    if progress['current'] == progress['total']:
        requestProgress.deleteJob(request.args["ID"])
        progress["finished"] = 'true'
    return progress

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=True)