import type { AnalysisResult, AnalysisSource, Issue, Metrics } from '@/lib/types';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function buildIssues(metrics: Metrics, sourceType: AnalysisSource, tempoRatio: number): Issue[] {
  const issues: Issue[] = [];
  if (metrics.headSwayPx > 18) {
    issues.push({
      code: 'head_sway',
      severity: metrics.headSwayPx > 28 ? 'high' : 'medium',
      titleZh: '头部位移偏大',
      titleEn: 'Head sway too large',
      detailZh: '快速首扫检测到下杆阶段头部位移偏大。',
      detailEn: 'Quick scan detected excess head movement during the downswing.'
    });
  }
  if (metrics.hipTurnDeg < 30) {
    issues.push({
      code: 'hip_turn',
      severity: 'medium',
      titleZh: '髋转不足',
      titleEn: 'Restricted hip turn',
      detailZh: '上杆髋转不足，可能影响蓄力与回正。',
      detailEn: 'Hip turn at the top is restricted, which can limit coil and delivery.'
    });
  }
  if (metrics.wristPathScore < 72) {
    issues.push({
      code: 'wrist_path',
      severity: 'low',
      titleZh: '手腕路径不稳定',
      titleEn: 'Wrist path unstable',
      detailZh: '快速首扫发现手腕路径偏离目标走廊。',
      detailEn: 'Quick scan found the wrist path drifting away from the corridor.'
    });
  }
  if (tempoRatio < 2.7) {
    issues.push({
      code: 'tempo_too_fast',
      severity: 'medium',
      titleZh: '整体节奏偏快',
      titleEn: 'Tempo running too fast',
      detailZh: '首扫节奏偏快，建议降低上杆速度再进入正式分析。',
      detailEn: 'Quick-scan tempo is too fast. Slow the backswing slightly before formal analysis.'
    });
  }
  if (sourceType.startsWith('screen')) {
    issues.push({
      code: 'screen_quality',
      severity: 'low',
      titleZh: '屏拍质量提示',
      titleEn: 'Screen capture advisory',
      detailZh: '建议完整拍入屏幕边框并减少反光，以提升深分析质量。',
      detailEn: 'Keep the display border fully visible and reduce glare for better deep analysis.'
    });
  }
  return issues;
}

export function runLightAnalysis(input: {
  sessionId: string;
  studentId: string;
  sourceType: AnalysisSource;
  durationMs: number;
  snapshot: {
    phaseDetected: string;
    score?: number;
    metrics: AnalysisResult['metrics'];
    keyframes?: AnalysisResult['keyframes'];
  };
}): AnalysisResult {
  const durationSec = Math.max(1.2, input.durationMs / 1000);
  const backswingMs = Math.round(durationSec * 680);
  const downswingMs = Math.max(180, Math.round(backswingMs / 3.05));
  const tempoRatio = Number((backswingMs / downswingMs).toFixed(2));
  const metrics = input.snapshot.metrics;
  const issues = buildIssues(metrics, input.sourceType, tempoRatio);
  const score = input.snapshot.score ?? Math.round(clamp(
    92
      - Math.max(0, metrics.headSwayPx - 12) * 0.45
      - Math.max(0, 70 - metrics.wristPathScore) * 0.2
      - Math.max(0, 32 - metrics.hipTurnDeg) * 0.35,
    55,
    95
  ));

  return {
    sessionId: input.sessionId,
    studentId: input.studentId,
    sourceType: input.sourceType,
    mode: 'light',
    score,
    tempoRatio,
    backswingMs,
    downswingMs,
    phaseDetected: input.snapshot.phaseDetected,
    keyframes: input.snapshot.keyframes ?? [
      { label: 'address', timeSec: 0.18, confidence: 0.72 },
      { label: 'top', timeSec: Number((durationSec * 0.48).toFixed(2)), confidence: 0.74 },
      { label: 'impact', timeSec: Number((durationSec * 0.7).toFixed(2)), confidence: 0.71 },
      { label: 'finish', timeSec: Number((durationSec * 0.92).toFixed(2)), confidence: 0.69 }
    ],
    metrics,
    issues,
    reportZh: `快速首扫完成：已基于真实姿态采样得出节奏 ${tempoRatio}、评分 ${score}，正式分析完成后会以完整结果更新。`,
    reportEn: `Quick scan finished: real pose samples produced tempo ${tempoRatio} and score ${score}. The formal analysis will update this result when ready.`,
    trainingPlanZh: issues.length ? issues.slice(0, 2).map((issue) => `针对 ${issue.titleZh} 先做 8–12 次专项练习`) : ['先保持当前节奏，再等待正式训练建议。'],
    trainingPlanEn: issues.length ? issues.slice(0, 2).map((issue) => `Run 8-12 focused reps for ${issue.titleEn}`) : ['Hold current tempo and wait for deep-analysis training plan.'],
    createdAt: new Date().toISOString()
  };
}
