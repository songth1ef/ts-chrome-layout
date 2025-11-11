import { LayoutNode } from '../../../types/common/layout-node';
import { BlockStyle } from '../../../types/layouts/block/block-style';
import { createLayoutNode, BaseNodeConfig } from '../../common/node-factory';

/**
 * Block 节点配置
 */
export interface BlockNodeConfig extends BaseNodeConfig {
  style: BlockStyle;
}

/**
 * 创建 Block 布局节点
 */
export function createBlockNode(config: BlockNodeConfig): LayoutNode {
  return createLayoutNode(config, 'block', config.style);
}
