import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { Card } from "@/components/ui/card";
import { getCurrentSessionPayload } from "@/lib/auth";
import { listCoachInvites, listCoachLinks } from "@/lib/auth-store";
import { listStudents } from '@/lib/d1';

export const dynamic = "force-dynamic";

export default async function ProPortalPage() {
  const session = await getCurrentSessionPayload();
  const coachUserId = session?.userId ?? '';
  const links = coachUserId ? await listCoachLinks(coachUserId) : [];
  const invites = coachUserId ? await listCoachInvites(coachUserId) : [];
  const students = coachUserId ? await listStudents({ role: 'pro', userId: coachUserId }) : [];

  return (
    <PortalShell
      roleLabel="pro portal"
      title={`${session?.displayName ?? "Pro"} · Pro工作台`}
      subtitle="面向教练、工作室、练习场与机构。这里统一管理你自己的学员、复盘分析与训练计划。"
      links={[
        { href: "/pro/students", label: "我的学员" },
        { href: "/pro/upload", label: "代学员上传" },
        { href: "/pro/capture", label: "代学员拍摄" },
        { href: "/pro/invites", label: "邀请绑定" },
        { href: "/pro/training", label: "训练计划" },
        { href: "/pro/settings", label: "设置" },
      ]}
    >
      <section className="stats-grid">
        <Card className="stack"><strong>我的学员</strong><span className="page-title" style={{ fontSize: 32 }}>{students.length}</span></Card>
        <Card className="stack"><strong>已绑定关系</strong><span className="page-title" style={{ fontSize: 32 }}>{links.length}</span></Card>
        <Card className="stack"><strong>待处理邀请</strong><span className="page-title" style={{ fontSize: 32 }}>{invites.filter((item) => item.status === "pending").length}</span></Card>
      </section>
      <section className="modes-grid">
        <Card className="stack"><strong>Pro 价值</strong><span className="muted">管理自己的学员、查看分析、下发训练计划与邀请绑定，统一沉淀在一个工作台。</span></Card>
        <Card className="stack"><strong>代学员操作</strong><span className="muted">你可以代学员上传挥杆视频或现场拍摄，再统一复盘结果。</span><Link href="/pro/students"><span className="button button-primary">进入我的学员</span></Link></Card>
      </section>
    </PortalShell>
  );
}
