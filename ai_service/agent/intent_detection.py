def detect_intent(message: str):
    print(f"Detecting intent for message: {message}")

    message = message.lower()

    job_keywords = [
        "job",
        "jobs",
        "vacancy",
        "openings",
        "positions",
        "hiring",
        "find job"
    ]

    candidate_keywords = [
        "candidate",
        "candidates",
        "resume",
        "resumes",
        "applicants",
        "developers",
        "engineers",
        "show candidates",
        "find developers"
    ]

    for word in job_keywords:
        if word in message:
            return "job_search"

    for word in candidate_keywords:
        if word in message:
            return "candidate_search"

    return "general_chat"