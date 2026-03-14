import boto3

# This points to the Docker service name
db = boto3.resource(
    'dynamodb',
    endpoint_url='http://dynamodb:8000',
    region_name='local',
    aws_access_key_id='local',
    aws_secret_access_key='local'
)

def create_history_table():
    try:
        table = db.create_table(
            TableName='ChatHistory',
            KeySchema=[
                {'AttributeName': 'user_id', 'KeyType': 'HASH'},  
                {'AttributeName': 'timestamp', 'KeyType': 'RANGE'} 
            ],
            AttributeDefinitions=[
                {'AttributeName': 'user_id', 'AttributeType': 'S'},
                {'AttributeName': 'timestamp', 'AttributeType': 'N'}
            ],
            ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
        )
        print("Table 'ChatHistory' created successfully!")
    except Exception as e:
        print("Table already exists or error:", e)

if __name__ == "__main__":
    create_history_table()