from pymongo import MongoClient
import os 
MONGODB_URL = os.getenv('MONGO_URL')
client = MongoClient(
    MONGODB_URL
)

db = client["smart_hiring"]

resume_collection = db["resumes"]