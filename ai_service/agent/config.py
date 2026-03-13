import os
from dotenv import load_dotenv
load_dotenv()

CHROMA_HOST = os.getenv("CHROMA_HOST", "chroma")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", 8000))

LLAMA_PATH = os.getenv("LLAMA_PATH", "models/llama2-7b.gguf")

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")
