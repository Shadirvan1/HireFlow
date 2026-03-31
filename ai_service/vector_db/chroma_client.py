import chromadb
import os

# Best practice: Use an environment variable with a fallback
CHROMA_HOST = os.getenv("CHROMA_HOST", "chroma-service")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", 8000))

client = chromadb.HttpClient(
    host=CHROMA_HOST,
    port=CHROMA_PORT
)

resume_collection = client.get_or_create_collection(name="resumes")
job_collection = client.get_or_create_collection(name="jobs")