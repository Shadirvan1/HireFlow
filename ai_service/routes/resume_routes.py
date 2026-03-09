from fastapi import APIRouter, UploadFile
import fitz
from services.embedding_service import create_embedding
from vector_db.chroma_client import collection

router = APIRouter()

@router.post("/upload-resume")
async def upload_resume(file: UploadFile):

    pdf_bytes = await file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    text = ""
    for page in doc:
        text += page.get_text()

    embedding = create_embedding(text)

    collection.add(
        documents=[text],
        embeddings=[embedding],
        ids=[file.filename]
    )

    return {"message": "resume stored"}