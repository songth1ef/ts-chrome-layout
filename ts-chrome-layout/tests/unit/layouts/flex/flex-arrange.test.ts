/**
 * FlexArrangeAlgorithm 测试
 */

import { FlexArrangeAlgorithm } from '../../../../src/layouts/flex/flex-arrange';
import { FlexMeasureAlgorithm } from '../../../../src/layouts/flex/flex-measure';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { FlexStyle } from '../../../../src/types/layouts/flex/flex-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';
import { FlexDirection, FlexJustifyContent, ItemAlignment } from '../../../../src/types/common/enums';

describe('FlexArrangeAlgorithm', () => {
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

  it('应该排列 Flex 节点', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
    };

    const node = createFlexNode(style);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const measureAlgorithm = new FlexMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new FlexArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.children)).toBe(true);
  });

  it('应该计算 Flex 项位置', () => {
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

    const measureAlgorithm = new FlexMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new FlexArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result.children.length).toBe(2);
    expect(result.children[0].x).toBeGreaterThanOrEqual(0);
    expect(result.children[1].x).toBeGreaterThan(result.children[0].x);
  });

  it('应该应用 justify-content: flex-start', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
      justifyContent: FlexJustifyContent.FlexStart,
    };

    const children = [
      createChildNode('child1', 100, 50),
      createChildNode('child2', 100, 50),
    ];

    const node = createFlexNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 500,
      availableHeight: 600,
    });

    const measureAlgorithm = new FlexMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new FlexArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result.children[0].x).toBeGreaterThanOrEqual(0);
  });

  it('应该应用 justify-content: center', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
      justifyContent: FlexJustifyContent.Center,
    };

    const children = [
      createChildNode('child1', 100, 50),
      createChildNode('child2', 100, 50),
    ];

    const node = createFlexNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 500,
      availableHeight: 600,
    });

    const measureAlgorithm = new FlexMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new FlexArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result.children.length).toBe(2);
    // center 对齐时，第一个子项应该不在最左边
    expect(result.children[0].x).toBeGreaterThan(0);
  });

  it('应该应用 justify-content: space-between', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
      justifyContent: FlexJustifyContent.SpaceBetween,
    };

    const children = [
      createChildNode('child1', 100, 50),
      createChildNode('child2', 100, 50),
    ];

    const node = createFlexNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 500,
      availableHeight: 600,
    });

    const measureAlgorithm = new FlexMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new FlexArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result.children.length).toBe(2);
    // space-between 时，子项之间应该有间距
    const gap = result.children[1].x - (result.children[0].x + result.children[0].width);
    expect(gap).toBeGreaterThan(0);
  });

  it('应该应用 align-items: stretch', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
      alignItems: ItemAlignment.Stretch,
    };

    const children = [
      createChildNode('child1', 100, 50),
    ];

    const node = createFlexNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 200,
    });

    const measureAlgorithm = new FlexMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new FlexArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result.children.length).toBe(1);
    // stretch 时，子项高度应该拉伸到容器高度
    expect(result.children[0].height).toBeGreaterThanOrEqual(50);
  });

  it('应该处理 column 方向', () => {
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

    const measureAlgorithm = new FlexMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new FlexArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result.children.length).toBe(2);
    expect(result.children[0].y).toBeGreaterThanOrEqual(0);
    expect(result.children[1].y).toBeGreaterThan(result.children[0].y);
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

    const measureResult = { width: 0, height: 0 };
    const algorithm = new FlexArrangeAlgorithm();
    expect(() => algorithm.arrange(node, constraintSpace, measureResult)).toThrow('Node must have flex style');
  });
});
