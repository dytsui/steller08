from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from tempfile import NamedTemporaryFile
import base64

import cv2
import numpy as np
from fastapi import UploadFile

from .core.issues import detect_issues
from .core.pose_extract import extract_pose_samples
from .core.reporting import build_report
from .core.screen_mode import preprocess_screen_video
from .core.tempo import compute_tempo
from .core.video_io import download_video, get_video_meta
from .schemas import AnalysisResult, Keyframe, Metrics


def _angle(a, b, c) -> float:
    ba = np.array(a) - np.array(b)
    bc = np.array(c) - np.array(b)
    denom = np.linalg.norm(ba) * np.linalg.norm(bc)
    if denom == 0:
        return 0.0
    cos = np.clip(np.dot(ba, bc) / denom, -1.0, 1.0)
    return float(np.degrees(np.arccos(cos)))


def _extract_keyframe_images(path: Path, keyframes: list[Keyframe]) -> list[Keyframe]:
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        return keyframes
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    enriched: list[Keyframe] = []
    for frame in keyframes:
        frame_index = max(0, int(round(frame.timeSec * fps)))
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
        ok, image = cap.read()
        if not ok:
            enriched.append(frame)
            continue
        image = cv2.resize(image, (640, 360))
        ok, encoded = cv2.imencode('.jpg', image, [int(cv2.IMWRITE_JPEG_QUALITY), 84])
        if not ok:
            enriched.append(frame)
            continue
        payload = base64.b64encode(encoded.tobytes()).decode('ascii')
        enriched.append(Keyframe(**frame.model_dump(), imageBase64=payload))
    cap.release()
    return enriched


def _analyze_path(session_id: str, student_id: str, source_type: str, path: Path) -> AnalysisResult:
    if source_type.startswith('screen'):
        path = preprocess_screen_video(path)

    meta = get_video_meta(path)
    lms = extract_pose_samples(path, fps_hint=meta['fps'])
    if len(lms) < 4:
        raise ValueError('not_enough_pose_samples')

    address = lms[0]
    top = max(lms, key=lambda row: row['time'] + abs(row['l_wrist'][1] - row['r_wrist'][1]) + row['l_shoulder'][0] - row['r_shoulder'][0])
    impact = lms[min(len(lms) - 1, max(1, int(len(lms) * 0.7)))]
    finish = lms[-1]

    backswing_ms, downswing_ms, ratio = compute_tempo(address['time'], top['time'], impact['time'])

    shoulder_turn = abs(top['l_shoulder'][0] - top['r_shoulder'][0]) * 100
    hip_turn = abs(top['l_hip'][0] - top['r_hip'][0]) * 100
    head_sway = abs(impact['nose'][0] - address['nose'][0]) * 200
    wrist_score = 100 - min(40, abs(top['l_wrist'][0] - impact['l_wrist'][0]) * 100)
    spine_tilt = _angle(top['l_shoulder'], top['l_hip'], top['l_knee'])
    knee_flex = _angle(top['l_hip'], top['l_knee'], finish['l_knee'])
    elbow_trail = _angle(top['r_shoulder'], top['r_elbow'], top['r_wrist'])
    pelvis_slide = abs(impact['l_hip'][0] - address['l_hip'][0]) * 200

    issues = detect_issues(head_sway, hip_turn, wrist_score, source_type, ratio)
    score = max(50, min(95, int(92 - len(issues) * 6 - max(0, head_sway - 12) * 0.4)))
    report_zh, report_en, plan_zh, plan_en = build_report(issues)

    keyframes = [
        Keyframe(label='address', timeSec=round(address['time'], 2), confidence=0.86),
        Keyframe(label='top', timeSec=round(top['time'], 2), confidence=0.84),
        Keyframe(label='impact', timeSec=round(impact['time'], 2), confidence=0.82),
        Keyframe(label='finish', timeSec=round(finish['time'], 2), confidence=0.8),
    ]
    keyframes = _extract_keyframe_images(path, keyframes)

    return AnalysisResult(
        sessionId=session_id,
        studentId=student_id,
        sourceType=source_type,  # type: ignore[arg-type]
        score=score,
        tempoRatio=ratio,
        backswingMs=backswing_ms,
        downswingMs=downswing_ms,
        phaseDetected='address-top-impact-finish',
        keyframes=keyframes,
        metrics=Metrics(
            spineTiltDeg=round(spine_tilt, 1),
            shoulderTurnDeg=round(shoulder_turn, 1),
            hipTurnDeg=round(hip_turn, 1),
            headSwayPx=round(head_sway, 1),
            wristPathScore=round(wrist_score, 1),
            kneeFlexDeg=round(knee_flex, 1),
            elbowTrailDeg=round(elbow_trail, 1),
            pelvisSlidePx=round(pelvis_slide, 1),
        ),
        issues=issues,
        reportZh=report_zh,
        reportEn=report_en,
        trainingPlanZh=plan_zh,
        trainingPlanEn=plan_en,
        createdAt=datetime.now(timezone.utc).isoformat(),
    )


def analyze_file(session_id: str, student_id: str, source_type: str, upload: UploadFile) -> AnalysisResult:
    suffix = Path(upload.filename or 'upload.mp4').suffix or '.mp4'
    with NamedTemporaryFile(delete=False, suffix=suffix) as temp:
        temp.write(upload.file.read())
        path = Path(temp.name)
    return _analyze_path(session_id, student_id, source_type, path)


def analyze_url(session_id: str, student_id: str, source_type: str, video_url: str) -> AnalysisResult:
    path = download_video(video_url)
    return _analyze_path(session_id, student_id, source_type, path)
