from __future__ import annotations
from pathlib import Path
import cv2
import numpy as np


def _order_points(points: np.ndarray) -> np.ndarray:
    rect = np.zeros((4, 2), dtype="float32")
    sums = points.sum(axis=1)
    rect[0] = points[np.argmin(sums)]
    rect[2] = points[np.argmax(sums)]
    diffs = np.diff(points, axis=1)
    rect[1] = points[np.argmin(diffs)]
    rect[3] = points[np.argmax(diffs)]
    return rect


def _detect_screen_quad(frame: np.ndarray) -> np.ndarray | None:
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 50, 160)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    frame_area = frame.shape[0] * frame.shape[1]
    best = None
    best_area = 0.0
    for contour in contours:
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.02 * peri, True)
        area = cv2.contourArea(approx)
        if len(approx) == 4 and area > frame_area * 0.16 and area > best_area:
            best = approx.reshape(4, 2).astype("float32")
            best_area = area
    return best


def _warp_screen(frame: np.ndarray, quad: np.ndarray) -> np.ndarray:
    rect = _order_points(quad)
    (tl, tr, br, bl) = rect
    width_a = np.linalg.norm(br - bl)
    width_b = np.linalg.norm(tr - tl)
    height_a = np.linalg.norm(tr - br)
    height_b = np.linalg.norm(tl - bl)
    width = int(max(width_a, width_b))
    height = int(max(height_a, height_b))
    if width < 64 or height < 64:
        return frame
    dst = np.array([[0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]], dtype="float32")
    matrix = cv2.getPerspectiveTransform(rect, dst)
    return cv2.warpPerspective(frame, matrix, (width, height))


def preprocess_screen_video(path: Path) -> Path:
    out_path = path.with_name(path.stem + "_screen.mp4")
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise ValueError("unable_to_open_video")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    ok, first = cap.read()
    if not ok:
        cap.release()
        raise ValueError("empty_video")
    quad = _detect_screen_quad(first)
    first_processed = _warp_screen(first, quad) if quad is not None else first
    first_processed = cv2.convertScaleAbs(first_processed, alpha=1.12, beta=10)
    first_processed = cv2.fastNlMeansDenoisingColored(first_processed, None, 3, 3, 7, 21)

    height, width = first_processed.shape[:2]
    writer = cv2.VideoWriter(str(out_path), cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))
    writer.write(first_processed)

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        processed = _warp_screen(frame, quad) if quad is not None else frame
        processed = cv2.convertScaleAbs(processed, alpha=1.12, beta=10)
        processed = cv2.fastNlMeansDenoisingColored(processed, None, 3, 3, 7, 21)
        if processed.shape[1] != width or processed.shape[0] != height:
            processed = cv2.resize(processed, (width, height))
        writer.write(processed)

    cap.release()
    writer.release()
    return out_path
