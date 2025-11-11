import { LayoutNode } from '../../types/common/layout-node';
import { LayoutType, LayoutStyle } from '../../types/common/style';
import { BoxStrut } from '../../types/common/layout-node';

/**
 * 通用节点配置接口
 */
export interface BaseNodeConfig {
  id: string;
  children?: LayoutNode[];
  margin?: Partial<BoxStrut>;
  padding?: Partial<BoxStrut>;
  border?: Partial<BoxStrut>;
}

/**
 * 默认的 BoxStrut 值
 */
const DEFAULT_BOX_STRUT: BoxStrut = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

/**
 * 创建布局节点的通用工厂函数
 */
export function createLayoutNode<T extends BaseNodeConfig & { style: LayoutStyle }>(
  config: T,
  layoutType: LayoutType,
  style: LayoutStyle
): LayoutNode {
  return {
    id: config.id,
    layoutType,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    contentWidth: 0,
    contentHeight: 0,
    margin: { ...DEFAULT_BOX_STRUT, ...config.margin },
    padding: { ...DEFAULT_BOX_STRUT, ...config.padding },
    border: { ...DEFAULT_BOX_STRUT, ...config.border },
    children: config.children || [],
    style,
  };
}
