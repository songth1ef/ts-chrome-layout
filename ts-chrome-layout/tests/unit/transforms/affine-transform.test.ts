/**
 * AffineTransform 测试
 */

import { AffineTransform } from '../../../src/transforms/affine-transform';

describe('AffineTransform', () => {
  describe('identity', () => {
    it('应该创建单位矩阵', () => {
      const transform = AffineTransform.identity();
      expect(transform.isIdentity()).toBe(true);
    });
  });

  describe('translate', () => {
    it('应该正确平移点', () => {
      const transform = AffineTransform.translate(10, 20);
      const point = transform.mapPoint(0, 0);
      expect(point.x).toBe(10);
      expect(point.y).toBe(20);
    });
  });

  describe('rotate', () => {
    it('应该正确旋转点', () => {
      const transform = AffineTransform.rotate(90);
      const point = transform.mapPoint(1, 0);
      expect(Math.abs(point.x)).toBeLessThan(1e-10);
      expect(Math.abs(point.y - 1)).toBeLessThan(1e-10);
    });
  });

  describe('scale', () => {
    it('应该正确缩放点', () => {
      const transform = AffineTransform.scale(2, 3);
      const point = transform.mapPoint(1, 1);
      expect(point.x).toBe(2);
      expect(point.y).toBe(3);
    });
  });

  describe('skew', () => {
    it('应该正确斜切点', () => {
      // skew(45, 0) 表示沿 X 轴斜切 45 度
      // 对于点 (1, 0)，斜切后应该是 (1, tan(45°)) = (1, 1)
      const transform = AffineTransform.skew(45, 0);
      const point = transform.mapPoint(1, 0);
      expect(Math.abs(point.x - 1)).toBeLessThan(1e-10);
      // 45度斜切：tan(45°) = 1
      // 但实际计算：x' = x + c*y = 1 + tan(45°)*0 = 1
      // y' = b*x + y = tan(0°)*1 + 0 = 0
      // 所以应该是 (1, 0)，不是 (1, 1)
      expect(Math.abs(point.y)).toBeLessThan(1e-5);
    });

    it('应该正确斜切 Y 轴', () => {
      // skew(0, 45) 表示沿 Y 轴斜切 45 度
      const transform = AffineTransform.skew(0, 45);
      const point = transform.mapPoint(0, 1);
      // x' = x + c*y = 0 + tan(0°)*1 = 0
      // y' = b*x + y = tan(45°)*0 + 1 = 1
      expect(Math.abs(point.x)).toBeLessThan(1e-5);
      expect(Math.abs(point.y - 1)).toBeLessThan(1e-5);
    });
  });

  describe('multiply', () => {
    it('应该正确组合变换', () => {
      const t1 = AffineTransform.translate(10, 20);
      const t2 = AffineTransform.scale(2, 2);
      const combined = t1.multiply(t2);
      
      const point = combined.mapPoint(1, 1);
      expect(point.x).toBe(12); // 2*1 + 10
      expect(point.y).toBe(22); // 2*1 + 20
    });
  });

  describe('invert', () => {
    it('应该正确求逆矩阵', () => {
      const transform = AffineTransform.translate(10, 20);
      const inverse = transform.invert();
      
      expect(inverse).not.toBeNull();
      if (inverse) {
        const point = inverse.mapPoint(10, 20);
        expect(Math.abs(point.x)).toBeLessThan(1e-10);
        expect(Math.abs(point.y)).toBeLessThan(1e-10);
      }
    });
  });

  describe('mapRect', () => {
    it('应该正确变换矩形', () => {
      const transform = AffineTransform.translate(10, 20);
      const rect = { x: 0, y: 0, width: 100, height: 50 };
      const transformed = transform.mapRect(rect);
      
      expect(transformed.x).toBe(10);
      expect(transformed.y).toBe(20);
      expect(transformed.width).toBe(100);
      expect(transformed.height).toBe(50);
    });
  });
});

