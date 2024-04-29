import io
from flask import Flask, request, render_template, send_from_directory
from flask_cors import CORS, cross_origin
from flask_basicauth import BasicAuth
import PIL
from google.cloud import storage
import os
os.environ["GCLOUD_PROJECT"] = "myPlasmocountInstance"
import time
#uncomment this line when working locally
#os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '../service_account_key.json'
import warnings
import json
import threading
warnings.filterwarnings('ignore')
#remove in prod 
from programs.model import Model
from programs.summarize import summarize
from programs.sendEmail import email_user



app = Flask(__name__, static_folder='../build', static_url_path='/')
app.config.from_object('config')
basic_auth = BasicAuth(app)
CORS(app, support_credentials=True)
model = Model()
gcs = storage.Client()
bucket = gcs.get_bucket(app.config['CLOUD_STORAGE_BUCKET'])
def upload_data(files, data,request_info):
    
    blob = bucket.blob(request_info['jobID'] + "/results.json")
    blob.upload_from_string(json.dumps(data),content_type='application/json')  
    blob = bucket.blob(request_info['jobID'] + "/info.json")
    blob.upload_from_string(json.dumps(request_info),content_type='application/json')  
    for id,key in enumerate(files):
        #upload each image of giemsa smear to the cloud
        filename = request_info['jobID'] + "/" + str(id)
        blob = bucket.blob(filename)
        blob.upload_from_file(files[id],rewind=True,content_type="image/"+files[id].name.split('.').pop())
    email_user(request_info['email_address'],'https://plasmocount.org/'+request_info['jobID'])

    
def set_progress(jobID, currentImage, totalImage):
    uploadStr = f"{currentImage},{totalImage}"
    blob = bucket.blob(f"{jobID}/progress")
    if blob != None and blob.exists():
        blob.delete()
    if currentImage < totalImage:
        blob.upload_from_string(uploadStr, content_type='text/plain')
    else:
        blob.upload_from_string("finish", content_type='text/plain')

def get_progress(jobID):
    blob = bucket.get_blob(jobID+'/progress')

    if blob != None and blob.exists():
        return blob.download_as_string()
    else:
        return "0"
    

@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')


@app.route('/')
def index():
    if model.is_loaded == False:
        load_model_thread = threading.Thread(target=model.load())
        load_model_thread.start()
    return app.send_static_file('index.html')


@app.route('/api/example/<path:filename>')
def download_example(filename):
    return send_from_directory(app.config['EXAMPLE_FOLDER'], filename)


def invalid_file(filename):
    return not ('.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_FILE_EXTENSIONS'])


@app.route('/api/model', methods=['POST'])
def run():
    data = {
        'id': request.form.get('id'),
        'magnification': request.form.get('magnification'),
        'date': request.form.get('date'),
        'email-address': request.form.get('email-address'),
        'has-gams': request.form.get('has-gams') == 'true',
        'data-contrib': request.form.get('data-contrib') == 'true',
        'cut-offs': [1.5, 2.5],
        'num-files': request.form.get('num-files')
    }
    
    if(data['num-files'] is None or data['num-files'] == 0):
        return "No Files Received", 401

    
    results = []
             
    images = []
    image_filenames = []
    while(not model.is_loaded):
        pass
    

    for id,key in enumerate(request.files):
        current_file = request.files.get(key)
        
        if invalid_file(current_file.filename):
            #do something  
            return "Invalid File Extension", 401
            
            

        pred,PILimage = model.predict(current_file,id,data['has-gams'],int(data['magnification']))
        
        set_request_progress_thread = threading.Thread(target=set_progress, args=(data['id'],id+1,int(data['num-files'])))
        set_request_progress_thread.start()
        images.append(PILimage)
        image_filenames.append(current_file.filename)
        request.files.get(key).close()
        results.append(pred)


    summary = summarize(results)

    output = {
        "data": {
            "results": results,
            "summary": summary
        },
        "statusOK": True,
        
    }
    if data['id'] != None:
        request_info = {
                "jobID": data['id'],
                'data-contrib': data['data-contrib'],
                "date": request.form.get('date'),
                "email_address": request.form.get('email-address')
            }
        cloud_data = {
            "results": results,
            "summary": summary,
        }
        
        copy_files = []
        for image, image_name in zip(images,image_filenames):
            f = io.BytesIO()
            image.convert('RGB').save(f,"jpeg")
            f.name = image_name
            copy_files.append(f)
        t1 = threading.Thread(target=upload_data, args=(copy_files,cloud_data,request_info))
        t1.start()
    return output

@app.route('/api/get_stored_data')
def get_stored_data():
    blob = bucket.get_blob(request.args["ID"]+'/results.json')

    if blob is not None:
        return json.loads(blob.download_as_string())
    else:
        return "Record not found", 400
   
@app.route('/api/get_request_progress')
def get_request_progress():
    progress = get_progress(request.args["ID"])
    if progress == 'finish':
        return "Request Completed", 401
    return progress

@app.route('/api/modify_results', methods=['POST'])
def modify_results():

    blob = bucket.blob(request.json["jobID"] + "/results.json")
    blob.upload_from_string(json.dumps(request.json["results"]),content_type='application/json')   
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=True)