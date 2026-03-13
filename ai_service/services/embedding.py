from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_embedding(text: str):

    response = client.models.embed_content(
        model="embedding-001",
        contents=[text]
    )

    return response.embeddings[0].values
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_embedding(text: str):
    print(f"Generating embedding for text: {text[:50]}...")
   

    response = client.models.embed_content(
        model="gemini-embedding-001",
        contents=[text]
    )
    

    return response.embeddings[0].values


# TEST TEXT
# text = "Python developer with FastAPI and Docker experience"

# embedding = generate_embedding(text)

# print("Embedding length:", len(embedding))
# print("First 5 numbers:", embedding[:5])