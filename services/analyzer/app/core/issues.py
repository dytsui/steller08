from __future__ import annotations
from ..schemas import Issue


def detect_issues(head_sway: float, hip_turn: float, wrist_score: float, source_type: str, tempo_ratio: float | None = None) -> list[Issue]:
    issues: list[Issue] = []
    if head_sway > 22:
        issues.append(Issue(code='impact_loss_of_posture', severity='high', titleZh='击球失去姿态', titleEn='Loss of posture at impact', detailZh='击球区间头部和躯干漂移过大，常见于提前起身。', detailEn='Head and torso drift are too large through impact, often linked to early extension.'))
    elif head_sway > 16:
        issues.append(Issue(code='head_sway', severity='medium', titleZh='头部位移偏大', titleEn='Head sway too large', detailZh='击球区间头部漂移偏大。', detailEn='Head drift is too large near impact.'))

    if hip_turn < 24:
        issues.append(Issue(code='hip_turn', severity='high', titleZh='髋转不足', titleEn='Restricted hip turn', detailZh='上杆阶段髋转明显不足。', detailEn='Hip turn is significantly restricted at the top.'))
    elif hip_turn < 30:
        issues.append(Issue(code='top_over_swing', severity='medium', titleZh='顶点结构不稳', titleEn='Top structure unstable', detailZh='顶点结构不够稳定，建议缩短顶点长度并增强旋转控制。', detailEn='Top structure is unstable; shorten the top and improve rotational control.'))

    if wrist_score < 62:
        issues.append(Issue(code='downswing_over_the_top', severity='high', titleZh='下杆外下切', titleEn='Over-the-top downswing', detailZh='手部路径偏离较大，疑似下杆从外向内切入。', detailEn='Hand path deviates strongly, suggesting an over-the-top delivery.'))
    elif wrist_score < 72:
        issues.append(Issue(code='wrist_path', severity='medium', titleZh='手腕路径偏离', titleEn='Wrist path off-line', detailZh='手腕路径偏离参考走廊。', detailEn='Wrist path diverges from the target corridor.'))

    if tempo_ratio is not None and tempo_ratio < 2.7:
        issues.append(Issue(code='tempo_too_fast', severity='medium', titleZh='整体节奏偏快', titleEn='Tempo too fast', detailZh='上杆和下杆节奏偏快，建议先放慢上杆。', detailEn='Overall tempo is too fast; slow down the backswing first.'))

    if source_type.startswith('screen'):
        issues.append(Issue(code='screen_quality', severity='low', titleZh='屏拍质量提示', titleEn='Screen quality advisory', detailZh='建议让屏幕边缘完整入镜，减少反光。', detailEn='Keep the full display in frame and reduce glare.'))
    return issues
