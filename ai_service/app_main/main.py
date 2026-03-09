from fastapi import FastAPI
from routes import resume_routes, job_routes, ranking_routes

app = FastAPI()

app.include_router(resume_routes.router)
app.include_router(job_routes.router)
app.include_router(ranking_routes.router)
