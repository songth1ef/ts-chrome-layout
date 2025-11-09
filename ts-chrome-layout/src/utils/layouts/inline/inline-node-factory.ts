import { LayoutNode } from '../../../types/common/layout-node';
import { InlineStyle } from '../../../types/layouts/inline/inline-style';
import { BoxStrut } from '../../../types/common/layout-node';

/**
 * Inline 节点配置
 */
export interface InlineNodeConfig {
  id: string;
  style: InlineStyle;
  children?: LayoutNode[];
  margin?: Partial<BoxStrut>;
  padding?: Partial<BoxStrut>;
  border?: Partial<BoxStrut>;
}

/**
 * 创建 Inline 布局节点
 */
export function createInlineNode(config: InlineNodeConfig): LayoutNode {
  const defaultBoxStrut: BoxStrut = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  
  return {
    id: config.id,
    layoutType: 'inline',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    contentWidth: 0,
    contentHeight: 0,
    margin: { ...defaultBoxStrut, ...config.margin },
    padding: { ...defaultBoxStrut, ...config.padding },
    border: { ...defaultBoxStrut, ...config.border },
    children: config.children || [],
    style: config.style,
  };
}
