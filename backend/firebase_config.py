import os
import firebase_admin
from firebase_admin import credentials

# Get absolute path to service account file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_PATH = os.path.join(BASE_DIR, "config/serviceAccountKey.json")

# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)