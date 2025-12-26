from fastapi import FastAPI

app = FastAPI(title="GazeDash API")

@app.get("/health")
def health():
    return {"ok": True}