"use client";

import type { AnalysisResult, AnalysisSource } from "@/lib/types";

type LandmarkPoint = { x: number; y: number; z?: number; visibility?: number };

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm";

function angle(a: LandmarkPoint, b: LandmarkPoint, c: LandmarkPoint) {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const denom = Math.hypot(abx, aby) * Math.hypot(cbx, cby);
  if (!denom) return 0;
  const cos = Math.max(-1, Math.min(1, (abx * cbx + aby * cby) / denom));
  return (Math.acos(cos) * 180) / Math.PI;
}

function distance(a: LandmarkPoint, b: LandmarkPoint, scale = 1000) {
  return Math.hypot(a.x - b.x, a.y - b.y) * scale;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function waitFor(el: HTMLVideoElement, event: string) {
  return new Promise<void>((resolve, reject) => {
    const done = () => {
      cleanup();
      resolve();
    };
    const fail = () => {
      cleanup();
      reject(new Error(`video_${event}_failed`));
    };
    const cleanup = () => {
      el.removeEventListener(event, done);
      el.removeEventListener("error", fail);
    };
    el.addEventListener(event, done, { once: true });
    el.addEventListener("error", fail, { once: true });
  });
}

function phaseFromLandmarks(landmarks: LandmarkPoint[]) {
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const shoulderMidY = (landmarks[11].y + landmarks[12].y) / 2;
  const hipY = (landmarks[23].y + landmarks[24].y) / 2;
  const wristY = Math.min(leftWrist.y, rightWrist.y);
  if (wristY < shoulderMidY - 0.1) return "top";
  if (leftWrist.y > hipY - 0.05 && rightWrist.y > hipY - 0.05) return "impact";
  if (leftWrist.y < hipY && rightWrist.y < hipY) return "finish";
  return "address";
}

function metricsFromLandmarks(landmarks: LandmarkPoint[]) {
  return {
    spineTiltDeg: Number(angle(landmarks[11], landmarks[23], landmarks[25]).toFixed(1)),
    shoulderTurnDeg: Number((Math.abs(landmarks[11].x - landmarks[12].x) * 100).toFixed(1)),
    hipTurnDeg: Number((Math.abs(landmarks[23].x - landmarks[24].x) * 100).toFixed(1)),
    headSwayPx: Number(distance(landmarks[0], { ...landmarks[0], x: 0.5, y: landmarks[0].y }, 280).toFixed(1)),
    wristPathScore: Number((100 - clamp(distance(landmarks[15], landmarks[16], 120), 0, 40)).toFixed(1)),
    kneeFlexDeg: Number(angle(landmarks[23], landmarks[25], landmarks[27]).toFixed(1)),
    elbowTrailDeg: Number(angle(landmarks[12], landmarks[14], landmarks[16]).toFixed(1)),
    pelvisSlidePx: Number(distance(landmarks[23], landmarks[24], 260).toFixed(1))
  };
}

function averageMetrics(samples: AnalysisResult["metrics"][]) {
  const total = samples.reduce((acc, sample) => ({
    spineTiltDeg: acc.spineTiltDeg + sample.spineTiltDeg,
    shoulderTurnDeg: acc.shoulderTurnDeg + sample.shoulderTurnDeg,
    hipTurnDeg: acc.hipTurnDeg + sample.hipTurnDeg,
    headSwayPx: acc.headSwayPx + sample.headSwayPx,
    wristPathScore: acc.wristPathScore + sample.wristPathScore,
    kneeFlexDeg: (acc.kneeFlexDeg ?? 0) + (sample.kneeFlexDeg ?? 0),
    elbowTrailDeg: (acc.elbowTrailDeg ?? 0) + (sample.elbowTrailDeg ?? 0),
    pelvisSlidePx: (acc.pelvisSlidePx ?? 0) + (sample.pelvisSlidePx ?? 0)
  }), {
    spineTiltDeg: 0,
    shoulderTurnDeg: 0,
    hipTurnDeg: 0,
    headSwayPx: 0,
    wristPathScore: 0,
    kneeFlexDeg: 0,
    elbowTrailDeg: 0,
    pelvisSlidePx: 0
  });
  const count = Math.max(1, samples.length);
  return {
    spineTiltDeg: Number((total.spineTiltDeg / count).toFixed(1)),
    shoulderTurnDeg: Number((total.shoulderTurnDeg / count).toFixed(1)),
    hipTurnDeg: Number((total.hipTurnDeg / count).toFixed(1)),
    headSwayPx: Number((total.headSwayPx / count).toFixed(1)),
    wristPathScore: Number((total.wristPathScore / count).toFixed(1)),
    kneeFlexDeg: Number(((total.kneeFlexDeg ?? 0) / count).toFixed(1)),
    elbowTrailDeg: Number(((total.elbowTrailDeg ?? 0) / count).toFixed(1)),
    pelvisSlidePx: Number(((total.pelvisSlidePx ?? 0) / count).toFixed(1))
  };
}

function scoreFromMetrics(metrics: AnalysisResult["metrics"]) {
  return Math.round(clamp(
    92
      - Math.max(0, metrics.headSwayPx - 12) * 0.45
      - Math.max(0, 72 - metrics.wristPathScore) * 0.2
      - Math.max(0, 32 - metrics.hipTurnDeg) * 0.35,
    55,
    95
  ));
}

export async function runVideoQuickScan(file: File, sourceType: AnalysisSource) {
  const [{ FilesetResolver, PoseLandmarker }] = await Promise.all([
    import("@mediapipe/tasks-vision")
  ]);
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
  const landmarker = await PoseLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.45,
    minPosePresenceConfidence: 0.45,
    minTrackingConfidence: 0.45
  });

  const video = document.createElement("video");
  video.playsInline = true;
  video.muted = true;
  video.preload = "auto";
  const url = URL.createObjectURL(file);
  video.src = url;
  await waitFor(video, "loadedmetadata");

  const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 2.4;
  const sampleTimes = [0.06, 0.28, 0.46, 0.62, 0.78, 0.92].map((ratio) => Math.max(0, Math.min(duration - 0.02, duration * ratio)));
  const poseSamples: Array<{ phase: string; timeSec: number; metrics: AnalysisResult["metrics"] }> = [];

  for (const timeSec of sampleTimes) {
    video.currentTime = timeSec;
    await waitFor(video, "seeked");
    const result = landmarker.detectForVideo(video, Math.round(timeSec * 1000));
    const landmarks = result?.landmarks?.[0] as LandmarkPoint[] | undefined;
    if (!landmarks?.length) continue;
    poseSamples.push({
      phase: phaseFromLandmarks(landmarks),
      timeSec,
      metrics: metricsFromLandmarks(landmarks)
    });
  }

  landmarker.close();
  URL.revokeObjectURL(url);

  if (poseSamples.length < 3) {
    throw new Error(sourceType.startsWith("screen") ? "screen_quick_scan_failed" : "quick_scan_failed");
  }

  const address = poseSamples[0];
  const impact = poseSamples[Math.min(poseSamples.length - 1, Math.max(1, Math.round(poseSamples.length * 0.66)))];
  const finish = poseSamples[poseSamples.length - 1];
  const top = [...poseSamples].sort((a, b) => b.metrics.shoulderTurnDeg - a.metrics.shoulderTurnDeg)[0];

  const averaged = averageMetrics([address.metrics, top.metrics, impact.metrics, finish.metrics]);
  return {
    durationMs: Math.round(duration * 1000),
    phaseDetected: "address-top-impact-finish",
    metrics: averaged,
    score: scoreFromMetrics(averaged),
    keyframes: [
      { label: "address", timeSec: Number(address.timeSec.toFixed(2)), confidence: 0.71 },
      { label: "top", timeSec: Number(top.timeSec.toFixed(2)), confidence: 0.74 },
      { label: "impact", timeSec: Number(impact.timeSec.toFixed(2)), confidence: 0.72 },
      { label: "finish", timeSec: Number(finish.timeSec.toFixed(2)), confidence: 0.7 }
    ]
  };
}
