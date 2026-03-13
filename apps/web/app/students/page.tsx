import { StudentManager } from "@/components/students/student-manager";

export default function StudentsPage() {
  return (
    <main className="page stack">
      <section className="page-hero">
        <span className="kicker">student binding</span>
        <h1 className="page-title">学员管理</h1>
        <p className="subhead">新增、编辑、切换当前学员。设为当前学员后，上传、实拍、历史和训练页都会自动联动。</p>
      </section>
      <StudentManager />
    </main>
  );
}
