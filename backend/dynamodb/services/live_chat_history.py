import datetime
import os
import boto3
from boto3.dynamodb.conditions import Key

# Production Constants
TABLE_NAME = "ChatMessages"
REGION = "ap-south-1"

def get_dynamodb_table():
    """
    Production-only table loader.
    Boto3 will automatically use the IAM Role assigned to your EKS Pod.
    """

    db = boto3.resource("dynamodb", region_name=REGION)
    return db.Table(TABLE_NAME)

table = get_dynamodb_table()

def save_message_to_dynamo(room_name, sender_id, receiver_id, text, message_id):
    """
    Saves a message to DynamoDB and returns the item.
    This is used by PrivateChatConsumer.
    """
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    item = {
        "room_name": str(room_name),
        "timestamp": timestamp,
        "id": str(message_id),
        "sender_id": int(sender_id),
        "receiver_id": int(receiver_id),
        "message": str(text),
        "is_read": False,
    }

    try:
        table.put_item(Item=item)
        return item
    except Exception as e:
        # In production, logging is better than print, but this will show in EKS logs
        print(f"Error saving to DynamoDB: {e}")
        return None

def get_chat_history(room_name, limit=50):
    """
    Retrieves history for a specific room.
    """
    try:
        response = table.query(
            KeyConditionExpression=Key("room_name").eq(str(room_name)),
            ScanIndexForward=True,  # True = Oldest to Newest
            Limit=limit,
        )
        return response.get("Items", [])
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []