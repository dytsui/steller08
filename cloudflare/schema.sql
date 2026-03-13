CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coach_student_links (
  id TEXT PRIMARY KEY,
  coach_user_id TEXT NOT NULL,
  student_user_id TEXT,
  student_profile_id TEXT,
  relationship_status TEXT NOT NULL DEFAULT 'invited',
  created_at TEXT NOT NULL,
  FOREIGN KEY(coach_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(student_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS coach_invites (
  id TEXT PRIMARY KEY,
  coach_user_id TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(coach_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  coach_user_id TEXT,
  name TEXT NOT NULL,
  dominant_hand TEXT NOT NULL,
  level TEXT NOT NULL,
  handicap REAL NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  is_current INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY(coach_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT,
  video_key TEXT NOT NULL,
  preview_key TEXT,
  share_key TEXT,
  screen_mode INTEGER NOT NULL DEFAULT 0,
  light_score REAL,
  final_score REAL,
  tempo_ratio REAL,
  duration_ms INTEGER,
  source_width INTEGER,
  source_height INTEGER,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY(student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS analysis_results (
  session_id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  mode TEXT NOT NULL,
  score INTEGER NOT NULL,
  tempo_ratio REAL NOT NULL,
  backswing_ms INTEGER NOT NULL,
  downswing_ms INTEGER NOT NULL,
  phase_detected TEXT NOT NULL,
  report_zh TEXT NOT NULL,
  report_en TEXT NOT NULL,
  analysis_version TEXT DEFAULT 'v1',
  created_at TEXT NOT NULL,
  FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS keyframes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  label TEXT NOT NULL,
  time_sec REAL NOT NULL,
  confidence REAL NOT NULL,
  image_key TEXT,
  preview_key TEXT,
  FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS metrics (
  session_id TEXT PRIMARY KEY,
  spine_tilt_deg REAL NOT NULL,
  shoulder_turn_deg REAL NOT NULL,
  hip_turn_deg REAL NOT NULL,
  head_sway_px REAL NOT NULL,
  wrist_path_score REAL NOT NULL,
  knee_flex_deg REAL,
  elbow_trail_deg REAL,
  pelvis_slide_px REAL,
  FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  code TEXT NOT NULL,
  severity TEXT NOT NULL,
  phase TEXT,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  detail_zh TEXT NOT NULL,
  detail_en TEXT NOT NULL,
  tip_short TEXT,
  FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  lang TEXT NOT NULL,
  body TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS training_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  student_id TEXT,
  focus_issue_code TEXT,
  plan_title TEXT,
  summary TEXT,
  drills_json TEXT,
  plan_zh TEXT,
  plan_en TEXT,
  FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS share_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  share_key TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS drills (
  id TEXT PRIMARY KEY,
  drill_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  target_issue_code TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  video_url TEXT,
  cover_r2_key TEXT,
  duration_minutes INTEGER DEFAULT 10,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news_cache (
  id TEXT PRIMARY KEY,
  lang TEXT NOT NULL DEFAULT 'zh',
  title TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  source TEXT,
  published_at TEXT,
  url TEXT NOT NULL,
  category TEXT,
  fetched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_links_coach ON coach_student_links(coach_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_invites_coach ON coach_invites(coach_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_coach ON students(coach_user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_created ON sessions(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_session ON issues(session_id);
CREATE INDEX IF NOT EXISTS idx_reports_session_lang ON reports(session_id, lang);
CREATE INDEX IF NOT EXISTS idx_training_plans_session ON training_plans(session_id);
CREATE INDEX IF NOT EXISTS idx_drills_issue ON drills(target_issue_code);
CREATE INDEX IF NOT EXISTS idx_news_cache_lang_published ON news_cache(lang, published_at DESC);
