# Base image
FROM python:3.11-slim

# Prevent python buffering
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better caching)
COPY requirements.txt .

# Upgrade pip
RUN pip install --upgrade pip

# Install dependencies
RUN pip install --default-timeout=1000 -r requirements.txt

# Copy project files
COPY . .

# Expose FastAPI port
EXPOSE 8002

# Run FastAPI
CMD ["uvicorn", "app_main.main:app", "--host", "0.0.0.0", "--port", "8002"]