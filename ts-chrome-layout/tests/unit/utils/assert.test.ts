/**
 * Assert 工具函数测试
 */

import { assert, assertNotNull, assertInRange, assertNotEmpty } from '../../../src/utils/common/assert';

describe('Assert Utils', () => {
  describe('assert', () => {
    it('应该在条件为真时不抛出错误', () => {
      expect(() => assert(true)).not.toThrow();
      expect(() => assert(1 === 1)).not.toThrow();
    });

    it('应该在条件为假时抛出错误', () => {
      expect(() => assert(false)).toThrow('Assertion failed');
      expect(() => assert(false, 'Custom message')).toThrow('Custom message');
    });
  });

  describe('assertNotNull', () => {
    it('应该在值不为 null 或 undefined 时不抛出错误', () => {
      expect(() => assertNotNull(0)).not.toThrow();
      expect(() => assertNotNull('')).not.toThrow();
      expect(() => assertNotNull(false)).not.toThrow();
      expect(() => assertNotNull([])).not.toThrow();
      expect(() => assertNotNull({})).not.toThrow();
    });

    it('应该在值为 null 时抛出错误', () => {
      expect(() => assertNotNull(null)).toThrow('Value is null or undefined');
      expect(() => assertNotNull(null, 'Custom message')).toThrow('Custom message');
    });

    it('应该在值为 undefined 时抛出错误', () => {
      expect(() => assertNotNull(undefined)).toThrow('Value is null or undefined');
      expect(() => assertNotNull(undefined, 'Custom message')).toThrow('Custom message');
    });
  });

  describe('assertInRange', () => {
    it('应该在值在范围内时不抛出错误', () => {
      expect(() => assertInRange(5, 0, 10)).not.toThrow();
      expect(() => assertInRange(0, 0, 10)).not.toThrow();
      expect(() => assertInRange(10, 0, 10)).not.toThrow();
    });

    it('应该在值小于最小值时抛出错误', () => {
      expect(() => assertInRange(-1, 0, 10)).toThrow();
      expect(() => assertInRange(-1, 0, 10, 'Custom message')).toThrow('Custom message');
    });

    it('应该在值大于最大值时抛出错误', () => {
      expect(() => assertInRange(11, 0, 10)).toThrow();
      expect(() => assertInRange(11, 0, 10, 'Custom message')).toThrow('Custom message');
    });
  });

  describe('assertNotEmpty', () => {
    it('应该在数组不为空时不抛出错误', () => {
      expect(() => assertNotEmpty([1])).not.toThrow();
      expect(() => assertNotEmpty([1, 2, 3])).not.toThrow();
      expect(() => assertNotEmpty(['a'])).not.toThrow();
    });

    it('应该在数组为空时抛出错误', () => {
      expect(() => assertNotEmpty([])).toThrow('Array is empty');
      expect(() => assertNotEmpty([], 'Custom message')).toThrow('Custom message');
    });
  });
});

