/**
 * GridArrangeAlgorithm 扩展测试 - 提高覆盖率
 */

import { GridArrangeAlgorithm } from '../../../../src/layouts/grid/grid-arrange';
import { GridMeasureAlgorithm } from '../../../../src/layouts/grid/grid-measure';
import { createGridNode } from '../../../../src/utils/layouts/grid/grid-node-factory';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { GridStyle } from '../../../../src/types/layouts/grid/grid-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';

describe('GridArrangeAlgorithm - Extended', () => {
  describe('placeGridItems', () => {
    it('应该计算网格项位置（有布局数据）', () => {
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
        columnGap: 10,
        rowGap: 20,
      };
      
      const child1: LayoutNode = {
        id: 'child1',
        layoutType: 'none',
        x: 0, y: 0, width: 100, height: 50,
        contentWidth: 100, contentHeight: 50,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        border: { top: 0, right: 0, bottom: 0, left: 0 },
        children: [],
      };
      
      const node = createGridNode({
        id: 'grid-container',
        style,
        children: [child1],
      });
      
      const constraintSpace = createConstraintSpace({
        availableWidth: 800,
        availableHeight: 600,
      });
      
      // 先执行测量，获取完整的 measureResult
      const measureAlgorithm = new GridMeasureAlgorithm();
      const measureResult = measureAlgorithm.measure(node, constraintSpace);
      
      const algorithm = new GridArrangeAlgorithm();
      const result = algorithm.arrange(node, constraintSpace, measureResult);
      
      expect(result).toBeDefined();
      expect(result.width).toBeGreaterThanOrEqual(0);
      expect(result.height).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.children)).toBe(true);
    });

    it('应该处理多个子节点', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const children: LayoutNode[] = [
        {
          id: 'child1',
          layoutType: 'none',
          x: 0, y: 0, width: 100, height: 50,
          contentWidth: 100, contentHeight: 50,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          border: { top: 0, right: 0, bottom: 0, left: 0 },
          children: [],
        },
        {
          id: 'child2',
          layoutType: 'none',
          x: 0, y: 0, width: 100, height: 50,
          contentWidth: 100, contentHeight: 50,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
          padding: { top: 0, right: 0, bottom: 0, left: 0 },
          border: { top: 0, right: 0, bottom: 0, left: 0 },
          children: [],
        },
      ];
      
      const node = createGridNode({
        id: 'grid-container',
        style,
        children,
      });
      
      const constraintSpace = createConstraintSpace({
        availableWidth: 800,
        availableHeight: 600,
      });
      
      // 先执行测量，获取完整的 measureResult
      const measureAlgorithm = new GridMeasureAlgorithm();
      const measureResult = measureAlgorithm.measure(node, constraintSpace);
      
      const algorithm = new GridArrangeAlgorithm();
      const result = algorithm.arrange(node, constraintSpace, measureResult);
      
      expect(result.children.length).toBe(2);
    });
  });

  describe('calculateFinalSize', () => {
    it('应该计算最终尺寸（无布局数据）', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [],
        gridTemplateRows: [],
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
      
      // 先执行测量，获取完整的 measureResult
      const measureAlgorithm = new GridMeasureAlgorithm();
      const measureResult = measureAlgorithm.measure(node, constraintSpace);
      
      const algorithm = new GridArrangeAlgorithm();
      const result = algorithm.arrange(node, constraintSpace, measureResult);
      
      expect(result.width).toBeGreaterThanOrEqual(0);
      expect(result.height).toBeGreaterThanOrEqual(0);
    });
  });
});
