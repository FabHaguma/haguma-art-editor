import os

# Determine the base directory of the backend folder
# This assumes config.py is directly inside the 'backend' folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

TEMP_FOLDER_NAME = 'temp_images'
TEMP_FOLDER = os.path.join(BASE_DIR, TEMP_FOLDER_NAME)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE_MB = 12
SESSION_TIMEOUT_HOURS = 1 # Hours for cleanup
MAX_CONTENT_LENGTH = MAX_FILE_SIZE_MB * 1024 * 1024 # In bytes