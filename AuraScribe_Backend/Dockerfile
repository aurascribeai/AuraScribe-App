FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/venv/bin:$PATH"

RUN useradd --create-home --shell /bin/bash aurascribe

WORKDIR /app

COPY requirements.txt .
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN python -m venv /venv
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p uploaded_pdfs
RUN chown -R aurascribe:aurascribe /app

USER aurascribe

EXPOSE 5000

CMD ["gunicorn", "-k", "eventlet", "-w", "1", "main:socketio", "-b", "0.0.0.0:5000"]

