import { describe, it, expect } from 'vitest';
import { templateRegistry } from '@/templates';

describe('模板过滤', () => {
  it('应该能按免费/VIP筛选模板', () => {
    const free = templateRegistry.filter((t) => !t.isPremium);
    const premium = templateRegistry.filter((t) => t.isPremium);
    // 8 base templates: 6 free + 2 premium; 29 collection templates all free
    expect(free.length).toBe(35);
    expect(premium.length).toBe(2);
  });

  it('应该能按标签搜索模板', () => {
    const result = templateRegistry.filter((t) =>
      t.tags.some((tag) => tag.includes('商务'))
    );
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('基础模板至少包含3个主题', () => {
    const baseTemplates = templateRegistry.filter((t) => !t.id.startsWith('cn-'));
    baseTemplates.forEach((t) => {
      expect(t.themes.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('收藏模板至少包含1个主题', () => {
    const collectionTemplates = templateRegistry.filter((t) => t.id.startsWith('cn-'));
    collectionTemplates.forEach((t) => {
      expect(t.themes.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('风格筛选应该包含时间线模板', () => {
    const timelineTemplates = templateRegistry.filter((t) =>
      t.tags.includes('时间线') || t.tags.includes('时间轴') || t.category === 'timeline'
    );
    expect(timelineTemplates.length).toBeGreaterThanOrEqual(3);
    expect(timelineTemplates.some((t) => t.id === 'timeline')).toBe(true);
  });
});
