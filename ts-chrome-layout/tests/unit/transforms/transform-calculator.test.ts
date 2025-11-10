/**
 * TransformCalculator 测试
 */

import { TransformCalculator } from '../../../src/transforms/transform-calculator';
import { TransformStyle } from '../../../src/types/common/transform';

describe('TransformCalculator', () => {
  describe('computeTransform', () => {
    it('应该计算基本变换', () => {
      const style: TransformStyle = {
        transform: [
          { type: 'translate', x: 10, y: 20 },
          { type: 'rotate', angle: 45 },
        ],
      };
      const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
      const transform = TransformCalculator.computeTransform(style, referenceBox);
      
      expect(transform).not.toBeNull();
      expect(transform.isIdentity()).toBe(false);
    });

    it('应该处理空变换', () => {
      const style: TransformStyle = {};
      const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
      const transform = TransformCalculator.computeTransform(style, referenceBox);
      
      expect(transform.isIdentity()).toBe(true);
    });
  });

  describe('computeTransformOrigin', () => {
    it('应该计算变换原点', () => {
      const origin = { x: '50%', y: '50%' };
      const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
      const point = TransformCalculator.computeTransformOrigin(origin, referenceBox);
      
      expect(point.x).toBe(50);
      expect(point.y).toBe(50);
    });

    it('应该处理像素值', () => {
      const origin = { x: 25, y: 25 };
      const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
      const point = TransformCalculator.computeTransformOrigin(origin, referenceBox);
      
      expect(point.x).toBe(25);
      expect(point.y).toBe(25);
    });
  });

  describe('computeTransformedBoundingBox', () => {
    it('应该计算变换后的边界框', () => {
      const transform = TransformCalculator.computeTransform(
        {
          transform: [{ type: 'translate', x: 10, y: 20 }],
        },
        { x: 0, y: 0, width: 100, height: 100 }
      );
      const rect = { x: 0, y: 0, width: 50, height: 50 };
      const transformed = TransformCalculator.computeTransformedBoundingBox(rect, transform);
      
      expect(transformed.x).toBe(10);
      expect(transformed.y).toBe(20);
      expect(transformed.width).toBe(50);
      expect(transformed.height).toBe(50);
    });

    it('应该处理旋转后的边界框', () => {
      const transform = TransformCalculator.computeTransform(
        {
          transform: [{ type: 'rotate', angle: 45 }],
        },
        { x: 0, y: 0, width: 100, height: 100 }
      );
      const rect = { x: 0, y: 0, width: 100, height: 100 };
      const transformed = TransformCalculator.computeTransformedBoundingBox(rect, transform);
      
      // 旋转后边界框会变大
      expect(transformed.width).toBeGreaterThan(100);
      expect(transformed.height).toBeGreaterThan(100);
    });

    it('应该处理缩放后的边界框', () => {
      const transform = TransformCalculator.computeTransform(
        {
          transform: [{ type: 'scale', x: 2, y: 3 }],
        },
        { x: 0, y: 0, width: 100, height: 100 }
      );
      const rect = { x: 0, y: 0, width: 50, height: 50 };
      const transformed = TransformCalculator.computeTransformedBoundingBox(rect, transform);
      
      expect(transformed.width).toBe(100);
      expect(transformed.height).toBe(150);
    });
  });

  describe('preserve-3d', () => {
    it('应该处理 preserve-3d 样式', () => {
      const style: TransformStyle = {
        transform: [
          { type: 'rotateX', angle: 45 },
          { type: 'translateZ', value: 50 },
        ],
        transformStyle: 'preserve-3d',
      };
      const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
      const transform = TransformCalculator.computeTransform(style, referenceBox);
      
      expect(transform).not.toBeNull();
      expect(transform.is2D()).toBe(false);
    });

    it('应该处理 flat 样式', () => {
      const style: TransformStyle = {
        transform: [
          { type: 'rotateX', angle: 45 },
          { type: 'translateZ', value: 50 },
        ],
        transformStyle: 'flat',
      };
      const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
      const transform = TransformCalculator.computeTransform(style, referenceBox);
      
      expect(transform).not.toBeNull();
      // flat 模式下，3D变换会被扁平化
      expect(transform.is2D()).toBe(true);
    });
  });

  describe('perspective', () => {
    it('应该处理透视变换', () => {
      const style: TransformStyle = {
        transform: [{ type: 'translateZ', value: 100 }],
        perspective: 1000,
      };
      const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
      const transform = TransformCalculator.computeTransform(style, referenceBox);
      
      expect(transform).not.toBeNull();
    });

    it('应该处理 perspective: none', () => {
      const style: TransformStyle = {
        transform: [{ type: 'translateZ', value: 100 }],
        perspective: 'none',
      };
      const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
      const transform = TransformCalculator.computeTransform(style, referenceBox);
      
      expect(transform).not.toBeNull();
    });
  });

  describe('3D变换组合', () => {
    it('应该处理复杂的3D变换组合', () => {
      const style: TransformStyle = {
        transform: [
          { type: 'rotateX', angle: 45 },
          { type: 'rotateY', angle: 30 },
          { type: 'rotateZ', angle: 15 },
          { type: 'translate', x: 10, y: 20, z: 30 },
          { type: 'scale', x: 2, y: 2, z: 1 },
        ],
        transformStyle: 'preserve-3d',
      };
      const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
      const transform = TransformCalculator.computeTransform(style, referenceBox);
      
      expect(transform).not.toBeNull();
      expect(transform.is2D()).toBe(false);
    });

    it('应该处理变换原点与3D变换的组合', () => {
      const style: TransformStyle = {
        transform: [{ type: 'rotateX', angle: 45 }],
        transformOrigin: { x: '50%', y: '50%', z: 0 },
        transformStyle: 'preserve-3d',
      };
      const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
      const transform = TransformCalculator.computeTransform(style, referenceBox);
      
      expect(transform).not.toBeNull();
    });
  });

  describe('backfaceVisibility', () => {
    it('应该处理 backfaceVisibility 属性', () => {
      const style: TransformStyle = {
        transform: [{ type: 'rotateY', angle: 180 }],
        backfaceVisibility: 'hidden',
      };
      const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
      const transform = TransformCalculator.computeTransform(style, referenceBox);
      
      // backfaceVisibility 不影响变换矩阵计算
      expect(transform).not.toBeNull();
    });
  });

  describe('computePerspective', () => {
    it('应该计算透视矩阵', () => {
      const origin = { x: 50, y: 50, z: 0 };
      const perspective = TransformCalculator.computePerspective(1000, origin);
      
      expect(perspective).not.toBeNull();
      expect(perspective.isIdentity()).toBe(false);
    });

    it('应该在距离 <= 0 时返回单位矩阵', () => {
      const origin = { x: 50, y: 50, z: 0 };
      const perspective = TransformCalculator.computePerspective(0, origin);
      
      expect(perspective.isIdentity()).toBe(true);
    });
  });
});

