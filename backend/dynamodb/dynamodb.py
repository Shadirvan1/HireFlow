import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

def get_dynamodb_resource():
    # Only connects to actual AWS using the region from your .env
    return boto3.resource("dynamodb", region_name=os.getenv("AWS_REGION", "ap-south-1"))

def create_hiring_tables():
    db = get_dynamodb_resource()

    # ChatMessages Table
    try:
        db.create_table(
            TableName="ChatMessages",
            KeySchema=[
                {"AttributeName": "room_name", "KeyType": "HASH"},
                {"AttributeName": "timestamp", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "room_name", "AttributeType": "S"},
                {"AttributeName": "timestamp", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        print("ChatMessages table creation initiated...")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceInUseException":
            print("ChatMessages table already exists.")
        else:
            print("Error creating ChatMessages:", e)

    # ChatHistory Table
    try:
        db.create_table(
            TableName="ChatHistory",
            KeySchema=[
                {"AttributeName": "user_id", "KeyType": "HASH"},
                {"AttributeName": "timestamp", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "user_id", "AttributeType": "S"},
                {"AttributeName": "timestamp", "AttributeType": "N"},
            ],
            # Note: Keeping Pay Per Request for consistency across your cloud setup
            BillingMode="PAY_PER_REQUEST",
        )
        print("ChatHistory table creation initiated...")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceInUseException":
            print("ChatHistory table already exists.")
        else:
            print("Error creating ChatHistory:", e)

if __name__ == "__main__":
    create_hiring_tables()