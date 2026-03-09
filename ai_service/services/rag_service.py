from transformers import pipeline

generator = pipeline(
    "text-generation",
    model="meta-llama/Meta-Llama-3-8B"
)

def explain_match(job, resume):

    prompt = f"""
    Job Description:
    {job}

    Candidate Resume:
    {resume}

    Explain why this candidate fits this job.
    """

    response = generator(prompt, max_new_tokens=200)

    return response[0]["generated_text"]