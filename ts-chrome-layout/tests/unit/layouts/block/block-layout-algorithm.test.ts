/**
 * BlockLayoutAlgorithm 测试
 */

import { BlockLayoutAlgorithm } from '../../../../src/layouts/block/block-layout-algorithm';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { BlockStyle } from '../../../../src/types/layouts/block/block-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';

describe('BlockLayoutAlgorithm', () => {
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

  it('应该执行完整布局流程', () => {
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

    const algorithm = new BlockLayoutAlgorithm();
    const result = algorithm.layout(node, constraintSpace);

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.children)).toBe(true);
    expect(result.children?.length).toBe(2);
  });

  it('应该分别执行 measure 和 arrange', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };

    const node = createBlockNode(style);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new BlockLayoutAlgorithm();
    const measureResult = algorithm.measure(node, constraintSpace);
    const arrangeResult = algorithm.arrange(node, constraintSpace, measureResult);

    expect(measureResult).toBeDefined();
    expect(arrangeResult).toBeDefined();
    expect(arrangeResult.width).toBe(measureResult.width);
    expect(arrangeResult.height).toBe(measureResult.height);
  });

  it('应该计算最小最大尺寸', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };

    const children = [
      createChildNode('child1', 100, 50),
      createChildNode('child2', 150, 50),
    ];

    const node = createBlockNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new BlockLayoutAlgorithm();
    const minMax = algorithm.computeMinMaxSizes(node, constraintSpace);

    expect(minMax).toBeDefined();
    expect(minMax.min).toBeGreaterThanOrEqual(0);
    expect(minMax.max).toBeGreaterThanOrEqual(minMax.min);
  });

  it('应该在缺少 style 时返回零尺寸', () => {
    const node = {
      ...createBlockNode({ layoutType: 'block' }),
      style: { layoutType: 'grid' } as any,
    };

    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new BlockLayoutAlgorithm();
    const minMax = algorithm.computeMinMaxSizes(node, constraintSpace);

    expect(minMax.min).toBe(0);
    expect(minMax.max).toBe(0);
  });
});
