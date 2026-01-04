from pathlib import Path
import sys

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import app

client = TestClient(app)

def test_list_sessions():
    r = client.get("/sessions")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert any(s["id"] == "s1" for s in data)

def test_get_session_events():
    r = client.get("/sessions/s1/events")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_missing_session_404():
    r = client.get("/sessions/nope")
    assert r.status_code == 404
