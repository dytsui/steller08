import { getAnalysis, getSessionForScope } from '@/lib/d1';
import { IssueDetail } from '@/components/analysis/issue-detail';
import { Card } from '@/components/ui/card';
import { getRequestScope } from '@/lib/scope';

export default async function AnalysisIssueDetailPage({ params }: { params: Promise<{ id: string; issueCode: string }> }) {
  const scope = await getRequestScope();
  const { id, issueCode } = await params;
  const session = scope ? await getSessionForScope(id, scope) : null;
  const analysis = session ? await getAnalysis(id) : null;

  if (!analysis) {
    return (
      <main className="page">
        <Card>
          <div className="empty-state">
            <strong>还没有可读取的正式分析结果</strong>
            <span>可能该 session 尚未完成深分析，或者当前账号无权查看它。</span>
          </div>
        </Card>
      </main>
    );
  }

  return <IssueDetail analysis={analysis} sessionId={id} issueCode={issueCode} />;
}
