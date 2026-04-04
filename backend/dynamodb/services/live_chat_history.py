import datetime
import os

import boto3
from boto3.dynamodb.conditions import Key
from dotenv import load_dotenv

load_dotenv()


IS_LOCAL = os.getenv("DYNAMODB_LOCAL", "False").lower() == "true"
TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "ChatMessages")
REGION = os.getenv("AWS_REGION", "ap-south-1")


def get_dynamodb_table():
    if IS_LOCAL:

        db = boto3.resource(
            "dynamodb",
            endpoint_url=os.getenv("DYNAMODB_ENDPOINT_LOCAL"),
            region_name="local",
            aws_access_key_id="local",
            aws_secret_access_key="local",
        )
    else:

        db = boto3.resource("dynamodb", region_name=REGION)

    return db.Table(TABLE_NAME)


table = get_dynamodb_table()


def save_message_to_dynamo(room_name, sender_id, receiver_id, text, message_id):

    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    item = {
        "room_name": room_name,
        "timestamp": timestamp,
        "id": str(message_id),
        "sender_id": int(sender_id),
        "receiver_id": int(receiver_id),
        "message": text,
        "is_read": False,
    }

    try:
        table.put_item(Item=item)
        return item
    except Exception as e:
        print(f" Error saving to DynamoDB: {e}")
        return None


def get_chat_history(room_name, limit=50):
    try:
        response = table.query(
            KeyConditionExpression=Key("room_name").eq(room_name),
            ScanIndexForward=True,  # True = Oldest to Newest, False = Newest First
            Limit=limit,
        )
        return response.get("Items", [])
    except Exception as e:
        print(f" Error fetching history: {e}")
        return []
