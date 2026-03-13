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
        { href: "/app/history", label: "我的分析" }
      ]}
    >
      <section className="stats-grid">
        <Card className="stack"><strong>本周重点</strong><span className="muted">先修下杆转换，再稳定 Impact 姿态。</span></Card>
        <Card className="stack"><strong>最近结果</strong><span className="muted">正式链路：轻分析 → 深分析 → 历史/训练同步更新。</span></Card>
        <Card className="stack"><strong>我的教练</strong><span className="muted">支持邀请码绑定 Pro 端，接收点评与训练计划。</span></Card>
      </section>
      <section className="modes-grid">
        <Card className="stack"><strong>快速入口</strong><div className="hero-actions"><Link href="/capture"><span className="button button-primary">普通拍摄</span></Link><Link href="/capture?mode=screen"><span className="button button-neutral">Screen Mode</span></Link></div></Card>
        <Card className="stack"><strong>成长闭环</strong><span className="muted">查看历史趋势、问题趋势、Tempo 趋势与 drill 推荐。</span><Link href="/app/training"><span className="button button-primary">进入训练页</span></Link></Card>
      </section>
    </PortalShell>
  );
}
