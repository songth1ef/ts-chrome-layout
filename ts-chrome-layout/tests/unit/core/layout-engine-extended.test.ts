/**
 * LayoutEngine 扩展测试
 */

import { LayoutEngine } from '../../../src/core/layout-engine';
import { LayoutNode, LayoutResult } from '../../../src/types/common/layout-node';
import { createConstraintSpace } from '../../../src/utils/common/constraint-space-factory';
import { LayoutAlgorithm } from '../../../src/core/layout-algorithm';
import { ConstraintSpace } from '../../../src/types/common/constraint-space';

class MockGridAlgorithm implements LayoutAlgorithm {
  readonly layoutType = 'grid' as const;
  
  measure(_node: LayoutNode, _constraintSpace: ConstraintSpace) {
    return { width: 300, height: 200 };
  }
  
  arrange(_node: LayoutNode, _constraintSpace: ConstraintSpace, _measureResult: any) {
    return { x: 0, y: 0, width: 300, height: 200, children: [] };
  }
  
  layout(_node: LayoutNode, _constraintSpace: ConstraintSpace): LayoutResult {
    return { width: 300, height: 200, children: [] };
  }
}

describe('LayoutEngine - Extended', () => {
  it('应该支持注册算法后执行布局', () => {
    const engine = new LayoutEngine({
      enableValidation: true,
      enablePerformanceMonitoring: false,
      enableCache: false,
    });
    
    const algorithm = new MockGridAlgorithm();
    (engine as any).registry.register(algorithm);
    
    const node: LayoutNode = {
      id: 'grid-node',
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
    
    const result = engine.layout(node, constraintSpace);
    
    expect(result).toBeDefined();
    expect(result.width).toBe(300);
    expect(result.height).toBe(200);
  });

  it('应该支持缓存', () => {
    const engine = new LayoutEngine({
      enableCache: true,
      cacheSize: 10,
    });
    
    const algorithm = new MockGridAlgorithm();
    (engine as any).registry.register(algorithm);
    
    const node: LayoutNode = {
      id: 'cached-node',
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
    
    const result1 = engine.layout(node, constraintSpace);
    const result2 = engine.layout(node, constraintSpace);
    
    expect(result1).toEqual(result2);
  });
});

