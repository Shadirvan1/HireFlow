def format_chroma_results(raw_results):
    """
    Converts ChromaDB's nested list structure into a clean, 
    serializable list of candidate matches.
    """
    formatted = []
    
    # Chroma returns lists of lists (e.g., results['ids'][0])
    # because it supports batch queries. We take index 0.
    ids = raw_results.get("ids", [[]])[0]
    distances = raw_results.get("distances", [[]])[0]
    metadatas = raw_results.get("metadatas", [[]])[0]
    documents = raw_results.get("documents", [[]])[0]

    for i in range(len(ids)):
        # Convert distance to a match percentage (Score)
        # Chroma distance: 0 is identical, 2 is opposite.
        # Score = (1 - (distance / 2)) * 100
        raw_distance = distances[i]
        match_score = max(0, min(100, round((1 - (raw_distance / 2)) * 100, 2)))

        formatted.append({
            "chunk_id": ids[i],
            "score": match_score,
            "document": documents[i],
            "metadata": metadatas[i],
            # Extract common fields for easy access in Django
            "applicant_id": metadatas[i].get("applicant_id"),
            "application_id": metadatas[i].get("application_id"),
            "resume_id": metadatas[i].get("resume_id")
        })

    # Sort by score highest to lowest
    return sorted(formatted, key=lambda x: x['score'], reverse=True)