import { describe, expect, it } from 'vitest';
import { getCollectionThemeStyle, getCollectionThemeDataAttributes } from '@/utils/collectionTheme';
import { templateRegistry } from '@/templates';

describe('collection 模板主题覆盖', () => {
  it('为 collection 模板输出 CSS 变量而不是整页滤镜', () => {
    const template = templateRegistry.find((t) => t.id.startsWith('cn-'))!;
    const theme = template.themes.find((t) => t.id === 'green') || template.themes[1];

    const style = getCollectionThemeStyle(template.id, theme) as Record<string, string>;

    expect(style['--resume-primary']).toBe(theme.colors.primary);
    expect(style['--resume-secondary']).toBe(theme.colors.secondary);
    expect(style['--resume-accent']).toBe(theme.colors.accent);
    expect(style.filter).toBeUndefined();
  });

  it('只给 collection 模板打主题覆盖标记', () => {
    const collection = templateRegistry.find((t) => t.id.startsWith('cn-'))!;
    const base = templateRegistry.find((t) => !t.id.startsWith('cn-'))!;

    expect(getCollectionThemeDataAttributes(collection.id)).toEqual({ 'data-collection-theme': 'true' });
    expect(getCollectionThemeDataAttributes(base.id)).toEqual({});
  });
});
