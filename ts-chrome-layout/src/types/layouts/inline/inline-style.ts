import { LayoutStyle } from '../../common/style';
import { TextDirection, WritingMode } from '../../common/enums';

/**
 * Inline 样式配置
 * 继承自 LayoutStyle，添加 Inline 特定属性
 */
export interface InlineStyle extends LayoutStyle {
  layoutType: 'inline';
  
  // 书写方向
  writingMode?: WritingMode;
  direction?: TextDirection;
  
  // 文本对齐
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';
  
  // 行高
  lineHeight?: number | 'normal';
  
  // 垂直对齐
  verticalAlign?: 'baseline' | 'top' | 'middle' | 'bottom' | 'sub' | 'super' | 'text-top' | 'text-bottom';
  
  // 空白处理
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line';
  
  // 单词换行
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word';
  wordWrap?: 'normal' | 'break-word';
  
  // 文本装饰
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
  
  // 文本转换
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}
