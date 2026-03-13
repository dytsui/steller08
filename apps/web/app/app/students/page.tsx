import { StudentManager } from "@/components/students/student-manager";

export default function StudentsPage() {
  return (
    <main className="page stack">
      <section className="page-hero">
        <span className="kicker">player profile</span>
        <h1 className="page-title">我的档案</h1>
        <p className="subhead">在这里维护当前使用的档案。之后上传、拍摄、记录和训练都会自动联动。</p>
      </section>
      <StudentManager />
    </main>
  );
}
