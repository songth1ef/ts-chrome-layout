/**
 * Performance 工具函数测试
 */

import { measureAsync, measureSync } from '../../../src/utils/common/performance';

describe('Performance Utils', () => {
  describe('measureSync', () => {
    it('应该测量同步函数执行时间', () => {
      const result = measureSync('test', () => {
        return 42;
      });
      expect(result).toBe(42);
    });

    it('应该在函数抛出错误时记录错误', () => {
      expect(() => {
        measureSync('test', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
    });

    it('应该处理复杂计算', () => {
      const result = measureSync('complex', () => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });
      expect(result).toBe(499500);
    });
  });

  describe('measureAsync', () => {
    it('应该测量异步函数执行时间', async () => {
      const result = await measureAsync('test', async () => {
        return Promise.resolve(42);
      });
      expect(result).toBe(42);
    });

    it('应该在异步函数抛出错误时记录错误', async () => {
      await expect(
        measureAsync('test', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
    });

    it('应该处理延迟的异步操作', async () => {
      const result = await measureAsync('delayed', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'done';
      });
      expect(result).toBe('done');
    });
  });
});

