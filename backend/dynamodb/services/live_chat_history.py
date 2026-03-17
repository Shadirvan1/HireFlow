import datetime
import os
import boto3




DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT", "http://dynamodb:8000")
TABLE_NAME = 'ChatHistory'

# 2. Initialize Resource
db = boto3.resource(
    'dynamodb',
    endpoint_url=DYNAMODB_ENDPOINT,
    region_name='local',
    aws_access_key_id='local',
    aws_secret_access_key='local'
)

table = db.Table('ChatMessages')

def save_message_to_dynamo(room_name, sender_id, receiver_id, text):
    item = {
        'room_name': room_name,
        'timestamp': datetime.utcnow().isoformat(),
        'sender_id': int(sender_id),
        'receiver_id': int(receiver_id),
        'message': text,
        'is_read': False
    }
    table.put_item(Item=item)
    return item

def get_chat_history(room_name, limit=50):
    response = table.query(
        KeyConditionExpression=boto3.query.Key('room_name').eq(room_name),
        ScanIndexForward=True, 
        Limit=limit
    )
    return response.get('Items', [])