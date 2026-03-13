import { deriveTrainingPlan, enrichIssue } from '@/lib/training';
import type { AnalysisResult } from '@/lib/types';

const STANDARD_TEMPLATE = {
  tempoRatio: 3,
  spineTiltDeg: 35,
  shoulderTurnDeg: 88,
  hipTurnDeg: 42,
  headSwayPx: 12,
  wristPathScore: 84,
  kneeFlexDeg: 24,
  elbowTrailDeg: 92,
  pelvisSlidePx: 14
};

const PHASES = [
  { key: 'address', label: 'Address' },
  { key: 'takeaway', label: 'Takeaway' },
  { key: 'top', label: 'Top' },
  { key: 'downswing', label: 'Downswing' },
  { key: 'impact', label: 'Impact' },
  { key: 'finish', label: 'Finish' }
] as const;

function diffText(name: string, actual: number | undefined, target: number) {
  if (actual === undefined || actual === null || Number.isNaN(actual)) return `${name} 暂无数据`;
  const delta = Number((actual - target).toFixed(1));
  if (Math.abs(delta) < 1) return `${name} 接近标准`;
  return `${name}${delta > 0 ? '高于' : '低于'}标准 ${Math.abs(delta)}`;
}

function metricDiffs(analysis: AnalysisResult) {
  return [
    { label: 'Tempo', actual: analysis.tempoRatio, target: STANDARD_TEMPLATE.tempoRatio, detail: diffText('Tempo', analysis.tempoRatio, STANDARD_TEMPLATE.tempoRatio) },
    { label: '脊柱', actual: analysis.metrics.spineTiltDeg, target: STANDARD_TEMPLATE.spineTiltDeg, detail: diffText('脊柱倾角', analysis.metrics.spineTiltDeg, STANDARD_TEMPLATE.spineTiltDeg) },
    { label: '肩转', actual: analysis.metrics.shoulderTurnDeg, target: STANDARD_TEMPLATE.shoulderTurnDeg, detail: diffText('肩转', analysis.metrics.shoulderTurnDeg, STANDARD_TEMPLATE.shoulderTurnDeg) },
    { label: '髋转', actual: analysis.metrics.hipTurnDeg, target: STANDARD_TEMPLATE.hipTurnDeg, detail: diffText('髋转', analysis.metrics.hipTurnDeg, STANDARD_TEMPLATE.hipTurnDeg) },
    { label: '头部', actual: analysis.metrics.headSwayPx, target: STANDARD_TEMPLATE.headSwayPx, detail: diffText('头部位移', analysis.metrics.headSwayPx, STANDARD_TEMPLATE.headSwayPx) },
    { label: '手腕路径', actual: analysis.metrics.wristPathScore, target: STANDARD_TEMPLATE.wristPathScore, detail: diffText('手腕路径', analysis.metrics.wristPathScore, STANDARD_TEMPLATE.wristPathScore) }
  ];
}

function phaseMetricSummary(analysis: AnalysisResult, phase: string) {
  switch (phase) {
    case 'address':
      return [
        `脊柱 ${analysis.metrics.spineTiltDeg}`,
        `头部 ${analysis.metrics.headSwayPx}`
      ];
    case 'takeaway':
      return [
        `肩转 ${analysis.metrics.shoulderTurnDeg}`,
        `手腕路径 ${analysis.metrics.wristPathScore}`
      ];
    case 'top':
      return [
        `肩转 ${analysis.metrics.shoulderTurnDeg}`,
        `髋转 ${analysis.metrics.hipTurnDeg}`
      ];
    case 'downswing':
      return [
        `手腕路径 ${analysis.metrics.wristPathScore}`,
        `骨盆滑移 ${analysis.metrics.pelvisSlidePx ?? '--'}`
      ];
    case 'impact':
      return [
        `头部 ${analysis.metrics.headSwayPx}`,
        `Tempo ${analysis.tempoRatio}`
      ];
    case 'finish':
      return [
        `膝角 ${analysis.metrics.kneeFlexDeg ?? '--'}`,
        `肘部 ${analysis.metrics.elbowTrailDeg ?? '--'}`
      ];
    default:
      return [];
  }
}

function phaseState(analysis: AnalysisResult, phase: string) {
  const issues = analysis.issues.map(enrichIssue).filter((item) => item.phase === phase);
  if (!issues.length) return 'pass';
  if (issues.some((item) => item.severity === 'high')) return 'fail';
  return 'warning';
}

export function presentAnalysis(analysis: AnalysisResult) {
  const enrichedIssues = analysis.issues.map(enrichIssue);
  const primary = enrichedIssues[0] ?? null;
  const training = deriveTrainingPlan(analysis);
  const primaryFrame = analysis.keyframes.find((frame) => ['impact', 'top', 'address'].includes(frame.label)) ?? analysis.keyframes[0] ?? null;

  const phaseDetails = PHASES.map((phase) => {
    const issues = enrichedIssues.filter((item) => item.phase === phase.key);
    const frame = analysis.keyframes.find((item) => item.label === phase.key || (phase.key === 'takeaway' && item.label === 'address') || (phase.key === 'downswing' && item.label === 'impact')) ?? analysis.keyframes[0] ?? null;
    return {
      ...phase,
      state: phaseState(analysis, phase.key),
      frame,
      issues,
      metrics: phaseMetricSummary(analysis, phase.key)
    };
  });

  return {
    primaryIssue: primary?.titleZh ?? '当前没有显著主问题',
    priorityReason: primary ? primary.why : '当前结构没有检出高优先级问题，可先保持节奏与平衡。',
    tip3s: primary?.shortTip ?? '保持节奏和收杆平衡。',
    primaryFrame,
    phaseFlow: phaseDetails.map((phase) => ({ key: phase.key, label: phase.label, state: phase.state })),
    phaseDetails,
    proCompare: {
      title: '标准模板对比',
      summary: '一期先使用标准模板对比，不冒充职业球手镜像。',
      metricDiffs: metricDiffs(analysis)
    },
    training,
    enrichedIssues
  };
}
