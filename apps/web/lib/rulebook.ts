export const ISSUE_RULES = [
  "head_sway",
  "hip_turn",
  "shoulder_turn",
  "wrist_path",
  "early_extension",
  "reverse_spine",
  "tempo_fast",
  "tempo_slow",
  "knee_lock",
  "elbow_fly",
  "pelvis_slide",
  "address_posture",
  "finish_balance",
  "screen_quality",
  "screen_glare",
  "screen_crop",
  "head_drop",
  "casting",
  "flat_shoulder",
  "over_swing"
] as const;

export const DRILL_LIBRARY: Record<string, { zh: string[]; en: string[] }> = {
  head_sway: {
    zh: ["头部稳定 drill 5 分钟", "靠墙头部基准练习 8 次"],
    en: ["Head stability drill 5 min", "Wall-reference head drill x8"]
  },
  hip_turn: {
    zh: ["髋转分离练习 10 组", "上杆髋转镜前练习 8 次"],
    en: ["Hip separation drill x10", "Mirror hip turn drill x8"]
  },
  wrist_path: {
    zh: ["手腕走廊练习 12 次", "半挥杆路径控制 10 次"],
    en: ["Wrist corridor drill x12", "Half swing path drill x10"]
  }
};
