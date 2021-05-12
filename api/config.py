import os

BASIC_AUTH_FORCE = True  # set to False to disable authorization
BASIC_AUTH_USERNAME = 'test-user'
BASIC_AUTH_PASSWORD = os.getenv('BASIC_AUTH_PASSWORD', '')
ALLOWED_FILE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'tiff', 'tif'}
EXAMPLE_FOLDER = 'example/'
CLOUD_STORAGE_BUCKET = 'plasmocount-bucket'