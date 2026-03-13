import Link from "next/link";
import { Card } from "@/components/ui/card";
import { listStudents } from "@/lib/d1";
import { getCurrentSessionPayload } from '@/lib/auth';

export const dynamic = "force-dynamic";

export default async function ProStudentsPage() {
  const session = await getCurrentSessionPayload();
  const students = session ? await listStudents({ role: 'pro', userId: session.userId }) : [];

  return (
    <main className="page stack">
      <section className="surface-title-row">
        <div>
          <span className="kicker">pro workspace</span>
          <h1 className="page-title">我的学员</h1>
        </div>
        <Link href="/pro/upload">
          <span className="button button-primary">代学员上传</span>
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
              <span className="muted">惯用手：{student.dominantHand === "left" ? "左手" : "右手"}</span>
              <span className="muted">差点：{student.handicap}</span>
              <div className="hero-actions">
                <Link href={`/pro/upload?studentId=${student.id}`}><span className="button button-neutral">上传视频</span></Link>
                <Link href={`/pro/capture?studentId=${student.id}`}><span className="button button-primary">现场拍摄</span></Link>
              </div>
            </Card>
          ))
        ) : (
          <div className="empty-state">
            <strong>还没有学员档案</strong>
            <span>先创建邀请或建立学员档案，后续再代学员上传与拍摄。</span>
          </div>
        )}
      </section>
    </main>
  );
}
