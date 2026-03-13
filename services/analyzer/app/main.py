import os
from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from .schemas import AnalyzeUrlRequest
from .analysis import analyze_url, analyze_file

app = FastAPI(title="steller07-analyzer")


def ensure_token(authorization: str | None):
    expected = os.getenv("ANALYZER_TOKEN")
    if not expected:
        return
    provided = (authorization or "").removeprefix("Bearer ").strip()
    if provided != expected:
        raise HTTPException(status_code=401, detail="invalid_analyzer_token")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/v1/analyze/url")
def analyze_from_url(request: AnalyzeUrlRequest, authorization: str | None = Header(default=None)):
    ensure_token(authorization)
    try:
        return analyze_url(
            session_id=request.sessionId,
            student_id=request.studentId,
            source_type=request.sourceType,
            video_url=request.videoUrl,
        )
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/v1/analyze/upload")
def analyze_from_upload(
    sessionId: str,
    studentId: str,
    sourceType: str,
    file: UploadFile = File(...),
    authorization: str | None = Header(default=None),
):
    ensure_token(authorization)
    try:
        return analyze_file(
            session_id=sessionId,
            student_id=studentId,
            source_type=sourceType,
            upload=file,
        )
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc))
