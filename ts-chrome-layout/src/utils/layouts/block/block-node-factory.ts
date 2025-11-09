import { LayoutNode } from '../../../types/common/layout-node';
import { BlockStyle } from '../../../types/layouts/block/block-style';
import { BoxStrut } from '../../../types/common/layout-node';

/**
 * Block 节点配置
 */
export interface BlockNodeConfig {
  id: string;
  style: BlockStyle;
  children?: LayoutNode[];
  margin?: Partial<BoxStrut>;
  padding?: Partial<BoxStrut>;
  border?: Partial<BoxStrut>;
}

/**
 * 创建 Block 布局节点
 */
export function createBlockNode(config: BlockNodeConfig): LayoutNode {
  const defaultBoxStrut: BoxStrut = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  
  return {
    id: config.id,
    layoutType: 'block',
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
