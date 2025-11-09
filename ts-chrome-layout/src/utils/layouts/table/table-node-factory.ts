import { LayoutNode } from '../../../types/common/layout-node';
import { TableStyle } from '../../../types/layouts/table/table-style';
import { BoxStrut } from '../../../types/common/layout-node';

/**
 * Table 节点配置
 */
export interface TableNodeConfig {
  id: string;
  style: TableStyle;
  children?: LayoutNode[];
  margin?: Partial<BoxStrut>;
  padding?: Partial<BoxStrut>;
  border?: Partial<BoxStrut>;
}

/**
 * 创建 Table 布局节点
 */
export function createTableNode(config: TableNodeConfig): LayoutNode {
  const defaultBoxStrut: BoxStrut = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  
  return {
    id: config.id,
    layoutType: 'table',
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
