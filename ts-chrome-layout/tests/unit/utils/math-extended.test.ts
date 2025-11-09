/**
 * Math 工具函数扩展测试
 */

import { 
  clamp,
} from '../../../src/utils/common/math';

// 这些函数在 math.ts 中不存在，暂时移除测试
// roundToNearest, floorToNearest, ceilToNearest

describe('Math utils - Extended', () => {
  describe('clamp', () => {
    it('应该限制值在范围内', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });
});

