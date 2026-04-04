import os

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

IS_LOCAL = os.getenv("DYNAMODB_LOCAL", "False").lower() == "true"


def get_dynamodb_resource():
    if IS_LOCAL:
        print("🔧 Connecting to LOCAL DynamoDB...")
        return boto3.resource(
            "dynamodb",
            endpoint_url=os.getenv("DYNAMODB_ENDPOINT_LOCAL"),
            region_name="local",
            aws_access_key_id="local",
            aws_secret_access_key="local",
        )
    else:
        print(f" Connecting to AWS Production ({os.getenv('AWS_REGION')})...")
        return boto3.resource("dynamodb", region_name=os.getenv("AWS_REGION"))


def create_hiring_tables():
    db = get_dynamodb_resource()

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
        print("✅ Table 'ChatMessages' created!")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceInUseException":
            print("⚠️ Table 'ChatMessages' already exists.")
        else:
            print("❌ Error creating ChatMessages:", e)

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
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
        )
        print("✅ Table 'ChatHistory' created!")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceInUseException":
            print("⚠️ Table 'ChatHistory' already exists.")
        else:
            print("❌ Error creating ChatHistory:", e)


if __name__ == "__main__":
    create_hiring_tables()
