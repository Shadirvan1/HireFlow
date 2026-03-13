from fastapi import APIRouter
from pydantic import BaseModel
from agent.agent_core import run_agent

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def chat(request: ChatRequest):

    result = await run_agent(request.message)
    print(f"Agent result: {result}")

    return result