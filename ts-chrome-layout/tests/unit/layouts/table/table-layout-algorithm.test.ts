/**
 * TableLayoutAlgorithm 测试
 */

import { TableLayoutAlgorithm } from '../../../../src/layouts/table/table-layout-algorithm';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { TableStyle } from '../../../../src/types/layouts/table/table-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';

describe('TableLayoutAlgorithm', () => {
  const createTableNode = (style: TableStyle, children: LayoutNode[] = []): LayoutNode => ({
    id: 'table-container',
    layoutType: 'table',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    contentWidth: 0,
    contentHeight: 0,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    border: { top: 0, right: 0, bottom: 0, left: 0 },
    children,
    style,
  });

  const createRowNode = (id: string, children: LayoutNode[]): LayoutNode => ({
    id,
    layoutType: 'none',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    contentWidth: 0,
    contentHeight: 0,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    border: { top: 0, right: 0, bottom: 0, left: 0 },
    children,
  });

  const createCellNode = (id: string, width: number = 100, height: number = 50): LayoutNode => ({
    id,
    layoutType: 'none',
    x: 0,
    y: 0,
    width,
    height,
    contentWidth: width,
    contentHeight: height,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    border: { top: 0, right: 0, bottom: 0, left: 0 },
    children: [],
  });

  it('应该执行完整布局流程', () => {
    const style: TableStyle = {
      layoutType: 'table',
      tableLayout: 'auto',
    };

    const row1 = createRowNode('row1', [
      createCellNode('cell1-1', 100, 50),
      createCellNode('cell1-2', 100, 50),
    ]);

    const node = createTableNode(style, [row1]);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new TableLayoutAlgorithm();
    const result = algorithm.layout(node, constraintSpace);

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
  });

  it('应该计算最小最大尺寸', () => {
    const style: TableStyle = {
      layoutType: 'table',
      tableLayout: 'auto',
    };

    const row1 = createRowNode('row1', [
      createCellNode('cell1-1', 100, 50),
    ]);

    const node = createTableNode(style, [row1]);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new TableLayoutAlgorithm();
    const minMax = algorithm.computeMinMaxSizes(node, constraintSpace);

    expect(minMax).toBeDefined();
    expect(minMax.min).toBeGreaterThanOrEqual(0);
    expect(minMax.max).toBeGreaterThanOrEqual(minMax.min);
  });
});
