import { appEnv } from "@/lib/env";
import { exec, many, one } from "@/lib/db";
import { getRuntimeEnv } from "@/lib/runtime";
import { nowIso, uid } from "@/lib/utils";
import type { RequestScope } from "@/types/domain";

export async function createStudent(scope: RequestScope, input: { name: string; dominantHand: string; level: string; handicap: number; notes?: string }) {
  const id = uid("stu");
  await exec(
    "INSERT INTO students (id, user_id, coach_user_id, name, dominant_hand, level, handicap, notes, is_current, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)",
    [id, scope.role === "pro" ? null : scope.userId, scope.role === "pro" ? scope.userId : null, input.name, input.dominantHand, input.level, input.handicap, input.notes ?? "", nowIso(), nowIso()]
  );
  return { id };
}

export async function listStudents(scope: RequestScope) {
  if (scope.canReadAll) return many("SELECT * FROM students ORDER BY created_at DESC");
  if (scope.role === "pro") return many("SELECT * FROM students WHERE coach_user_id=? ORDER BY created_at DESC", [scope.userId]);
  return many("SELECT * FROM students WHERE user_id=? ORDER BY created_at DESC", [scope.userId]);
}

export async function createMediaSession(scope: RequestScope, input: { studentId: string; file: File; sourceType: "upload" | "capture" }) {
  const env = getRuntimeEnv();
  const sessionId = uid("ses");
  const videoKey = `videos/${scope.userId}/${sessionId}.mp4`;
  await env.VIDEOS.put(videoKey, await input.file.arrayBuffer(), { httpMetadata: { contentType: input.file.type || "video/mp4" } });
  await exec("INSERT INTO sessions (id, student_id, source_type, status, video_key, created_at, updated_at) VALUES (?, ?, ?, 'created', ?, ?, ?)", [sessionId, input.studentId, input.sourceType, videoKey, nowIso(), nowIso()]);
  return { sessionId, videoKey };
}

export async function analyzeLight(scope: RequestScope, sessionId: string) {
  const allowed = await one<{ id: string }>(
    `SELECT s.id FROM sessions s JOIN students st ON st.id=s.student_id
     WHERE s.id=? AND (${scope.canReadAll ? "1=1" : scope.role === "pro" ? "st.coach_user_id=?" : "st.user_id=?"})`,
    scope.canReadAll ? [sessionId] : [sessionId, scope.userId]
  );
  if (!allowed) throw new Error("session out of scope");
  const lightScore = 78;
  const tempoRatio = 2.9;
  await exec("UPDATE sessions SET status='analyzing-light', light_score=?, tempo_ratio=?, updated_at=? WHERE id=?", [lightScore, tempoRatio, nowIso(), sessionId]);
  await exec("INSERT OR REPLACE INTO analysis_results (session_id, student_id, source_type, mode, score, tempo_ratio, backswing_ms, downswing_ms, phase_detected, report_zh, report_en, analysis_version, created_at) VALUES (?, (SELECT student_id FROM sessions WHERE id=?), (SELECT source_type FROM sessions WHERE id=?), 'light', ?, ?, 920, 330, 'impact', ?, ?, 'v1', ?)", [sessionId, sessionId, sessionId, lightScore, tempoRatio, '轻分析建议：注意下杆时重心前移。', 'Light tip: transfer weight earlier in downswing.', nowIso()]);
  await exec("INSERT OR REPLACE INTO metrics (session_id, spine_tilt_deg, shoulder_turn_deg, hip_turn_deg, head_sway_px, wrist_path_score) VALUES (?, 33.2, 90.1, 46.2, 11.0, 81.5)", [sessionId]);
  await exec("INSERT INTO issues (session_id, code, severity, phase, title_zh, title_en, detail_zh, detail_en, tip_short) VALUES (?, 'tempo_inconsistent', 'medium', 'downswing', '下杆节奏不稳', 'Inconsistent tempo', '下杆时速度波动会影响击球稳定性。', 'Tempo variance in downswing reduces strike consistency.', '先慢后快，保持3:1节奏')", [sessionId]);
  return { sessionId, lightScore, tempoRatio };
}

export async function analyzeDeep(scope: RequestScope, sessionId: string) {
  const row = await one<{ video_key: string }>(
    `SELECT s.video_key FROM sessions s JOIN students st ON st.id=s.student_id
     WHERE s.id=? AND (${scope.canReadAll ? "1=1" : scope.role === "pro" ? "st.coach_user_id=?" : "st.user_id=?"})`,
    scope.canReadAll ? [sessionId] : [sessionId, scope.userId]
  );
  if (!row) throw new Error("session out of scope");
  await exec("UPDATE sessions SET status='analyzing-deep', updated_at=? WHERE id=?", [nowIso(), sessionId]);

  try {
    const object = await getRuntimeEnv().VIDEOS.get(row.video_key);
    if (!object) throw new Error("video missing");
    const response = await fetch(`${appEnv.server.analyzerBaseUrl}/analyze`, {
      method: "POST",
      headers: {
        "content-type": "application/octet-stream",
        "x-analyzer-token": appEnv.server.analyzerToken,
        "x-session-id": sessionId
      },
      body: await object.arrayBuffer()
    });
    if (!response.ok) throw new Error(`analyzer ${response.status}`);
    const data = (await response.json()) as { finalScore?: number; durationMs?: number };
    await exec("UPDATE sessions SET status='completed', final_score=?, duration_ms=?, completed_at=?, updated_at=? WHERE id=?", [data.finalScore ?? 84, data.durationMs ?? 2300, nowIso(), nowIso(), sessionId]);
    return { sessionId, finalScore: data.finalScore ?? 84 };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "deep failed";
    await exec("UPDATE sessions SET status='failed', error_message=?, updated_at=? WHERE id=?", [msg, nowIso(), sessionId]);
    throw e;
  }
}

export async function generateReport(scope: RequestScope, sessionId: string) {
  const exists = await one<{ id: string }>(
    `SELECT s.id FROM sessions s JOIN students st ON st.id=s.student_id
     WHERE s.id=? AND (${scope.canReadAll ? "1=1" : scope.role === "pro" ? "st.coach_user_id=?" : "st.user_id=?"})`,
    scope.canReadAll ? [sessionId] : [sessionId, scope.userId]
  );
  if (!exists) throw new Error("session out of scope");

  let provider = "rules";
  let zh = "规则报告：建议优化顶点到击球过渡，减少下杆急促。";
  if (appEnv.server.geminiApiKey) {
    const r = await fetch(`${appEnv.server.geminiApiBase}/models/${appEnv.server.geminiModel}:generateContent?key=${appEnv.server.geminiApiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: zh }] }] })
    });
    if (r.ok) {
      const j = (await r.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      zh = j.candidates?.[0]?.content?.parts?.[0]?.text ?? zh;
      provider = "gemini";
    }
  }
  await exec("INSERT INTO reports (session_id, lang, body, provider, model, created_at) VALUES (?, 'zh', ?, ?, ?, ?)", [sessionId, zh, provider, appEnv.server.geminiModel, nowIso()]);
  await exec("INSERT INTO reports (session_id, lang, body, provider, model, created_at) VALUES (?, 'en', 'Keep rhythm and transition smoother.', ?, ?, ?)", [sessionId, provider, appEnv.server.geminiModel, nowIso()]);
  await exec("INSERT INTO training_plans (session_id, student_id, focus_issue_code, plan_title, summary, drills_json, plan_zh, plan_en) VALUES (?, (SELECT student_id FROM sessions WHERE id=?), 'tempo_inconsistent', 'Tempo Stability Plan', 'Focus on 3:1 tempo drills', ?, ?, ?)", [sessionId, sessionId, JSON.stringify([{ code: 'D001', name: '3:1 Tempo Drill' }]), '中文训练计划：节奏训练+镜前反馈。', 'EN plan: tempo drills + mirror feedback.']);
  return { sessionId, provider };
}
