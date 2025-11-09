import { CommonStyle } from '../../common/style';

/**
 * Flex 项样式
 * 
 * 对应 Chromium: ComputedStyle 中的 flex 相关属性
 */
export interface FlexItemStyle extends CommonStyle {
  // Flex 属性
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | 'auto' | 'content';
  
  // flex 简写（优先级高于单独属性）
  flex?: string | number;
  
  // 对齐
  alignSelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  
  // 顺序
  order?: number;
}
