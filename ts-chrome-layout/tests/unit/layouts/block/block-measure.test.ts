/**
 * BlockMeasureAlgorithm 测试
 */

import { BlockMeasureAlgorithm } from '../../../../src/layouts/block/block-measure';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { BlockStyle } from '../../../../src/types/layouts/block/block-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';

describe('BlockMeasureAlgorithm', () => {
  const createBlockNode = (style: BlockStyle, children: LayoutNode[] = []): LayoutNode => ({
    id: 'block-container',
    layoutType: 'block',
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

  const createChildNode = (id: string, width: number = 100, height: number = 50): LayoutNode => ({
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

  it('应该测量 Block 节点', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };

    const node = createBlockNode(style);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new BlockMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
    expect((result as any).blockLayoutData).toBeDefined();
  });

  it('应该计算容器宽度', () => {
    const style: BlockStyle = {
      layoutType: 'block',
      width: 500,
    };

    const node = createBlockNode(style);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new BlockMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result.width).toBeLessThanOrEqual(500);
  });

  it('应该计算容器高度（垂直堆叠）', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };

    const children = [
      createChildNode('child1', 100, 50),
      createChildNode('child2', 100, 100),
    ];

    const node = createBlockNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new BlockMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result.height).toBeGreaterThanOrEqual(150); // 至少是子项高度之和
  });

  it('应该处理浮动项', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };

    const children = [
      {
        ...createChildNode('child1', 100, 50),
        style: { float: 'left' } as any,
      },
      createChildNode('child2', 100, 50),
    ];

    const node = createBlockNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new BlockMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result).toBeDefined();
    const layoutData = (result as any).blockLayoutData;
    expect(layoutData.floatingItems.length).toBeGreaterThan(0);
  });

  it('应该处理清除浮动', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };

    const children = [
      {
        ...createChildNode('child1', 100, 50),
        style: { float: 'left' } as any,
      },
      {
        ...createChildNode('child2', 100, 50),
        style: { clear: 'both' } as any,
      },
    ];

    const node = createBlockNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new BlockMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result).toBeDefined();
    const layoutData = (result as any).blockLayoutData;
    expect(layoutData.blockItems.some((item: any) => item.clearsFloat)).toBe(true);
  });

  it('应该考虑最小和最大宽度', () => {
    const style: BlockStyle = {
      layoutType: 'block',
      minWidth: 200,
      maxWidth: 400,
    };

    const node = createBlockNode(style);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new BlockMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result.width).toBeGreaterThanOrEqual(200);
    expect(result.width).toBeLessThanOrEqual(400);
  });

  it('应该考虑最小和最大高度', () => {
    const style: BlockStyle = {
      layoutType: 'block',
      minHeight: 100,
      maxHeight: 300,
    };

    const node = createBlockNode(style);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new BlockMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result.height).toBeGreaterThanOrEqual(100);
    expect(result.height).toBeLessThanOrEqual(300);
  });

  it('应该在缺少 style 时抛出错误', () => {
    const node = {
      ...createBlockNode({ layoutType: 'block' }),
      style: undefined,
    };

    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new BlockMeasureAlgorithm();
    expect(() => algorithm.measure(node, constraintSpace)).toThrow('Node must have block style');
  });
});
