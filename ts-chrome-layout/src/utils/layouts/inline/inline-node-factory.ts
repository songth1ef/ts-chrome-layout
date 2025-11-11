import { LayoutNode } from '../../../types/common/layout-node';
import { InlineStyle } from '../../../types/layouts/inline/inline-style';
import { createLayoutNode, BaseNodeConfig } from '../../common/node-factory';

/**
 * Inline 节点配置
 */
export interface InlineNodeConfig extends BaseNodeConfig {
  style: InlineStyle;
}

/**
 * 创建 Inline 布局节点
 */
export function createInlineNode(config: InlineNodeConfig): LayoutNode {
  return createLayoutNode(config, 'inline', config.style);
}
