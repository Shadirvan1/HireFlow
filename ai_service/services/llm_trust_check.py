from google import genai
import os
import json

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def check_job_trust(jd: dict) -> dict:
    target_model = "gemini-3-flash-preview"

    prompt = f"""
    Analyze if this job post is a scam or legitimate. 
    Return a simple JSON with 'trusted' (true/false), 'confidence' (0-1), and 'reasoning'.
    
    Job: {jd.get('title')} - {jd.get('description')[:500]}
    """

    try:
        response = client.models.generate_content(
            model=target_model,
            contents=prompt,
            config={"temperature": 0.7} 
        )
        
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
        
    except Exception as e:
        return {"trusted": False, "confidence": 0, "reasoning": f"Error: {str(e)}"}