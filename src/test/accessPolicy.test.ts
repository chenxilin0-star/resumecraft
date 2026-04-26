import { describe, expect, it } from 'vitest';
import {
  FREE_TEMPLATE_IDS,
  FREE_AI_DAILY_LIMIT,
  DAILY_IP_REGISTRATION_LIMIT,
  canUseTemplate,
  getTemplateAccessMessage,
  isFreeTemplateId,
  isIpRegistrationAllowed,
} from '@/utils/accessPolicy';

describe('access policy', () => {
  it('only exposes five basic templates for free users', () => {
    expect(FREE_TEMPLATE_IDS).toEqual([
      'minimal-classic',
      'business-blue',
      'modern-split',
      'fresh-green',
      'internet-style',
    ]);
    expect(new Set(FREE_TEMPLATE_IDS).size).toBe(5);
    expect(isFreeTemplateId('academic')).toBe(false);
    expect(isFreeTemplateId('creative-designer')).toBe(false);
    expect(isFreeTemplateId('timeline')).toBe(false);
    expect(isFreeTemplateId('cn-002')).toBe(false);
    expect(isFreeTemplateId('unknown-template')).toBe(false);
  });

  it('blocks non-VIP users from VIP templates and allows VIP/admin', () => {
    expect(canUseTemplate('cn-002', false)).toBe(false);
    expect(canUseTemplate('academic', false)).toBe(false);
    expect(canUseTemplate('unknown-template', false)).toBe(false);
    expect(canUseTemplate('minimal-classic', false)).toBe(true);
    expect(canUseTemplate('cn-002', true)).toBe(true);
    expect(getTemplateAccessMessage('cn-002')).toContain('VIP');
  });

  it('limits every free-user AI optimization action to the daily quota', () => {
    expect(FREE_AI_DAILY_LIMIT).toBe(2);
  });

  it('allows at most two successful registrations per IP per day', () => {
    expect(DAILY_IP_REGISTRATION_LIMIT).toBe(2);
    expect(isIpRegistrationAllowed(0)).toBe(true);
    expect(isIpRegistrationAllowed(1)).toBe(true);
    expect(isIpRegistrationAllowed(2)).toBe(false);
  });
});
