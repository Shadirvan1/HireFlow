from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from agent.agent_core import run_agent

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    # Making these optional with a default of None
    company_id: Optional[str] = None 
    company_name: Optional[str] = None
    user_id: str

@router.post("/chat")
async def chat(request: ChatRequest):
    # Pass the values (which might be None) to the agent
    result = await run_agent(
        message=request.message, 
        user_id=request.user_id,
        company_id=request.company_id,
        company_name=request.company_name
    )
    
    # Use a fallback for the print statement to avoid errors
    name = request.company_name or "Candidate"
    print(f"Agent result for {name}: {result}")
    
    return result