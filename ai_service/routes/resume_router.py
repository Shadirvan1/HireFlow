from fastapi import APIRouter, UploadFile
import uuid

from services.resume_parser import extract_text
from services.embedding_service import generate_embedding
from database.chroma import resume_collection

router = APIRouter()

@router.post("/upload-resume")
async def upload_resume(file: UploadFile):

    file_id = str(uuid.uuid4())

    path = f"uploads/{file_id}.pdf"

    with open(path, "wb") as f:
        f.write(await file.read())

    text = extract_text(path)

    embedding = generate_embedding(text)

    resume_collection.add(
        ids=[file_id],
        embeddings=[embedding],
        metadatas=[{"resume_id": file_id}]
    )

    return {"resume_id": file_id}