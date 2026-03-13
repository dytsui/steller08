from __future__ import annotations

RULEBOOK = [
    {"code": "head_sway", "severity": "medium", "titleZh": "头部位移偏大", "titleEn": "Head sway too large"},
    {"code": "hip_turn", "severity": "medium", "titleZh": "髋转不足", "titleEn": "Restricted hip turn"},
    {"code": "shoulder_turn", "severity": "medium", "titleZh": "肩转不足", "titleEn": "Shoulder turn too small"},
    {"code": "wrist_path", "severity": "low", "titleZh": "手腕路径偏离", "titleEn": "Wrist path off-line"},
    {"code": "early_extension", "severity": "medium", "titleZh": "提前起身风险", "titleEn": "Early extension risk"},
    {"code": "reverse_spine", "severity": "high", "titleZh": "反向脊柱角风险", "titleEn": "Reverse spine angle risk"},
    {"code": "tempo_fast", "severity": "low", "titleZh": "节奏过快", "titleEn": "Tempo too fast"},
    {"code": "tempo_slow", "severity": "low", "titleZh": "节奏过慢", "titleEn": "Tempo too slow"},
    {"code": "knee_lock", "severity": "low", "titleZh": "膝角偏直", "titleEn": "Knee too straight"},
    {"code": "elbow_fly", "severity": "medium", "titleZh": "肘部外飞", "titleEn": "Elbow flying"},
    {"code": "pelvis_slide", "severity": "medium", "titleZh": "髋部横移偏大", "titleEn": "Pelvis slide too large"},
    {"code": "address_posture", "severity": "low", "titleZh": "准备姿态不稳", "titleEn": "Address posture unstable"},
    {"code": "finish_balance", "severity": "low", "titleZh": "收杆平衡不足", "titleEn": "Finish balance weak"},
    {"code": "screen_quality", "severity": "low", "titleZh": "屏拍质量提示", "titleEn": "Screen quality advisory"},
    {"code": "screen_glare", "severity": "low", "titleZh": "屏幕反光", "titleEn": "Screen glare"},
    {"code": "screen_crop", "severity": "low", "titleZh": "屏幕取景不完整", "titleEn": "Screen crop incomplete"},
    {"code": "head_drop", "severity": "low", "titleZh": "头部下沉", "titleEn": "Head drop"},
    {"code": "casting", "severity": "medium", "titleZh": "提前释放", "titleEn": "Casting"},
    {"code": "flat_shoulder", "severity": "low", "titleZh": "肩线过平", "titleEn": "Shoulder plane too flat"},
    {"code": "over_swing", "severity": "low", "titleZh": "上杆过长", "titleEn": "Overswing"},
]

DRILLS = {
    "head_sway": ["头部稳定 drill 5 分钟", "靠墙头部基准练习 8 次"],
    "hip_turn": ["髋转分离练习 10 组", "上杆髋转镜前练习 8 次"],
    "wrist_path": ["手腕走廊练习 12 次", "半挥杆路径控制 10 次"],
    "screen_quality": ["提高屏幕完整入镜率", "降低环境反光"],
}
