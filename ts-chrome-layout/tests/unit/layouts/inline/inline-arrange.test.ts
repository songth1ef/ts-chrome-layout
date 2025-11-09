/**
 * InlineArrangeAlgorithm 测试
 */

import { InlineArrangeAlgorithm } from '../../../../src/layouts/inline/inline-arrange';
import { InlineMeasureAlgorithm } from '../../../../src/layouts/inline/inline-measure';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { InlineStyle } from '../../../../src/types/layouts/inline/inline-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';

describe('InlineArrangeAlgorithm', () => {
  const createInlineNode = (style: InlineStyle, children: LayoutNode[] = []): LayoutNode => ({
    id: 'inline-container',
    layoutType: 'inline',
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

  const createTextNode = (id: string, text: string, width: number = text.length * 8): LayoutNode => ({
    id,
    layoutType: 'none',
    x: 0,
    y: 0,
    width,
    height: 20,
    contentWidth: width,
    contentHeight: 20,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    border: { top: 0, right: 0, bottom: 0, left: 0 },
    children: [],
    text,
  } as any);

  it('应该排列 Inline 节点', () => {
    const style: InlineStyle = {
      layoutType: 'inline',
    };

    const node = createInlineNode(style);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const measureAlgorithm = new InlineMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new InlineArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.children)).toBe(true);
  });

  it('应该应用文本对齐 left', () => {
    const style: InlineStyle = {
      layoutType: 'inline',
      textAlign: 'left',
    };

    const children = [
      createTextNode('text1', 'Hello'),
      createTextNode('text2', 'World'),
    ];

    const node = createInlineNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const measureAlgorithm = new InlineMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new InlineArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result.children.length).toBeGreaterThan(0);
  });

  it('应该应用文本对齐 center', () => {
    const style: InlineStyle = {
      layoutType: 'inline',
      textAlign: 'center',
    };

    const children = [
      createTextNode('text1', 'Hello'),
    ];

    const node = createInlineNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const measureAlgorithm = new InlineMeasureAlgorithm();
    const measureResult = measureAlgorithm.measure(node, constraintSpace);

    const algorithm = new InlineArrangeAlgorithm();
    const result = algorithm.arrange(node, constraintSpace, measureResult);

    expect(result).toBeDefined();
  });

  it('应该在缺少 style 时抛出错误', () => {
    const node = {
      ...createInlineNode({ layoutType: 'inline' }),
      style: undefined,
    };

    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const measureResult = { width: 0, height: 0 };
    const algorithm = new InlineArrangeAlgorithm();
    expect(() => algorithm.arrange(node, constraintSpace, measureResult)).toThrow('Node must have inline style');
  });
});
