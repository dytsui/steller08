export type IssueCatalogItem = {
  code: string;
  nameZh: string;
  nameEn: string;
  phase: 'address' | 'takeaway' | 'top' | 'downswing' | 'impact' | 'finish' | 'global';
  severityDefault: 'low' | 'medium' | 'high';
  shortTip: string;
  why: string;
  fix: string;
  drillCodes: string[];
};

export const ISSUE_CATALOG: Record<string, IssueCatalogItem> = {
  head_sway: {
    code: 'head_sway',
    nameZh: '头部位移偏大',
    nameEn: 'Head sway too large',
    phase: 'impact',
    severityDefault: 'medium',
    shortTip: '击球区保持头部稳定，不要提前追球。',
    why: '下杆后半段头部明显前移或后撤，会让低点和杆面控制变差。',
    fix: '保持胸椎前倾与头位稳定，让身体旋转带动通过击球，而不是头部先动。',
    drillCodes: ['drill_balance_setup_hold', 'drill_chair_hip_depth']
  },
  hip_turn: {
    code: 'hip_turn',
    nameZh: '髋转不足',
    nameEn: 'Restricted hip turn',
    phase: 'top',
    severityDefault: 'medium',
    shortTip: '上杆到顶点时，允许髋部自然转动，不要锁死。',
    why: '髋转不足会限制蓄力，导致后续下杆只能用手臂补偿。',
    fix: '先建立更好的站位平衡，再让上杆过程中的髋部跟随肩部自然转开。',
    drillCodes: ['drill_shoulder_turn_cross_arm', 'drill_step_through_sequence']
  },
  wrist_path: {
    code: 'wrist_path',
    nameZh: '手腕路径偏离',
    nameEn: 'Wrist path off-line',
    phase: 'downswing',
    severityDefault: 'low',
    shortTip: '让手臂从身体内侧自然下落，不要外拉。',
    why: '手腕路径偏离通常意味着上杆宽度或转换顺序不够稳定。',
    fix: '先用半挥杆和停顿转换，建立更稳定的手部走廊。',
    drillCodes: ['drill_pause_transition', 'drill_split_hand_drop']
  },
  screen_quality: {
    code: 'screen_quality',
    nameZh: '屏拍质量提示',
    nameEn: 'Screen capture advisory',
    phase: 'global',
    severityDefault: 'low',
    shortTip: '完整拍入屏幕边缘，并尽量减少反光。',
    why: '屏拍视频容易出现透视变形、亮斑和边缘裁切，影响关键点稳定性。',
    fix: '让屏幕四边完整入镜，稍微降低曝光，并避免斜侧角度拍摄。',
    drillCodes: ['drill_screen_mode_reframe', 'drill_screen_mode_reduce_glare']
  },
  takeaway_inside: {
    code: 'takeaway_inside',
    nameZh: '起杆过度内收',
    nameEn: 'Takeaway too far inside',
    phase: 'takeaway',
    severityDefault: 'medium',
    shortTip: '起杆前段先维持胸口与杆身一起带动。',
    why: '起杆过早拉向身体内侧，容易让后续顶点与下杆路径都变得被动。',
    fix: '用一体式起杆和门框练习，让杆头前段更稳定地沿目标线移动。',
    drillCodes: ['drill_one_piece_takeaway', 'drill_takeaway_gate']
  },
  takeaway_outside: {
    code: 'takeaway_outside',
    nameZh: '起杆过度外带',
    nameEn: 'Takeaway too far outside',
    phase: 'takeaway',
    severityDefault: 'medium',
    shortTip: '起杆前段别急着抬手，让身体先转动。',
    why: '起杆外带会让顶点偏陡，下杆更容易外下切。',
    fix: '先用短距离挥杆建立杆头走廊，再逐渐增加挥幅。',
    drillCodes: ['drill_one_piece_takeaway', 'drill_takeaway_gate']
  },
  top_over_swing: {
    code: 'top_over_swing',
    nameZh: '顶点过长',
    nameEn: 'Overswing at the top',
    phase: 'top',
    severityDefault: 'high',
    shortTip: '顶点到位就停，不要为了“更远”继续拉长。',
    why: '顶点过长会破坏结构，让下杆需要额外补偿。',
    fix: '做顶点停顿和半挥杆结构练习，把顶点长度固定下来。',
    drillCodes: ['drill_top_pause_check', 'drill_half_swing_top_structure']
  },
  downswing_over_the_top: {
    code: 'downswing_over_the_top',
    nameZh: '下杆外下切',
    nameEn: 'Over-the-top downswing',
    phase: 'downswing',
    severityDefault: 'high',
    shortTip: '转换时先让下半身带动，再让手臂自然下落。',
    why: '肩膀过早抢下杆，会把杆路拉到身体外侧。',
    fix: '通过停顿转换和分手下落练习，让杆从更浅的路径进入击球区。',
    drillCodes: ['drill_pause_transition', 'drill_split_hand_drop', 'drill_shallow_delivery_rehearsal']
  },
  downswing_early_extension: {
    code: 'downswing_early_extension',
    nameZh: '下杆提前起身',
    nameEn: 'Early extension',
    phase: 'downswing',
    severityDefault: 'high',
    shortTip: '下杆到击球时保持髋部后侧空间。',
    why: '骨盆提前前顶会让手臂通道变窄，常伴随薄击或拉左。',
    fix: '用椅子或墙面辅助，维持髋深并保持身体前倾到通过击球。',
    drillCodes: ['drill_chair_hip_depth', 'drill_wall_glute_touch']
  },
  impact_flip_release: {
    code: 'impact_flip_release',
    nameZh: '击球翻腕释放',
    nameEn: 'Flippy release through impact',
    phase: 'impact',
    severityDefault: 'medium',
    shortTip: '击球时感觉杆把略领先，不要靠手腕急甩。',
    why: '翻腕释放会让低点与杆面更不稳定。',
    fix: '先用击球袋和杆把前置检查点建立更稳定的通过击球姿态。',
    drillCodes: ['drill_impact_bag_press', 'drill_handle_forward_checkpoint']
  },
  impact_loss_of_posture: {
    code: 'impact_loss_of_posture',
    nameZh: '击球失去姿态',
    nameEn: 'Loss of posture at impact',
    phase: 'impact',
    severityDefault: 'high',
    shortTip: '保持胸椎前倾到通过击球，再自然抬起。',
    why: '击球前提前直立，会破坏击球点和力量传递。',
    fix: '保持髋部深度和上身角度，让旋转完成动作，而不是提前站起。',
    drillCodes: ['drill_chair_hip_depth', 'drill_wall_glute_touch']
  },
  finish_off_balance: {
    code: 'finish_off_balance',
    nameZh: '收杆平衡不足',
    nameEn: 'Finish out of balance',
    phase: 'finish',
    severityDefault: 'medium',
    shortTip: '收杆后停 2 秒，检查重心是否稳定落在前脚。',
    why: '收杆失衡通常意味着节奏、转移或旋转链条有中断。',
    fix: '先做短挥幅，再逐步增加速度，同时保持收杆停留。',
    drillCodes: ['drill_finish_hold_balance', 'drill_full_rotation_finish']
  },
  tempo_too_fast: {
    code: 'tempo_too_fast',
    nameZh: '整体节奏过快',
    nameEn: 'Overall tempo too fast',
    phase: 'global',
    severityDefault: 'medium',
    shortTip: '上杆慢一点，下杆保持干脆。',
    why: '整体节奏太快时，动作阶段更容易塌陷和抢节奏。',
    fix: '用 3:1 节奏口令做慢速挥杆，再逐步恢复正常速度。',
    drillCodes: ['drill_pause_transition', 'drill_finish_hold_balance']
  },
  tracking_confidence_low: {
    code: 'tracking_confidence_low',
    nameZh: '追踪置信度偏低',
    nameEn: 'Tracking confidence low',
    phase: 'global',
    severityDefault: 'low',
    shortTip: '保证光线稳定，并完整拍到头部与脚部。',
    why: '骨架追踪点过少时，轻分析和深分析的稳定性都会下降。',
    fix: '重新取景，增加人物完整度，避免反光、遮挡和强逆光。',
    drillCodes: ['drill_screen_mode_reframe', 'drill_balance_setup_hold']
  }
};

export function getIssueCatalogItem(code: string): IssueCatalogItem | null {
  return ISSUE_CATALOG[code] ?? null;
}
