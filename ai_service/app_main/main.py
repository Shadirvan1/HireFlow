from fastapi import FastAPI
from routes.resume_router import router as resume_api_router
from routes.jd_router import router as job_api_router
from routes.rank_router import router as rank_api_router
from routes.agent_router import router as agent_api_router

app = FastAPI()

app.include_router(resume_api_router, prefix="/api/ai")
app.include_router(job_api_router, prefix="/api/ai")
app.include_router(rank_api_router, prefix="/api/ai")
app.include_router(agent_api_router, prefix="/api/ai")