"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { enrichIssue } from '@/lib/training';
import type { AnalysisResult } from '@/lib/types';

function phaseZh(phase: string) {
  return ({ address: '站位', takeaway: '起杆', top: '顶点', downswing: '下杆', impact: '击球', finish: '收杆', global: '全局' } as Record<string, string>)[phase] ?? phase;
}

export function IssueList({ analysis, sessionId }: { analysis: AnalysisResult; sessionId: string }) {
  const pathname = usePathname();
  const basePath = pathname.startsWith('/pro') ? `/pro/analysis/${sessionId}` : pathname.startsWith('/app') ? `/app/analysis/${sessionId}` : `/analysis/${sessionId}`;
  const issues = analysis.issues.map(enrichIssue);

  return (
    <main className="page stack">
      <section className="page-hero">
        <span className="kicker">issue center</span>
        <h1 className="page-title">问题列表</h1>
        <p className="subhead">按严重度和阶段查看本次 session 的问题，点击进入详情页查看原因、修正和 drill。</p>
        <div className="action-strip">
          <Link href={basePath} className="button button-neutral">返回分析总览</Link>
        </div>
      </section>

      {issues.length ? (
        <section className="issue-grid">
          {issues.map((issue) => (
            <Card key={issue.code}>
              <div className="stack">
                <div className="row-between">
                  <span className="badge badge-accent">{phaseZh(issue.phase)}</span>
                  <span className="badge">{issue.severity}</span>
                </div>
                <div>
                  <h2 className="section-title">{issue.titleZh}</h2>
                  <p className="subhead">{issue.detailZh}</p>
                </div>
                <div className="news-link">{issue.shortTip}</div>
                <div className="chip-row">
                  {issue.drillCodes.slice(0, 3).map((code) => (
                    <span key={code} className="badge">{code.replace('drill_', '')}</span>
                  ))}
                </div>
                <Link href={`${basePath}/issues/${issue.code}`} className="button button-primary">查看问题详情</Link>
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <Card>
          <div className="empty-state">
            <strong>当前没有需要单独展开的问题</strong>
            <span>这次正式分析未检出高优先级问题，可继续查看总览与训练页。</span>
          </div>
        </Card>
      )}
    </main>
  );
}
