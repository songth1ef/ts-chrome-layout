import { LayoutStyle } from '../../common/style';
import {
  FlexDirection,
  FlexWrap,
  FlexJustifyContent,
  ItemAlignment,
} from '../../common/enums';

/**
 * Flex 样式配置
 * 继承自 LayoutStyle，添加 Flex 特定属性
 */
export interface FlexStyle extends LayoutStyle {
  layoutType: 'flex';
  
  // 方向
  flexDirection?: FlexDirection;
  
  // 换行
  flexWrap?: FlexWrap;
  
  // 主轴对齐
  justifyContent?: FlexJustifyContent;
  
  // 交叉轴对齐
  alignItems?: ItemAlignment;
  alignContent?: ItemAlignment;
  
  // 间距
  gap?: number;
  rowGap?: number;
  columnGap?: number;
}
