import { CapturePanel } from "@/components/capture/capture-panel";

export default async function CapturePage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const screenMode = mode === "screen";

  return (
    <main className="page stack">
      <section className="page-hero">
        <span className="kicker">live capture</span>
        <h1 className="page-title">{screenMode ? "Screen Mode 实拍实时" : "普通实拍实时"}</h1>
        <p className="subhead">
          摄像头打开后先稳定骨架，再开始录制。录制结束自动创建 session，并依次进入轻度分析与深度分析。
        </p>
      </section>
      <CapturePanel screenMode={screenMode} />
    </main>
  );
}
