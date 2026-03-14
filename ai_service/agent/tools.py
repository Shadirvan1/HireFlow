from langchain.tools import tool
from vector_db.chroma_client import job_collection,resume_collection
from services.embedding import generate_embedding


@tool
def search_jobs(query: str):
    """Search job postings related to a query"""

    embedding = generate_embedding(query)

    results = job_collection.query(
        query_embeddings=[embedding],
        n_results=5
    )

    documents = results.get("documents", [[]])[0]

    return documents




@tool
def search_candidates(query: str):
    """Search candidates based on skills or job role"""

    embedding = generate_embedding(query)

    results = resume_collection.query(
        query_embeddings=[embedding],
        n_results=5
    )

    documents = results.get("documents", [[]])[0]
    print(documents)

    return documents
