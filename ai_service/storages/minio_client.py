from minio import Minio

minio_client = Minio(
    "minio:9000", 
    access_key="admin",
    secret_key="admin123",
    secure=False
)

BUCKET_NAME = "hireflow-files"

# create bucket if not exists
if not minio_client.bucket_exists(BUCKET_NAME):
    minio_client.make_bucket(BUCKET_NAME)