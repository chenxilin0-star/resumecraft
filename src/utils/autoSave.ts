import type { ResumeData } from '@/types';

export const AUTO_SAVE_INTERVAL_MS = 30_000;

export type ResumeContentForSave = ResumeData & { templateId: string };

interface ShouldRunAutoSaveInput {
  isAuthenticated: boolean;
  isLoading: boolean;
  isSaving: boolean;
  currentSnapshot: string;
  lastSavedSnapshot: string;
}

interface AutoSaveSnapshotInput {
  title: string;
  templateId: string;
  activeThemeId?: string;
  visibleSections: string[];
  resumeData: ResumeData;
}

export function normalizeResumeContentForSave(resumeData: ResumeData, templateId: string): ResumeContentForSave {
  return {
    ...resumeData,
    templateId: (resumeData as ResumeData & { templateId?: string }).templateId || templateId,
  };
}

export function buildAutoSaveSnapshot(input: AutoSaveSnapshotInput): string {
  return JSON.stringify({
    title: input.title,
    templateId: input.templateId,
    activeThemeId: input.activeThemeId || '',
    visibleSections: input.visibleSections,
    resumeData: normalizeResumeContentForSave(input.resumeData, input.templateId),
  });
}

export function shouldRunAutoSave(input: ShouldRunAutoSaveInput): boolean {
  if (!input.isAuthenticated) return false;
  if (input.isLoading) return false;
  if (input.isSaving) return false;
  return input.currentSnapshot !== input.lastSavedSnapshot;
}
