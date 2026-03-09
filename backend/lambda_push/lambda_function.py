import json
import os
import firebase_admin
from firebase_admin import credentials, messaging
from firebase_admin.exceptions import FirebaseError


def initialize_firebase():
    if not firebase_admin._apps:

        private_key = os.getenv("GOOGLE_PRIVATE_KEY")
        if private_key:
            private_key = private_key.replace("\\n", "\n")

        firebase_config = {
            "type": os.getenv("GOOGLE_TYPE"),
            "project_id": os.getenv("GOOGLE_PROJECT_ID"),
            "private_key_id": os.getenv("GOOGLE_PRIVATE_KEY_ID"),
            "private_key": private_key,
            "client_email": os.getenv("GOOGLE_CLIENT_EMAIL"),
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "auth_uri": os.getenv("GOOGLE_AUTH_URI"),
            "token_uri": os.getenv("GOOGLE_TOKEN_URI"),
            "auth_provider_x509_cert_url": os.getenv("GOOGLE_AUTH_PROVIDER_CERT_URL"),
            "client_x509_cert_url": os.getenv("GOOGLE_CLIENT_CERT_URL"),
        }

        cred = credentials.Certificate(firebase_config)
        firebase_admin.initialize_app(cred)


def lambda_handler(event, context):
    initialize_firebase()
    print("Event received:", event)

    for record in event["Records"]:
        try:
            body = json.loads(record["body"])

            fcm_token = body.get("fcm_token")
            title = body.get("title")
            message_body = body.get("body")
            data_payload = body.get("data", {})

            if not fcm_token:
                print("Missing FCM token")
                continue

            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=message_body,
                ),
                data={str(k): str(v) for k, v in data_payload.items()},
                token=fcm_token,
            )

            response = messaging.send(message)
            print("Successfully sent message:", response)

        except FirebaseError as e:
            print("Firebase error:", str(e))

        except Exception as e:
            print("General error:", str(e))

    return {"statusCode": 200}