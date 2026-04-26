import type { ResumeData } from '@/types';

export type AiEditableSection = 'summary' | 'workExperience' | 'projects';

export function normalizeAiTargetIndex(
  resumeData: ResumeData,
  section: string,
  index: number
): number {
  const list = section === 'workExperience'
    ? resumeData.workExperience
    : section === 'projects'
      ? resumeData.projects
      : [];

  if (!list.length) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), list.length - 1);
}

export function getResumeAiText(
  resumeData: ResumeData,
  section: string,
  targetIndex: number
): string {
  if (section === 'summary') return resumeData.summary || '';
  if (section === 'workExperience') {
    const index = normalizeAiTargetIndex(resumeData, section, targetIndex);
    return resumeData.workExperience[index]?.description || '';
  }
  if (section === 'projects') {
    const index = normalizeAiTargetIndex(resumeData, section, targetIndex);
    return resumeData.projects[index]?.description || '';
  }
  return '';
}

export function applyResumeAiText(
  resumeData: ResumeData,
  section: string,
  targetIndex: number,
  text: string
): ResumeData {
  if (section === 'summary') {
    return { ...resumeData, summary: text };
  }

  if (section === 'workExperience') {
    const workExperience = [...resumeData.workExperience];
    const index = normalizeAiTargetIndex(resumeData, section, targetIndex);
    workExperience[index] = {
      ...(workExperience[index] || { company: '', position: '', period: '', description: '' }),
      description: text,
    };
    return { ...resumeData, workExperience };
  }

  if (section === 'projects') {
    const projects = [...resumeData.projects];
    const index = normalizeAiTargetIndex(resumeData, section, targetIndex);
    projects[index] = {
      ...(projects[index] || { name: '', role: '', period: '', description: '' }),
      description: text,
    };
    return { ...resumeData, projects };
  }

  return resumeData;
}
