# services/chunker.py
import re

def chunk_text(text: str, chunk_size: int = 120, overlap: int = 30):

    # Clean extra spaces
    text = re.sub(r'\s+', ' ', text).strip()

    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)

    chunks = []
    current_chunk = []
    current_len = 0

    for sentence in sentences:
        words = sentence.split()
        word_count = len(words)

        # If sentence fits in current chunk
        if current_len + word_count <= chunk_size:
            current_chunk.extend(words)
            current_len += word_count
        else:
            if current_chunk:
                chunks.append(" ".join(current_chunk))

                # Create overlap
                overlap_words = current_chunk[-overlap:]
                current_chunk = overlap_words + words
                current_len = len(current_chunk)
            else:
                # Sentence longer than chunk
                chunks.append(" ".join(words[:chunk_size]))
                current_chunk = words[chunk_size-overlap:]
                current_len = len(current_chunk)

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks