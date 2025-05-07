import os

BASIC_AUTH_FORCE = False  # set to False to disable authorization
BASIC_AUTH_USERNAME = 'giemsa'
BASIC_AUTH_PASSWORD = os.getenv('BASIC_AUTH_PASSWORD', '')
ALLOWED_FILE_EXTENSIONS = {'png', 'jpg', 'jpeg','tif','tiff'}
EXAMPLE_FOLDER = 'example/'
CLOUD_STORAGE_BUCKET = 'myplasmocount-bucket'