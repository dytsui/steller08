from __future__ import annotations
from ..schemas import Issue

DRILL_MAP = {
    'impact_loss_of_posture': ['椅子保持髋深 10 分钟', '臀部贴墙练习 10 分钟'],
    'head_sway': ['站位平衡停留 6 分钟', '椅子保持髋深 8 分钟'],
    'hip_turn': ['抱胸转肩练习 6 分钟', '踏步顺序练习 8 分钟'],
    'top_over_swing': ['顶点停顿检查 8 组', '半挥杆顶点结构 10 组'],
    'downswing_over_the_top': ['停顿转换练习 8 组', '分手下落练习 8 组'],
    'wrist_path': ['停顿转换练习 8 组', '分手下落练习 6 组'],
    'tempo_too_fast': ['3:1 节奏挥杆 8 组', '收杆平衡停留 3 分钟'],
    'screen_quality': ['Screen Mode 重新取景 1 次', 'Screen Mode 降反光调整 1 次']
}


def build_report(issues: list[Issue]) -> tuple[str, str, list[str], list[str]]:
    if not issues:
        return (
            '深度分析完成。当前动作结构整体稳定，建议保持节奏、平衡和基础旋转训练。',
            'Deep analysis completed. Overall structure looks stable; keep refining tempo, balance, and rotational basics.',
            ['3:1 节奏挥杆 8 组', '收杆平衡保持 3 分钟'],
            ['Tempo 3:1 drill x8', 'Finish balance hold 3 min'],
        )

    zh = '深度分析完成。当前优先处理：' + '、'.join(i.titleZh for i in issues[:3]) + '。'
    en = 'Deep analysis completed. Priorities: ' + ', '.join(i.titleEn for i in issues[:3]) + '.'

    zh_plan: list[str] = []
    en_plan: list[str] = []
    for issue in issues[:2]:
        for drill in DRILL_MAP.get(issue.code, [])[:2]:
            if drill not in zh_plan:
                zh_plan.append(drill)
        for drill in DRILL_MAP.get(issue.code, [])[:2]:
            english = drill.replace('分钟', ' min').replace('组', ' reps')
            if english not in en_plan:
                en_plan.append(english)

    if not zh_plan:
        zh_plan = ['头部稳定 drill 5 分钟', '镜前慢动作 8 次', '下杆节奏训练 10 组']
        en_plan = ['Head stability drill 5 min', 'Mirror slow swings x8', 'Downswing tempo drill x10']

    return zh, en, zh_plan, en_plan
