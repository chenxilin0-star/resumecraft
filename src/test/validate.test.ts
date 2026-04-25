import { describe, it, expect } from 'vitest';
import { isValidRedeemCode, formatRedeemCode } from '@/utils/validate';

describe('兑换码格式校验', () => {
  it('有效兑换码应通过校验', () => {
    expect(isValidRedeemCode('ABCD-EFGH-IJKL')).toBe(true);
    expect(isValidRedeemCode('1234-5678-9ABC')).toBe(true);
  });

  it('无效兑换码应被拒绝', () => {
    expect(isValidRedeemCode('ABCD-EFGH')).toBe(false);
    expect(isValidRedeemCode('ABCD-EFGH-IJKL-MNOP')).toBe(false);
    expect(isValidRedeemCode('abcd-efgh-ijkl')).toBe(false);
    expect(isValidRedeemCode('')).toBe(false);
    expect(isValidRedeemCode('ABCD_EFGH_IJKL')).toBe(false);
  });

  it('formatRedeemCode 应正确格式化输入', () => {
    expect(formatRedeemCode('abcd efgh ijkl')).toBe('ABCD-EFGH-IJKL');
    expect(formatRedeemCode('ABCDEFGHIJKL')).toBe('ABCD-EFGH-IJKL');
  });
});
