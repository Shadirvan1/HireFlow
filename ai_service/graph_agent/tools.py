import os
import json
import re
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from schemas.langgraph import HiringState
from vector_db.chroma_client import job_collection

# --- LLM INITIALIZATION ---
# Using the standard GOOGLE_API_KEY which is expected by the Google GenAI library
llm_groq = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY")
)

llm_gemini = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0,
    google_api_key=os.getenv("GEMINI_API_KEY") 
)



def extract_json_content(text: str) -> Dict[str, Any]:
    """
    Cleans LLM response by removing markdown blocks and whitespace 
    to ensure valid JSON parsing.
    """
    try:
        # Remove triple backticks and 'json' language identifier
        clean_text = re.sub(r"```json|```", "", text).strip()
        return json.loads(clean_text)
    except Exception as e:
        # Fallback: try to find the first '{' and last '}'
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Failed to parse JSON: {str(e)}")

# --- NODES ---

def fetch_job_data(state: HiringState):
    """Fetches job description from ChromaDB using the job_embedd_id."""
    job_id = str(state["job_embedd_id"]) # Ensure ID is a string for Chroma

    result = job_collection.get(
        ids=[job_id],
        include=["documents", "metadatas"]
    )

    documents = result.get("documents", [])
    
    if not documents or documents[0] is None:
        return {
            **state,
            "job_description": "",
            "decision": "REJECTED",
            "reason": "Job description not found in vector database."
        }

    return {
        **state,
        "job_description": documents[0],
    }

def normalize_scores(state: HiringState) -> HiringState:
    """Uses LLMs to weight candidate scores against the JD."""
    scores = state["scores"]
    jd = state["job_description"]

    prompt = f"""
    You are an AI hiring evaluator.
    Job Description: {jd}
    Candidate Scores: {scores}

    Task:
    - Weight each skill based on the job role.
    - Calculate a final normalized score out of 10.
    - Tech jobs prioritize technical skills; Client roles prioritize communication.

    Return ONLY valid JSON:
    {{
        "normalized_score": number,
        "reasoning": "short explanation"
    }}
    """

    try:
        response = llm_groq.invoke(prompt).content
        parsed = extract_json_content(response)
        return _build_normalization_response(state, parsed)

    except Exception as e:
        print(f"Groq Normalization failed: {e}. Falling back to Gemini...")
        try:
            response = llm_gemini.invoke(prompt).content
            parsed = extract_json_content(response)
            return _build_normalization_response(state, parsed)
        except Exception as e_final:
            print(f"Critical Failure in normalize_scores: {e_final}")
            return {
                **state,
                "normalized_score": 0.0,
                "score_reasoning": "System Error: Both AI providers failed during normalization."
            }

def evaluate_candidate(state: HiringState) -> HiringState:
    """Final decision making node."""
    jd = state.get("job_description", "N/A")
    scores = state.get("scores", {})
    norm_score = state.get("normalized_score", 0)
    norm_reason = state.get("score_reasoning", "No reasoning provided")

    prompt = f"""
    You are an AI Hiring Manager.
    
    CONTEXT:
    - Job Description: {jd}
    - Technical Scores: {scores}
    - Overall Calculated Score: {norm_score}/10
    - Scoring Analysis: {norm_reason}

    TASK:
    Decide if the candidate should be 'Hired' or 'Rejected'.
    If score < 7, justify a rejection. Be objective and professional.

    RETURN ONLY VALID JSON:
    {{
        "decision": "HIRED" or "REJECTED",
        "reason": "Clear explanation of why this decision was made"
    }}
    """

    try:
        response = llm_groq.invoke(prompt).content
        parsed = extract_json_content(response)
        return _finalize_decision_state(state, parsed)

    except Exception as e:
        print(f"Groq Evaluation failed: {e}. Trying Gemini Fallback...")
        try:
            response = llm_gemini.invoke(prompt).content
            parsed = extract_json_content(response)
            return _finalize_decision_state(state, parsed)
        except Exception as e_final:
            print(f"Critical Failure in evaluate_candidate: {e_final}")
            return {
                **state,
                "decision": "Rejected",
                "reason": "System Error: AI evaluators unreachable for final decision."
            }

# --- STATE HELPERS ---

def _build_normalization_response(state: HiringState, parsed: dict) -> HiringState:
    return {
        **state,
        "normalized_score": round(float(parsed.get("normalized_score", 0)), 2),
        "score_reasoning": parsed.get("reasoning", "Successfully calculated score.")
    }

def _finalize_decision_state(state: HiringState, parsed: dict) -> HiringState:
    return {
        **state,
        "decision": parsed.get("decision", "Rejected"),
        "reason": parsed.get("reason", "No reason provided by AI.")
    }

def decision_guard(state: HiringState) -> HiringState:
    """Safety node to prevent low-score hires."""
    if state["decision"] == "Hired" and state["normalized_score"] < 6:
        return {
            **state,
            "decision": "Rejected",
            "reason": f"Guard Override: Normalized score ({state['normalized_score']}) is below hiring threshold."
        }
    return state