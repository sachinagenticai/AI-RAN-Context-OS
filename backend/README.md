# Backend API

This folder contains a FastAPI backend scaffold for AI RAN Context OS using a clean, modular structure.

## Structure

- app/main.py: application entrypoint
- app/api/v1: versioned API routes
- app/services: business logic services
- app/schemas: Pydantic request/response models
- app/core: configuration and logging

## Run locally

```bash
cd backend
python3 -m pip install -r requirements.txt
PYTHONPATH=. python3 -m uvicorn app.main:app --reload
```

## Health check

```bash
curl http://127.0.0.1:8000/api/v1/health
```
