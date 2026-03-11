import os
from pymongo import MongoClient

# Add ?authSource=admin to ensure the login is verified against the root user table
MONGO_URL = os.getenv(
    "MONGO_URL", 
    "mongodb://mongo_admin:mongo_pass@mongodb:27017/?authSource=admin"
)

client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
db = client["smart_hiring"]
logs_collection = db["logs"]

try:
    client.admin.command('ping')
    print("✅ Connected to MongoDB at service 'mongodb'!")
except Exception as e:
    print(f"❌ Connection failed: {e}")