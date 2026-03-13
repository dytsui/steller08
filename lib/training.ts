import type { AnalysisResult, Issue } from '@/lib/types';
import { getIssueCatalogItem } from '@/lib/catalogs/issue-catalog';
import { ISSUE_TO_DRILLS } from '@/lib/catalogs/issue-to-drills';
import { getDrillCatalogItem } from '@/lib/catalogs/drill-catalog';

export type EnrichedIssue = Issue & {
  phase: 'address' | 'takeaway' | 'top' | 'downswing' | 'impact' | 'finish' | 'global';
  why: string;
  fix: string;
  shortTip: string;
  drillCodes: string[];
};

export function enrichIssue(issue: Issue): EnrichedIssue {
  const meta = getIssueCatalogItem(issue.code);
  return {
    ...issue,
    phase: meta?.phase ?? 'global',
    why: meta?.why ?? issue.detailZh,
    fix: meta?.fix ?? '先从节奏和站位稳定性做基础修正，再复测。',
    shortTip: meta?.shortTip ?? issue.detailZh,
    drillCodes: meta?.drillCodes ?? ISSUE_TO_DRILLS[issue.code] ?? []
  };
}

export function deriveTrainingPlan(analysis: AnalysisResult) {
  const issues = analysis.issues.map(enrichIssue);
  const focus = issues[0] ?? null;
  const drillCodes = focus?.drillCodes.length ? focus.drillCodes : issues.flatMap((item) => item.drillCodes).slice(0, 3);
  const drills = drillCodes.map((code) => getDrillCatalogItem(code)).filter(Boolean);
  const planTitle = focus ? `针对 ${focus.titleZh} 的 7 天训练计划` : '基础节奏与平衡 7 天训练计划';
  const summary = focus
    ? `当前优先解决 ${focus.titleZh}。先做 ${drills.map((item) => item?.title).filter(Boolean).slice(0, 2).join('、')}。`
    : '当前没有显著问题，维持节奏、平衡和基础旋转即可。';
  return {
    focusIssueCode: focus?.code ?? null,
    planTitle,
    summary,
    drills: drills.map((item) => ({
      code: item!.code,
      title: item!.title,
      durationMinutes: item!.durationMinutes,
      summary: item!.summary,
      steps: item!.steps,
      cautions: item!.cautions,
      difficulty: item!.difficulty
    }))
  };
}
