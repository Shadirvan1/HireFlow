# services/resume_parser.py
import fitz
from io import BytesIO

def extract_text_from_bytes(file_bytes: bytes) -> str:
    """
    Extract text from PDF bytes (no disk storage needed)
    """

    with BytesIO(file_bytes) as f:
        doc = fitz.open(stream=f.read(), filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
    return text