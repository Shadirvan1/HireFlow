from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
client_general = Groq(api_key=os.getenv("GROQ_GENERAL_API_KEY"))


def ask_llm(question, candidates, jobs):

    prompt = f"""
You are an AI hiring assistant.

User question:
{question}

Candidate data:
{candidates}

Job data:
{jobs}

Instructions:
- Answer the user's question using the provided data.
- If the user asks for candidates, suggest the best ones.
- If the user asks for jobs, recommend relevant jobs.
- If data is not enough, say so.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
        max_tokens=600
    )

    return response.choices[0].message.content



async def ask_general_llm(message: str):

    response =  client_general.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful AI hiring assistant. Answer clearly and professionally."
            },
            {
                "role": "user",
                "content": message
            }
        ],

        temperature=0.7
    )

    return response.choices[0].message.content

    
from langchain_groq import ChatGroq

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0
)