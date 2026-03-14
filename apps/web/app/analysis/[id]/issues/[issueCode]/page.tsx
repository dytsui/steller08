export default async function IssueDetail({ params }: { params: Promise<{ id: string; issueCode: string }> }) {
  const { id, issueCode } = await params;
  return <p>Issue {issueCode} for session {id}</p>;
}
