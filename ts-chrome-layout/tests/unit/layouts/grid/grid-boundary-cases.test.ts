/**
 * Grid 布局边界情况测试
 */

import { GridMeasureAlgorithm } from '../../../../src/layouts/grid/grid-measure';
import { GridArrangeAlgorithm } from '../../../../src/layouts/grid/grid-arrange';
import { createGridNode } from '../../../../src/utils/layouts/grid/grid-node-factory';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { GridStyle } from '../../../../src/types/layouts/grid/grid-style';

describe('Grid 布局边界情况', () => {
  describe('空网格', () => {
    it('应该处理没有轨道定义的网格', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [],
        gridTemplateRows: [],
      };
      
      const node = createGridNode({
        id: 'empty-grid',
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

    it('应该处理没有子项的网格', () => {
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
        id: 'grid-no-children',
        style,
        children: [],
      });
      
      const constraintSpace = createConstraintSpace({
        availableWidth: 800,
        availableHeight: 600,
      });
      
      const measureAlgorithm = new GridMeasureAlgorithm();
      const measureResult = measureAlgorithm.measure(node, constraintSpace);
      
      const arrangeAlgorithm = new GridArrangeAlgorithm();
      const result = arrangeAlgorithm.arrange(node, constraintSpace, measureResult);
      
      expect(result).toBeDefined();
      expect(result.children).toEqual([]);
    });
  });

  describe('单行/单列网格', () => {
    it('应该处理单列网格', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
          { type: 'fixed', value: 100 },
        ],
      };
      
      const node = createGridNode({
        id: 'single-column-grid',
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
      expect(result.width).toBeGreaterThanOrEqual(100);
    });

    it('应该处理单行网格', () => {
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
        id: 'single-row-grid',
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
      expect(result.height).toBeGreaterThanOrEqual(50);
    });

    it('应该处理1x1网格', () => {
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
        id: '1x1-grid',
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
      expect(result.width).toBeGreaterThanOrEqual(100);
      expect(result.height).toBeGreaterThanOrEqual(50);
    });
  });

  describe('极端轨道尺寸', () => {
    it('应该处理零尺寸轨道', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 0 },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const node = createGridNode({
        id: 'zero-track-grid',
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
    });

    it('应该处理极小尺寸轨道', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 0.001 },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const node = createGridNode({
        id: 'tiny-track-grid',
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
    });

    it('应该处理极大尺寸轨道', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 1e6 },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const node = createGridNode({
        id: 'huge-track-grid',
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
      expect(result.width).toBeGreaterThanOrEqual(1e6);
    });

    it('应该处理负尺寸轨道（应该被处理为0或最小值）', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: -100 },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const node = createGridNode({
        id: 'negative-track-grid',
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
    });
  });

  describe('复杂嵌套网格', () => {
    it('应该处理嵌套的网格容器', () => {
      const outerStyle: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 200 },
          { type: 'fixed', value: 200 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 100 },
        ],
      };
      
      const innerStyle: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const innerNode = createGridNode({
        id: 'inner-grid',
        style: innerStyle,
        children: [],
      });
      
      const outerNode = createGridNode({
        id: 'outer-grid',
        style: outerStyle,
        children: [innerNode],
      });
      
      const constraintSpace = createConstraintSpace({
        availableWidth: 800,
        availableHeight: 600,
      });
      
      const algorithm = new GridMeasureAlgorithm();
      const result = algorithm.measure(outerNode, constraintSpace);
      
      expect(result).toBeDefined();
      expect(result.width).toBeGreaterThanOrEqual(400);
    });

    it('应该处理深层嵌套的网格', () => {
      const createNestedGrid = (depth: number, id: string): any => {
        if (depth === 0) {
          return createGridNode({
            id,
            style: {
              layoutType: 'grid',
              gridTemplateColumns: [{ type: 'fixed', value: 50 }],
              gridTemplateRows: [{ type: 'fixed', value: 50 }],
            },
            children: [],
          });
        }
        
        return createGridNode({
          id,
          style: {
            layoutType: 'grid',
            gridTemplateColumns: [{ type: 'fixed', value: 100 }],
            gridTemplateRows: [{ type: 'fixed', value: 100 }],
          },
          children: [createNestedGrid(depth - 1, `${id}-child`)],
        });
      };
      
      const node = createNestedGrid(3, 'deep-grid');
      
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

  describe('边界值处理', () => {
    it('应该处理零可用空间', () => {
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
        id: 'zero-space-grid',
        style,
        children: [],
      });
      
      const constraintSpace = createConstraintSpace({
        availableWidth: 0,
        availableHeight: 0,
      });
      
      const algorithm = new GridMeasureAlgorithm();
      const result = algorithm.measure(node, constraintSpace);
      
      expect(result).toBeDefined();
      expect(result.width).toBeGreaterThanOrEqual(0);
      expect(result.height).toBeGreaterThanOrEqual(0);
    });

    it('应该处理极小可用空间', () => {
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
        id: 'tiny-space-grid',
        style,
        children: [],
      });
      
      const constraintSpace = createConstraintSpace({
        availableWidth: 0.001,
        availableHeight: 0.001,
      });
      
      const algorithm = new GridMeasureAlgorithm();
      const result = algorithm.measure(node, constraintSpace);
      
      expect(result).toBeDefined();
      expect(result.width).toBeGreaterThanOrEqual(0);
      expect(result.height).toBeGreaterThanOrEqual(0);
    });

    it('应该处理极大可用空间', () => {
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
        id: 'huge-space-grid',
        style,
        children: [],
      });
      
      const constraintSpace = createConstraintSpace({
        availableWidth: 1e10,
        availableHeight: 1e10,
      });
      
      const algorithm = new GridMeasureAlgorithm();
      const result = algorithm.measure(node, constraintSpace);
      
      expect(result).toBeDefined();
      expect(result.width).toBeGreaterThanOrEqual(0);
      expect(result.height).toBeGreaterThanOrEqual(0);
    });

    it('应该处理负可用空间（应该被处理为0或最小值）', () => {
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
        id: 'negative-space-grid',
        style,
        children: [],
      });
      
      const constraintSpace = createConstraintSpace({
        availableWidth: -100,
        availableHeight: -100,
      });
      
      const algorithm = new GridMeasureAlgorithm();
      const result = algorithm.measure(node, constraintSpace);
      
      expect(result).toBeDefined();
      expect(result.width).toBeGreaterThanOrEqual(0);
      expect(result.height).toBeGreaterThanOrEqual(0);
    });
  });

  describe('自动轨道尺寸', () => {
    it('应该处理auto轨道尺寸', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'auto' },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const node = createGridNode({
        id: 'auto-track-grid',
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
    });

    it('应该处理min-content轨道尺寸', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'min-content' },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const node = createGridNode({
        id: 'min-content-track-grid',
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
    });

    it('应该处理max-content轨道尺寸', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'max-content' },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const node = createGridNode({
        id: 'max-content-track-grid',
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
    });

    it('应该处理fr（flex）轨道尺寸', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fr', value: 1 },
          { type: 'fr', value: 2 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const node = createGridNode({
        id: 'fr-track-grid',
        style,
        children: [],
      });
      
      const constraintSpace = createConstraintSpace({
        availableWidth: 600,
        availableHeight: 600,
      });
      
      const algorithm = new GridMeasureAlgorithm();
      const result = algorithm.measure(node, constraintSpace);
      
      expect(result).toBeDefined();
      expect(result.width).toBeGreaterThanOrEqual(0);
    });
  });

  describe('重复轨道', () => {
    it('应该处理repeat轨道', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'repeat', count: 3, tracks: [{ type: 'fixed', value: 100 }] },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const node = createGridNode({
        id: 'repeat-track-grid',
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
      expect(result.width).toBeGreaterThanOrEqual(300);
    });

    it('应该处理零次repeat', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'repeat', count: 0, tracks: [{ type: 'fixed', value: 100 }] },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const node = createGridNode({
        id: 'zero-repeat-grid',
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
    });
  });
});
