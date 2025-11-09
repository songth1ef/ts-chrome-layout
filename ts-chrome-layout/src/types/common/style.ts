/**
 * 布局样式基础接口
 * 所有布局模式的样式都继承此接口
 */
export interface LayoutStyle {
  layoutType: LayoutType;
}

/**
 * 布局类型
 */
export type LayoutType = 'grid' | 'flex' | 'block' | 'inline' | 'table' | 'none';

/**
 * 通用样式属性（所有布局模式共享）
 */
export interface CommonStyle {
  // 尺寸
  width?: number | 'auto';
  height?: number | 'auto';
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  
  // 边距
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  
  // 填充
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  
  // 边框
  borderTop?: number;
  borderRight?: number;
  borderBottom?: number;
  borderLeft?: number;
  
  // 显示
  display?: 'block' | 'inline' | 'flex' | 'grid' | 'none';
  
  // 定位
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: number | 'auto';
  right?: number | 'auto';
  bottom?: number | 'auto';
  left?: number | 'auto';
  
  // 对齐
  textAlign?: 'left' | 'right' | 'center' | 'justify';
  verticalAlign?: 'baseline' | 'top' | 'middle' | 'bottom';
}

