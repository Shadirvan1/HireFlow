import boto3

dynamodb = boto3.client(
    "dynamodb",
    endpoint_url="http://dynamodb:8000",
    region_name="local",
    aws_access_key_id="local",
    aws_secret_access_key="local"
)

try:
    response = dynamodb.create_table(
        TableName="ChatMessages",
        KeySchema=[
            {"AttributeName": "room_name", "KeyType": "HASH"},
            {"AttributeName": "timestamp", "KeyType": "RANGE"}
        ],
        AttributeDefinitions=[
            {"AttributeName": "room_name", "AttributeType": "S"},
            {"AttributeName": "timestamp", "AttributeType": "S"}
        ],
        BillingMode="PAY_PER_REQUEST"
    )

    print("✅ Table created!")

except dynamodb.exceptions.ResourceInUseException:
    print("⚠️ Table already exists")