import { LayoutNode } from '../../../types/common/layout-node';
import { FlexStyle } from '../../../types/layouts/flex/flex-style';
import { createLayoutNode, BaseNodeConfig } from '../../common/node-factory';

/**
 * Flex 节点配置
 */
export interface FlexNodeConfig extends BaseNodeConfig {
  style: FlexStyle;
}

/**
 * 创建 Flex 布局节点
 */
export function createFlexNode(config: FlexNodeConfig): LayoutNode {
  return createLayoutNode(config, 'flex', config.style);
}
