import time
import boto3
import os
import logging
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key



DYNAMODB_ENDPOINT = os.getenv("DYNAMODB_ENDPOINT", "http://dynamodb:8000")
TABLE_NAME = 'ChatHistory'

db = boto3.resource(
    'dynamodb',
    endpoint_url=DYNAMODB_ENDPOINT,
    region_name=os.getenv("AWS_REGION", "local"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "local"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "local")
)

chat_table = db.Table(TABLE_NAME)

def save_ai_chat_history(user_id, message, response, company_id=None):
    """Stores a single chat interaction."""
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
        
    except ClientError as e:
        print(f"DynamoDB ClientError: {e.response['Error']['Message']}")
    except Exception as e:
        print(f"Unexpected error in save_chat_history: {str(e)}")



def get_ai_chat_history(room_name, limit=20, last_timestamp=None,*args,**kwargs):
    try:
        query_params = {
            'KeyConditionExpression': Key('user_id').eq(str(room_name)),
            'ScanIndexForward': False,
            'Limit': limit
        }

        if last_timestamp:
            
            try:
                query_params['ExclusiveStartKey'] = {
                    'room_name': str(room_name),
                    'timestamp': int(last_timestamp) 
                }
            except (ValueError, TypeError):
                print(f"Invalid last_timestamp format: {last_timestamp}")

        response = chat_table.query(**query_params)
        
        items = response.get('Items', [])
        
        formatted_history = []
        for item in items:
           
            formatted_history.append({
                "role": "ai", 
                "content": item['response'], 
                "timestamp": item['timestamp']
            })
            formatted_history.append({
                "role": "user", 
                "content": item['prompt'], 
                "timestamp": item['timestamp']
            })
            
        return {
            "messages": formatted_history,
            "last_evaluated_key": response.get('LastEvaluatedKey')
        }

    except Exception as e:
        print(f"Error in get_ai_chat_history: {str(e)}")
        return {"messages": [], "last_evaluated_key": None}