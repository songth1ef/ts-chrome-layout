/**
 * FlexMeasureAlgorithm 测试
 */

import { FlexMeasureAlgorithm } from '../../../../src/layouts/flex/flex-measure';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { FlexStyle } from '../../../../src/types/layouts/flex/flex-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';
import { FlexDirection, FlexWrap } from '../../../../src/types/common/enums';

describe('FlexMeasureAlgorithm', () => {
  const createFlexNode = (style: FlexStyle, children: LayoutNode[] = []): LayoutNode => ({
    id: 'flex-container',
    layoutType: 'flex',
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

  it('应该测量 Flex 节点', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
    };

    const node = createFlexNode(style);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new FlexMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
    expect((result as any).flexLayoutData).toBeDefined();
  });

  it('应该计算主轴尺寸（row 方向）', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
    };

    const children = [
      createChildNode('child1', 100, 50),
      createChildNode('child2', 150, 50),
    ];

    const node = createFlexNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new FlexMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result.width).toBeGreaterThanOrEqual(250); // 至少是子项宽度之和
  });

  it('应该计算主轴尺寸（column 方向）', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Column,
    };

    const children = [
      createChildNode('child1', 100, 50),
      createChildNode('child2', 100, 100),
    ];

    const node = createFlexNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new FlexMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result.height).toBeGreaterThanOrEqual(150); // 至少是子项高度之和
  });

  it('应该处理 flex-grow', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
    };

    const children = [
      {
        ...createChildNode('child1', 100, 50),
        style: { flexGrow: 1 } as any,
      },
      {
        ...createChildNode('child2', 100, 50),
        style: { flexGrow: 2 } as any,
      },
    ];

    const node = createFlexNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 500,
      availableHeight: 600,
    });

    const algorithm = new FlexMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result.width).toBeGreaterThanOrEqual(200);
  });

  it('应该处理 flex-shrink', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
      flexWrap: FlexWrap.NoWrap,
    };

    const children = [
      {
        ...createChildNode('child1', 200, 50),
        style: { flexShrink: 1 } as any,
      },
      {
        ...createChildNode('child2', 200, 50),
        style: { flexShrink: 1 } as any,
      },
    ];

    const node = createFlexNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 300, // 小于子项总宽度
      availableHeight: 600,
    });

    const algorithm = new FlexMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result.width).toBeLessThanOrEqual(300);
  });

  it('应该处理 flex-basis', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
    };

    const children = [
      {
        ...createChildNode('child1', 100, 50),
        style: { flexBasis: 150 } as any,
      },
    ];

    const node = createFlexNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new FlexMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result.width).toBeGreaterThanOrEqual(150);
  });

  it('应该处理 order 排序', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
    };

    const children = [
      {
        ...createChildNode('child1', 100, 50),
        style: { order: 2 } as any,
      },
      {
        ...createChildNode('child2', 100, 50),
        style: { order: 1 } as any,
      },
    ];

    const node = createFlexNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new FlexMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result).toBeDefined();
    const layoutData = (result as any).flexLayoutData;
    expect(layoutData.flexItems.length).toBe(2);
    // order 为 1 的项应该在前面
    expect(layoutData.flexItems[0].order).toBeLessThanOrEqual(layoutData.flexItems[1].order);
  });

  it('应该在缺少 style 时抛出错误', () => {
    const node = {
      ...createFlexNode({ layoutType: 'flex' }),
      style: undefined,
    };

    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new FlexMeasureAlgorithm();
    expect(() => algorithm.measure(node, constraintSpace)).toThrow('Node must have flex style');
  });

  it('应该在 layoutType 不匹配时抛出错误', () => {
    const node = createFlexNode({
      layoutType: 'grid' as any,
    });

    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new FlexMeasureAlgorithm();
    expect(() => algorithm.measure(node, constraintSpace)).toThrow('Node must have flex style');
  });
});
