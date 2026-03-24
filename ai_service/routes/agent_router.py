from typing import Optional
from fastapi import APIRouter
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
