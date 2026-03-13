"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { getCurrentStudentId, setCurrentStudentId, subscribeCurrentStudent } from '@/lib/current-student';
import { analysisPathForPortal } from '@/lib/scope';

export function TrainingBoard() {
  const pathname = usePathname();
  const portal = pathname.startsWith('/pro') ? 'pro' : 'app';
  const [studentId, setStudentId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [latestTraining, setLatestTraining] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/students', { cache: 'no-store' }).then((r) => r.json()).then((d) => {
      const next = d.students ?? [];
      setStudents(next);
      const current = getCurrentStudentId() || next[0]?.id || '';
      setStudentId(current);
      if (current) setCurrentStudentId(current);
    });
    return subscribeCurrentStudent((id) => setStudentId(id));
  }, []);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/history?studentId=${studentId}`, { cache: 'no-store' }).then((r) => r.json()).then((d) => {
      setGrowth(d.growth ?? []);
      setHistory(d.history ?? []);
      const latest = d.history?.[0]?.id;
      if (latest) {
        fetch(`/api/analysis/${latest}/training`, { cache: 'no-store' }).then((r) => r.json()).then((payload) => setLatestTraining(payload.training ?? null));
      } else {
        setLatestTraining(null);
      }
    });
  }, [studentId]);

  const maxScore = useMemo(() => Math.max(100, ...growth.map((g: any) => g.score || 0)), [growth]);
  const latest = history[0];
  const avgTempo = growth.length ? (growth.reduce((sum: number, g: any) => sum + Number(g.tempoRatio || 0), 0) / growth.length).toFixed(2) : '--';
  const avgIssues = growth.length ? (growth.reduce((sum: number, g: any) => sum + Number(g.issueCount || 0), 0) / growth.length).toFixed(1) : '--';
  const fiveDayImprovement = growth.length >= 2 ? Number(((Number(growth[growth.length - 1].score || 0) - Number(growth[Math.max(0, growth.length - 5)]?.score || 0)) / Math.max(1, Number(growth[Math.max(0, growth.length - 5)]?.score || 1)) * 100).toFixed(1)) : null;

  return (
    <div className="training-grid">
      <Card>
        <div className="stack">
          <div>
            <span className="kicker">bound student</span>
            <h2 className="section-title">训练对象</h2>
          </div>
          <select className="select" value={studentId} onChange={(e: any) => { setStudentId(e.target.value); setCurrentStudentId(e.target.value); }}>
            {students.map((student: any) => <option key={student.id} value={student.id}>{student.name}</option>)}
          </select>
          {latest ? (
            <>
              <div className="summary-card"><div className="muted">最近一次分析</div><strong>{latest.sourceType.startsWith('screen') ? 'Screen Mode' : '普通模式'}</strong><div className="muted">分数 {latest.score ?? '--'}</div></div>
              <div className="summary-card"><div className="muted">平均 Tempo</div><strong>{avgTempo}</strong></div>
              <div className="summary-card"><div className="muted">平均问题数</div><strong>{avgIssues}</strong></div>
              <div className="summary-card"><div className="muted">最近 5 次改善率</div><strong>{fiveDayImprovement === null ? '--' : `${fiveDayImprovement}%`}</strong></div>
            </>
          ) : <div className="empty-state">当前学员暂无正式分析记录。</div>}
        </div>
      </Card>

      <Card>
        <div className="stack">
          <div>
            <span className="kicker">growth chart</span>
            <h2 className="section-title">成长曲线</h2>
          </div>
          {growth.length ? (
            <div className="chart">
              {growth.map((point: any, idx: number) => (
                <div key={idx} className="chart-column">
                  <div className="chart-bar" style={{ height: `${Math.max(24, (point.score / maxScore) * 230)}px` }} />
                  <div className="chart-meta">{point.score}</div>
                  <div className="chart-meta">T {point.tempoRatio}</div>
                  <div className="chart-meta">I {point.issueCount}</div>
                </div>
              ))}
            </div>
          ) : <div className="empty-state">暂无成长数据。</div>}
        </div>
      </Card>

      <Card>
        <div className="stack">
          <div>
            <span className="kicker">issue & drill</span>
            <h2 className="section-title">当前重点与 Drill</h2>
          </div>
          {latestTraining ? (
            <div className="stack">
              <div className="detail-panel">
                <strong>{latestTraining.planTitle}</strong>
                <p>{latestTraining.summary}</p>
              </div>
              {latestTraining.drills?.slice(0, 3).map((item: any) => (
                <div key={item.code} className="drill-card compact-drill-card">
                  <div className="row-between">
                    <strong>{item.title}</strong>
                    <span className="badge">{item.durationMinutes} min</span>
                  </div>
                  <div className="muted">{item.summary}</div>
                </div>
              ))}
              {latest ? <Link href={analysisPathForPortal(portal, latest.id)} className="button button-primary">查看最近一次分析</Link> : null}
            </div>
          ) : history.length ? (
            <div className="stack">
              {history.slice(0, 6).map((item: any, idx: number) => (
                <Link key={idx} href={analysisPathForPortal(portal, item.id)} className="news-link">
                  <strong>{idx + 1}. {item.sourceType.startsWith('screen') ? 'Screen Mode' : '普通模式'} · {item.score ?? '--'}</strong>
                  <span className="muted">{new Date(item.createdAt).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          ) : <div className="empty-state">暂无 drill 建议来源。</div>}
        </div>
      </Card>
    </div>
  );
}
