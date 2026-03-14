import time
import boto3
import os
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

# 1. Configuration
# From Django container to DynamoDB container, use internal service name
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

def ensure_table_exists():
    """Checks if table exists; if not, creates it and waits until active."""
    try:
        table = db.Table(TABLE_NAME)
        table.table_status
        return table
    except db.meta.client.exceptions.ResourceNotFoundException:
        print(f"Table {TABLE_NAME} not found. Creating it now...")
        table = db.create_table(
            TableName=TABLE_NAME,
            KeySchema=[
                {'AttributeName': 'user_id', 'KeyType': 'HASH'},  # Partition Key
                {'AttributeName': 'timestamp', 'KeyType': 'RANGE'} # Sort Key
            ],
            AttributeDefinitions=[
                {'AttributeName': 'user_id', 'AttributeType': 'S'},
                {'AttributeName': 'timestamp', 'AttributeType': 'N'}
            ],
            ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
        )
        # Wait until the table exists (important for local persistence)
        table.meta.client.get_waiter('table_exists').wait(TableName=TABLE_NAME)
        print(f"✅ Table {TABLE_NAME} created and active.")
        return table

def save_chat_history(user_id, message, response, company_id=None):
    """Stores a single chat interaction."""
    chat_table = ensure_table_exists()
    
    try:
        chat_table.put_item(
            Item={
                'user_id': str(user_id),
                'timestamp': int(time.time() * 1000),  # Milliseconds for sorting
                'prompt': message,
                'response': response,
                'company_id': str(company_id) if company_id else "N/A",
                'status': 'completed'
            }
        )
        print(f"✅ Chat saved for user: {user_id}")
    except ClientError as e:
        print(f"❌ DynamoDB Storage Error: {e.response['Error']['Message']}")

def get_chat_history(user_id, limit=20, last_timestamp=None):
    """
    Retrieves history for a user.
    If last_timestamp is provided, it fetches messages older than that (Pagination).
    """
    chat_table = ensure_table_exists()
    
    try:
        # Construct Query parameters
        query_params = {
            'KeyConditionExpression': Key('user_id').eq(str(user_id)),
            'ScanIndexForward': False,  # False = Newest messages first
            'Limit': limit
        }

        # If user scrolled up and requested older messages
        if last_timestamp:
            query_params['ExclusiveStartKey'] = {
                'user_id': str(user_id),
                'timestamp': int(last_timestamp)
            }

        response = chat_table.query(**query_params)
        
        items = response.get('Items', [])
        
        # Format for React: {role: 'user', content: '...'}
        formatted_history = []
        for item in items:
            # We add AI response first because we are querying DESC (newest first)
            # When React renders, it will likely reverse this list or append to top
            formatted_history.append({"role": "ai", "content": item['response'], "timestamp": item['timestamp']})
            formatted_history.append({"role": "user", "content": item['prompt'], "timestamp": item['timestamp']})
            
        return {
            "messages": formatted_history,
            "last_evaluated_key": response.get('LastEvaluatedKey') # Use this for next "scroll up"
        }

    except Exception as e:
        print(f"❌ DynamoDB Retrieval Error: {e}")
        return {"messages": [], "last_evaluated_key": None}