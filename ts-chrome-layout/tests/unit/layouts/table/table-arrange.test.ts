/**
 * TableArrangeAlgorithm 测试
 */

import { TableArrangeAlgorithm } from '../../../../src/layouts/table/table-arrange';
import { TableMeasureAlgorithm } from '../../../../src/layouts/table/table-measure';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { TableStyle } from '../../../../src/types/layouts/table/table-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';

describe('TableArrangeAlgorithm', () => {
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

  it('应该排列 Table 节点', () => {
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

    const measureAlgorithm = new TableMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new TableArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.children)).toBe(true);
  });

  it('应该计算单元格位置', () => {
    const style: TableStyle = {
      layoutType: 'table',
      tableLayout: 'auto',
    };

    const row1 = createRowNode('row1', [
      createCellNode('cell1-1', 100, 50),
      createCellNode('cell1-2', 150, 50),
    ]);

    const node = createTableNode(style, [row1]);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const measureAlgorithm = new TableMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new TableArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result.children.length).toBeGreaterThan(0);
    // 第二个单元格应该在第一个单元格右边
    if (result.children.length >= 2) {
      expect(result.children[1].x).toBeGreaterThan(result.children[0].x);
    }
  });

  it('应该在缺少 style 时抛出错误', () => {
    const node = {
      ...createTableNode({ layoutType: 'table' }),
      style: undefined,
    };

    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const measureResult = { width: 0, height: 0 };
    const algorithm = new TableArrangeAlgorithm();
    expect(() => algorithm.arrange(node, constraintSpace, measureResult)).toThrow('Node must have table style');
  });
});
