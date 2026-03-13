import { getEnv } from "@/lib/cloudflare";
import type { AnalysisResult, GrowthPoint, SessionRecord, Student } from "@/lib/types";

function db() {
  return getEnv().DB;
}

type StudentRow = Student & { userId?: string | null; coachUserId?: string | null };

type Scope = { role: "user" | "pro" | "admin"; userId: string };

function mapStudent(row: any): Student {
  return {
    id: row.id,
    name: row.name,
    dominantHand: row.dominantHand,
    level: row.level,
    handicap: Number(row.handicap ?? 0),
    notes: row.notes ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export async function listStudents(scope?: Scope): Promise<Student[]> {
  let sql = `
    SELECT id, user_id as userId, coach_user_id as coachUserId, name,
           dominant_hand as dominantHand, level, handicap, notes,
           created_at as createdAt, updated_at as updatedAt
    FROM students`;
  const binds: string[] = [];
  if (scope?.role === "user") {
    sql += ` WHERE user_id = ?1`;
    binds.push(scope.userId);
  } else if (scope?.role === "pro") {
    sql += ` WHERE coach_user_id = ?1`;
    binds.push(scope.userId);
  }
  sql += ` ORDER BY updated_at DESC`;
  const result = binds.length ? await db().prepare(sql).bind(...binds).all() : await db().prepare(sql).all();
  return ((result.results ?? []) as StudentRow[]).map(mapStudent);
}

export async function getStudent(id: string): Promise<Student | null> {
  const row = await db().prepare(`
    SELECT id, user_id as userId, coach_user_id as coachUserId, name,
           dominant_hand as dominantHand, level, handicap, notes,
           created_at as createdAt, updated_at as updatedAt
    FROM students WHERE id = ?1 LIMIT 1
  `).bind(id).first();
  return row ? mapStudent(row as StudentRow) : null;
}

export async function getStudentWithOwnership(id: string): Promise<StudentRow | null> {
  const row = await db().prepare(`
    SELECT id, user_id as userId, coach_user_id as coachUserId, name,
           dominant_hand as dominantHand, level, handicap, notes,
           created_at as createdAt, updated_at as updatedAt
    FROM students WHERE id = ?1 LIMIT 1
  `).bind(id).first();
  return (row ?? null) as StudentRow | null;
}

export async function getStudentForScope(id: string, scope?: Scope): Promise<Student | null> {
  const row = await getStudentWithOwnership(id);
  if (!row) return null;
  if (!scope || scope.role === "admin") return mapStudent(row);
  if (scope.role === "user" && row.userId === scope.userId) return mapStudent(row);
  if (scope.role === "pro" && row.coachUserId === scope.userId) return mapStudent(row);
  return null;
}

export async function findStudentByUserId(userId: string): Promise<Student | null> {
  const row = await db().prepare(`
    SELECT id, user_id as userId, coach_user_id as coachUserId, name,
           dominant_hand as dominantHand, level, handicap, notes,
           created_at as createdAt, updated_at as updatedAt
    FROM students WHERE user_id = ?1 ORDER BY updated_at DESC LIMIT 1
  `).bind(userId).first();
  return row ? mapStudent(row as StudentRow) : null;
}

export async function upsertStudent(student: Student & { userId?: string | null; coachUserId?: string | null }): Promise<void> {
  await db().prepare(`
    INSERT INTO students (id, user_id, coach_user_id, name, dominant_hand, level, handicap, notes, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
    ON CONFLICT(id) DO UPDATE SET
      user_id = excluded.user_id,
      coach_user_id = excluded.coach_user_id,
      name = excluded.name,
      dominant_hand = excluded.dominant_hand,
      level = excluded.level,
      handicap = excluded.handicap,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `).bind(
    student.id,
    student.userId ?? null,
    student.coachUserId ?? null,
    student.name,
    student.dominantHand,
    student.level,
    student.handicap,
    student.notes,
    student.createdAt,
    student.updatedAt
  ).run();
}

export async function createSession(session: SessionRecord): Promise<void> {
  await db().prepare(`
    INSERT INTO sessions (id, student_id, source_type, status, video_key, share_key, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
  `).bind(
    session.id,
    session.studentId,
    session.sourceType,
    session.status,
    session.videoKey,
    session.shareKey,
    session.createdAt,
    session.updatedAt
  ).run();
}

export async function updateSessionStatus(id: string, status: string): Promise<void> {
  await db().prepare(`UPDATE sessions SET status = ?1, updated_at = ?2 WHERE id = ?3`)
    .bind(status, new Date().toISOString(), id)
    .run();
}

export async function updateSessionShareKey(id: string, shareKey: string): Promise<void> {
  await db().prepare(`UPDATE sessions SET share_key = ?1, updated_at = ?2 WHERE id = ?3`)
    .bind(shareKey, new Date().toISOString(), id)
    .run();
}

export async function getSession(id: string): Promise<SessionRecord | null> {
  const row = await db().prepare(`
    SELECT id, student_id as studentId, source_type as sourceType, status, video_key as videoKey,
           share_key as shareKey, created_at as createdAt, updated_at as updatedAt
    FROM sessions WHERE id = ?1 LIMIT 1
  `).bind(id).first();
  return (row ?? null) as SessionRecord | null;
}

export async function getSessionForScope(id: string, scope?: Scope): Promise<SessionRecord | null> {
  const session = await getSession(id);
  if (!session) return null;
  const student = await getStudentWithOwnership(session.studentId);
  if (!student) return null;
  if (!scope || scope.role === "admin") return session;
  if (scope.role === "user" && student.userId === scope.userId) return session;
  if (scope.role === "pro" && student.coachUserId === scope.userId) return session;
  return null;
}

export async function writeAnalysis(result: AnalysisResult): Promise<void> {
  const now = new Date().toISOString();
  await db().batch([
    db().prepare(`
      INSERT INTO analysis_results (
        session_id, student_id, source_type, mode, score, tempo_ratio, backswing_ms, downswing_ms,
        phase_detected, report_zh, report_en, created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
      ON CONFLICT(session_id) DO UPDATE SET
        student_id = excluded.student_id,
        source_type = excluded.source_type,
        mode = excluded.mode,
        score = excluded.score,
        tempo_ratio = excluded.tempo_ratio,
        backswing_ms = excluded.backswing_ms,
        downswing_ms = excluded.downswing_ms,
        phase_detected = excluded.phase_detected,
        report_zh = excluded.report_zh,
        report_en = excluded.report_en,
        created_at = excluded.created_at
    `).bind(
      result.sessionId,
      result.studentId,
      result.sourceType,
      result.mode,
      result.score,
      result.tempoRatio,
      result.backswingMs,
      result.downswingMs,
      result.phaseDetected,
      result.reportZh,
      result.reportEn,
      result.createdAt
    ),
    db().prepare(`DELETE FROM keyframes WHERE session_id = ?1`).bind(result.sessionId),
    db().prepare(`DELETE FROM issues WHERE session_id = ?1`).bind(result.sessionId),
    db().prepare(`DELETE FROM reports WHERE session_id = ?1`).bind(result.sessionId),
    db().prepare(`DELETE FROM training_plans WHERE session_id = ?1`).bind(result.sessionId),
    db().prepare(`DELETE FROM metrics WHERE session_id = ?1`).bind(result.sessionId),
    db().prepare(`UPDATE sessions SET status = ?1, updated_at = ?2, completed_at = CASE WHEN ?1 = 'completed' THEN ?2 ELSE completed_at END WHERE id = ?3`)
      .bind(result.mode === 'deep' ? 'completed' : 'analyzing-light', now, result.sessionId)
  ]);

  for (const frame of result.keyframes) {
    await db().prepare(`
      INSERT INTO keyframes (session_id, label, time_sec, confidence, image_key)
      VALUES (?1, ?2, ?3, ?4, ?5)
    `).bind(result.sessionId, frame.label, frame.timeSec, frame.confidence, frame.imageKey ?? null).run();
  }

  const m = result.metrics;
  await db().prepare(`
    INSERT INTO metrics (session_id, spine_tilt_deg, shoulder_turn_deg, hip_turn_deg, head_sway_px,
      wrist_path_score, knee_flex_deg, elbow_trail_deg, pelvis_slide_px)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
    ON CONFLICT(session_id) DO UPDATE SET
      spine_tilt_deg = excluded.spine_tilt_deg,
      shoulder_turn_deg = excluded.shoulder_turn_deg,
      hip_turn_deg = excluded.hip_turn_deg,
      head_sway_px = excluded.head_sway_px,
      wrist_path_score = excluded.wrist_path_score,
      knee_flex_deg = excluded.knee_flex_deg,
      elbow_trail_deg = excluded.elbow_trail_deg,
      pelvis_slide_px = excluded.pelvis_slide_px
  `).bind(
    result.sessionId,
    m.spineTiltDeg,
    m.shoulderTurnDeg,
    m.hipTurnDeg,
    m.headSwayPx,
    m.wristPathScore,
    m.kneeFlexDeg ?? null,
    m.elbowTrailDeg ?? null,
    m.pelvisSlidePx ?? null
  ).run();

  for (const issue of result.issues) {
    await db().prepare(`
      INSERT INTO issues (session_id, code, severity, phase, title_zh, title_en, detail_zh, detail_en, tip_short)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
    `).bind(result.sessionId, issue.code, issue.severity, null, issue.titleZh, issue.titleEn, issue.detailZh, issue.detailEn, null).run();
  }

  await db().batch([
    db().prepare(`INSERT INTO reports (session_id, lang, body, provider, model, created_at) VALUES (?1, 'zh', ?2, ?3, ?4, ?5)`)
      .bind(result.sessionId, result.reportZh, result.mode === 'deep' ? 'gemini-or-rules' : 'rules', 'structured', now),
    db().prepare(`INSERT INTO reports (session_id, lang, body, provider, model, created_at) VALUES (?1, 'en', ?2, ?3, ?4, ?5)`)
      .bind(result.sessionId, result.reportEn, result.mode === 'deep' ? 'gemini-or-rules' : 'rules', 'structured', now)
  ]);

  for (const plan of result.trainingPlanZh) {
    await db().prepare(`INSERT INTO training_plans (session_id, plan_zh) VALUES (?1, ?2)`)
      .bind(result.sessionId, plan)
      .run();
  }

  for (const plan of result.trainingPlanEn) {
    await db().prepare(`INSERT INTO training_plans (session_id, plan_en) VALUES (?1, ?2)`)
      .bind(result.sessionId, plan)
      .run();
  }
}

export async function getAnalysis(sessionId: string): Promise<AnalysisResult | null> {
  const base = await db().prepare(`
    SELECT session_id as sessionId, student_id as studentId, source_type as sourceType, mode,
           score, tempo_ratio as tempoRatio, backswing_ms as backswingMs,
           downswing_ms as downswingMs, phase_detected as phaseDetected,
           report_zh as reportZh, report_en as reportEn, created_at as createdAt
    FROM analysis_results WHERE session_id = ?1 LIMIT 1
  `).bind(sessionId).first();
  if (!base) return null;

  const keyframes = ((await db().prepare(`
    SELECT label, time_sec as timeSec, confidence, image_key as imageKey FROM keyframes WHERE session_id = ?1 ORDER BY time_sec ASC
  `).bind(sessionId).all()).results ?? []).map((frame: any) => ({
    ...frame,
    imageUrl: frame.imageKey ? `/api/media?bucket=KEYFRAMES&key=${encodeURIComponent(frame.imageKey)}` : null
  }));

  const metrics = await db().prepare(`
    SELECT spine_tilt_deg as spineTiltDeg, shoulder_turn_deg as shoulderTurnDeg, hip_turn_deg as hipTurnDeg,
           head_sway_px as headSwayPx, wrist_path_score as wristPathScore,
           knee_flex_deg as kneeFlexDeg, elbow_trail_deg as elbowTrailDeg, pelvis_slide_px as pelvisSlidePx
    FROM metrics WHERE session_id = ?1 LIMIT 1
  `).bind(sessionId).first();

  const issues = (await db().prepare(`
    SELECT code, severity, title_zh as titleZh, title_en as titleEn, detail_zh as detailZh, detail_en as detailEn
    FROM issues WHERE session_id = ?1 ORDER BY rowid ASC
  `).bind(sessionId).all()).results ?? [];

  const trainingZh = (await db().prepare(`SELECT plan_zh as value FROM training_plans WHERE session_id = ?1 AND plan_zh IS NOT NULL`).bind(sessionId).all()).results?.map((r: any) => r.value) ?? [];
  const trainingEn = (await db().prepare(`SELECT plan_en as value FROM training_plans WHERE session_id = ?1 AND plan_en IS NOT NULL`).bind(sessionId).all()).results?.map((r: any) => r.value) ?? [];

  return {
    ...base,
    keyframes,
    metrics: metrics as any,
    issues: issues as any,
    trainingPlanZh: trainingZh,
    trainingPlanEn: trainingEn
  };
}

export async function listHistory(studentId?: string, scope?: Scope): Promise<Array<SessionRecord & { score: number | null; studentName?: string | null }>> {
  let sql = `SELECT s.id, s.student_id as studentId, s.source_type as sourceType, s.status, s.video_key as videoKey, s.share_key as shareKey,
         s.created_at as createdAt, s.updated_at as updatedAt, COALESCE(a.score, s.light_score, s.final_score) as score, st.name as studentName
       FROM sessions s
       JOIN students st ON st.id = s.student_id
       LEFT JOIN analysis_results a ON a.session_id = s.id`;
  const binds: string[] = [];
  const clauses: string[] = [];
  if (studentId) {
    clauses.push(`s.student_id = ?${binds.length + 1}`);
    binds.push(studentId);
  }
  if (scope?.role === 'user') {
    clauses.push(`st.user_id = ?${binds.length + 1}`);
    binds.push(scope.userId);
  } else if (scope?.role === 'pro') {
    clauses.push(`st.coach_user_id = ?${binds.length + 1}`);
    binds.push(scope.userId);
  }
  if (clauses.length) sql += ` WHERE ${clauses.join(' AND ')}`;
  sql += ` ORDER BY s.created_at DESC`;
  const stmt = db().prepare(sql);
  const result = binds.length ? await stmt.bind(...binds).all() : await stmt.all();
  return (result.results ?? []) as Array<SessionRecord & { score: number | null; studentName?: string | null }>;
}

export async function getGrowth(studentId: string, scope?: Scope): Promise<GrowthPoint[]> {
  const student = await getStudentForScope(studentId, scope);
  if (!student) return [];
  const result = await db().prepare(`
    SELECT s.created_at as createdAt, a.score, a.tempo_ratio as tempoRatio,
           (SELECT COUNT(*) FROM issues i WHERE i.session_id = s.id) as issueCount
    FROM sessions s JOIN analysis_results a ON a.session_id = s.id
    WHERE s.student_id = ?1 AND a.mode = 'deep'
    ORDER BY s.created_at ASC
  `).bind(studentId).all();
  return (result.results ?? []) as GrowthPoint[];
}

export async function createShareLog(sessionId: string, channel: string, shareKey?: string): Promise<void> {
  await db().prepare(`INSERT INTO share_logs (session_id, channel, share_key, created_at) VALUES (?1, ?2, ?3, ?4)`)
    .bind(sessionId, channel, shareKey ?? null, new Date().toISOString())
    .run();
}
