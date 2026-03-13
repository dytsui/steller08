"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { AnalysisSource, Student } from "@/lib/types";
import { getCurrentStudentId, setCurrentStudentId, subscribeCurrentStudent } from "@/lib/current-student";
import { runVideoQuickScan } from "@/lib/client/video-quick-scan";

const screenHints = ["完整拍入屏幕边框", "减少环境反光", "别让拍摄设备晃动", "保证人物挥杆区域完整可见"];

export function UploadWorkflow({ screenMode }: { screenMode: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId') ?? '';
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("准备中");

  useEffect(() => {
    fetch("/api/students", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      const next = d.students ?? [];
      setStudents(next);
      const stored = getCurrentStudentId();
      const usable = next.find((student: Student) => student.id === preselectedStudentId)?.id ?? next.find((student: Student) => student.id === stored)?.id ?? next[0]?.id ?? "";
      setStudentId(usable);
      if (usable) setCurrentStudentId(usable);
    });
    return subscribeCurrentStudent((id) => setStudentId(id));
  }, [preselectedStudentId]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const sourceType: AnalysisSource = useMemo(() => (screenMode ? "screen-upload" : "upload"), [screenMode]);

  async function start() {
    if (!file || !studentId) {
      setError("请选择学员和视频文件。");
      return;
    }
    try {
      setCurrentStudentId(studentId);
      setError("");
      setBusy(true);
      setProgress(4);
      setStatus("正在创建分析任务");

      const fd = new FormData();
      fd.append("file", file);
      fd.append("studentId", studentId);
      fd.append("sourceType", sourceType);
      const sessionRes = await fetch("/api/sessions", { method: "POST", body: fd });
      if (!sessionRes.ok) throw new Error(await sessionRes.text());
      const { session } = await sessionRes.json();

      setProgress(18);
      setStatus("正在读取视频并生成首扫");
      const snapshot = await runVideoQuickScan(file, sourceType);

      setProgress(46);
      setStatus("正在写入快速结果");
      const lightRes = await fetch("/api/analyze/light", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, studentId, sourceType, durationMs: snapshot.durationMs, snapshot })
      });
      if (!lightRes.ok) throw new Error(await lightRes.text());

      setProgress(72);
      setStatus("正在生成正式分析报告");
      const deepRes = await fetch("/api/analyze/deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id })
      });
      if (!deepRes.ok) throw new Error(await deepRes.text());

      setProgress(100);
      setStatus("分析完成，正在跳转");
      router.push(`/analysis/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传分析失败");
      setStatus("失败");
      setBusy(false);
    }
  }

  return (
    <div className="detail-grid">
      <Card>
        <div className="stack">
          <div className="video-shell" style={{ minHeight: "52vh" }}>
            {preview ? <video src={preview} controls playsInline /> : <div className="video-shell-placeholder"><div><strong>选择视频后会在这里预览</strong><div className="muted">支持普通上传与 Screen Mode 上传。</div></div></div>}
          </div>

          <div className="grid-2">
            <select className="select" value={studentId} onChange={(e: any) => { setStudentId(e.target.value); setCurrentStudentId(e.target.value); }}>
              <option value="">选择学员</option>
              {students.map((student: any) => <option key={student.id} value={student.id}>{student.name}</option>)}
            </select>
            <input className="input" type="file" accept="video/*" onChange={(e: any) => setFile(e.target.files?.[0] ?? null)} />
          </div>

          <ProgressBar value={progress} />
          <div className="surface">
            <div className="surface-title-row"><strong>当前状态</strong><span className="badge">{progress}%</span></div>
            <div className="muted">{status}</div>
            {file ? <div className="muted">文件：{file.name}</div> : null}
            {error ? <div className="status-text-danger">错误：{error}</div> : null}
          </div>

          <div className="action-strip">
            <Button tone="primary" disabled={busy || !file || !studentId} onClick={start}>{busy ? "分析中…" : screenMode ? "开始 Screen Mode 分析" : "开始分析"}</Button>
            <Button onClick={() => { setFile(null); setError(""); setProgress(0); setStatus("准备中"); setBusy(false); }} disabled={busy}>重置</Button>
          </div>
        </div>
      </Card>

      <div className="stack">
        <Card>
          <div className="stack">
            <div><span className="kicker">upload flow</span><h2 className="section-title">上传后执行顺序</h2></div>
            <div className="timeline-grid">
              {["保存视频", "创建分析任务", "浏览器首扫", "写入快速结果", "正式分析", "跳转结果页"].map((item, index) => (
                <div key={item} className="timeline-card"><span className="badge badge-accent">0{index + 1}</span><strong>{item}</strong></div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="stack">
            <div><span className="kicker">quality guide</span><h2 className="section-title">{screenMode ? "Screen Mode 建议" : "普通上传建议"}</h2></div>
            <ul className="list-plain">
              {(screenMode ? screenHints : ["完整拍到头部与脚部", "镜头尽量固定", "确保挥杆动作完整", "避免逆光和拖影"]).map((item) => (
                <li key={item} className="news-link">{item}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
