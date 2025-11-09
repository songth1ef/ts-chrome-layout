/**
 * Math 工具函数测试
 */

import {
  safeDivide,
  clamp,
  isFiniteNumber,
  isPositive,
  isNonNegative,
  percentage,
  roundTo,
} from '../../../src/utils/common/math';

describe('Math utils', () => {
  describe('safeDivide', () => {
    it('应该正常执行除法', () => {
      expect(safeDivide(10, 2)).toBe(5);
      expect(safeDivide(9, 3)).toBe(3);
      expect(safeDivide(1, 4)).toBe(0.25);
    });

    it('应该在除数为零时返回 0', () => {
      expect(safeDivide(10, 0)).toBe(0);
      expect(safeDivide(-5, 0)).toBe(0);
      expect(safeDivide(0, 0)).toBe(0);
    });
  });

  describe('clamp', () => {
    it('应该将值限制在范围内', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('应该将小于最小值的值限制为最小值', () => {
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(-10, 0, 10)).toBe(0);
    });

    it('应该将大于最大值的值限制为最大值', () => {
      expect(clamp(11, 0, 10)).toBe(10);
      expect(clamp(100, 0, 10)).toBe(10);
    });
  });

  describe('isFiniteNumber', () => {
    it('应该正确识别有限数', () => {
      expect(isFiniteNumber(0)).toBe(true);
      expect(isFiniteNumber(100)).toBe(true);
      expect(isFiniteNumber(-100)).toBe(true);
      expect(isFiniteNumber(3.14)).toBe(true);
    });

    it('应该正确识别非有限数', () => {
      expect(isFiniteNumber(Infinity)).toBe(false);
      expect(isFiniteNumber(-Infinity)).toBe(false);
      expect(isFiniteNumber(NaN)).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('应该正确识别正数', () => {
      expect(isPositive(1)).toBe(true);
      expect(isPositive(100)).toBe(true);
      expect(isPositive(0.1)).toBe(true);
    });

    it('应该正确识别非正数', () => {
      expect(isPositive(0)).toBe(false);
      expect(isPositive(-1)).toBe(false);
      expect(isPositive(Infinity)).toBe(false);
      expect(isPositive(NaN)).toBe(false);
    });
  });

  describe('isNonNegative', () => {
    it('应该正确识别非负数', () => {
      expect(isNonNegative(0)).toBe(true);
      expect(isNonNegative(1)).toBe(true);
      expect(isNonNegative(100)).toBe(true);
    });

    it('应该正确识别负数', () => {
      expect(isNonNegative(-1)).toBe(false);
      expect(isNonNegative(-100)).toBe(false);
    });

    it('应该正确处理非有限数', () => {
      expect(isNonNegative(Infinity)).toBe(false);
      expect(isNonNegative(NaN)).toBe(false);
    });
  });

  describe('percentage', () => {
    it('应该正确计算百分比', () => {
      expect(percentage(50, 100)).toBe(50);
      expect(percentage(25, 100)).toBe(25);
      expect(percentage(1, 4)).toBe(25);
    });

    it('应该在总数为零时返回 0', () => {
      expect(percentage(50, 0)).toBe(0);
      expect(percentage(0, 0)).toBe(0);
    });
  });

  describe('roundTo', () => {
    it('应该使用默认精度 2 进行四舍五入', () => {
      expect(roundTo(3.14159)).toBe(3.14);
      expect(roundTo(2.71828)).toBe(2.72);
    });

    it('应该使用指定精度进行四舍五入', () => {
      expect(roundTo(3.14159, 0)).toBe(3);
      expect(roundTo(3.14159, 1)).toBe(3.1);
      expect(roundTo(3.14159, 3)).toBe(3.142);
      expect(roundTo(3.14159, 4)).toBe(3.1416);
    });

    it('应该处理整数', () => {
      expect(roundTo(5, 2)).toBe(5);
      expect(roundTo(10, 0)).toBe(10);
    });
  });
});

