FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1


WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip


RUN pip install --default-timeout=1000 -r requirements.txt


COPY . .


EXPOSE 8002


CMD ["uvicorn", "app_main.main:app", "--host", "0.0.0.0", "--port", "8002"]