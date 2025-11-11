import { LayoutNode } from '../../../types/common/layout-node';
import { GridStyle } from '../../../types/layouts/grid/grid-style';
import { createLayoutNode, BaseNodeConfig } from '../../common/node-factory';

/**
 * Grid 节点配置
 */
export interface GridNodeConfig extends BaseNodeConfig {
  style: GridStyle;
}

/**
 * 创建 Grid 布局节点
 */
export function createGridNode(config: GridNodeConfig): LayoutNode {
  return createLayoutNode(config, 'grid', config.style);
}

