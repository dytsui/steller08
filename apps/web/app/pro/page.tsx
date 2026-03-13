import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Card } from "@/components/ui/card";
import { getCurrentSessionPayload } from "@/lib/auth";
import { countRole, listCoachInvites, listCoachLinks } from "@/lib/auth-store";

export default async function ProPortalPage() {
  const session = await getCurrentSessionPayload();
  const links = session ? await listCoachLinks(session.userId) : [];
  const invites = session ? await listCoachInvites(session.userId) : [];
  const userCount = await countRole("user");
  return (
    <PortalShell
      roleLabel="pro portal"
      title={`${session?.displayName ?? "Pro"} · Pro工作台`}
      subtitle="面向教练、工作室、练习场与机构。这里统一管理用户、复盘分析、下发训练计划与邀请绑定。"
      links={[
        { href: "/pro/students", label: "用户管理" },
        { href: "/pro/invites", label: "邀请绑定" },
        { href: "/history", label: "分析记录" }
      ]}
    >
      <section className="stats-grid">
        <Card className="stack"><strong>平台用户数</strong><span className="page-title" style={{fontSize: 32}}>{userCount}</span></Card>
        <Card className="stack"><strong>已绑定关系</strong><span className="page-title" style={{fontSize: 32}}>{links.length}</span></Card>
        <Card className="stack"><strong>待处理邀请</strong><span className="page-title" style={{fontSize: 32}}>{invites.filter((item) => item.status === "pending").length}</span></Card>
      </section>
      <section className="modes-grid">
        <Card className="stack"><strong>Pro 价值</strong><span className="muted">学员管理、分析复盘、训练计划、邀请绑定，统一沉淀在一个工作台。</span></Card>
        <Card className="stack"><strong>业务定位</strong><span className="muted">Pro端不是后台杂糅页，而是高尔夫训练业务工作台。</span><Link href="/pro/students"><span className="button button-primary">进入用户管理</span></Link></Card>
      </section>
    </PortalShell>
  );
}
