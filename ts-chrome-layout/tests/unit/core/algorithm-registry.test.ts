/**
 * AlgorithmRegistry 测试
 */

import { AlgorithmRegistry } from '../../../src/core/algorithm-registry';
import { LayoutAlgorithm } from '../../../src/core/layout-algorithm';
import { LayoutNode, LayoutResult } from '../../../src/types/common/layout-node';
import { ConstraintSpace } from '../../../src/types/common/constraint-space';

class TestAlgorithm implements LayoutAlgorithm {
  readonly layoutType = 'grid' as const;
  
  measure(_node: LayoutNode, _constraintSpace: ConstraintSpace) {
    return { width: 0, height: 0 };
  }
  
  arrange(_node: LayoutNode, _constraintSpace: ConstraintSpace, _measureResult: any) {
    return { x: 0, y: 0, width: 0, height: 0, children: [] };
  }
  
  layout(_node: LayoutNode, _constraintSpace: ConstraintSpace): LayoutResult {
    return { width: 100, height: 100, children: [] };
  }
}

describe('AlgorithmRegistry', () => {
  let registry: AlgorithmRegistry;

  beforeEach(() => {
    registry = new AlgorithmRegistry();
  });

  it('应该注册算法', () => {
    const algorithm = new TestAlgorithm();
    registry.register(algorithm);
    
    expect(registry.get('grid')).toBe(algorithm);
  });

  it('应该在算法未注册时抛出错误', () => {
    expect(() => {
      registry.get('none');
    }).toThrow();
  });

  it('应该返回已注册的类型', () => {
    registry.register(new TestAlgorithm());
    
    const types = registry.getRegisteredTypes();
    expect(types).toContain('grid');
  });
});

