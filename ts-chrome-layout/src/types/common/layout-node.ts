import { ConstraintSpace } from './constraint-space';
import { LayoutStyle } from './style';

/**
 * 布局节点基础接口
 * 所有布局模式共享的基础结构
 */
export interface LayoutNode {
  // 节点标识
  id: string;
  layoutType: 'grid' | 'flex' | 'block' | 'inline' | 'table' | 'none';
  
  // 位置和尺寸
  x: number;
  y: number;
  width: number;
  height: number;
  
  // 内容尺寸（不含 padding/border）
  contentWidth: number;
  contentHeight: number;
  
  // 边距和填充
  margin: BoxStrut;
  padding: BoxStrut;
  border: BoxStrut;
  
  // 子节点
  children: LayoutNode[];
  
  // 约束空间
  constraintSpace?: ConstraintSpace;
  
  // 样式属性（类型由 layoutType 决定）
  style?: LayoutStyle;
  
  // 布局结果缓存
  layoutResult?: LayoutResult;
}

/**
 * 盒子边距结构
 */
export interface BoxStrut {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * 布局结果（通用）
 */
export interface LayoutResult {
  width: number;
  height: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  children?: ChildLayout[];
  
  // 布局特定的额外数据
  [key: string]: any;
}

/**
 * 子项布局结果
 */
export interface ChildLayout {
  node: LayoutNode;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 测量结果（通用）
 */
export interface MeasureResult {
  width: number;
  height: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  
  // 布局特定的额外数据
  [key: string]: any;
}

/**
 * 排列结果（通用）
 */
export interface ArrangeResult {
  x: number;
  y: number;
  width: number;
  height: number;
  children: ChildLayout[];
  
  // 布局特定的额外数据
  [key: string]: any;
}

