import { describe, it, expect } from 'vitest';
import { templateRegistry } from '@/templates';

describe('模板过滤', () => {
  it('应该能按免费/VIP筛选模板', () => {
    const free = templateRegistry.filter((t) => !t.isPremium);
    const premium = templateRegistry.filter((t) => t.isPremium);
    expect(free.length).toBe(6);
    expect(premium.length).toBe(2);
  });

  it('应该能按标签搜索模板', () => {
    const result = templateRegistry.filter((t) =>
      t.tags.some((tag) => tag.includes('商务'))
    );
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('每套模板至少包含3个主题', () => {
    templateRegistry.forEach((t) => {
      expect(t.themes.length).toBeGreaterThanOrEqual(3);
    });
  });
});
