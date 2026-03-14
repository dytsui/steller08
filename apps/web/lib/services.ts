import { exec, many, one } from "@/lib/db";
import { getRuntimeEnv } from "@/lib/runtime";
import { appEnv } from "@/lib/env";
import { json, nowIso, uid } from "@/lib/utils";
import type { RequestScope } from "@/types/domain";

export async function createStudent(scope: RequestScope, payload: { name: string; level: string; dominantHand: string; handicap: number; notes?: string }) {
  const id = uid("stu");
  await exec(
    "INSERT INTO students (id, user_id, coach_user_id, name, dominant_hand, level, handicap, notes, is_current, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)",
    [id, scope.userId, scope.coachUserId ?? null, payload.name, payload.dominantHand, payload.level, payload.handicap, payload.notes ?? "", nowIso(), nowIso()]
  );
  return { id };
}

export async function listStudents(scope: RequestScope) {
  if (scope.canReadAll) {
    return many("SELECT * FROM students ORDER BY created_at DESC");
  }
  if (scope.role === "pro") {
    return many("SELECT * FROM students WHERE coach_user_id = ? ORDER BY created_at DESC", [scope.userId]);
  }
  return many("SELECT * FROM students WHERE user_id = ? ORDER BY created_at DESC", [scope.userId]);
}

export async function createMediaSession(scope: RequestScope, payload: { studentId: string; sourceType: "upload" | "capture"; fileName: string; contentType: string; buffer: ArrayBuffer }) {
  const student = await one<{ id: string }>(
    scope.role === "pro"
      ? "SELECT id FROM students WHERE id = ? AND coach_user_id = ?"
      : "SELECT id FROM students WHERE id = ? AND user_id = ?",
    [payload.studentId, scope.userId]
  );
  if (!student && !scope.canReadAll) {
    throw new Error("Student not found in scope");
  }

  const env = getRuntimeEnv();
  const sessionId = uid("ses");
  const ext = payload.fileName.split(".").pop() ?? "mp4";
  const videoKey = `videos/${scope.userId}/${sessionId}.${ext}`;
  await env.VIDEOS.put(videoKey, payload.buffer, { httpMetadata: { contentType: payload.contentType } });

  await exec(
    "INSERT INTO sessions (id, student_id, source_type, status, video_key, created_at, updated_at) VALUES (?, ?, ?, 'created', ?, ?, ?)",
    [sessionId, payload.studentId, payload.sourceType, videoKey, nowIso(), nowIso()]
  );

  return { sessionId, videoKey };
}

export async function analyzeLight(scope: RequestScope, payload: { sessionId: string }) {
  const session = await one<{ id: string; video_key: string; source_type: string; student_id: string }>(
    `SELECT s.id, s.video_key, s.source_type, s.student_id
     FROM sessions s JOIN students st ON st.id = s.student_id
     WHERE s.id = ? AND (${scope.canReadAll ? "1=1" : scope.role === "pro" ? "st.coach_user_id = ?" : "st.user_id = ?"})`,
    scope.canReadAll ? [payload.sessionId] : [payload.sessionId, scope.userId]
  );
  if (!session) throw new Error("Session not found in scope");

  const lightScore = 70 + Math.round(Math.random() * 20);
  const tempoRatio = 2.5 + Math.random() * 0.8;
  await exec("UPDATE sessions SET status='analyzing-light', light_score=?, tempo_ratio=?, updated_at=? WHERE id=?", [lightScore, tempoRatio, nowIso(), payload.sessionId]);

  await exec(
    "INSERT OR REPLACE INTO analysis_results (session_id, student_id, source_type, mode, score, tempo_ratio, backswing_ms, downswing_ms, phase_detected, report_zh, report_en, analysis_version, created_at) VALUES (?, ?, ?, 'light', ?, ?, 900, 350, 'impact', ?, ?, 'v1', ?)",
    [payload.sessionId, session.student_id, session.source_type, lightScore, tempoRatio, "轻分析：节奏基本稳定，建议提升下杆连续性。", "Light analysis: rhythm is stable, focus on downswing continuity.", nowIso()]
  );
  await exec(
    "INSERT OR REPLACE INTO metrics (session_id, spine_tilt_deg, shoulder_turn_deg, hip_turn_deg, head_sway_px, wrist_path_score) VALUES (?, ?, ?, ?, ?, ?)",
    [payload.sessionId, 34.2, 88.1, 44.5, 9.4, 79.2]
  );
  await exec(
    "INSERT INTO issues (session_id, code, severity, phase, title_zh, title_en, detail_zh, detail_en, tip_short) VALUES (?, 'tempo_inconsistent', 'medium', 'downswing', '下杆节奏波动', 'Inconsistent downswing tempo', '下杆阶段速度变化较大，影响击球稳定。', 'Speed fluctuates in downswing and affects impact stability.', '放慢顶点切换，保持节奏。')",
    [payload.sessionId]
  );
  return { sessionId: payload.sessionId, lightScore, tempoRatio };
}

export async function analyzeDeep(scope: RequestScope, payload: { sessionId: string }) {
  const session = await one<{ id: string; video_key: string; student_id: string }>(
    `SELECT s.id, s.video_key, s.student_id
     FROM sessions s JOIN students st ON st.id = s.student_id
     WHERE s.id = ? AND (${scope.canReadAll ? "1=1" : scope.role === "pro" ? "st.coach_user_id = ?" : "st.user_id = ?"})`,
    scope.canReadAll ? [payload.sessionId] : [payload.sessionId, scope.userId]
  );
  if (!session) throw new Error("Session not found");

  await exec("UPDATE sessions SET status='analyzing-deep', updated_at=? WHERE id=?", [nowIso(), payload.sessionId]);

  try {
    const env = getRuntimeEnv();
    const object = await env.VIDEOS.get(session.video_key);
    if (!object) throw new Error("Video not found in R2");
    const bytes = await object.arrayBuffer();

    const response = await fetch(`${appEnv.server.analyzerBaseUrl}/analyze`, {
      method: "POST",
      headers: {
        "content-type": "application/octet-stream",
        "x-analyzer-token": appEnv.server.analyzerToken,
        "x-session-id": payload.sessionId
      },
      body: bytes
    });

    if (!response.ok) throw new Error(`Analyzer failed: ${response.status}`);
    const data = (await response.json()) as { finalScore?: number; durationMs?: number; issues?: Array<{ code: string; severity: string }> };
    const finalScore = data.finalScore ?? 82;

    await exec("UPDATE sessions SET status='completed', final_score=?, duration_ms=?, completed_at=?, updated_at=? WHERE id=?", [finalScore, data.durationMs ?? 2200, nowIso(), nowIso(), payload.sessionId]);

    if (data.issues?.length) {
      for (const issue of data.issues) {
        await exec(
          "INSERT INTO issues (session_id, code, severity, phase, title_zh, title_en, detail_zh, detail_en, tip_short) VALUES (?, ?, ?, 'impact', ?, ?, ?, ?, ?)",
          [payload.sessionId, issue.code, issue.severity, "深度问题", "Deep issue", "来自深度分析器的问题。", "Issue returned by deep analyzer.", "按建议执行专项训练"]
        );
      }
    }
    return { sessionId: payload.sessionId, finalScore };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Deep analysis failed";
    await exec("UPDATE sessions SET status='failed', error_message=?, updated_at=? WHERE id=?", [msg, nowIso(), payload.sessionId]);
    throw error;
  }
}

export async function generateReport(scope: RequestScope, payload: { sessionId: string }) {
  const session = await one<{ id: string; light_score: number | null; final_score: number | null }>(
    `SELECT s.id, s.light_score, s.final_score
     FROM sessions s JOIN students st ON st.id = s.student_id
     WHERE s.id=? AND (${scope.canReadAll ? "1=1" : scope.role === "pro" ? "st.coach_user_id = ?" : "st.user_id = ?"})`,
    scope.canReadAll ? [payload.sessionId] : [payload.sessionId, scope.userId]
  );
  if (!session) throw new Error("session not found");

  const ruleText = `规则报告：light=${session.light_score ?? "n/a"}, final=${session.final_score ?? "n/a"}。建议：稳定重心，优化顶点转换。`;
  let provider = "rules";
  let bodyZh = ruleText;

  if (appEnv.server.geminiApiKey) {
    const resp = await fetch(`${appEnv.server.geminiApiBase}/models/${appEnv.server.geminiModel}:generateContent?key=${appEnv.server.geminiApiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: json({ contents: [{ parts: [{ text: `请基于以下信息生成高尔夫挥杆建议报告：${ruleText}` }] }] })
    });
    if (resp.ok) {
      const data = (await resp.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      bodyZh = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ruleText;
      provider = "gemini";
    }
  }

  await exec("INSERT INTO reports (session_id, lang, body, provider, model, created_at) VALUES (?, 'zh', ?, ?, ?, ?)", [payload.sessionId, bodyZh, provider, appEnv.server.geminiModel, nowIso()]);
  await exec("INSERT INTO reports (session_id, lang, body, provider, model, created_at) VALUES (?, 'en', ?, ?, ?, ?)", [payload.sessionId, "Rule report generated for training continuity and consistency.", provider, appEnv.server.geminiModel, nowIso()]);

  await exec(
    "INSERT INTO training_plans (session_id, student_id, focus_issue_code, plan_title, summary, drills_json, plan_zh, plan_en) VALUES (?, (SELECT student_id FROM sessions WHERE id=?), 'tempo_inconsistent', 'Tempo Stabilization', ?, ?, ?, ?)",
    [payload.sessionId, payload.sessionId, "Focus on transition and rhythm drills", json([{ code: "D001", title: "3:1 Tempo Drill" }]), "中文训练建议：节奏训练+镜前练习。", "EN plan: tempo drills and mirror practice."]
  );

  return { sessionId: payload.sessionId, provider, report: bodyZh };
}
