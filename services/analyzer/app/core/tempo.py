from __future__ import annotations


def compute_tempo(address_sec: float, top_sec: float, impact_sec: float) -> tuple[int, int, float]:
    backswing_ms = int(max(200, (top_sec - address_sec) * 1000))
    downswing_ms = int(max(120, (impact_sec - top_sec) * 1000))
    ratio = round(backswing_ms / max(1, downswing_ms), 2)
    return backswing_ms, downswing_ms, ratio
