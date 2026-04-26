import type { CSSProperties } from 'react';
import type { TemplateTheme } from '@/types';

export function isCollectionTemplate(templateId: string | undefined): boolean {
  return Boolean(templateId?.startsWith('cn-'));
}

export function getCollectionThemeStyle(
  templateId: string | undefined,
  theme: TemplateTheme | undefined,
  extraStyle: CSSProperties = {}
): CSSProperties | undefined {
  if (!isCollectionTemplate(templateId) || !theme) return Object.keys(extraStyle).length ? extraStyle : undefined;
  return {
    ...extraStyle,
    '--resume-primary': theme.colors.primary,
    '--resume-secondary': theme.colors.secondary,
    '--resume-accent': theme.colors.accent,
    '--resume-surface': theme.colors.surface,
    '--resume-border': theme.colors.border,
    '--resume-text': theme.colors.text,
    '--resume-muted': theme.colors.textMuted,
  } as CSSProperties;
}

export function getCollectionThemeDataAttributes(templateId: string | undefined): { 'data-collection-theme'?: 'true' } {
  return isCollectionTemplate(templateId) ? { 'data-collection-theme': 'true' } : {};
}

export function getCollectionThemeName(templateId: string | undefined, theme: TemplateTheme | undefined): string | undefined {
  if (!isCollectionTemplate(templateId) || !theme) return undefined;
  return theme.id;
}
