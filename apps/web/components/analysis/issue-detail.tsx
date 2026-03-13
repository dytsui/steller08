"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { enrichIssue } from '@/lib/training';
import { getDrillCatalogItem } from '@/lib/catalogs/drill-catalog';
import type { AnalysisResult } from '@/lib/types';

function phaseZh(phase: string) {
  return ({ address: '站位', takeaway: '起杆', top: '顶点', downswing: '下杆', impact: '击球', finish: '收杆', global: '全局' } as Record<string, string>)[phase] ?? phase;
}

export function IssueDetail({ analysis, sessionId, issueCode }: { analysis: AnalysisResult; sessionId: string; issueCode: string }) {
  const pathname = usePathname();
  const basePath = pathname.startsWith('/pro') ? `/pro/analysis/${sessionId}` : pathname.startsWith('/app') ? `/app/analysis/${sessionId}` : `/analysis/${sessionId}`;
  const issue = analysis.issues.map(enrichIssue).find((item) => item.code === issueCode);

  if (!issue) {
    return (
      <main className="page">
        <Card>
          <div className="empty-state">
            <strong>找不到这个问题</strong>
            <span>可能该 session 还未完成正式分析，或这个 issue code 不在当前结果里。</span>
            <Link href={`${basePath}/issues`} className="button button-neutral">返回问题列表</Link>
          </div>
        </Card>
      </main>
    );
  }

  const drills = issue.drillCodes.map((code) => getDrillCatalogItem(code)).filter(Boolean);

  return (
    <main className="page stack">
      <section className="page-hero">
        <span className="kicker">issue detail</span>
        <h1 className="page-title">{issue.titleZh}</h1>
        <p className="subhead">阶段：{phaseZh(issue.phase)} · 严重度：{issue.severity}</p>
        <div className="action-strip">
          <Link href={basePath} className="button button-neutral">返回分析总览</Link>
          <Link href={`${basePath}/issues`} className="button button-neutral">返回问题列表</Link>
        </div>
      </section>

      <section className="analysis-grid">
        <Card>
          <div className="stack">
            <div>
              <span className="kicker">3 second tip</span>
              <h2 className="section-title">3 秒小贴士</h2>
            </div>
            <div className="news-link">{issue.shortTip}</div>
            <div className="detail-panel">
              <strong>为什么会出现</strong>
              <p>{issue.why}</p>
            </div>
            <div className="detail-panel">
              <strong>怎么修正</strong>
              <p>{issue.fix}</p>
            </div>
            <div className="detail-panel">
              <strong>本次识别说明</strong>
              <p>{issue.detailZh}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <div>
              <span className="kicker">recommended drills</span>
              <h2 className="section-title">推荐 Drill</h2>
            </div>
            {drills.length ? drills.map((drill) => (
              <div key={drill!.code} className="drill-card">
                <div className="row-between">
                  <strong>{drill!.title}</strong>
                  <span className="badge">{drill!.durationMinutes} min</span>
                </div>
                <div className="muted">{drill!.summary}</div>
                <div className="stack tight-stack">
                  {drill!.steps.map((step, index) => <div key={step} className="news-link">{index + 1}. {step}</div>)}
                </div>
              </div>
            )) : <div className="empty-state">当前没有匹配的 drill。</div>}
          </div>
        </Card>
      </section>
    </main>
  );
}
