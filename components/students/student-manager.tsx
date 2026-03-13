"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Student } from "@/lib/types";
import { fmtDate } from "@/lib/utils";
import { getCurrentStudentId, setCurrentStudentId } from "@/lib/current-student";
import { fetchAuthSession } from '@/lib/services/auth';

const EMPTY = { name: "", dominantHand: "right", level: "Beginner", handicap: 28, notes: "" };

export function StudentManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'user' | 'pro' | 'admin'>('user');

  async function refresh() {
    setLoading(true);
    const [res, auth] = await Promise.all([
      fetch("/api/students", { cache: "no-store" }),
      fetchAuthSession()
    ]);
    const data = await res.json();
    const next = data.students ?? [];
    setStudents(next);
    setRole(auth.user?.role ?? 'user');
    const stored = getCurrentStudentId();
    const usable = next.find((student: Student) => student.id === stored)?.id ?? next[0]?.id ?? "";
    setSelectedId(usable);
    if (usable) setCurrentStudentId(usable);
    if (next[0] && auth.user?.role === 'user') {
      setCurrentId(next[0].id);
      setForm({
        name: next[0].name,
        dominantHand: next[0].dominantHand,
        level: next[0].level,
        handicap: next[0].handicap,
        notes: next[0].notes
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function submit() {
    const payload = { id: currentId || undefined, ...form };
    await fetch("/api/students", {
      method: currentId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
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
            <span className="kicker">profile editor</span>
            <h2 className="section-title">{role === 'pro' ? (currentId ? "编辑学员" : "新增学员") : "编辑我的档案"}</h2>
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
            <Button tone="primary" onClick={submit}>{currentId ? "保存修改" : role === 'pro' ? "新增学员" : "保存档案"}</Button>
            {currentId && role === 'pro' ? <Button onClick={() => { setCurrentId(""); setForm(EMPTY); }}>取消编辑</Button> : null}
          </div>
        </div>
      </Card>

      <Card>
        <div className="stack">
          <div className="surface-title-row">
            <div>
              <span className="kicker">player list</span>
              <h2 className="section-title">{role === 'pro' ? '我的学员' : '我的档案'}</h2>
            </div>
            <span className="badge">{loading ? "读取中" : `${students.length} 项`}</span>
          </div>
          {students.length ? (
            <div className="stack">
              {students.map((student: any) => {
                const selected = selectedId === student.id;
                return (
                  <div key={student.id} className="student-card">
                    <div className="row-between">
                      <strong>{student.name}</strong>
                      {selected ? <span className="badge badge-success">当前档案</span> : null}
                    </div>
                    <div className="muted">{student.dominantHand === "left" ? "左手" : "右手"} · {student.level} · 差点 {student.handicap}</div>
                    <div className="muted">{student.notes || "暂无备注"}</div>
                    <div className="muted">更新于 {fmtDate(student.updatedAt)}</div>
                    <div className="action-strip">
                      <Button tone="primary" onClick={() => choose(student.id)}>{selected ? "已选中" : role === 'pro' ? '设为当前学员' : '设为当前档案'}</Button>
                      <Button onClick={() => edit(student)}>编辑</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">{role === 'pro' ? '先新增一个学员档案，后续代学员上传与拍摄都会自动绑定。' : '还没有个人档案，请先完成基本信息。'}</div>
          )}
        </div>
      </Card>
    </div>
  );
}
