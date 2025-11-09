/**
 * GridMeasureAlgorithm 测试
 */

import { GridMeasureAlgorithm } from '../../../../src/layouts/grid/grid-measure';
import { createGridNode } from '../../../../src/utils/layouts/grid/grid-node-factory';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { GridStyle } from '../../../../src/types/layouts/grid/grid-style';

describe('GridMeasureAlgorithm', () => {
  it('应该测量网格节点', () => {
    const style: GridStyle = {
      layoutType: 'grid',
      gridTemplateColumns: [
        { type: 'fixed', value: 100 },
        { type: 'fixed', value: 200 },
      ],
      gridTemplateRows: [
        { type: 'fixed', value: 50 },
        { type: 'fixed', value: 100 },
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
    
    const algorithm = new GridMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);
    
    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
  });
});

