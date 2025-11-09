import { LayoutStyle } from '../../common/style';
import { TextDirection, WritingMode } from '../../common/enums';

/**
 * Table 样式配置
 * 继承自 LayoutStyle，添加 Table 特定属性
 */
export interface TableStyle extends LayoutStyle {
  layoutType: 'table';
  
  // 书写方向
  writingMode?: WritingMode;
  direction?: TextDirection;
  
  // 表格布局
  tableLayout?: 'auto' | 'fixed';
  
  // 边框合并
  borderCollapse?: 'separate' | 'collapse';
  
  // 边框间距
  borderSpacing?: {
    horizontal: number;
    vertical: number;
  };
  
  // 标题位置
  captionSide?: 'top' | 'bottom';
  
  // 空单元格
  emptyCells?: 'show' | 'hide';
  
  // 尺寸
  width?: number | 'auto';
  height?: number | 'auto';
  
  // 列宽
  columnWidths?: number[];
}
