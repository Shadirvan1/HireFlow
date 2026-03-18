import datetime
import os
import boto3
# 1. ADD THIS IMPORT
from boto3.dynamodb.conditions import Key

DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT", "http://dynamodb:8000")
# Ensure this matches your actual DynamoDB table name
TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "ChatMessages")

# 2. Initialize Resource
db = boto3.resource(
    'dynamodb',
    endpoint_url='http://dynamodb:8000',
    region_name='local',
    aws_access_key_id='local',
    aws_secret_access_key='local'
)

table = db.Table(TABLE_NAME)

def save_message_to_dynamo(room_name, sender_id, receiver_id, text, message_id):
    timestamp = datetime.datetime.utcnow().isoformat()

    item = {
        'room_name': room_name,
        'timestamp': timestamp,  # sort key
        'id': message_id,        # ✅ required
        'sender_id': int(sender_id),
        'receiver_id': int(receiver_id),
        'message': text,
        'is_read': False
    }

    table.put_item(Item=item)
    return item

def get_chat_history(room_name, limit=50):
    # 3. FIX: Use 'Key' directly after importing it
    response = table.query(
        KeyConditionExpression=Key('room_name').eq(room_name),
        ScanIndexForward=True, 
        Limit=limit
    )
    
    return response.get('Items', [])