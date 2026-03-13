export type DrillCatalogItem = {
  code: string;
  title: string;
  targetIssueCodes: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  summary: string;
  steps: string[];
  cautions: string[];
};

export const DRILL_CATALOG: Record<string, DrillCatalogItem> = {
  drill_balance_setup_hold: {
    code: 'drill_balance_setup_hold',
    title: '站位平衡停留',
    targetIssueCodes: ['head_sway', 'tracking_confidence_low', 'finish_off_balance'],
    difficulty: 'beginner',
    durationMinutes: 6,
    summary: '通过站位停留和慢速启动，让重心与头位先稳定下来。',
    steps: ['进入击球准备姿势后停 5 秒', '保持脚底压力均衡', '做 5 次小幅起杆后回位', '再进入正式挥杆'],
    cautions: ['不要耸肩', '不要故意把重心压到脚跟']
  },
  drill_chair_hip_depth: {
    code: 'drill_chair_hip_depth',
    title: '椅子保持髋深',
    targetIssueCodes: ['head_sway', 'downswing_early_extension', 'impact_loss_of_posture'],
    difficulty: 'beginner',
    durationMinutes: 10,
    summary: '借助身后椅背，帮助保持髋部深度，减少提前起身。',
    steps: ['站位时臀部轻触椅背', '上杆维持骨盆后侧空间', '下杆至击球前保持臀部不要前顶', '收杆后再自然离开椅背'],
    cautions: ['不要故意蹲太低', '不要把重心压到脚跟外侧']
  },
  drill_shoulder_turn_cross_arm: {
    code: 'drill_shoulder_turn_cross_arm',
    title: '抱胸转肩练习',
    targetIssueCodes: ['hip_turn'],
    difficulty: 'beginner',
    durationMinutes: 6,
    summary: '不带球杆先建立更完整的躯干旋转，再带回挥杆。',
    steps: ['双臂交叉抱胸', '站位后缓慢转肩到顶点', '感受肩与髋协调转动', '重复 10 次后再拿杆练习'],
    cautions: ['不要耸肩', '不要只扭腰不转髋']
  },
  drill_step_through_sequence: {
    code: 'drill_step_through_sequence',
    title: '踏步顺序练习',
    targetIssueCodes: ['hip_turn', 'finish_off_balance'],
    difficulty: 'beginner',
    durationMinutes: 8,
    summary: '用踏步建立更清晰的重心转移与收杆旋转。',
    steps: ['做半挥杆', '下杆时前脚轻踏步', '感受重心自然转移到前脚', '完成后保持收杆平衡'],
    cautions: ['动作不要过快', '先小幅度再加大']
  },
  drill_pause_transition: {
    code: 'drill_pause_transition',
    title: '停顿转换练习',
    targetIssueCodes: ['wrist_path', 'downswing_over_the_top', 'tempo_too_fast'],
    difficulty: 'beginner',
    durationMinutes: 8,
    summary: '在上杆顶点短暂停顿，再让下半身先启动，重建下杆顺序。',
    steps: ['上杆到顶点后停 1 秒', '下半身轻微启动', '手臂自然下落', '用半挥杆完成动作'],
    cautions: ['不要停顿后直接用肩膀外拉', '不要追求速度']
  },
  drill_split_hand_drop: {
    code: 'drill_split_hand_drop',
    title: '分手下落练习',
    targetIssueCodes: ['wrist_path', 'downswing_over_the_top'],
    difficulty: 'intermediate',
    durationMinutes: 8,
    summary: '通过双手分开握杆，更容易感受手臂从身体内侧自然下落。',
    steps: ['上下手分开约一掌距离', '慢速上杆到顶点', '转换时感受杆头浅化', '做 8 到 10 次慢速练习'],
    cautions: ['动作以感受为主', '不要用力甩杆']
  },
  drill_one_piece_takeaway: {
    code: 'drill_one_piece_takeaway',
    title: '一体式起杆',
    targetIssueCodes: ['takeaway_inside', 'takeaway_outside'],
    difficulty: 'beginner',
    durationMinutes: 8,
    summary: '减少手部单独带杆，让胸口与杆身更同步。',
    steps: ['起杆前段让胸口和杆身一起移动', '保持杆头在目标线附近', '做 10 次短挥幅练习', '再接完整上杆'],
    cautions: ['不要只用手提杆', '不要急着抬手臂']
  },
  drill_takeaway_gate: {
    code: 'drill_takeaway_gate',
    title: '起杆门框练习',
    targetIssueCodes: ['takeaway_inside', 'takeaway_outside'],
    difficulty: 'intermediate',
    durationMinutes: 10,
    summary: '通过门框或两侧标志物，让起杆路径留在合理走廊。',
    steps: ['在球后摆两个小标志物', '起杆时杆头从中间通过', '保持慢速 8 到 12 次', '逐步增加挥幅'],
    cautions: ['先慢后快', '门框不要设得过窄']
  },
  drill_top_pause_check: {
    code: 'drill_top_pause_check',
    title: '顶点停顿检查',
    targetIssueCodes: ['top_over_swing'],
    difficulty: 'beginner',
    durationMinutes: 8,
    summary: '固定上杆顶点长度，减少继续拉长的习惯。',
    steps: ['上杆到顶点时停顿 1 秒', '确认手臂与肩转结构', '缓慢下杆完成动作', '连续做 8 次'],
    cautions: ['不要僵硬锁死', '感受“到位就停”']
  },
  drill_half_swing_top_structure: {
    code: 'drill_half_swing_top_structure',
    title: '半挥杆顶点结构',
    targetIssueCodes: ['top_over_swing'],
    difficulty: 'intermediate',
    durationMinutes: 10,
    summary: '先用半挥杆重建结构，再过渡到完整挥杆。',
    steps: ['做半挥杆到稳定顶点', '停顿确认结构', '慢速通过击球', '完成 10 次后再加挥幅'],
    cautions: ['不要急着做全挥杆', '保持节奏匀速']
  },
  drill_shallow_delivery_rehearsal: {
    code: 'drill_shallow_delivery_rehearsal',
    title: '浅化下杆预演',
    targetIssueCodes: ['downswing_over_the_top'],
    difficulty: 'advanced',
    durationMinutes: 10,
    summary: '通过慢速预演，感受杆身在转换时稍微浅化。',
    steps: ['上杆到顶点', '轻微启动下半身', '让手臂从内侧下落', '保持胸口不要外拉'],
    cautions: ['不要故意把杆甩到身后', '以浅化感受为主']
  },
  drill_wall_glute_touch: {
    code: 'drill_wall_glute_touch',
    title: '臀部贴墙练习',
    targetIssueCodes: ['downswing_early_extension', 'impact_loss_of_posture'],
    difficulty: 'beginner',
    durationMinutes: 10,
    summary: '通过身后墙面维持骨盆空间，减少下杆前顶。',
    steps: ['站位时臀部轻触墙面', '上杆保持臀部空间', '下杆至击球继续感受臀部不要离墙太快', '收杆后再自然离开'],
    cautions: ['不要用力顶墙', '避免重心后坐过多']
  },
  drill_impact_bag_press: {
    code: 'drill_impact_bag_press',
    title: '击球袋压迫练习',
    targetIssueCodes: ['impact_flip_release'],
    difficulty: 'intermediate',
    durationMinutes: 8,
    summary: '建立更稳定的击球位与杆把领先感。',
    steps: ['准备击球袋或软垫', '做半挥杆到击球位', '感受杆把略领先', '每次停留 2 秒'],
    cautions: ['不要猛砸', '重视姿态与压力方向']
  },
  drill_handle_forward_checkpoint: {
    code: 'drill_handle_forward_checkpoint',
    title: '杆把前置检查点',
    targetIssueCodes: ['impact_flip_release'],
    difficulty: 'intermediate',
    durationMinutes: 8,
    summary: '在击球前建立更稳定的杆把位置和手腕结构。',
    steps: ['做慢速挥杆到击球位', '检查杆把是否略在球前', '保持胸口和髋部继续转动', '重复 8 到 12 次'],
    cautions: ['不要硬压手腕', '保持旋转带动']
  },
  drill_finish_hold_balance: {
    code: 'drill_finish_hold_balance',
    title: '收杆平衡停留',
    targetIssueCodes: ['finish_off_balance', 'tempo_too_fast'],
    difficulty: 'beginner',
    durationMinutes: 6,
    summary: '每次挥杆后停 2 秒，建立更完整的完成动作。',
    steps: ['完成挥杆后停 2 秒', '检查重心是否在前脚', '检查身体是否完整转向目标', '连续做 10 次'],
    cautions: ['先慢速进行', '不要为了停住而僵住']
  },
  drill_full_rotation_finish: {
    code: 'drill_full_rotation_finish',
    title: '完整转体收杆',
    targetIssueCodes: ['finish_off_balance'],
    difficulty: 'beginner',
    durationMinutes: 8,
    summary: '通过完整转体与停留，让收杆更稳定。',
    steps: ['做中等幅度挥杆', '重心转到前脚', '胸口与扣带转向目标', '收杆停住'],
    cautions: ['不要急着看球', '不要收杆过低']
  },
  drill_screen_mode_reframe: {
    code: 'drill_screen_mode_reframe',
    title: 'Screen Mode 重新取景',
    targetIssueCodes: ['screen_quality', 'tracking_confidence_low'],
    difficulty: 'beginner',
    durationMinutes: 5,
    summary: '调整拍摄角度、距离与边框完整性，让屏拍视频更适合识别。',
    steps: ['完整拍入屏幕四边', '尽量居中对准屏幕', '避免斜角过大', '重新录制 1 条测试样本'],
    cautions: ['不要切掉边框', '不要边拍边走动']
  },
  drill_screen_mode_reduce_glare: {
    code: 'drill_screen_mode_reduce_glare',
    title: 'Screen Mode 降反光',
    targetIssueCodes: ['screen_quality'],
    difficulty: 'beginner',
    durationMinutes: 5,
    summary: '通过降低环境反光和曝光过亮，让人物轮廓更清楚。',
    steps: ['避开直射灯', '降低屏幕亮度一点点', '不要正对强光拍摄', '再做 1 条测试录制'],
    cautions: ['不要让画面过暗', '不要牺牲屏幕边缘完整性']
  }
};

export function getDrillCatalogItem(code: string): DrillCatalogItem | null {
  return DRILL_CATALOG[code] ?? null;
}
