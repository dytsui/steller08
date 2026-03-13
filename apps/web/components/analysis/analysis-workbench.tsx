"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { presentAnalysis } from '@/lib/analysis-presenter';
import type { AnalysisResult, SessionRecord, Student } from '@/lib/types';

function scoreLabel(score: number) {
  if (score >= 86) return '稳定';
  if (score >= 74) return '可继续提升';
  return '优先修正';
}

export function AnalysisWorkbench({ id }: { id: string }) {
  const pathname = usePathname();
  const portalPrefix = pathname.startsWith('/pro') ? '/pro' : pathname.startsWith('/app') ? '/app' : '';
  const analysisBase = `${portalPrefix}/analysis/${id}`.replace('//', '/');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [shareCard, setShareCard] = useState('');
  const [shareJson, setShareJson] = useState('');
  const [shareBusy, setShareBusy] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: any = null;

    async function load() {
      const response = await fetch(`/api/analysis/${id}`, { cache: 'no-store' });
      const data = await response.json();
      if (!active) return;
      setAnalysis(data.analysis ?? null);
      setSession(data.session ?? null);
      setStudent(data.student ?? null);
      if (data.session?.status && ['created', 'analyzing-light', 'analyzing-deep'].includes(data.session.status)) {
        timer = window.setTimeout(load, 2800);
      }
    }

    void load();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
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

  const presented = useMemo(() => (analysis ? presentAnalysis(analysis) : null), [analysis]);

  if (!analysis || !presented) {
    return (
      <main className="page stack">
        <Card>
          <div className="empty-state">
            <strong>暂时还没有可展示的分析结果</strong>
            <span>需要先完成真实首扫或正式分析回写，才会显示结果页内容。</span>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="page stack">
      <section className="page-hero analysis-hero-surface">
        <span className="kicker">analysis overview</span>
        <h1 className="page-title">{analysis.mode === 'deep' ? '正式分析结果' : '快速首扫结果'}</h1>
        <p className="subhead">
          学员 {student?.name ?? '--'} · Session {session?.id} · 状态 {session?.status}
          {session && 'errorMessage' in session && (session as any).errorMessage ? ` · ${(session as any).errorMessage}` : ''}
        </p>
        <div className="action-strip">
          <Button tone="primary" onClick={share} disabled={shareBusy}>{shareBusy ? '生成中…' : '生成摘要卡并复制链接'}</Button>
          <Link href={`${analysisBase}/issues`} className="button button-neutral">查看问题详情</Link>
          {shareCard ? <a className="button button-neutral" href={shareCard} target="_blank" rel="noreferrer">查看摘要卡</a> : null}
          {shareJson ? <a className="button button-neutral" href={shareJson} target="_blank" rel="noreferrer">查看分享 JSON</a> : null}
        </div>
      </section>

      <section className="summary-grid analysis-summary-grid">
        <div className="summary-card">
          <div className="muted">综合评分</div>
          <strong>{analysis.score}</strong>
          <div className="muted">{scoreLabel(analysis.score)}</div>
        </div>
        <div className="summary-card">
          <div className="muted">Tempo Ratio</div>
          <strong>{analysis.tempoRatio}</strong>
          <div className="muted">Back {analysis.backswingMs}ms · Down {analysis.downswingMs}ms</div>
        </div>
        <div className="summary-card">
          <div className="muted">主问题</div>
          <strong>{presented.primaryIssue}</strong>
          <div className="muted">{presented.tip3s}</div>
        </div>
      </section>

      <section className="grid-2 analysis-main-grid">
        <Card>
          <div className="stack">
            <div className="surface-title-row">
              <div>
                <span className="kicker">primary issue</span>
                <h2 className="section-title">主问题优先级</h2>
              </div>
              <span className="badge badge-accent">3 秒纠正提示</span>
            </div>
            <div className="detail-panel">
              <strong>{presented.primaryIssue}</strong>
              <p>{presented.priorityReason}</p>
            </div>
            <div className="tip-banner">{presented.tip3s}</div>
            {presented.primaryFrame ? (
              <div className="analysis-feature-frame">
                {presented.primaryFrame.imageUrl ? <img src={presented.primaryFrame.imageUrl} alt={presented.primaryFrame.label} className="keyframe-image" /> : null}
                <div className="muted">关键帧 {presented.primaryFrame.label.toUpperCase()} · {presented.primaryFrame.timeSec.toFixed(2)}s</div>
              </div>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="stack">
            <div>
              <span className="kicker">main view</span>
              <h2 className="section-title">主视图切换</h2>
            </div>
            <div className="chip-row">
              <span className="badge badge-accent">本次分析</span>
              <span className="badge">挥杆流程</span>
              <span className="badge">Pro 对比</span>
              <span className="badge">问题诊断</span>
            </div>
            <div className="keyframes">
              {analysis.keyframes.map((frame) => (
                <div key={frame.label} className="kf card-frame-lite">
                  {frame.imageUrl ? <img src={frame.imageUrl} alt={frame.label} className="keyframe-image" /> : null}
                  <strong>{frame.label.toUpperCase()}</strong>
                  <div className="muted">{frame.timeSec.toFixed(2)}s</div>
                  <div className="muted">置信度 {Math.round(frame.confidence * 100)}%</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="phase-strip phase-strip-rich">
        {presented.phaseFlow.map((phase: any) => (
          <div key={phase.key} className={`phase-pill phase-${phase.state === 'warning' ? 'warn' : phase.state}`}>
            <span>{phase.label}</span>
            <strong>{phase.state === 'pass' ? 'pass' : phase.state === 'warning' ? 'warning' : 'fail'}</strong>
          </div>
        ))}
      </section>

      <section className="analysis-grid analysis-grid-rich">
        <Card>
          <div className="stack">
            <div>
              <span className="kicker">phase flow</span>
              <h2 className="section-title">挥杆流程示意区</h2>
            </div>
            <div className="phase-detail-grid">
              {presented.phaseDetails.map((phase: any) => (
                <div key={phase.key} className="detail-panel">
                  <div className="row-between">
                    <strong>{phase.label}</strong>
                    <span className={`badge ${phase.state === 'fail' ? 'badge-danger' : phase.state === 'warning' ? 'badge-warning' : 'badge-success'}`}>{phase.state}</span>
                  </div>
                  <div className="muted">关键帧 {phase.frame?.label ?? '--'}</div>
                  <div className="stack tight-stack">
                    {(phase.issues.length ? phase.issues.map((issue: any) => issue.titleZh) : ['当前阶段未检出高优先级问题']).map((item: any) => (
                      <span key={item} className="news-link">{item}</span>
                    ))}
                  </div>
                  <div className="chip-row">
                    {phase.metrics.map((metric: any) => <span key={metric} className="badge">{metric}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <div>
              <span className="kicker">pro compare</span>
              <h2 className="section-title">标准模板对比</h2>
            </div>
            <div className="muted">{presented.proCompare.summary}</div>
            <div className="metric-diff-grid">
              {presented.proCompare.metricDiffs.map((item: any) => (
                <div key={item.label} className="metric-tile">
                  <div className="muted">{item.label}</div>
                  <strong>{item.actual}</strong>
                  <div className="muted">标准 {item.target}</div>
                  <div className="muted">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid-2">
        <Card>
          <div className="stack">
            <div className="surface-title-row">
              <div>
                <span className="kicker">issue diagnosis</span>
                <h2 className="section-title">问题诊断区</h2>
              </div>
              <Link href={`${analysisBase}/issues`} className="badge">全部问题</Link>
            </div>
            <div className="stack">
              {presented.enrichedIssues.length ? presented.enrichedIssues.map((issue: any) => (
                <Link key={issue.code} href={`${analysisBase}/issues/${issue.code}`} className="news-link">
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
              <span className="kicker">training plan</span>
              <h2 className="section-title">训练计划区</h2>
            </div>
            <div className="detail-panel">
              <strong>{presented.training.planTitle}</strong>
              <p>{presented.training.summary}</p>
            </div>
            <div className="chip-row">
              <span className="badge badge-accent">focus_issue_code {presented.training.focusIssueCode ?? '--'}</span>
              <span className="badge">duration_days 7</span>
            </div>
            {presented.training.drills.slice(0, 4).map((item: any) => (
              <div key={item.code} className="drill-card compact-drill-card">
                <div className="row-between">
                  <strong>{item.title}</strong>
                  <span className="badge">{item.durationMinutes} min</span>
                </div>
                <div className="muted">{item.summary}</div>
              </div>
            ))}
            <div className="detail-panel">
              <strong>AI 解释</strong>
              <p>{analysis.reportZh}</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
