/**
 * TableMeasureAlgorithm 测试
 */

import { TableMeasureAlgorithm } from '../../../../src/layouts/table/table-measure';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { TableStyle } from '../../../../src/types/layouts/table/table-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';

describe('TableMeasureAlgorithm', () => {
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

  it('应该测量 Table 节点', () => {
    const style: TableStyle = {
      layoutType: 'table',
      tableLayout: 'auto',
    };

    const row1 = createRowNode('row1', [
      createCellNode('cell1-1', 100, 50),
      createCellNode('cell1-2', 100, 50),
    ]);
    const row2 = createRowNode('row2', [
      createCellNode('cell2-1', 100, 50),
      createCellNode('cell2-2', 100, 50),
    ]);

    const node = createTableNode(style, [row1, row2]);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new TableMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
    expect((result as any).tableLayoutData).toBeDefined();
  });

  it('应该构建表格结构', () => {
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

    const algorithm = new TableMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    const layoutData = (result as any).tableLayoutData;
    expect(layoutData.rows.length).toBeGreaterThan(0);
    expect(layoutData.columns.length).toBeGreaterThan(0);
    expect(layoutData.cells.length).toBeGreaterThan(0);
  });

  it('应该计算列宽（auto 布局）', () => {
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

    const algorithm = new TableMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    const layoutData = (result as any).tableLayoutData;
    expect(layoutData.columns.length).toBe(2);
    expect(layoutData.columns[0].width).toBeGreaterThan(0);
    expect(layoutData.columns[1].width).toBeGreaterThan(0);
  });

  it('应该计算列宽（fixed 布局）', () => {
    const style: TableStyle = {
      layoutType: 'table',
      tableLayout: 'fixed',
      columnWidths: [120, 180],
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

    const algorithm = new TableMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    const layoutData = (result as any).tableLayoutData;
    expect(layoutData.columns[0].width).toBe(120);
    expect(layoutData.columns[1].width).toBe(180);
  });

  it('应该计算行高', () => {
    const style: TableStyle = {
      layoutType: 'table',
      tableLayout: 'auto',
    };

    const row1 = createRowNode('row1', [
      createCellNode('cell1-1', 100, 50),
    ]);
    const row2 = createRowNode('row2', [
      createCellNode('cell2-1', 100, 100),
    ]);

    const node = createTableNode(style, [row1, row2]);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new TableMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    const layoutData = (result as any).tableLayoutData;
    expect(layoutData.rows.length).toBe(2);
    expect(layoutData.rows[0].height).toBeGreaterThan(0);
    expect(layoutData.rows[1].height).toBeGreaterThan(0);
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

    const algorithm = new TableMeasureAlgorithm();
    expect(() => algorithm.measure(node, constraintSpace)).toThrow('Node must have table style');
  });
});
