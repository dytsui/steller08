import { getAnalysis, getSessionForScope } from '@/lib/d1';
import { IssueList } from '@/components/analysis/issue-list';
import { Card } from '@/components/ui/card';
import { getRequestScope } from '@/lib/scope';

export default async function AnalysisIssuesPage({ params }: { params: Promise<{ id: string }> }) {
  const scope = await getRequestScope();
  const { id } = await params;
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

  return <IssueList analysis={analysis} sessionId={id} />;
}
