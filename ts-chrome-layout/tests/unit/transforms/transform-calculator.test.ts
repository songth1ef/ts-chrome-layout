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
  });
});

