"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { AnalysisSource } from "@/lib/types";

type Metric = { label: string; value: number; target: string };
type LandmarkPoint = { x: number; y: number; z?: number; visibility?: number };
type HudPoint = { id: string; x: number; y: number; visible: boolean };
type QuickSnapshot = {
  durationMs: number;
  phaseDetected: string;
  keyframes: Array<{ label: "address" | "top" | "impact" | "finish"; timeSec: number; confidence: number }>;
  metrics: {
    spineTiltDeg: number;
    shoulderTurnDeg: number;
    hipTurnDeg: number;
    headSwayPx: number;
    wristPathScore: number;
    kneeFlexDeg: number;
    elbowTrailDeg: number;
    pelvisSlidePx: number;
  };
  score: number;
};

type CameraAnalysisState = {
  videoRef: RefObject<HTMLVideoElement | null>;
  overlayRef: RefObject<HTMLCanvasElement | null>;
  streamReady: boolean;
  snapshotReady: boolean;
  metrics: Metric[];
  phase: string;
  hudPoints: HudPoint[];
  poseReady: boolean;
  confidenceText: string;
  quickSnapshot: QuickSnapshot | null;
};

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

function phaseFromLandmarks(landmarks: LandmarkPoint[]) {
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const shoulderMidY = (landmarks[11].y + landmarks[12].y) / 2;
  const wristY = Math.min(leftWrist.y, rightWrist.y);
  const hipY = (landmarks[23].y + landmarks[24].y) / 2;
  const wristSpread = Math.abs(leftWrist.x - rightWrist.x);

  if (wristY < shoulderMidY - 0.1) return "top";
  if (wristSpread < 0.08 && leftWrist.y > hipY - 0.05) return "impact";
  if (leftWrist.y < hipY && rightWrist.y < hipY) return "finish";
  return "address";
}

function buildMetrics(landmarks: LandmarkPoint[]) {
  const metrics = {
    spineTiltDeg: Number(angle(landmarks[11], landmarks[23], landmarks[25]).toFixed(1)),
    shoulderTurnDeg: Number((Math.abs(landmarks[11].x - landmarks[12].x) * 100).toFixed(1)),
    hipTurnDeg: Number((Math.abs(landmarks[23].x - landmarks[24].x) * 100).toFixed(1)),
    headSwayPx: Number(distance(landmarks[0], { ...landmarks[0], x: 0.5, y: landmarks[0].y }, 300).toFixed(1)),
    wristPathScore: 0,
    kneeFlexDeg: Number(angle(landmarks[23], landmarks[25], landmarks[27]).toFixed(1)),
    elbowTrailDeg: Number(angle(landmarks[12], landmarks[14], landmarks[16]).toFixed(1)),
    pelvisSlidePx: Number(distance(landmarks[23], landmarks[24], 300).toFixed(1))
  };
  metrics.wristPathScore = Number((100 - clamp(distance(landmarks[15], landmarks[16], 120), 0, 40)).toFixed(1));
  return metrics;
}

function metricsToHud(metrics: QuickSnapshot["metrics"]): Metric[] {
  return [
    { label: '头部', value: metrics.headSwayPx, target: '0–15px' },
    { label: '脊柱', value: metrics.spineTiltDeg, target: '32–38°' },
    { label: '肩转', value: metrics.shoulderTurnDeg, target: '75–95' },
    { label: '髋滑移', value: metrics.pelvisSlidePx, target: '8–18px' },
    { label: '手腕', value: metrics.wristPathScore, target: '70–100' },
    { label: '髋转', value: metrics.hipTurnDeg, target: '35–45' },
    { label: '膝盖', value: metrics.kneeFlexDeg, target: '18–30°' },
    { label: '肘部', value: metrics.elbowTrailDeg, target: '75–110°' }
  ];
}

function drawOverlay(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  points: HudPoint[],
  phase: string,
  confidenceText: string,
  screenMode: boolean
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = video.videoWidth || canvas.width;
  const height = video.videoHeight || canvas.height;
  if (!width || !height) return;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo((width / 3) * i, 0);
    ctx.lineTo((width / 3) * i, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, (height / 3) * i);
    ctx.lineTo(width, (height / 3) * i);
    ctx.stroke();
  }

  const map = Object.fromEntries(points.map((p) => [p.id, p]));
  const segments = [
    ["nose", "lShoulder"],
    ["nose", "rShoulder"],
    ["lShoulder", "rShoulder"],
    ["lShoulder", "lHip"],
    ["rShoulder", "rHip"],
    ["lHip", "rHip"],
    ["lShoulder", "lWrist"],
    ["rShoulder", "rWrist"]
  ];
  ctx.strokeStyle = "rgba(192,132,252,0.35)";
  ctx.lineWidth = 2;
  segments.forEach(([a, b]) => {
    const pa = map[a];
    const pb = map[b];
    if (!pa?.visible || !pb?.visible) return;
    ctx.beginPath();
    ctx.moveTo(pa.x * width, pa.y * height);
    ctx.lineTo(pb.x * width, pb.y * height);
    ctx.stroke();
  });

  points.forEach((point) => {
    if (!point.visible) return;
    ctx.beginPath();
    ctx.fillStyle = "rgba(216,180,254,0.55)";
    ctx.arc(point.x * width, point.y * height, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(9,8,17,0.45)";
  ctx.fillRect(12, 12, 230, 54);
  ctx.fillStyle = "#f8f4ff";
  ctx.font = "600 14px Inter, sans-serif";
  ctx.fillText(`阶段: ${phase}`, 24, 34);
  ctx.fillStyle = "#b6a7cf";
  ctx.font = "12px Inter, sans-serif";
  ctx.fillText(`${screenMode ? "Screen" : "Normal"} · ${confidenceText}`, 24, 54);
}

export function useCameraAnalysis(sourceType: AnalysisSource): CameraAnalysisState {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [poseReady, setPoseReady] = useState(false);
  const [snapshotReady, setSnapshotReady] = useState(false);
  const [phase, setPhase] = useState("address");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [hudPoints, setHudPoints] = useState<HudPoint[]>([]);
  const [confidenceText, setConfidenceText] = useState("准备中");
  const snapshotRef = useRef<QuickSnapshot | null>(null);
  const sampleRef = useRef<Array<{ phase: string; timeSec: number; metrics: QuickSnapshot["metrics"] }>>([]);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let raf = 0;
    let poseLandmarker: any = null;

    async function boot() {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      if (cancelled) return;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setStreamReady(true);

      try {
        const vision = await import("@mediapipe/tasks-vision");
        const fileset = await vision.FilesetResolver.forVisionTasks(WASM_URL);
        poseLandmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.45,
          minPosePresenceConfidence: 0.45,
          minTrackingConfidence: 0.45
        });
        if (!cancelled) setPoseReady(true);
      } catch {
        setConfidenceText("姿态模型加载失败");
      }

      const startedAt = performance.now();
      const loop = () => {
        const video = videoRef.current;
        if (cancelled || !video || video.readyState < 2) {
          raf = requestAnimationFrame(loop);
          return;
        }

        if (poseLandmarker) {
          const result = poseLandmarker.detectForVideo(video, performance.now());
          const landmarks = result?.landmarks?.[0] as LandmarkPoint[] | undefined;
          if (landmarks?.length) {
            const quickMetrics = buildMetrics(landmarks);
            const nextPhase = phaseFromLandmarks(landmarks);
            const nextHud = metricsToHud(quickMetrics);
            const score = Math.round(clamp(
              92 - Math.max(0, quickMetrics.headSwayPx - 12) * 0.5 - Math.max(0, 70 - quickMetrics.wristPathScore) * 0.15,
              55,
              95
            ));
            const timeSec = Math.max(0.01, (performance.now() - startedAt) / 1000);
            sampleRef.current.push({ phase: nextPhase, timeSec, metrics: quickMetrics });
            if (sampleRef.current.length > 16) sampleRef.current.shift();
            const top = [...sampleRef.current].sort((a, b) => b.metrics.shoulderTurnDeg - a.metrics.shoulderTurnDeg)[0] ?? sampleRef.current[0];
            const impact = sampleRef.current[Math.min(sampleRef.current.length - 1, Math.max(1, Math.round(sampleRef.current.length * 0.66)))] ?? sampleRef.current[0];
            const finish = sampleRef.current[sampleRef.current.length - 1];
            const address = sampleRef.current[0];
            snapshotRef.current = {
              durationMs: Math.max(1200, performance.now() - startedAt),
              phaseDetected: "address-top-impact-finish",
              keyframes: [
                { label: "address", timeSec: Number(address.timeSec.toFixed(2)), confidence: 0.73 },
                { label: "top", timeSec: Number(top.timeSec.toFixed(2)), confidence: 0.75 },
                { label: "impact", timeSec: Number(impact.timeSec.toFixed(2)), confidence: 0.72 },
                { label: "finish", timeSec: Number(finish.timeSec.toFixed(2)), confidence: 0.7 }
              ],
              metrics: quickMetrics,
              score
            };
            setSnapshotReady(true);
            setPhase(nextPhase);
            setMetrics(nextHud);
            setConfidenceText("实时骨架已连接");
            const nextPoints: HudPoint[] = [
              { id: "nose", x: landmarks[0].x, y: landmarks[0].y, visible: true },
              { id: "lShoulder", x: landmarks[11].x, y: landmarks[11].y, visible: true },
              { id: "rShoulder", x: landmarks[12].x, y: landmarks[12].y, visible: true },
              { id: "lHip", x: landmarks[23].x, y: landmarks[23].y, visible: true },
              { id: "rHip", x: landmarks[24].x, y: landmarks[24].y, visible: true },
              { id: "lWrist", x: landmarks[15].x, y: landmarks[15].y, visible: true },
              { id: "rWrist", x: landmarks[16].x, y: landmarks[16].y, visible: true },
              { id: "lKnee", x: landmarks[25].x, y: landmarks[25].y, visible: true },
              { id: "rKnee", x: landmarks[26].x, y: landmarks[26].y, visible: true }
            ];
            setHudPoints(nextPoints);
            if (overlayRef.current) {
              drawOverlay(overlayRef.current, video, nextPoints, nextPhase, "实时骨架已连接", sourceType.startsWith("screen"));
            }
          } else {
            setConfidenceText("请调整机位或光线");
          }
        }

        raf = requestAnimationFrame(loop);
      };

      raf = requestAnimationFrame(loop);
    }

    boot().catch(() => setConfidenceText("摄像头未就绪"));
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [sourceType]);

  return useMemo(
    () => ({ videoRef, overlayRef, streamReady, snapshotReady, poseReady, phase, metrics, hudPoints, confidenceText, quickSnapshot: snapshotRef.current }),
    [streamReady, snapshotReady, poseReady, phase, metrics, hudPoints, confidenceText]
  );
}
