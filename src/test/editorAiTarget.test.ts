import { describe, expect, it } from 'vitest';
import { applyResumeAiText, getResumeAiText, normalizeAiTargetIndex } from '@/utils/editorAiTarget';
import type { ResumeData } from '@/types';

const resumeData: ResumeData = {
  personal: { name: '张三', phone: '13800138000', email: 'zhangsan@example.com' },
  intention: { position: '前端工程师', city: '北京', salary: '20K', availableTime: '随时' },
  education: [],
  workExperience: [
    { company: 'A 公司', position: '前端', period: '2021', description: '第一段工作经历' },
    { company: 'B 公司', position: '前端', period: '2022', description: '第二段工作经历' },
    { company: 'C 公司', position: '前端', period: '2023', description: '第三段工作经历' },
  ],
  projects: [
    { name: '项目一', role: '开发', period: '2021', description: '第一个项目描述' },
    { name: '项目二', role: '开发', period: '2022', description: '第二个项目描述' },
    { name: '项目三', role: '开发', period: '2023', description: '第三个项目描述' },
  ],
  skills: [],
  summary: '原始自我评价',
};

describe('editor AI target helpers', () => {
  it('reads the focused work experience item instead of always reading the first item', () => {
    expect(getResumeAiText(resumeData, 'workExperience', 1)).toBe('第二段工作经历');
    expect(getResumeAiText(resumeData, 'workExperience', 2)).toBe('第三段工作经历');
  });

  it('updates only the focused project item and keeps other project descriptions unchanged', () => {
    const next = applyResumeAiText(resumeData, 'projects', 2, 'AI 优化后的第三个项目');

    expect(next.projects[0].description).toBe('第一个项目描述');
    expect(next.projects[1].description).toBe('第二个项目描述');
    expect(next.projects[2].description).toBe('AI 优化后的第三个项目');
  });

  it('updates only the focused work experience item and keeps the first item unchanged', () => {
    const next = applyResumeAiText(resumeData, 'workExperience', 1, 'AI 优化后的第二段工作经历');

    expect(next.workExperience[0].description).toBe('第一段工作经历');
    expect(next.workExperience[1].description).toBe('AI 优化后的第二段工作经历');
    expect(next.workExperience[2].description).toBe('第三段工作经历');
  });

  it('clamps an out-of-range AI target index to an existing item', () => {
    expect(normalizeAiTargetIndex(resumeData, 'workExperience', 99)).toBe(2);
    expect(normalizeAiTargetIndex(resumeData, 'projects', -1)).toBe(0);
  });
});
