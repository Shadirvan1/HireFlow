def format_chroma_results(raw_results):
    """
    Converts ChromaDB's nested list structure into a clean, 
    serializable list of candidate matches.
    """
    formatted = []
    

    ids = raw_results.get("ids", [[]])[0]
    distances = raw_results.get("distances", [[]])[0]
    metadatas = raw_results.get("metadatas", [[]])[0]
    documents = raw_results.get("documents", [[]])[0]

    for i in range(len(ids)):
        
        raw_distance = distances[i]
        match_score = max(0, min(100, round((1 - (raw_distance / 2)) * 100, 2)))

        formatted.append({
            "chunk_id": ids[i],
            "score": match_score,
            "document": documents[i],
            "metadata": metadatas[i],
            "applicant_id": metadatas[i].get("applicant_id"),
            "application_id": metadatas[i].get("application_id"),
            "resume_id": metadatas[i].get("resume_id")
        })

    return sorted(formatted, key=lambda x: x['score'], reverse=True)