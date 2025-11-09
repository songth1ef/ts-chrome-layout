/**
 * InlineLayoutAlgorithm 测试
 */

import { InlineLayoutAlgorithm } from '../../../../src/layouts/inline/inline-layout-algorithm';
import { createConstraintSpace } from '../../../../src/utils/common/constraint-space-factory';
import { InlineStyle } from '../../../../src/types/layouts/inline/inline-style';
import { LayoutNode } from '../../../../src/types/common/layout-node';

describe('InlineLayoutAlgorithm', () => {
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

  const createTextNode = (id: string, text: string): LayoutNode => ({
    id,
    layoutType: 'none',
    x: 0,
    y: 0,
    width: text.length * 8,
    height: 20,
    contentWidth: text.length * 8,
    contentHeight: 20,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    border: { top: 0, right: 0, bottom: 0, left: 0 },
    children: [],
    text,
  } as any);

  it('应该执行完整布局流程', () => {
    const style: InlineStyle = {
      layoutType: 'inline',
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

    const algorithm = new InlineLayoutAlgorithm();
    const result = algorithm.layout(node, constraintSpace);

    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
  });

  it('应该计算最小最大尺寸', () => {
    const style: InlineStyle = {
      layoutType: 'inline',
    };

    const children = [
      createTextNode('text1', 'Hello'),
    ];

    const node = createInlineNode(style, children);
    const constraintSpace = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });

    const algorithm = new InlineLayoutAlgorithm();
    const minMax = algorithm.computeMinMaxSizes(node, constraintSpace);

    expect(minMax).toBeDefined();
    expect(minMax.min).toBeGreaterThanOrEqual(0);
    expect(minMax.max).toBeGreaterThanOrEqual(minMax.min);
  });
});
