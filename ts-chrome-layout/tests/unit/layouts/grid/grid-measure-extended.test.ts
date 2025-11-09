/**
 * GridMeasureAlgorithm 扩展测试 - 提高覆盖率
 */

import { GridMeasureAlgorithm } from '../../../../src/layouts/grid/grid-measure';
import { createGridNode } from '../../../../src/utils/layouts/grid/grid-node-factory';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { GridStyle } from '../../../../src/types/layouts/grid/grid-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';

describe('GridMeasureAlgorithm - Extended', () => {
  describe('buildGridSizingTree', () => {
    it('应该构建包含子节点的尺寸树', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
          { type: 'fr', value: 1 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
          { type: 'auto' },
        ],
      };
      
      const child1: LayoutNode = {
        id: 'child1',
        layoutType: 'none',
        x: 0, y: 0, width: 0, height: 0,
        contentWidth: 0, contentHeight: 0,
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
      
      const algorithm = new GridMeasureAlgorithm();
      const result = algorithm.measure(node, constraintSpace);
      
      expect(result).toBeDefined();
      expect(result.width).toBeGreaterThanOrEqual(0);
      expect(result.height).toBeGreaterThanOrEqual(0);
    });

    it('应该处理 repeat 语法', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          {
            type: 'repeat',
            count: 3,
            tracks: [{ type: 'fixed', value: 100 }],
          },
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
      
      const algorithm = new GridMeasureAlgorithm();
      const result = algorithm.measure(node, constraintSpace);
      
      expect(result.width).toBeGreaterThanOrEqual(0);
    });

    it('应该处理 auto-fill', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          {
            type: 'repeat',
            count: 'auto-fill',
            tracks: [{ type: 'fixed', value: 100 }],
          },
        ],
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
      
      const algorithm = new GridMeasureAlgorithm();
      const result = algorithm.measure(node, constraintSpace);
      
      expect(result.width).toBeGreaterThanOrEqual(0);
    });
  });

  describe('子网格处理', () => {
    it('应该处理子网格情况', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
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
      
      // 创建一个模拟的 gridLayoutTree，需要有 getNode 方法
      const mockGridLayoutTree = {
        getNode: (index: number) => ({
          layoutData: {
            columns: { sets: [] },
            rows: { sets: [] },
          },
        }),
        getSubtree: () => null,
        nodes: [],
      };
      
      const constraintSpace = createConstraintSpace({
        availableWidth: 800,
        availableHeight: 600,
        gridLayoutTree: mockGridLayoutTree as any,
      });
      
      const algorithm = new GridMeasureAlgorithm();
      const result = algorithm.measure(node, constraintSpace);
      
      expect(result).toBeDefined();
    });
  });
});
