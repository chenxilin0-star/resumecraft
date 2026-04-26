import { describe, expect, it } from 'vitest';
import { AUTO_SAVE_INTERVAL_MS, buildAutoSaveSnapshot, normalizeResumeContentForSave, shouldRunAutoSave } from '../utils/autoSave';
import type { ResumeData } from '../types';

const baseResumeData: ResumeData = {
  personal: { name: '张三', phone: '13800138000', email: 'zhangsan@example.com' },
  education: [],
  workExperience: [],
  projects: [],
  skills: [],
};

describe('editor cloud auto-save policy', () => {
  it('runs every 30 seconds', () => {
    expect(AUTO_SAVE_INTERVAL_MS).toBe(30_000);
  });

  it('saves only when user is authenticated, editor is loaded, not currently saving, and content changed', () => {
    expect(shouldRunAutoSave({
      isAuthenticated: true,
      isLoading: false,
      isSaving: false,
      currentSnapshot: 'changed',
      lastSavedSnapshot: 'old',
    })).toBe(true);

    expect(shouldRunAutoSave({
      isAuthenticated: true,
      isLoading: false,
      isSaving: false,
      currentSnapshot: 'same',
      lastSavedSnapshot: 'same',
    })).toBe(false);

    expect(shouldRunAutoSave({
      isAuthenticated: false,
      isLoading: false,
      isSaving: false,
      currentSnapshot: 'changed',
      lastSavedSnapshot: 'old',
    })).toBe(false);
  });

  it('normalizes saved content with the current template slug', () => {
    expect(normalizeResumeContentForSave(baseResumeData, 'minimal-classic')).toMatchObject({
      templateId: 'minimal-classic',
      personal: { name: '张三' },
    });
  });

  it('uses a stable snapshot that changes when title or resume data changes', () => {
    const first = buildAutoSaveSnapshot({
      title: '简历 A',
      templateId: 'minimal-classic',
      activeThemeId: 'default',
      visibleSections: ['personal'],
      resumeData: baseResumeData,
    });
    const same = buildAutoSaveSnapshot({
      title: '简历 A',
      templateId: 'minimal-classic',
      activeThemeId: 'default',
      visibleSections: ['personal'],
      resumeData: baseResumeData,
    });
    const changed = buildAutoSaveSnapshot({
      title: '简历 B',
      templateId: 'minimal-classic',
      activeThemeId: 'default',
      visibleSections: ['personal'],
      resumeData: baseResumeData,
    });

    expect(first).toBe(same);
    expect(first).not.toBe(changed);
  });
});
