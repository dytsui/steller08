import { AnalysisWorkbench } from "@/components/analysis/analysis-workbench";

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnalysisWorkbench id={id} />;
}
