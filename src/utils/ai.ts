export type AiAction = 'polish' | 'expand' | 'shorten' | 'professional';

const ACTIONS: AiAction[] = ['polish', 'expand', 'shorten', 'professional'];

const sectionNameMap: Record<string, string> = {
  personal: '个人信息',
  intention: '求职意向',
  education: '教育经历',
  workExperience: '工作经历',
  projects: '项目经历',
  skills: '技能特长',
  certificates: '证书奖项',
  summary: '自我评价',
  languages: '语言能力',
};

const actionInstructionMap: Record<AiAction, string> = {
  polish:
    '润色表达，让语言更精炼、更有冲击力，同时保持事实不变。每句话尽量包含「做了什么」+「怎么做的」+「取得了什么结果」。',
  expand:
    '基于原文合理扩写，补充具体做法、技术细节或业务价值。用 STAR 或 PAR 结构（背景-行动-结果）组织内容，突出可量化成果。严禁编造未提及的数据。',
  shorten:
    '压缩为最精炼的简历 bullet points，保留核心成果、关键技术和影响力。每点不超过 25 字，适合排版紧凑的简历。',
  professional:
    '改写为资深 HR 偏好的职业化表达：强动词开头、数据驱动、结果导向、去口语化。避免"负责日常""参与一些"等弱表达。',
};

export function normalizeAiAction(action: string): AiAction {
  return ACTIONS.includes(action as AiAction) ? (action as AiAction) : 'polish';
}

export interface BuildResumeAiPromptInput {
  action: string;
  section: string;
  text: string;
  targetRole?: string;
}

export function getSectionDisplayName(section: string): string {
  return sectionNameMap[section] || section;
}

function getSectionRules(section: string): string {
  switch (section) {
    case 'workExperience':
      return [
        '- 用强动词开头：主导、推动、搭建、优化、落地、统筹、设计、重构、深耕、从0到1等。',
        '- 按「职责范围 → 关键行动 → 量化结果」展开，避免流水账。',
        '- 优先写对目标岗位最有价值的经历，弱化不相关的内容。',
        '- 量化公式：指标 + 幅度 + 影响。如"通过 XX 将转化率从 3% 提升到 5.2%，带动 GMV 增长 300 万"。',
        '- 技术岗：写清技术栈、架构设计、性能指标、稳定性数据。',
        '- 不要出现"协助""帮忙""学习"等弱化个人贡献的词。',
      ].join('\n');
    case 'projects':
      return [
        '- 项目 = 业务/技术背景 + 你的角色 + 核心方案 + 关键指标。',
        '- 突出「你在其中的不可替代性」，而不是团队整体做了什么。',
        '- 技术项目：写明选型理由、架构难点、性能数据、上线效果。',
        '- 产品/运营项目：写明用户量、转化率、ROI、DAU 等业务数据。',
        '- 避免"参与了某项目"这类无信息量的表达。',
      ].join('\n');
    case 'summary':
      return [
        '- 自我评价不是自我表扬，而是「能力标签 + 核心经验 + 差异化优势」。',
        '- 控制在 80-120 字，3-4 句话。',
        '- 第一句：身份标签 + 年限。如"5 年后端开发经验，专注高并发系统架构"。',
        '- 第二句：核心能力与亮点。如"主导过日活千万级产品的服务稳定性建设"。',
        '- 第三句：软技能或职业特质。如"擅长跨部门协作与技术方案落地"。',
        '- 不要写"性格开朗、吃苦耐劳、学习能力强"等主观空泛描述。',
      ].join('\n');
    default:
      return [
        '- 表达专业、简洁、有信息密度。',
        '- 去口语化，避免"我觉得""我们认为"等主观表述。',
      ].join('\n');
  }
}

export function buildResumeAiPrompt({ action, section, text, targetRole }: BuildResumeAiPromptInput): string {
  const normalizedAction = normalizeAiAction(action);
  const sectionName = getSectionDisplayName(section);
  const role = targetRole?.trim() || '未指定岗位';

  return [
    `你是一名拥有 10 年经验的中文简历优化专家，曾为头部互联网公司筛选过数万份简历。你的任务是将普通描述改写为专业级简历内容。`,
    '',
    `## 当前模块：${sectionName}`,
    `## 目标岗位：${role}`,
    `## 优化指令：${actionInstructionMap[normalizedAction]}`,
    '',
    '## 该模块的写作规则',
    getSectionRules(section),
    '',
    '## 通用输出规则',
    '1. 只返回优化后的正文，不要任何解释、前缀、后缀、Markdown 标题。',
    '2. 严禁编造学校、公司、岗位、证书、数据等事实。如果原文没有量化数据，不要硬编数字，可用「显著提升」「大幅降低」等资量表达替代。',
    '3. 中文表达自然、专业，不要出现 AI 腐蚀式语言。',
    '4. 若原文为多条目，保持分点列表形式（每条以换行分隔）。',
    '5. 尽量针对目标岗位突出相关关键词和能力。',
    '',
    '---',
    `请优化以下内容：`,
    text.trim(),
  ].join('\n');
}
