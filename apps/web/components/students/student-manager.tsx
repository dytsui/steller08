"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Student } from "@/lib/types";
import { fmtDate, makeId } from "@/lib/utils";
import { getCurrentStudentId, setCurrentStudentId } from "@/lib/current-student";

const EMPTY = { name: "", dominantHand: "right", level: "Beginner", handicap: 28, notes: "" };

export function StudentManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/students", { cache: "no-store" });
    const data = await res.json();
    const next = data.students ?? [];
    setStudents(next);
    const stored = getCurrentStudentId();
    const usable = next.find((student: Student) => student.id === stored)?.id ?? next[0]?.id ?? "";
    setSelectedId(usable);
    if (usable) setCurrentStudentId(usable);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submit() {
    const payload = {
      id: currentId || makeId("stu"),
      ...form
    };
    await fetch("/api/students", {
      method: currentId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setCurrentId("");
    setForm(EMPTY);
    await refresh();
  }

  function edit(student: Student) {
    setCurrentId(student.id);
    setForm({
      name: student.name,
      dominantHand: student.dominantHand,
      level: student.level,
      handicap: student.handicap,
      notes: student.notes
    });
  }

  function choose(studentId: string) {
    setSelectedId(studentId);
    setCurrentStudentId(studentId);
  }

  return (
    <div className="students-grid">
      <Card>
        <div className="stack form-grid">
          <div>
            <span className="kicker">student editor</span>
            <h2 className="section-title">{currentId ? "编辑学员" : "新增学员"}</h2>
          </div>
          <input className="input" placeholder="姓名" value={form.name} onChange={(e: any) => setForm((v: any) => ({ ...v, name: e.target.value }))} />
          <select className="select" value={form.dominantHand} onChange={(e: any) => setForm((v: any) => ({ ...v, dominantHand: e.target.value as "left" | "right" }))}>
            <option value="right">右手</option>
            <option value="left">左手</option>
          </select>
          <input className="input" placeholder="水平" value={form.level} onChange={(e: any) => setForm((v: any) => ({ ...v, level: e.target.value }))} />
          <input className="input" type="number" placeholder="差点" value={form.handicap} onChange={(e: any) => setForm((v: any) => ({ ...v, handicap: Number(e.target.value || 0) }))} />
          <textarea className="textarea" placeholder="备注" value={form.notes} onChange={(e: any) => setForm((v: any) => ({ ...v, notes: e.target.value }))} />
          <div className="action-strip">
            <Button tone="primary" onClick={submit}>{currentId ? "保存修改" : "新增学员"}</Button>
            {currentId ? <Button onClick={() => { setCurrentId(""); setForm(EMPTY); }}>取消编辑</Button> : null}
          </div>
        </div>
      </Card>

      <Card>
        <div className="stack">
          <div className="surface-title-row">
            <div>
              <span className="kicker">student list</span>
              <h2 className="section-title">学员列表</h2>
            </div>
            <span className="badge">{loading ? "读取中" : `${students.length} 人`}</span>
          </div>
          {students.length ? (
            <div className="stack">
              {students.map((student: any) => {
                const selected = selectedId === student.id;
                return (
                  <div key={student.id} className="student-card">
                    <div className="row-between">
                      <strong>{student.name}</strong>
                      {selected ? <span className="badge badge-success">当前学员</span> : null}
                    </div>
                    <div className="muted">{student.dominantHand === "left" ? "左手" : "右手"} · {student.level} · 差点 {student.handicap}</div>
                    <div className="muted">{student.notes || "暂无备注"}</div>
                    <div className="muted">更新于 {fmtDate(student.updatedAt)}</div>
                    <div className="action-strip">
                      <Button tone="primary" onClick={() => choose(student.id)}>{selected ? "已选中" : "设为当前学员"}</Button>
                      <Button onClick={() => edit(student)}>编辑</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">还没有学员。先新增一个学员，后续上传、实拍和训练页都会自动绑定。</div>
          )}
        </div>
      </Card>
    </div>
  );
}
