from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class Session(BaseModel):
    id: str
    started_at: str
    source: str
    notes: str | None = None


app = FastAPI(title="GazeDash API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

@app.get("/")
def root():
    return {"service": "GazeDash API", "docs": "/docs"}

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/sessions", response_model=List[Session])
def list_sessions():
    now = datetime.now(timezone.utc).isoformat()
    return [
        {"id": "s1", "started_at": now, "source": "mock", "notes": "First test session"},
        {"id": "s2", "started_at": now, "source": "mock", "notes": "Second test session"},

    ]