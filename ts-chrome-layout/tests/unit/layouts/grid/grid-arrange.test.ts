/**
 * GridArrangeAlgorithm 测试
 */

import { GridArrangeAlgorithm } from '../../../../src/layouts/grid/grid-arrange';
import { createGridNode } from '../../../../src/utils/layouts/grid/grid-node-factory';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { GridStyle } from '../../../../src/types/layouts/grid/grid-style';

describe('GridArrangeAlgorithm', () => {
  it('应该排列网格节点', () => {
    const style: GridStyle = {
      layoutType: 'grid',
      gridTemplateColumns: [
        { type: 'fixed', value: 100 },
        { type: 'fixed', value: 200 },
      ],
      gridTemplateRows: [
        { type: 'fixed', value: 50 },
      ],
    };
    
    const node = createGridNode({
      id: 'grid-container',
      style,
      children: [],
    });
    
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });
    
    const measureResult = {
      width: 300,
      height: 50,
    };
    
    const algorithm = new GridArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);
    
    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.children)).toBe(true);
  });
});

