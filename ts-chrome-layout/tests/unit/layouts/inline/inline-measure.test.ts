/**
 * InlineMeasureAlgorithm 测试
 */

import { InlineMeasureAlgorithm } from '../../../../src/layouts/inline/inline-measure';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { InlineStyle } from '../../../../src/types/layouts/inline/inline-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';

describe('InlineMeasureAlgorithm', () => {
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

  it('应该测量 Inline 节点', () => {
    const style: InlineStyle = {
      layoutType: 'inline',
    };

    const node = createInlineNode(style);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new InlineMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
    expect((result as any).inlineLayoutData).toBeDefined();
  });

  it('应该分行文本', () => {
    const style: InlineStyle = {
      layoutType: 'inline',
      lineHeight: 24,
    };

    const children = [
      createTextNode('text1', 'Hello World'),
      createTextNode('text2', 'This is a long text that should wrap'),
    ];

    const node = createInlineNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 200, // 较小的宽度，应该换行
      availableHeight: 600,
    });

    const algorithm = new InlineMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result).toBeDefined();
    const layoutData = (result as any).inlineLayoutData;
    expect(layoutData.lines.length).toBeGreaterThan(0);
  });

  it('应该计算行高', () => {
    const style: InlineStyle = {
      layoutType: 'inline',
      lineHeight: 30,
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

    const algorithm = new InlineMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result).toBeDefined();
    const layoutData = (result as any).inlineLayoutData;
    if (layoutData.lines.length > 0) {
      expect(layoutData.lines[0].lineHeight).toBeGreaterThanOrEqual(20);
    }
  });

  it('应该处理换行符', () => {
    const style: InlineStyle = {
      layoutType: 'inline',
      lineHeight: 24,
    };

    const children = [
      createTextNode('text1', 'Line 1'),
      createTextNode('text2', '\n'),
      createTextNode('text3', 'Line 2'),
    ];

    const node = createInlineNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new InlineMeasureAlgorithm();
    const result = algorithm.measure(node, constraintSpace);

    expect(result).toBeDefined();
    const layoutData = (result as any).inlineLayoutData;
    expect(layoutData.lines.length).toBeGreaterThanOrEqual(2);
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

    const algorithm = new InlineMeasureAlgorithm();
    expect(() => algorithm.measure(node, constraintSpace)).toThrow('Node must have inline style');
  });
});
