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
  polish: '在不改变事实的前提下润色表达，让内容更清晰、更有结果导向、更适合写入简历。',
  expand: '基于原文扩写为更完整的简历表述，突出动作、方法、结果和价值。',
  shorten: '压缩为更精炼的简历表述，保留核心成果和关键词。',
  professional: '改写为更专业、更职业化、更符合 HR 阅读习惯的表达。',
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

export function buildResumeAiPrompt({ action, section, text, targetRole }: BuildResumeAiPromptInput): string {
  const normalizedAction = normalizeAiAction(action);
  const sectionName = getSectionDisplayName(section);
  const role = targetRole?.trim() || '未指定岗位';

  return [
    '你是一名中文简历优化专家，擅长把普通经历改写成专业、有重点、结果导向的简历内容。',
    `当前模块：${sectionName}`,
    `目标岗位：${role}`,
    `任务要求：${actionInstructionMap[normalizedAction]}`,
    '输出要求：',
    '1. 只返回优化后的正文，不要解释过程，不要使用 Markdown 标题。',
    '2. 不要编造学校、公司、岗位、数字结果、证书等事实；如果原文没有量化结果，可以用更稳妥的非量化表达。',
    '3. 中文表达要自然、专业，适合直接复制到简历。',
    '4. 如果是工作/项目经历，优先使用“负责/主导/参与 + 做法 + 结果/价值”的结构。',
    '',
    '原文：',
    text.trim(),
  ].join('\n');
}
