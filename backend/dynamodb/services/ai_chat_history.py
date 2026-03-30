import time
import boto3
import os
import logging
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from dotenv import load_dotenv

load_dotenv()

IS_LOCAL = os.getenv("DYNAMODB_LOCAL", "False").lower() == "true"
TABLE_NAME = 'ChatHistory'
REGION = os.getenv("AWS_REGION", "ap-south-1")

def get_dynamodb_resource():
    if IS_LOCAL:
        
        return boto3.resource(
            'dynamodb',
            endpoint_url=os.getenv("DYNAMODB_ENDPOINT_LOCAL"),
            region_name="local",
            aws_access_key_id="local",
            aws_secret_access_key="local"
        )
    else:
       
        return boto3.resource('dynamodb', region_name=REGION)

db = get_dynamodb_resource()
chat_table = db.Table(TABLE_NAME)

def save_ai_chat_history(user_id, message, response, company_id=None):
    """Stores a single AI-User interaction."""
    try:
        chat_table.put_item(
            Item={
                'user_id': str(user_id),
                'timestamp': int(time.time() * 1000),
                'prompt': message,
                'response': response,
                'company_id': str(company_id) if company_id else "N/A",
                'status': 'completed'
            }
        )
        print(f" AI History saved for user: {user_id}")
    except ClientError as e:
        print(f" DynamoDB Error: {e.response['Error']['Message']}")
    except Exception as e:
        print(f" Unexpected Error: {str(e)}")

def get_ai_chat_history(user_id, limit=20, last_timestamp=None, *args, **kwargs):
    """Retrieves and formats history for the frontend."""
    try:
        query_params = {
            'KeyConditionExpression': Key('user_id').eq(str(user_id)),
            'ScanIndexForward': False,
            'Limit': limit
        }

        if last_timestamp:
            query_params['ExclusiveStartKey'] = {
                'user_id': str(user_id),
                'timestamp': int(last_timestamp) 
            }

        response = chat_table.query(**query_params)
        items = response.get('Items', [])
        
        formatted_history = []
        for item in items:
            formatted_history.append({
                "role": "user", 
                "content": item['prompt'], 
                "timestamp": item['timestamp']
            })
            formatted_history.append({
                "role": "ai", 
                "content": item['response'], 
                "timestamp": item['timestamp']
            })
            
        return {
            "messages": formatted_history,
            "last_evaluated_key": response.get('LastEvaluatedKey')
        }

    except Exception as e:
        print(f"Error in get_ai_chat_history: {str(e)}")
        return {"messages": [], "last_evaluated_key": None}