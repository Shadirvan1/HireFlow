import logging
import os
import time
import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

REGION = "ap-south-1"
TABLE_NAME = "ChatHistory"

def get_dynamodb_resource():
    """
    Production-only resource loader. 
    EKS will automatically use the IAM Role assigned to the Pod.
    """
    return boto3.resource("dynamodb", region_name=REGION)

db = get_dynamodb_resource()
chat_table = db.Table(TABLE_NAME)

def save_ai_chat_history(user_id, message, response, company_id=None):
    """Stores a single AI-User interaction and returns the created item."""
    item = {
        "user_id": str(user_id),
        "timestamp": int(time.time() * 1000),
        "prompt": message,
        "response": response,
        "company_id": str(company_id) if company_id else "N/A",
        "status": "completed",
    }
    
    try:
        chat_table.put_item(Item=item)
        return item 
    except ClientError as e:
        print(f"DynamoDB ClientError: {e.response['Error']['Message']}")
        return None
    except Exception as e:
        print(f"Unexpected DynamoDB Error: {str(e)}")
        return None

def get_ai_chat_history(user_id, limit=20, last_timestamp=None, *args, **kwargs):
    """Retrieves and formats history for the frontend."""
    try:
        query_params = {
            "KeyConditionExpression": Key("user_id").eq(str(user_id)),
            "ScanIndexForward": False,
            "Limit": limit,
        }

        if last_timestamp:
            query_params["ExclusiveStartKey"] = {
                "user_id": str(user_id),
                "timestamp": int(last_timestamp),
            }

        response = chat_table.query(**query_params)
        items = response.get("Items", [])

        formatted_history = []
        for item in items:
            # User Message
            formatted_history.append({
                "role": "user",
                "content": item["prompt"],
                "timestamp": item["timestamp"],
            })
            # AI Response
            formatted_history.append({
                "role": "ai",
                "content": item["response"],
                "timestamp": item["timestamp"],
            })

        return {
            "messages": formatted_history,
            "last_evaluated_key": response.get("LastEvaluatedKey"),
        }

    except Exception as e:
        print(f"Error querying history: {str(e)}")
        return {"messages": [], "last_evaluated_key": None}