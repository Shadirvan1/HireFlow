from langchain.tools import tool
from vector_db.chroma_client import job_collection,resume_collection
from services.embedding import generate_embedding
from typing import Optional
@tool
def search_jobs(query: str, company_id: Optional[str] = None):

    """Search job postings. Candidates see all jobs, HR see only their own."""
    
    
    embedding = generate_embedding(query)

    search_filter = {"company_id": company_id} if company_id else None

    results = job_collection.query(
        query_embeddings=[embedding],
        n_results=20,
        where=search_filter
    )

    return results.get("documents", [[]])[0]

@tool
def search_candidates(query: str, company_id: Optional[str] = None):

    """Search candidates. Strictly requires a company_id."""
    
    
   
    if not company_id or company_id == "":
        return "No results found. (Access restricted to Company HR only)"

    embedding = generate_embedding(query)

    results = resume_collection.query(
        query_embeddings=[embedding],
        n_results=20,
        where={"company_id": company_id}
    )

    documents = results.get("documents", [[]])[0]
    return documents if documents else "No candidates found for this company."

@tool
def general_support(query: str):
    """
    Use this tool for general greetings (hi, hello) or small talk.
    """
    
    return {
        "intent": "general questions or intent",
        "suggested_tone": "professional and encouraging",
        "focus_area": "Tech field",
        "user_query": query
    }