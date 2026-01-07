from datetime import datetime, timezone, timedelta
from typing import List

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class Session(BaseModel):
    id: str
    started_at: str
    source: str
    notes: str | None = None

class Event(BaseModel):
    ts: str
    type: str
    value: float | bool
    confidence: float

class EventIn(BaseModel):
    ts: str
    type: str
    value: float | bool
    confidence: float

ALLOWED_EVENT_TYPES = {"attention", "offroad", "phone", "drowsy"}

class EventIn(BaseModel):
    ts: str | None = None
    type: str
    value: float | bool
    confidence: float = Field(ge = 0.0, le = 1.0)
    
class Stats(BaseModel):
    session_id: str
    events_total: int
    duration_sec: float
    attention_avg: float          
    attention_pct: float          
    offroad_count: int
    phone_count: int
    drowsy_count: int
    offroad_pct: float
    phone_pct: float
    drowsy_pct: float

app = FastAPI(title="GazeDash API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

NOW = datetime.now(timezone.utc)

MOCK_SESSIONS: dict[str, Session] = {
    "s1": Session(
        id = "s1",
        started_at = NOW.isoformat(),
        source = "mock",
        notes = "First test session",
    ),
    "s2": Session(
        id = "s2",
        started_at = NOW.isoformat(),
        source = "mock",
        notes = "Second test session",
    ),
}

MOCK_EVENTS: dict[str, List[Event]] = {
    "s1": [
        Event(ts = (NOW + timedelta(seconds = 5)).isoformat(), type = "attention", value = 0.92, confidence = 0.88),
        Event(ts = (NOW + timedelta(seconds = 12)).isoformat(), type = "offroad", value = True, confidence = 0.90),
        Event(ts = (NOW + timedelta(seconds = 20)).isoformat(), type = "phone", value = False, confidence = 0.70),
        Event(ts = (NOW + timedelta(seconds = 30)).isoformat(), type = "drowsy", value = False, confidence = 0.85),
    ],
    "s2": [
        Event(ts = (NOW + timedelta(seconds = 6)).isoformat(), type = "attention", value = 0.78, confidence = 0.86),
        Event(ts = (NOW + timedelta(seconds = 18)).isoformat(), type = "offroad", value = False, confidence = 0.92),
        Event(ts = (NOW + timedelta(seconds = 26)).isoformat(), type = "phone", value = True, confidence = 0.80),
        Event(ts = (NOW + timedelta(seconds = 40)).isoformat(), type = "drowsy", value = True, confidence = 0.76),
    ],
}

@app.get("/")
def root():
    return {"service": "GazeDash API", "docs": "/docs"}

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/sessions", response_model=List[Session])
def list_sessions():
    return list(MOCK_SESSIONS.values())

@app.get("/sessions/{session_id}", response_model=Session)
def get_session(session_id:str):
    s = MOCK_SESSIONS.get(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    return s

@app.get("/sessions/{session_id}/events", response_model=List[Event])
def get_session_events(session_id: str):
    if session_id not in MOCK_SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")
    return MOCK_EVENTS.get(session_id, [])

    MOCK_EVENTS.setdefault(session_id, [])
    for e in events:
        MOCK_EVENTS[session_id.append(
            Event(ts=e.ts, type=e.type, value=e.value, confidence=e.confidence)
        )]
    return {"added": len(events), "session_id": session_id}

@app.get("/sessions/{session_id}/stats", response_model=Stats)
def get_session_stats(session_id: str):
    if session_id not in MOCK_SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    events = MOCK_EVENTS.get(session_id, [])
    total = len(events)
    if total == 0:
        return Stats(
            session_id=session_id,
            events_total=0,
            duration_sec=0,
            attention_pct=0.0,
            offroad_pct=0.0,
            phone_pct=0.0,
            drowsy_pct=0.0,
        )
    att = [
        float(e.value)
        for e in events
        if e.type == "attention"
        and isinstance(e.value, (int, float))
        and not isinstance(e.value, bool)
    ]

    attention_avg = float(sum(att) / len(att)) if att else 0.0
    attention_pct = attention_avg * 100.0 if attention_avg <= 1.0 else attention_avg

    def count_true(t: str) -> int:
        return sum(1 for e in events if e.type == t and e.value is True)

    offroad_count = count_true("offroad")
    phone_count = count_true("phone")
    drowsy_count = count_true("drowsy")

    def pct(count: int, denom: int) -> float:
        return float(count) / float(denom) * 100.0 if denom > 0 else 0.0

    if total >= 2:
        times = [datetime.fromisoformat(e.ts) for e in events]
        duration_sec = float((max(times) - min(times)).total_seconds())
    else:
        duration_sec = 0.0

    return Stats(
        session_id=session_id,
        events_total=total,
        duration_sec=duration_sec,

        attention_avg=attention_avg,
        attention_pct=attention_avg * 100.0,

        offroad_count=offroad_count,
        phone_count=phone_count,
        drowsy_count=drowsy_count,

        offroad_pct=pct(offroad_count, total),
        phone_pct=pct(phone_count, total),
        drowsy_pct=pct(drowsy_count, total),
    )

@app.post("/sessions/{session_id}/events", response_model = Event, status_code = 201)
def add_session_event(session_id: str, payload: EventIn):
    if session_id not in MOCK_SESSIONS:
        raise HTTPException(status_code=404, detail = "Session not found")
    if payload.type not in ALLOWED_EVENT_TYPES:
        raise HTTPException(status_code=422, detail = f"Unknown event type: {payload.type}")
    if payload.type == "attention":
        if isinstance(payload.value, bool) or not isinstance(payload.value, (int, float)):
            raise HTTPException(status_code=422, detail = f"attention.value must be a number")
    else:
        if not isinstance(payload.value, bool):
            raise HTTPException(status_code=422, detail = f"{payload.type}.value must be boolean")
    ts = payload.ts or datetime.now(timezone.utc).isoformat()

    ev = Event(
        ts = ts,
        type = payload.type,
        value = payload.value,
        confidence=payload.confidence,
    )

    MOCK_EVENTS.setdefault(session_id, []).append(ev)
    return ev
