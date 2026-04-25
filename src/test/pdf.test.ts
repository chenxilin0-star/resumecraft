import { describe, it, expect, vi } from 'vitest';
import { exportToPDF } from '@/utils/pdf';

describe('PDF 导出', () => {
  it('当元素不存在时应抛出错误', async () => {
    const originalGetElementById = document.getElementById;
    document.getElementById = vi.fn(() => null);

    await expect(
      exportToPDF({ elementId: 'non-existent', filename: 'test' })
    ).rejects.toThrow('Preview element not found');

    document.getElementById = originalGetElementById;
  });
});
