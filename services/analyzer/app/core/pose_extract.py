from __future__ import annotations
from pathlib import Path
import cv2
import mediapipe as mp

mp_pose = mp.solutions.pose


def extract_pose_samples(path: Path, fps_hint: float | None = None) -> list[dict]:
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise ValueError("unable_to_open_video")
    fps = cap.get(cv2.CAP_PROP_FPS) or fps_hint or 30.0
    sample_every = max(1, int(fps // 6) or 1)
    idx = 0
    rows: list[dict] = []
    with mp_pose.Pose(static_image_mode=False, model_complexity=1, min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            if idx % sample_every != 0:
                idx += 1
                continue
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = pose.process(rgb)
            if result.pose_landmarks:
                lm = result.pose_landmarks.landmark
                rows.append({
                    "frame": idx,
                    "time": idx / fps,
                    "nose": (lm[0].x, lm[0].y),
                    "l_shoulder": (lm[11].x, lm[11].y),
                    "r_shoulder": (lm[12].x, lm[12].y),
                    "l_elbow": (lm[13].x, lm[13].y),
                    "r_elbow": (lm[14].x, lm[14].y),
                    "l_wrist": (lm[15].x, lm[15].y),
                    "r_wrist": (lm[16].x, lm[16].y),
                    "l_hip": (lm[23].x, lm[23].y),
                    "r_hip": (lm[24].x, lm[24].y),
                    "l_knee": (lm[25].x, lm[25].y),
                    "r_knee": (lm[26].x, lm[26].y),
                })
            idx += 1
    cap.release()
    return rows
