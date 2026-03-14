"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deriveTrainingPlan, enrichIssue } from '@/lib/training';
import type { AnalysisResult, SessionRecord, Student } from '@/lib/types';

const phaseLabels: Array<{ key: string; label: string }> = [
  { key: 'address', label: 'Address' },
  { key: 'takeaway', label: 'Takeaway' },
  { key: 'top', label: 'Top' },
  { key: 'downswing', label: 'Downswing' },
  { key: 'impact', label: 'Impact' },
  { key: 'finish', label: 'Finish' }
];

function inferPhaseState(analysis: AnalysisResult, key: string) {
  const issues = analysis.issues.map(enrichIssue).filter((item) => item.phase === key);
  if (!issues.length) return 'pass';
  if (issues.some((item) => item.severity === 'high')) return 'fail';
  return 'warn';
}

export function AnalysisWorkbench({ id }: { id: string }) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [shareCard, setShareCard] = useState('');
  const [shareJson, setShareJson] = useState('');
  const [shareBusy, setShareBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/analysis/${id}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setAnalysis(data.analysis ?? null);
        setSession(data.session ?? null);
        setStudent(data.student ?? null);
      });
  }, [id]);

  async function share() {
    setShareBusy(true);
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: id, channel: 'manual' })
    });
    const data = await res.json();
    setShareCard(data.cardUrl ?? '');
    setShareJson(data.shareUrl ?? '');
    if (data.shareUrl) {
      await navigator.clipboard.writeText(`${window.location.origin}${data.shareUrl}`).catch(() => undefined);
    }
    setShareBusy(false);
  }

  const derivedPlan = useMemo(() => (analysis ? deriveTrainingPlan(analysis) : null), [analysis]);
  const enrichedIssues = useMemo(() => (analysis ? analysis.issues.map(enrichIssue) : []), [analysis]);

  if (!analysis) {
    return (
      <main className="page">
        <Card>
          <div className="empty-state">
            <strong>找不到分析结果</strong>
            <span>请先上传或录制一条视频，且云端链路已经回写正式结果。</span>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="page stack">
      <section className="page-hero">
        <span className="kicker">analysis result</span>
        <h1 className="page-title">分析结果工作台</h1>
        <p className="subhead">Session {session?.id} · 学员 {student?.name} · 当前结果 {analysis.mode === 'deep' ? '正式分析' : '快速结果'}</p>
        <div className="action-strip">
          <Button tone="primary" onClick={share} disabled={shareBusy}>{shareBusy ? '生成中…' : '生成摘要卡并复制链接'}</Button>
          <Link href={`/analysis/${id}/issues`} className="button button-neutral">查看全部问题</Link>
          {shareCard ? <a className="button button-neutral" href={shareCard} target="_blank" rel="noreferrer">查看摘要卡</a> : null}
          {shareJson ? <a className="button button-neutral" href={shareJson} target="_blank" rel="noreferrer">查看分享 JSON</a> : null}
        </div>
      </section>

      <section className="summary-grid">
        <div className="summary-card"><div className="muted">总评分</div><strong>{analysis.score}</strong></div>
        <div className="summary-card"><div className="muted">Tempo</div><strong>{analysis.tempoRatio}</strong></div>
        <div className="summary-card"><div className="muted">问题数量</div><strong>{analysis.issues.length}</strong></div>
      </section>

      <section className="phase-strip">
        {phaseLabels.map((phase) => {
          const state = inferPhaseState(analysis, phase.key);
          return (
            <div key={phase.key} className={`phase-pill phase-${state}`}>
              <span>{phase.label}</span>
              <strong>{state === 'pass' ? '通过' : state === 'warn' ? '警告' : '失败'}</strong>
            </div>
          );
        })}
      </section>

      <section className="analysis-grid">
        <Card>
          <div className="stack">
            <div>
              <span className="kicker">keyframes</span>
              <h2 className="section-title">关键帧与节奏</h2>
            </div>
            <div className="keyframes">
              {analysis.keyframes.map((frame) => (
                <div key={frame.label} className="kf">
                  {frame.imageUrl ? <img src={frame.imageUrl} alt={frame.label} className="keyframe-image" /> : null}
                  <strong>{frame.label.toUpperCase()}</strong>
                  <div className="muted">{frame.timeSec.toFixed(2)}s</div>
                  <div className="muted">置信度 {Math.round(frame.confidence * 100)}%</div>
                </div>
              ))}
            </div>
            <div className="metric-grid">
              <div className="metric-tile"><div className="muted">Backswing</div><strong>{analysis.backswingMs}ms</strong></div>
              <div className="metric-tile"><div className="muted">Downswing</div><strong>{analysis.downswingMs}ms</strong></div>
              <div className="metric-tile"><div className="muted">Tempo Ratio</div><strong>{analysis.tempoRatio}</strong></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <div>
              <span className="kicker">metrics</span>
              <h2 className="section-title">结构指标</h2>
            </div>
            <div className="metric-grid">
              <div className="metric-tile"><div className="muted">脊柱倾角</div><strong>{analysis.metrics.spineTiltDeg}</strong></div>
              <div className="metric-tile"><div className="muted">肩转</div><strong>{analysis.metrics.shoulderTurnDeg}</strong></div>
              <div className="metric-tile"><div className="muted">髋转</div><strong>{analysis.metrics.hipTurnDeg}</strong></div>
              <div className="metric-tile"><div className="muted">头部位移</div><strong>{analysis.metrics.headSwayPx}</strong></div>
              <div className="metric-tile"><div className="muted">手腕路径</div><strong>{analysis.metrics.wristPathScore}</strong></div>
              <div className="metric-tile"><div className="muted">骨盆滑移</div><strong>{analysis.metrics.pelvisSlidePx ?? '--'}</strong></div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid-2">
        <Card>
          <div className="stack">
            <div className="surface-title-row">
              <div>
                <span className="kicker">issue detection</span>
                <h2 className="section-title">问题识别</h2>
              </div>
              <Link href={`/analysis/${id}/issues`} className="badge">全部问题</Link>
            </div>
            <div className="stack">
              {enrichedIssues.length ? enrichedIssues.map((issue: any) => (
                <Link key={issue.code} href={`/analysis/${id}/issues/${issue.code}`} className="news-link">
                  <div className="row-between">
                    <strong>{issue.titleZh}</strong>
                    <span className="badge">{issue.severity}</span>
                  </div>
                  <span className="muted">{issue.shortTip}</span>
                </Link>
              )) : <div className="empty-state">当前没有检出需要提示的问题。</div>}
            </div>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <div>
              <span className="kicker">report plan</span>
              <h2 className="section-title">报告与训练计划</h2>
            </div>
            <div className="news-link">{analysis.reportZh}</div>
            {derivedPlan ? (
              <div className="stack">
                <div className="detail-panel">
                  <strong>{derivedPlan.planTitle}</strong>
                  <p>{derivedPlan.summary}</p>
                </div>
                {derivedPlan.drills.slice(0, 3).map((item: any) => (
                  <div key={item.code} className="drill-card compact-drill-card">
                    <div className="row-between">
                      <strong>{item.title}</strong>
                      <span className="badge">{item.durationMinutes} min</span>
                    </div>
                    <div className="muted">{item.summary}</div>
                  </div>
                ))}
              </div>
            ) : <div className="empty-state">暂无训练计划。</div>}
          </div>
        </Card>
      </section>
    </main>
  );
}
