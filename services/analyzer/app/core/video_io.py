from __future__ import annotations
from pathlib import Path
from tempfile import NamedTemporaryFile
import httpx
import cv2


def download_video(url: str) -> Path:
    with httpx.Client(timeout=120) as client:
        response = client.get(url)
        response.raise_for_status()
        with NamedTemporaryFile(delete=False, suffix=".mp4") as temp:
            temp.write(response.content)
            return Path(temp.name)


def get_video_meta(path: Path) -> dict[str, float]:
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise ValueError("unable_to_open_video")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
    width = cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0
    height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0
    cap.release()
    return {
        "fps": float(fps),
        "frames": float(frames),
        "width": float(width),
        "height": float(height),
        "durationSec": float(frames / fps) if fps else 0.0,
    }
