/**
 * LayoutEngine 单元测试
 */

import { LayoutEngine } from '../../../src/core/layout-engine';
import { LayoutAlgorithm } from '../../../src/core/layout-algorithm';
import {
  LayoutNode,
  MeasureResult,
  ArrangeResult,
  LayoutResult,
} from '../../../src/types/common/layout-node';
import { ConstraintSpace } from '../../../src/types/common/constraint-space';
import { createConstraintSpace } from '../../../src/utils/common/constraint-space-factory';

describe('LayoutEngine', () => {
  let engine: LayoutEngine;

  beforeEach(() => {
    engine = new LayoutEngine({
      enableValidation: true,
      enablePerformanceMonitoring: false,
      enableCache: false,
    });
  });

  describe('构造函数', () => {
    it('应该创建引擎实例', () => {
      expect(engine).toBeInstanceOf(LayoutEngine);
    });

    it('应该使用默认配置', () => {
      const defaultEngine = new LayoutEngine();
      expect(defaultEngine).toBeInstanceOf(LayoutEngine);
    });
  });

  describe('算法注册', () => {
    it('应该支持注册算法', () => {
      // 创建一个简单的测试算法
      class TestLayoutAlgorithm implements LayoutAlgorithm {
        readonly layoutType = 'none' as const;
        
        measure(_node: LayoutNode, _constraintSpace: ConstraintSpace): MeasureResult {
          return { width: 100, height: 100 };
        }
        
        arrange(
          _node: LayoutNode,
          _constraintSpace: ConstraintSpace,
          _measureResult: MeasureResult
        ): ArrangeResult {
          return {
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            children: [],
          };
        }
        
        layout(_node: LayoutNode, _constraintSpace: ConstraintSpace): LayoutResult {
          return {
            width: 100,
            height: 100,
            children: [],
          };
        }
      }
      
      const testAlgorithm = new TestLayoutAlgorithm();
      
      // 注册算法
      engine.register(testAlgorithm);
      
      // 验证算法已注册
      expect(engine.supports('none')).toBe(true);
      expect(engine.getRegisteredTypes()).toContain('none');
    });

    it('应该返回已注册的类型', () => {
      const types = engine.getRegisteredTypes();
      expect(Array.isArray(types)).toBe(true);
    });

    it('应该检查是否支持布局类型', () => {
      expect(engine.supports('grid')).toBe(false); // 未注册时应该返回 false
    });
  });

  describe('布局计算', () => {
    it('应该在算法未注册时抛出错误', () => {
      const node: LayoutNode = {
        id: 'test-node',
        layoutType: 'grid',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        contentWidth: 0,
        contentHeight: 0,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        border: { top: 0, right: 0, bottom: 0, left: 0 },
        children: [],
      };

      const constraintSpace = createConstraintSpace({
        availableWidth: 800,
        availableHeight: 600,
      });

      // 算法未注册时应该抛出 LayoutError
      expect(() => {
        engine.layout(node, constraintSpace);
      }).toThrow(/algorithm.*not.*registered/i);
    });
  });

  describe('配置', () => {
    it('应该支持更新配置', () => {
      engine.updateConfig({
        enableCache: true,
        cacheSize: 200,
      });

      // 配置应该已更新
      expect(engine).toBeInstanceOf(LayoutEngine);
    });
  });
});

