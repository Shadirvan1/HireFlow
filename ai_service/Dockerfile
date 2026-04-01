# Stage 1: Builder
FROM python:3.11-slim AS builder

WORKDIR /app

# Install only what is needed to build C-extensions
RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Use a cache mount to speed up subsequent pip installs
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefix=/install -r requirements.txt


# Stage 2: Final Slim Image
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy only the installed packages from the builder
COPY --from=builder /install /usr/local
COPY . .

EXPOSE 8002

# Using the JSON array syntax for CMD is faster and more stable
CMD ["uvicorn", "app_main.main:app", "--host", "0.0.0.0", "--port", "8002"]