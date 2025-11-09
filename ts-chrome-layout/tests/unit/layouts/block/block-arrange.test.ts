/**
 * BlockArrangeAlgorithm 测试
 */

import { BlockArrangeAlgorithm } from '../../../../src/layouts/block/block-arrange';
import { BlockMeasureAlgorithm } from '../../../../src/layouts/block/block-measure';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { BlockStyle } from '../../../../src/types/layouts/block/block-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';

describe('BlockArrangeAlgorithm', () => {
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

  it('应该排列 Block 节点', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };

    const node = createBlockNode(style);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const measureAlgorithm = new BlockMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new BlockArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.children)).toBe(true);
  });

  it('应该计算 Block 项位置（垂直堆叠）', () => {
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

    const measureAlgorithm = new BlockMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new BlockArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result.children.length).toBe(2);
    expect(result.children[0].y).toBeGreaterThanOrEqual(0);
    expect(result.children[1].y).toBeGreaterThan(result.children[0].y);
  });

  it('应该处理左浮动', () => {
    const style: BlockStyle = {
      layoutType: 'block',
      width: 500,
    };

    const children = [
      {
        ...createChildNode('child1', 100, 50),
        style: { float: 'left' } as any,
      },
      createChildNode('child2', 200, 50),
    ];

    const node = createBlockNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 500,
      availableHeight: 600,
    });

    const measureAlgorithm = new BlockMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new BlockArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result.children.length).toBe(2);
    // 浮动项应该在左边
    expect(result.children[0].x).toBeLessThan(result.children[1].x);
  });

  it('应该处理右浮动', () => {
    const style: BlockStyle = {
      layoutType: 'block',
      width: 500,
    };

    const children = [
      {
        ...createChildNode('child1', 100, 50),
        style: { float: 'right' } as any,
      },
      createChildNode('child2', 200, 50),
    ];

    const node = createBlockNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 500,
      availableHeight: 600,
    });

    const measureAlgorithm = new BlockMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new BlockArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result.children.length).toBe(2);
    // 浮动项应该在右边
    expect(result.children[0].x).toBeGreaterThan(200);
  });

  it('应该处理清除浮动', () => {
    const style: BlockStyle = {
      layoutType: 'block',
      width: 500,
    };

    const children = [
      {
        ...createChildNode('child1', 100, 50),
        style: { float: 'left' } as any,
      },
      {
        ...createChildNode('child2', 200, 50),
        style: { clear: 'both' } as any,
      },
    ];

    const node = createBlockNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 500,
      availableHeight: 600,
    });

    const measureAlgorithm = new BlockMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new BlockArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result.children.length).toBe(2);
    // 清除浮动的项应该在浮动项下方
    expect(result.children[1].y).toBeGreaterThan(result.children[0].y);
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

    const measureResult = { width: 0, height: 0 };
    const algorithm = new BlockArrangeAlgorithm();
    expect(() => algorithm.arrange(node, constraintSpace, measureResult)).toThrow('Node must have block style');
  });
});
