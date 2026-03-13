from services.llm_services import search_jobs,search_candidates


tools = {
    "search_candidate": {
        "description": "Search candidates based on skills or role",
        "function": search_candidates
    },
    "search_job": {
        "description": "Search jobs based on title or skills",
        "function": search_jobs
    },

    # "analyze_resume": {
    #     "description": "Analyze a resume and extract insights",
    #     "function": analyze_resume
    # }
}