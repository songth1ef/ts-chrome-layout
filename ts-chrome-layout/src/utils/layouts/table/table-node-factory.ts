import { LayoutNode } from '../../../types/common/layout-node';
import { TableStyle } from '../../../types/layouts/table/table-style';
import { createLayoutNode, BaseNodeConfig } from '../../common/node-factory';

/**
 * Table 节点配置
 */
export interface TableNodeConfig extends BaseNodeConfig {
  style: TableStyle;
}

/**
 * 创建 Table 布局节点
 */
export function createTableNode(config: TableNodeConfig): LayoutNode {
  return createLayoutNode(config, 'table', config.style);
}
