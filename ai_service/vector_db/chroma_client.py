import chromadb

client = chromadb.HttpClient(
    host="chroma",
    port=8000
)

resume_collection = client.get_or_create_collection(
    name="resumes"
)