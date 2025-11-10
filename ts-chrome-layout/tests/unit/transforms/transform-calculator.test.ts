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

    it('应该处理负数透视距离', () => {
      const origin = { x: 50, y: 50, z: 0 };
      const perspective = TransformCalculator.computePerspective(-100, origin);
      
      expect(perspective.isIdentity()).toBe(true);
    });

    it('应该处理极大透视距离', () => {
      const origin = { x: 50, y: 50, z: 0 };
      const perspective = TransformCalculator.computePerspective(1e10, origin);
      
      expect(perspective).not.toBeNull();
      expect(perspective.isIdentity()).toBe(false);
    });
  });

  describe('边界情况处理', () => {
    describe('零值和极小值', () => {
      it('应该处理零平移', () => {
        const style: TransformStyle = {
          transform: [{ type: 'translate', x: 0, y: 0, z: 0 }],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform.isIdentity()).toBe(true);
      });

      it('应该处理零旋转', () => {
        const style: TransformStyle = {
          transform: [{ type: 'rotate', angle: 0 }],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform.isIdentity()).toBe(true);
      });

      it('应该处理单位缩放', () => {
        const style: TransformStyle = {
          transform: [{ type: 'scale', x: 1, y: 1, z: 1 }],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform.isIdentity()).toBe(true);
      });

      it('应该处理极小缩放值', () => {
        const style: TransformStyle = {
          transform: [{ type: 'scale', x: 0.0001, y: 0.0001 }],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
        expect(transform.isIdentity()).toBe(false);
      });
    });

    describe('负值处理', () => {
      it('应该处理负平移', () => {
        const style: TransformStyle = {
          transform: [{ type: 'translate', x: -10, y: -20 }],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
        expect(transform.isIdentity()).toBe(false);
      });

      it('应该处理负缩放', () => {
        const style: TransformStyle = {
          transform: [{ type: 'scale', x: -1, y: 1 }],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
        expect(transform.isIdentity()).toBe(false);
      });

      it('应该处理负旋转角度', () => {
        const style: TransformStyle = {
          transform: [{ type: 'rotate', angle: -45 }],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
        expect(transform.isIdentity()).toBe(false);
      });
    });

    describe('极大值处理', () => {
      it('应该处理极大平移值', () => {
        const style: TransformStyle = {
          transform: [{ type: 'translate', x: 1e10, y: 1e10 }],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
        expect(transform.isIdentity()).toBe(false);
      });

      it('应该处理极大缩放值', () => {
        const style: TransformStyle = {
          transform: [{ type: 'scale', x: 1e10, y: 1e10 }],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
        expect(transform.isIdentity()).toBe(false);
      });

      it('应该处理极大旋转角度', () => {
        const style: TransformStyle = {
          transform: [{ type: 'rotate', angle: 3600 }],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
        expect(transform.isIdentity()).toBe(false);
      });
    });

    describe('复杂嵌套变换', () => {
      it('应该处理多层嵌套的变换', () => {
        const style: TransformStyle = {
          transform: [
            { type: 'translate', x: 10, y: 20 },
            { type: 'rotate', angle: 45 },
            { type: 'scale', x: 2, y: 2 },
            { type: 'translate', x: -5, y: -10 },
            { type: 'rotate', angle: -30 },
          ],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
        expect(transform.isIdentity()).toBe(false);
      });

      it('应该处理嵌套的3D变换', () => {
        const style: TransformStyle = {
          transform: [
            { type: 'rotateX', angle: 45 },
            { type: 'translateZ', value: 50 },
            { type: 'rotateY', angle: 30 },
            { type: 'translateZ', value: -25 },
            { type: 'rotateZ', angle: 15 },
          ],
          transformStyle: 'preserve-3d',
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
        expect(transform.is2D()).toBe(false);
      });

      it('应该处理变换原点与嵌套变换', () => {
        const style: TransformStyle = {
          transform: [
            { type: 'rotate', angle: 45 },
            { type: 'scale', x: 2, y: 2 },
            { type: 'rotate', angle: -45 },
          ],
          transformOrigin: { x: '50%', y: '50%' },
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
      });
    });

    describe('变换原点边界情况', () => {
      it('应该处理变换原点在边界', () => {
        const origin = { x: '0%', y: '0%' };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const point = TransformCalculator.computeTransformOrigin(origin, referenceBox);
        
        expect(point.x).toBe(0);
        expect(point.y).toBe(0);
      });

      it('应该处理变换原点在100%', () => {
        const origin = { x: '100%', y: '100%' };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const point = TransformCalculator.computeTransformOrigin(origin, referenceBox);
        
        expect(point.x).toBe(100);
        expect(point.y).toBe(100);
      });

      it('应该处理负百分比变换原点', () => {
        const origin = { x: '-50%', y: '-50%' };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const point = TransformCalculator.computeTransformOrigin(origin, referenceBox);
        
        expect(point.x).toBe(-50);
        expect(point.y).toBe(-50);
      });

      it('应该处理超过100%的变换原点', () => {
        const origin = { x: '150%', y: '200%' };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const point = TransformCalculator.computeTransformOrigin(origin, referenceBox);
        
        expect(point.x).toBe(150);
        expect(point.y).toBe(200);
      });

      it('应该处理零尺寸参考框', () => {
        const origin = { x: '50%', y: '50%' };
        const referenceBox = { x: 0, y: 0, width: 0, height: 0 };
        const point = TransformCalculator.computeTransformOrigin(origin, referenceBox);
        
        expect(point.x).toBe(0);
        expect(point.y).toBe(0);
      });
    });

    describe('边界框变换边界情况', () => {
      it('应该处理零尺寸边界框', () => {
        const transform = TransformCalculator.computeTransform(
          {
            transform: [{ type: 'translate', x: 10, y: 20 }],
          },
          { x: 0, y: 0, width: 100, height: 100 }
        );
        const rect = { x: 0, y: 0, width: 0, height: 0 };
        const transformed = TransformCalculator.computeTransformedBoundingBox(rect, transform);
        
        expect(transformed.x).toBe(10);
        expect(transformed.y).toBe(20);
        expect(transformed.width).toBe(0);
        expect(transformed.height).toBe(0);
      });

      it('应该处理负坐标边界框', () => {
        const transform = TransformCalculator.computeTransform(
          {
            transform: [{ type: 'translate', x: 10, y: 20 }],
          },
          { x: 0, y: 0, width: 100, height: 100 }
        );
        const rect = { x: -50, y: -50, width: 100, height: 100 };
        const transformed = TransformCalculator.computeTransformedBoundingBox(rect, transform);
        
        expect(transformed.x).toBe(-40);
        expect(transformed.y).toBe(-30);
        expect(transformed.width).toBe(100);
        expect(transformed.height).toBe(100);
      });

      it('应该处理极大尺寸边界框', () => {
        const transform = TransformCalculator.computeTransform(
          {
            transform: [{ type: 'scale', x: 2, y: 2 }],
          },
          { x: 0, y: 0, width: 100, height: 100 }
        );
        const rect = { x: 0, y: 0, width: 1e6, height: 1e6 };
        const transformed = TransformCalculator.computeTransformedBoundingBox(rect, transform);
        
        expect(transformed.width).toBe(2e6);
        expect(transformed.height).toBe(2e6);
      });
    });

    describe('错误情况处理', () => {
      it('应该处理空变换数组', () => {
        const style: TransformStyle = {
          transform: [],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform.isIdentity()).toBe(true);
      });

      it('应该处理undefined变换', () => {
        const style: TransformStyle = {
          transform: undefined,
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform.isIdentity()).toBe(true);
      });

      it('应该处理无效的变换原点值', () => {
        const origin = { x: 'invalid', y: 'invalid' } as any;
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const point = TransformCalculator.computeTransformOrigin(origin, referenceBox);
        
        // 应该返回默认值或0
        expect(point.x).toBeDefined();
        expect(point.y).toBeDefined();
      });
    });

    describe('变换组合边界情况', () => {
      it('应该处理所有变换类型组合', () => {
        const style: TransformStyle = {
          transform: [
            { type: 'translate', x: 10, y: 20, z: 30 },
            { type: 'rotate', angle: 45 },
            { type: 'rotateX', angle: 30 },
            { type: 'rotateY', angle: 60 },
            { type: 'rotateZ', angle: 15 },
            { type: 'scale', x: 2, y: 3, z: 1 },
            { type: 'skew', x: 10, y: 5 },
            { type: 'skewX', angle: 15 },
            { type: 'skewY', angle: 20 },
          ],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
        expect(transform.isIdentity()).toBe(false);
      });

      it('应该处理矩阵变换', () => {
        const style: TransformStyle = {
          transform: [
            {
              type: 'matrix',
              values: [1, 0, 0, 1, 10, 20],
            },
          ],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
        expect(transform.isIdentity()).toBe(false);
      });

      it('应该处理3D矩阵变换', () => {
        const style: TransformStyle = {
          transform: [
            {
              type: 'matrix3d',
              values: [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                10, 20, 30, 1,
              ],
            },
          ],
        };
        const referenceBox = { x: 0, y: 0, width: 100, height: 100 };
        const transform = TransformCalculator.computeTransform(style, referenceBox);
        
        expect(transform).not.toBeNull();
        expect(transform.isIdentity()).toBe(false);
      });
    });
  });
});

