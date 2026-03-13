import { UploadWorkflow } from "@/components/upload/upload-workflow";

export default async function UploadPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const screenMode = mode === "screen";
  return (
    <main className="page stack">
      <section className="page-hero">
        <span className="kicker">formal upload</span>
        <h1 className="page-title">{screenMode ? "Screen Mode 上传" : "上传原视频"}</h1>
        <p className="subhead">
          上传视频后先做浏览器端真实首扫，再写入轻度分析结果，最后调用 Render 做正式深分析并回写历史。
        </p>
      </section>
      <UploadWorkflow screenMode={screenMode} />
    </main>
  );
}
