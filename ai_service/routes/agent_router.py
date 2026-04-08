from graph_agent.agent_core import run_graph_agent
from typing import Optional
from fastapi import APIRouter,HTTPException
from pydantic import BaseModel
from agent.agent_core import run_agent

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    
    company_id: Optional[str] = None 
    company_name: Optional[str] = None
    user_id: str

@router.post("/chat")
async def chat(request: ChatRequest):
    result = await run_agent(
        message=request.message, 
        user_id=request.user_id,
        company_id=request.company_id,
        company_name=request.company_name
    )
    
    
    name = request.company_name or "Candidate"
    
    
    return result


class ScoreInput(BaseModel):
    application_id: int
    job_embedd_id: int
    scores: dict


@router.post("/evaluate")
async def evaluate(request: ScoreInput):
    try:
       
        result = run_graph_agent(
            application_id=request.application_id,
            job_embedd_id=request.job_embedd_id,
            scores=request.scores
        )
        return result
    except Exception as e:
        print(f"Graph Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))