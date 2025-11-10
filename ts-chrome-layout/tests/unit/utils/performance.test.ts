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

    it('应该处理返回 Promise 的函数', async () => {
      const result = await measureAsync('promise', async () => {
        return new Promise<number>(resolve => {
          setTimeout(() => resolve(100), 5);
        });
      });
      expect(result).toBe(100);
    });

    it('应该处理多个连续的异步操作', async () => {
      const results: number[] = [];
      for (let i = 0; i < 3; i++) {
        const result = await measureAsync(`async-${i}`, async () => {
          await new Promise(resolve => setTimeout(resolve, 5));
          return i;
        });
        results.push(result);
      }
      expect(results).toEqual([0, 1, 2]);
    });
  });

  describe('性能测量边界情况', () => {
    it('应该处理立即返回的函数', () => {
      const result = measureSync('immediate', () => {
        return 'immediate';
      });
      expect(result).toBe('immediate');
    });

    it('应该处理返回 undefined 的函数', () => {
      const result = measureSync('undefined', () => {
        return undefined;
      });
      expect(result).toBeUndefined();
    });

    it('应该处理返回 null 的函数', () => {
      const result = measureSync('null', () => {
        return null;
      });
      expect(result).toBeNull();
    });

    it('应该处理抛出非 Error 对象的函数', () => {
      expect(() => {
        measureSync('throw-string', () => {
          throw 'String error';
        });
      }).toThrow('String error');
    });
  });
});

