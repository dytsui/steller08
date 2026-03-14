import Link from "next/link";

export default async function AnalysisIssues({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h3>问题列表 Session {id}</h3>
      <ul><li><Link href={`/analysis/${id}/issues/tempo_inconsistent`}>tempo_inconsistent</Link></li></ul>
    </div>
  );
}
