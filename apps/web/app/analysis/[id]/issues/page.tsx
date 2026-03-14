import { getAnalysis } from '@/lib/d1';
import { IssueList } from '@/components/analysis/issue-list';
import { Card } from '@/components/ui/card';

export default async function AnalysisIssuesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analysis = await getAnalysis(id);

  if (!analysis) {
    return (
      <main className="page">
        <Card>
          <div className="empty-state">
            <strong>还没有正式分析结果</strong>
            <span>请先完成一次上传或录制，并等待深度分析写回。</span>
          </div>
        </Card>
      </main>
    );
  }

  return <IssueList analysis={analysis} sessionId={id} />;
}
