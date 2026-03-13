export type Locale = 'zh-CN' | 'en';
export type AnalysisSource = 'camera' | 'upload' | 'screen-camera' | 'screen-upload';
export type AnalysisMode = 'light' | 'deep';
export type SessionStatus = 'created' | 'uploading' | 'uploaded' | 'analyzing-light' | 'analyzing-deep' | 'completed' | 'failed';
export type KeyframeLabel = 'address' | 'top' | 'impact' | 'finish';
export type IssueSeverity = 'low' | 'medium' | 'high';

export type Student = {
  id: string;
  name: string;
  dominantHand: 'left' | 'right';
  level: string;
  handicap: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type SessionRecord = {
  id: string;
  studentId: string;
  sourceType: AnalysisSource;
  status: SessionStatus;
  videoKey: string;
  shareKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Keyframe = {
  label: KeyframeLabel;
  timeSec: number;
  confidence: number;
  imageKey?: string | null;
  imageUrl?: string | null;
  imageBase64?: string | null;
};

export type Metrics = {
  spineTiltDeg: number;
  shoulderTurnDeg: number;
  hipTurnDeg: number;
  headSwayPx: number;
  wristPathScore: number;
  kneeFlexDeg?: number;
  elbowTrailDeg?: number;
  pelvisSlidePx?: number;
};

export type Issue = {
  code: string;
  severity: IssueSeverity;
  titleZh: string;
  titleEn: string;
  detailZh: string;
  detailEn: string;
};

export type AnalysisResult = {
  sessionId: string;
  studentId: string;
  sourceType: AnalysisSource;
  mode: AnalysisMode;
  score: number;
  tempoRatio: number;
  backswingMs: number;
  downswingMs: number;
  phaseDetected: string;
  keyframes: Keyframe[];
  metrics: Metrics;
  issues: Issue[];
  reportZh: string;
  reportEn: string;
  trainingPlanZh: string[];
  trainingPlanEn: string[];
  createdAt: string;
};

export type GrowthPoint = {
  createdAt: string;
  score: number;
  tempoRatio: number;
  issueCount: number;
};


export type UserRole = 'user' | 'pro' | 'admin';
export type PortalType = 'user' | 'pro';

export type UserAccount = {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string | null;
  status: 'active' | 'invited' | 'disabled';
  createdAt: string;
  updatedAt: string;
};

export type CoachStudentLink = {
  id: string;
  coachUserId: string;
  studentUserId?: string | null;
  studentProfileId?: string | null;
  relationshipStatus: 'invited' | 'active' | 'archived';
  createdAt: string;
};

export type CoachInvite = {
  id: string;
  coachUserId: string;
  inviteCode: string;
  email?: string | null;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
};
