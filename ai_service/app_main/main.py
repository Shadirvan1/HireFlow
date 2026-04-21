from fastapi import FastAPI,Security, HTTPException, status,Depends
from routes.resume_router import router as resume_api_router
from routes.jd_router import router as job_api_router
from routes.rank_router import router as rank_api_router
from routes.agent_router import router as agent_api_router

from fastapi.security.api_key import APIKeyHeader

import os

app = FastAPI(
    title="HireFlow AI Service",
    docs_url="/api/ai/docs",
    redoc_url="/api/ai/redoc",
    openapi_url="/api/ai/openapi.json"
)
@app.get("/api/ai/health/")
def health_check():
    return {"status": "healthy"}



API_KEY = os.getenv("SECRET_KEY")
api_key_header = APIKeyHeader(name="X-API-KEY")

def get_api_key(api_key: str = Security(api_key_header)):
    
    if api_key == API_KEY:
        
        return api_key
    
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")


app.include_router(
    resume_api_router,
    prefix="/api/ai", 
    dependencies=[Depends(get_api_key)]
)
app.include_router(
    job_api_router, 
    prefix="/api/ai", 
    dependencies=[Depends(get_api_key)]
)
app.include_router(
    rank_api_router, 
    prefix="/api/ai", 
    dependencies=[Depends(get_api_key)]
)
app.include_router(
    agent_api_router, 
    prefix="/api/ai", 
    dependencies=[Depends(get_api_key)]
)
