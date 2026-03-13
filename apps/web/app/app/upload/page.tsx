import { UploadWorkflow } from "@/components/upload/upload-workflow";

export default async function UploadPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const screenMode = mode === "screen";
  return (
    <main className="page stack">
      <section className="page-hero">
        <span className="kicker">formal upload</span>
        <h1 className="page-title">{screenMode ? "Screen Mode 上传" : "上传视频"}</h1>
        <p className="subhead">上传后会先进行快速首扫，再生成正式分析结果与训练建议。</p>
      </section>
      <UploadWorkflow screenMode={screenMode} />
    </main>
  );
}
