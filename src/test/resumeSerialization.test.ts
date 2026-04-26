import { describe, expect, it } from 'vitest';
import { buildResumeUpdateParams, resolveResumeTemplateSlug, serializeResumeRow } from '../worker/index';

describe('resume serialization for editor links', () => {
  it('returns template slug instead of numeric db template id for saved resume list', () => {
    const row = {
      id: 42,
      template_id: 1,
      template_slug: 'minimal-classic',
      title: '我的简历',
      is_public: 0,
      public_slug: null,
      view_count: 0,
      created_at: 1710000000,
      updated_at: 1710000001,
      content: JSON.stringify({ personal: { name: '木杉' } }),
    };

    expect(resolveResumeTemplateSlug(row)).toBe('minimal-classic');
    expect(serializeResumeRow(row)).toMatchObject({
      id: 42,
      templateId: 'minimal-classic',
      dbTemplateId: 1,
      isPublic: false,
    });
  });

  it('injects template slug into loaded content so an existing resume can be saved again', () => {
    const payload = serializeResumeRow({
      id: 7,
      template_id: 3,
      template_slug: 'modern-split',
      title: '旧简历',
      is_public: 1,
      public_slug: 'resume-abc',
      view_count: 12,
      created_at: 1710000000,
      updated_at: 1710000001,
      content: JSON.stringify({ personal: { name: '张三' }, workExperience: [] }),
    }, true);

    expect(payload.templateId).toBe('modern-split');
    expect(payload.content).toMatchObject({
      templateId: 'modern-split',
      personal: { name: '张三' },
    });
  });

  it('falls back to content.templateId for legacy rows whose template_id was not mapped', () => {
    const row = {
      id: 9,
      template_id: 0,
      template_slug: null,
      content: JSON.stringify({ templateId: 'fresh-green' }),
    };

    expect(resolveResumeTemplateSlug(row)).toBe('fresh-green');
  });

  it('normalizes omitted update fields to null so D1 bindings never receive undefined', () => {
    const params = buildResumeUpdateParams({
      title: '编辑后简历',
      content: { templateId: 'minimal-classic', personal: { name: '编辑后姓名' } },
    }, 4);

    expect(params).toEqual([
      '编辑后简历',
      JSON.stringify({ templateId: 'minimal-classic', personal: { name: '编辑后姓名' } }),
      null,
      null,
      4,
    ]);
    expect(params).not.toContain(undefined);
  });
});
