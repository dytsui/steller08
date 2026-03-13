from typing import Literal, List
from pydantic import BaseModel

AnalysisSource = Literal["camera", "upload", "screen-camera", "screen-upload"]

class AnalyzeUrlRequest(BaseModel):
    sessionId: str
    studentId: str
    sourceType: AnalysisSource
    videoUrl: str
    fileName: str

class Keyframe(BaseModel):
    label: Literal["address", "top", "impact", "finish"]
    timeSec: float
    confidence: float
    imageKey: str | None = None
    imageUrl: str | None = None
    imageBase64: str | None = None

class Metrics(BaseModel):
    spineTiltDeg: float
    shoulderTurnDeg: float
    hipTurnDeg: float
    headSwayPx: float
    wristPathScore: float
    kneeFlexDeg: float | None = None
    elbowTrailDeg: float | None = None
    pelvisSlidePx: float | None = None

class Issue(BaseModel):
    code: str
    severity: Literal["low", "medium", "high"]
    titleZh: str
    titleEn: str
    detailZh: str
    detailEn: str

class AnalysisResult(BaseModel):
    sessionId: str
    studentId: str
    sourceType: AnalysisSource
    mode: Literal["deep"] = "deep"
    score: int
    tempoRatio: float
    backswingMs: int
    downswingMs: int
    phaseDetected: str
    keyframes: List[Keyframe]
    metrics: Metrics
    issues: List[Issue]
    reportZh: str
    reportEn: str
    trainingPlanZh: List[str]
    trainingPlanEn: List[str]
    createdAt: str
