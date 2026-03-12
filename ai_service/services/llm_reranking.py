import json
import os
import re
import concurrent.futures
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def rerank_candidates(job_text, candidates):

    def run_rerank():

        print("--- 1. Entering rerank_candidates ---")

        subset = candidates[:10]

        simplified = [
            {
                "application_id": str(c["application_id"]),
                "resume": c["resume"][:800]
            }
            for c in subset
        ]

        candidate_ids = [c["application_id"] for c in simplified]

        prompt = f"""
You are an AI hiring evaluator.

Evaluate how well each candidate matches the job description.

SCORING RULES:
- Score range: 0 to 100
- Use precise scoring (81, 82, 77, etc.)
- DO NOT round scores to multiples of 5 or 10
- Compare candidates relative to each other
- Higher score = better match

IMPORTANT RULES:
- Use ONLY the provided application_id values
- Do NOT invent new IDs
- Return rankings for ALL candidates provided

Return STRICT JSON only.

Format:
{{
 "rankings":[
   {{"application_id":"string","score":integer}}
 ]
}}

VALID APPLICATION IDS:
{candidate_ids}

JOB DESCRIPTION:
{job_text[:500]}

CANDIDATES:
{json.dumps(simplified)}
"""

        print("--- 2. Calling Groq API ---")

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You rank job candidates."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=500
        )

        content = response.choices[0].message.content

        print("--- Raw Response ---")
        print(content)

        # Remove markdown blocks
        content = re.sub(r"```json", "", content)
        content = re.sub(r"```", "", content)

        # Remove comments
        content = re.sub(r"//.*", "", content)

        # Fix trailing commas
        content = re.sub(r",\s*}", "}", content)
        content = re.sub(r",\s*]", "]", content)

        content = content.strip()

        try:
            data = json.loads(content)

            print("--- JSON Parsed ---")

            rankings = data.get("rankings", [])

            # Validate IDs
            valid_ids = set(candidate_ids)

            rankings = [
                r for r in rankings
                if str(r.get("application_id")) in valid_ids
            ]

            return rankings

        except Exception as e:
            print("JSON parse error:", e)
            print("Cleaned response:", content)
            return None

    try:
        with concurrent.futures.ThreadPoolExecutor() as executor:

            future = executor.submit(run_rerank)

            result = future.result(timeout=5)

            return result

    except concurrent.futures.TimeoutError:
        print("Groq reranking timeout (5 seconds)")
        return None

    except Exception as e:
        print(f"Error caught: {type(e).__name__} - {e}")
        return None