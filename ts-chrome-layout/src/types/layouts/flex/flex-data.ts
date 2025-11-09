import type { LayoutNode } from '../../common/layout-node';
import { FlexDirection } from '../../common/enums';

/**
 * Flex 项数据
 * 
 * 对应 Chromium: flex_item.h - FlexItemData
 */
export interface FlexItemData {
  // 节点引用
  node: LayoutNode;
  
  // Flex 项属性
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | 'auto' | 'content';
  
  // 对齐方式
  alignSelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  
  // 顺序
  order?: number;
  
  // 计算后的尺寸
  mainSize?: number;
  crossSize?: number;
  
  // 计算后的位置
  mainOffset?: number;
  crossOffset?: number;
}

/**
 * Flex 容器数据
 * 
 * 对应 Chromium: flex_layout_algorithm.h - FlexLayoutData
 */
export interface FlexLayoutData {
  // 主轴方向
  direction: FlexDirection;
  
  // 主轴总尺寸
  mainSize: number;
  
  // 交叉轴总尺寸
  crossSize: number;
  
  // Flex 项列表
  flexItems: FlexItemData[];
  
  // 主轴可用空间
  availableMainSize: number;
  
  // 交叉轴可用空间
  availableCrossSize: number;
}
