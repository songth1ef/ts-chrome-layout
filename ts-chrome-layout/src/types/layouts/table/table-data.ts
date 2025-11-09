import type { LayoutNode } from '../../common/layout-node';
import { TextDirection, WritingMode } from '../../common/enums';

/**
 * 表格单元格数据
 */
export interface TableCellData {
  // 节点引用
  node: LayoutNode;
  
  // 行和列位置
  row: number;
  column: number;
  
  // 行和列跨度
  rowSpan: number;
  columnSpan: number;
  
  // 计算后的位置
  x: number;
  y: number;
  
  // 计算后的尺寸
  width: number;
  height: number;
  
  // 边框
  border: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * 表格行数据
 */
export interface TableRowData {
  // 行索引
  index: number;
  
  // 单元格列表
  cells: TableCellData[];
  
  // 计算后的位置
  y: number;
  
  // 计算后的高度
  height: number;
}

/**
 * 表格列数据
 */
export interface TableColumnData {
  // 列索引
  index: number;
  
  // 计算后的位置
  x: number;
  
  // 计算后的宽度
  width: number;
  
  // 最小宽度
  minWidth: number;
  
  // 最大宽度
  maxWidth: number;
}

/**
 * Table 容器数据
 * 
 * 对应 Chromium: table_layout_algorithm.h - TableLayoutData
 */
export interface TableLayoutData {
  // 书写模式
  writingMode: WritingMode;
  
  // 文本方向
  direction: TextDirection;
  
  // 表格布局模式
  tableLayout: 'auto' | 'fixed';
  
  // 边框合并模式
  borderCollapse: 'separate' | 'collapse';
  
  // 边框间距
  borderSpacing: {
    horizontal: number;
    vertical: number;
  };
  
  // 容器尺寸
  width: number;
  height: number;
  
  // 行列表
  rows: TableRowData[];
  
  // 列列表
  columns: TableColumnData[];
  
  // 单元格列表
  cells: TableCellData[];
  
  // 标题节点（如果有）
  caption?: LayoutNode;
}
