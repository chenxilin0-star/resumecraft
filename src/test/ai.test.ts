import { describe, expect, it } from 'vitest';
import { buildResumeAiPrompt, normalizeAiAction } from '@/utils/ai';

describe('AI resume helpers', () => {
  it('normalizes supported AI actions', () => {
    expect(normalizeAiAction('polish')).toBe('polish');
    expect(normalizeAiAction('expand')).toBe('expand');
    expect(normalizeAiAction('unknown')).toBe('polish');
  });

  it('builds a Chinese resume prompt with section and target role context', () => {
    const prompt = buildResumeAiPrompt({
      action: 'polish',
      section: 'workExperience',
      text: '负责前端页面开发',
      targetRole: '前端工程师',
    });

    expect(prompt).toContain('简历优化专家');
    expect(prompt).toContain('工作经历');
    expect(prompt).toContain('前端工程师');
    expect(prompt).toContain('负责前端页面开发');
    expect(prompt).toContain('只返回优化后的正文');
  });
});
