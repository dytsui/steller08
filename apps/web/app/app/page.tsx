import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Card } from "@/components/ui/card";
import { getCurrentSessionPayload } from "@/lib/auth";

export default async function UserPortalPage() {
  const session = await getCurrentSessionPayload();
  return (
    <PortalShell
      roleLabel="user portal"
      title={`欢迎回来，${session?.displayName ?? "用户"}`}
      subtitle="这里是用户端首页。一次分析不只看结论，还要进入训练计划与成长闭环。"
      links={[
        { href: "/app/capture", label: "开始拍摄" },
        { href: "/app/upload", label: "上传视频" },
        { href: "/app/history", label: "我的分析" },
        { href: "/app/profile", label: "我的档案" }
      ]}
    >
      <section className="stats-grid">
        <Card className="stack"><strong>本周重点</strong><span className="muted">先看主问题优先级，再根据训练计划去练。</span></Card>
        <Card className="stack"><strong>最近结果</strong><span className="muted">正式结果生成后，会同步到记录与训练页面。</span></Card>
        <Card className="stack"><strong>技术提升</strong><span className="muted">从 3 秒提示到阶段诊断，再到训练计划，形成完整闭环。</span></Card>
      </section>
      <section className="modes-grid">
        <Card className="stack"><strong>快速入口</strong><div className="hero-actions"><Link href="/app/capture"><span className="button button-primary">普通拍摄</span></Link><Link href="/app/capture?mode=screen"><span className="button button-neutral">Screen Mode</span></Link></div></Card>
        <Card className="stack"><strong>成长闭环</strong><span className="muted">查看历史趋势、问题趋势、Tempo 趋势与 drill 推荐。</span><Link href="/app/training"><span className="button button-primary">进入训练页</span></Link></Card>
      </section>
    </PortalShell>
  );
}
