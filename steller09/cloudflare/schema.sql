CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  display_name TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  coach_user_id TEXT,
  name TEXT NOT NULL,
  dominant_hand TEXT NOT NULL,
  level TEXT NOT NULL,
  handicap REAL NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  is_current INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  status TEXT NOT NULL,
  video_key TEXT NOT NULL,
  preview_key TEXT,
  share_key TEXT,
  light_score REAL,
  final_score REAL,
  tempo_ratio REAL,
  duration_ms INTEGER,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
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
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS metrics (
  session_id TEXT PRIMARY KEY,
  spine_tilt_deg REAL NOT NULL,
  shoulder_turn_deg REAL NOT NULL,
  hip_turn_deg REAL NOT NULL,
  head_sway_px REAL NOT NULL,
  wrist_path_score REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS keyframes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  label TEXT NOT NULL,
  time_sec REAL NOT NULL,
  confidence REAL NOT NULL,
  image_key TEXT,
  preview_key TEXT
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
  tip_short TEXT
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  lang TEXT NOT NULL,
  body TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  created_at TEXT NOT NULL
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
  plan_en TEXT
);

CREATE TABLE IF NOT EXISTS share_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  share_key TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coach_links (
  id TEXT PRIMARY KEY,
  coach_user_id TEXT NOT NULL,
  student_user_id TEXT,
  student_profile_id TEXT,
  relationship_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coach_invites (
  id TEXT PRIMARY KEY,
  coach_user_id TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
