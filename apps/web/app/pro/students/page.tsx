import Link from "next/link";
import { Card } from "@/components/ui/card";
import { listStudents } from "@/lib/d1";

export const dynamic = "force-dynamic";

export default async function ProStudentsPage() {
  const students = await listStudents();

  return (
    <main className="page stack">
      <section className="surface-title-row">
        <div>
          <span className="kicker">pro workspace</span>
          <h1 className="page-title">用户管理</h1>
        </div>
        <Link href="/students">
          <span className="button button-primary">进入完整学员管理</span>
        </Link>
      </section>

      <section className="students-grid">
        {students.length ? (
          students.map((student) => (
            <Card key={student.id} className="stack">
              <div className="row-between">
                <strong>{student.name}</strong>
                <span className="badge">{student.level}</span>
              </div>

              <span className="muted">
                惯用手：{student.dominantHand === "left" ? "左手" : "右手"}
              </span>
              <span className="muted">差点：{student.handicap}</span>

              <div className="hero-actions">
                <Link href="/history">
                  <span className="button button-neutral">最近分析</span>
                </Link>
                <Link href="/students">
                  <span className="button button-primary">编辑</span>
                </Link>
              </div>
            </Card>
          ))
        ) : (
          <div className="empty-state">
            <strong>还没有用户档案</strong>
            <span>可先从 Pro 端创建用户资料，再邀请对方绑定账号。</span>
          </div>
        )}
      </section>
    </main>
  );
}
