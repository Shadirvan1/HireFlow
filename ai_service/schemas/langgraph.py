from typing import TypedDict, Dict
from pydantic import BaseModel



class ScoreInput(BaseModel):
    application_id: int
    job_embedd_id: int
    scores: dict  
 
 

class HiringState(TypedDict):
    application_id: int
    job_embedd_id: int
    scores: Dict[str, float]
    score_reasoning: str
    job_description: str
    normalized_score: float
    decision: str
    reason: str