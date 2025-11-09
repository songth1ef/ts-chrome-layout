import { LayoutStyle } from '../../common/style';
import { TextDirection, WritingMode } from '../../common/enums';

/**
 * Block 样式配置
 * 继承自 LayoutStyle，添加 Block 特定属性
 */
export interface BlockStyle extends LayoutStyle {
  layoutType: 'block';
  
  // 书写方向
  writingMode?: WritingMode;
  direction?: TextDirection;
  
  // 定位
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  
  // 浮动
  float?: 'none' | 'left' | 'right';
  clear?: 'none' | 'left' | 'right' | 'both';
  
  // 尺寸
  width?: number | 'auto';
  height?: number | 'auto';
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  
  // 边距和填充
  margin?: { top: number; right: number; bottom: number; left: number };
  padding?: { top: number; right: number; bottom: number; left: number };
  border?: { top: number; right: number; bottom: number; left: number };
  
  // 溢出
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  // 显示
  display?: 'block' | 'inline-block' | 'none';
}
