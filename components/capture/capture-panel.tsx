"use client";

import { BrandLogo } from '@/components/layout/brand-logo';
import { useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCameraAnalysis } from '@/hooks/use-camera-analysis';
import { getCurrentStudentId, setCurrentStudentId } from '@/lib/current-student';
import { analysisPathForPortal } from '@/lib/scope';
import type { AnalysisSource } from '@/lib/types';

function toSourceType(screenMode: boolean): AnalysisSource {
  return screenMode ? 'screen-camera' : 'camera';
}

const flowHints = ['摄像头接通', '姿态稳定', '开始录制', '快速首扫', '正式分析'];
const phaseFocusMap: Record<string, string[]> = {
  address: ['头部', '脊柱'],
  takeaway: ['肩转', '手腕'],
  top: ['肩转', '髋转'],
  downswing: ['髋滑移', '手腕'],
  impact: ['头部', '脊柱'],
  finish: ['膝盖', '肘部']
};

export function CapturePanel({ screenMode }: { screenMode: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const portal = pathname.startsWith('/pro') ? 'pro' : 'app';
  const studentIdFromQuery = searchParams.get('studentId') ?? '';
  const sourceType = useMemo(() => toSourceType(screenMode), [screenMode]);
  const { videoRef, overlayRef, streamReady, snapshotReady, poseReady, phase, metrics, confidenceText, quickSnapshot } = useCameraAnalysis(sourceType);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('准备开始');
  const [error, setError] = useState('');
  const [showAllHud, setShowAllHud] = useState(false);

  async function startRecording() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (!stream) {
      setError('摄像头还未就绪。');
      return;
    }
    if (!snapshotReady) {
      setError('请先让人体骨架稳定识别后再开始录制。');
      return;
    }
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstart = () => {
      setRecording(true);
      setStatus('录制中');
      setError('');
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
  }

  async function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (!quickSnapshot) {
      setError('当前没有可用的真实首扫数据，无法提交分析。');
      return;
    }
    setBusy(true);
    setStatus('正在保存视频');
    const stopPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunksRef.current, { type: 'video/webm' }));
    });
    recorder.stop();
    setRecording(false);
    const blob = await stopPromise;

    try {
      const studentId = studentIdFromQuery || getCurrentStudentId();
      if (!studentId) throw new Error(portal === 'pro' ? '请先选择当前学员。' : '请先设置当前档案。');
      setCurrentStudentId(studentId);

      const formData = new FormData();
      formData.append('studentId', studentId);
      formData.append('sourceType', sourceType);
      formData.append('durationMs', String(Math.round(quickSnapshot.durationMs)));
      formData.append('file', new File([blob], `${sourceType}-${Date.now()}.webm`, { type: 'video/webm' }));

      const sessionRes = await fetch('/api/sessions', { method: 'POST', body: formData });
      if (!sessionRes.ok) throw new Error(await sessionRes.text());
      const { session } = await sessionRes.json();

      setStatus('正在生成快速首扫');
      const lightRes = await fetch('/api/analyze/light', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          studentId,
          sourceType,
          durationMs: quickSnapshot.durationMs,
          snapshot: quickSnapshot
        })
      });
      if (!lightRes.ok) throw new Error(await lightRes.text());

      setStatus('正在生成正式分析');
      const deepRes = await fetch('/api/analyze/deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id })
      });
      if (!deepRes.ok) throw new Error(await deepRes.text());

      window.location.href = analysisPathForPortal(portal, session.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '录制分析失败');
      setBusy(false);
      setStatus('失败');
    }
  }

  const primaryMetrics = metrics.slice(0, 4);
  const expandedMetrics = showAllHud ? metrics : primaryMetrics;
  const activeLabels = phaseFocusMap[phase] ?? [];

  return (
    <div className="detail-grid">
      <div className="stack">
        <div className="video-shell capture-shell">
          <video ref={videoRef} autoPlay muted playsInline />
          <canvas ref={overlayRef} className="overlay-canvas" />
          <div className="grid-overlay" />
          <BrandLogo href="/" className="capture-brand" ariaLabel="Homepage" />
          <div className="hud-shell hud-shell-faded">
            <div className="hud-topbar">
              <div>
                <strong>{phase.toUpperCase()}</strong>
                <div className="muted">{confidenceText}</div>
              </div>
              <button type="button" className="hud-more-button" onClick={() => setShowAllHud((value: boolean) => !value)}>
                {showAllHud ? '收起' : '查看更多'}
              </button>
            </div>
            <div className={`hud-metrics ${showAllHud ? 'hud-metrics-expanded' : ''}`}>
              {expandedMetrics.map((metric, index) => {
                const highlighted = activeLabels.includes(metric.label);
                return (
                  <div key={metric.label} className={`metric-chip metric-chip-soft ${index < 4 ? 'metric-chip-primary' : 'metric-chip-secondary'} ${highlighted ? 'metric-chip-highlight' : ''}`}>
                    <div className="muted">{metric.label}</div>
                    <strong>{metric.value}</strong>
                    <div className="metric-target">{metric.target}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="action-strip">
          {!recording ? <Button tone="primary" onClick={startRecording} disabled={busy || !streamReady || !poseReady}>开始录制</Button> : <Button tone="primary" onClick={stopRecording} disabled={busy}>结束并分析</Button>}
          <Button onClick={() => setShowAllHud((value: boolean) => !value)}>{showAllHud ? '仅看 4 项' : '查看 8 项'}</Button>
        </div>

        <Card>
          <div className="stack">
            <div className="surface-title-row">
              <div>
                <span className="kicker">capture status</span>
                <h2 className="section-title">录制状态</h2>
              </div>
              <span className="badge">{recording ? '录制中' : streamReady ? '已就绪' : '等待中'}</span>
            </div>
            <div className="timeline-grid">
              {flowHints.map((item, index) => (
                <div key={item} className="timeline-card">
                  <span className="badge badge-accent">0{index + 1}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
            <div className="muted">{status}</div>
            {error ? <div className="status-text-danger">{error}</div> : null}
          </div>
        </Card>
      </div>

      <div className="stack">
        <Card>
          <div className="stack">
            <div>
              <span className="kicker">capture guide</span>
              <h2 className="section-title">拍摄建议</h2>
            </div>
            <div className="timeline-grid">
              {flowHints.map((item, index) => (
                <div key={item} className="timeline-card">
                  <span className="badge badge-accent">0{index + 1}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
            <div className="news-link">默认显示 4 项固定指标，点击“查看更多”可展开到 8 项完整 HUD。</div>
            {screenMode ? <div className="news-link">Screen Mode 建议完整拍入屏幕边框，并减少反光与曝光过亮。</div> : <div className="news-link">普通模式建议手机稳定在髋部高度，完整拍到头部与脚部。</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
