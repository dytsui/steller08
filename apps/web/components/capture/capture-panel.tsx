"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCameraAnalysis } from "@/hooks/use-camera-analysis";
import { getCurrentStudentId } from "@/lib/current-student";
import type { AnalysisSource } from "@/lib/types";

function toSourceType(screenMode: boolean): AnalysisSource {
  return screenMode ? "screen-camera" : "camera";
}

const flowHints = ["摄像头接通", "姿态稳定", "开始录制", "快速首扫", "Render 深分析"];

export function CapturePanel({ screenMode }: { screenMode: boolean }) {
  const sourceType = useMemo(() => toSourceType(screenMode), [screenMode]);
  const { videoRef, overlayRef, streamReady, snapshotReady, poseReady, phase, metrics, confidenceText, quickSnapshot } = useCameraAnalysis(sourceType);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("准备开始");
  const [error, setError] = useState("");

  async function startRecording() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (!stream) {
      setError("摄像头还未就绪。");
      return;
    }
    if (!snapshotReady) {
      setError("请先让人体骨架稳定识别后再开始录制。");
      return;
    }
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstart = () => {
      setRecording(true);
      setStatus("录制中");
      setError("");
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
  }

  async function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (!quickSnapshot) {
      setError("当前没有可用的真实首扫数据，无法提交分析。");
      return;
    }
    setBusy(true);
    setStatus("正在保存 session");
    const stopPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunksRef.current, { type: "video/webm" }));
    });
    recorder.stop();
    setRecording(false);
    const blob = await stopPromise;

    try {
      const studentId = getCurrentStudentId();
      if (!studentId) throw new Error("请先在学员页设定当前学员。");

      const formData = new FormData();
      formData.append("studentId", studentId);
      formData.append("sourceType", sourceType);
      formData.append("file", new File([blob], `${sourceType}-${Date.now()}.webm`, { type: "video/webm" }));

      const sessionRes = await fetch("/api/sessions", { method: "POST", body: formData });
      if (!sessionRes.ok) throw new Error(await sessionRes.text());
      const { session } = await sessionRes.json();

      setStatus("正在进行快速分析");
      const lightRes = await fetch("/api/analyze/light", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          studentId,
          sourceType,
          durationMs: quickSnapshot.durationMs,
          snapshot: quickSnapshot
        })
      });
      if (!lightRes.ok) throw new Error(await lightRes.text());

      setStatus("正在进行深度分析");
      const deepRes = await fetch("/api/analyze/deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id })
      });
      if (!deepRes.ok) throw new Error(await deepRes.text());

      window.location.href = `/analysis/${session.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "录制分析失败");
      setBusy(false);
      setStatus("失败");
    }
  }

  return (
    <div className="detail-grid">
      <div className="stack">
        <div className="video-shell">
          <video ref={videoRef} autoPlay muted playsInline />
          <canvas ref={overlayRef} className="overlay-canvas" />
          <div className="grid-overlay" />
          <div className="hud-shell">
            <div className="hud-metrics">
              {metrics.map((metric) => (
                <div key={metric.label} className="metric-chip">
                  <div className="muted">{metric.label}</div>
                  <strong>{metric.value}</strong>
                  <div className="muted">参考 {metric.target}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card>
          <div className="capture-actions">
            <Button tone="primary" disabled={!streamReady || !snapshotReady || recording || busy} onClick={startRecording}>开始录制</Button>
            <Button disabled={!recording || busy} onClick={stopRecording}>停止并分析</Button>
          </div>
        </Card>
      </div>

      <div className="stack">
        <Card>
          <div className="stack">
            <div>
              <span className="kicker">capture status</span>
              <h2 className="section-title">实时状态面板</h2>
            </div>
            <div className="status-list">
              <div className="status-card"><strong>模式</strong><div className="muted">{screenMode ? "Screen Mode 实拍" : "普通实拍"}</div></div>
              <div className="status-card"><strong>摄像头</strong><div className={streamReady ? "status-text-success" : "status-text-danger"}>{streamReady ? "已连接" : "未连接"}</div></div>
              <div className="status-card"><strong>姿态模型</strong><div className={poseReady ? "status-text-success" : "status-text-danger"}>{poseReady ? confidenceText : "正在加载姿态模型"}</div></div>
              <div className="status-card"><strong>动作阶段</strong><div className="muted">{phase}</div></div>
              <div className="status-card"><strong>链路进度</strong><div className="muted">{status}</div></div>
              {!snapshotReady ? <div className="empty-state">等待首个真实骨架快照后才允许提交分析。</div> : null}
              {error ? <div className="empty-state status-text-danger">错误：{error}</div> : null}
            </div>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <div>
              <span className="kicker">operation flow</span>
              <h2 className="section-title">录制后会发生什么</h2>
            </div>
            <div className="timeline-grid">
              {flowHints.map((item, index) => (
                <div key={item} className="timeline-card">
                  <span className="badge badge-accent">0{index + 1}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
            <div className="news-link">HUD 只显示当前阶段下最关键的指标，不显示假数，不用固定 8 项。</div>
            {screenMode ? <div className="news-link">Screen Mode 建议完整拍入屏幕边框，并减少反光与曝光过亮。</div> : <div className="news-link">普通模式建议手机稳定在髋部高度，完整拍到头部与脚部。</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
