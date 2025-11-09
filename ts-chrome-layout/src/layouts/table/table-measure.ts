import { LayoutNode, MeasureResult } from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { TableStyle } from '../../types/layouts/table/table-style';
import {
  TableLayoutData,
  TableCellData,
  TableRowData,
  TableColumnData,
} from '../../types/layouts/table/table-data';
import { WritingMode, TextDirection } from '../../types/common/enums';

/**
 * Table 测量算法
 * 
 * 对应 Chromium: TableLayoutAlgorithm::Measure()
 * 
 * 主要步骤：
 * 1. 构建表格结构（行、列、单元格）
 * 2. 计算列宽
 * 3. 计算行高
 * 4. 计算表格尺寸
 */
export class TableMeasureAlgorithm {
  /**
   * 测量阶段主流程
   */
  measure(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): MeasureResult {
    const style = node.style as TableStyle;
    if (!style || style.layoutType !== 'table') {
      throw new Error('Node must have table style');
    }
    
    // 步骤 1: 构建表格结构
    const { rows, columns, cells } = this.buildTableStructure(node);
    
    // 步骤 2: 确定书写模式
    const writingMode = style.writingMode || WritingMode.HorizontalTb;
    const direction = style.direction || TextDirection.Ltr;
    
    // 步骤 3: 计算可用空间
    const availableWidth = typeof constraintSpace.availableWidth === 'number'
      ? constraintSpace.availableWidth
      : Infinity;
    
    // 步骤 4: 计算列宽
    this.calculateColumnWidths(columns, cells, availableWidth, style);
    
    // 步骤 5: 计算行高
    this.calculateRowHeights(rows, cells, style);
    
    // 步骤 6: 计算表格尺寸
    const tableWidth = this.calculateTableWidth(columns, style);
    const tableHeight = this.calculateTableHeight(rows, style);
    
    // 创建布局数据
    const layoutData: TableLayoutData = {
      writingMode,
      direction,
      tableLayout: style.tableLayout || 'auto',
      borderCollapse: style.borderCollapse || 'separate',
      borderSpacing: style.borderSpacing || { horizontal: 0, vertical: 0 },
      width: tableWidth,
      height: tableHeight,
      rows,
      columns,
      cells,
    };
    
    return {
      width: tableWidth,
      height: tableHeight,
      tableLayoutData: layoutData,
    };
  }
  
  /**
   * 构建表格结构
   */
  private buildTableStructure(node: LayoutNode): {
    rows: TableRowData[];
    columns: TableColumnData[];
    cells: TableCellData[];
  } {
    const rows: TableRowData[] = [];
    const columns: TableColumnData[] = [];
    const cells: TableCellData[] = [];
    
    // 简化实现：假设子节点按顺序排列为行
    let rowIndex = 0;
    let maxColumns = 0;
    
    for (const rowNode of node.children) {
      const rowCells: TableCellData[] = [];
      let columnIndex = 0;
      
      for (const cellNode of rowNode.children || []) {
        const cellStyle = cellNode.style as any;
        const rowSpan = cellStyle?.rowSpan || 1;
        const columnSpan = cellStyle?.columnSpan || 1;
        
        const cell: TableCellData = {
          node: cellNode,
          row: rowIndex,
          column: columnIndex,
          rowSpan,
          columnSpan,
          x: 0,
          y: 0,
          width: cellNode.width || 100,
          height: cellNode.height || 50,
          border: {
            top: cellStyle?.border?.top || 0,
            right: cellStyle?.border?.right || 0,
            bottom: cellStyle?.border?.bottom || 0,
            left: cellStyle?.border?.left || 0,
          },
        };
        
        rowCells.push(cell);
        cells.push(cell);
        columnIndex += columnSpan;
      }
      
      maxColumns = Math.max(maxColumns, columnIndex);
      
      rows.push({
        index: rowIndex,
        cells: rowCells,
        y: 0,
        height: 0,
      });
      
      rowIndex++;
    }
    
    // 创建列
    for (let i = 0; i < maxColumns; i++) {
      columns.push({
        index: i,
        x: 0,
        width: 0,
        minWidth: 0,
        maxWidth: Infinity,
      });
    }
    
    return { rows, columns, cells };
  }
  
  /**
   * 计算列宽
   */
  private calculateColumnWidths(
    columns: TableColumnData[],
    cells: TableCellData[],
    availableWidth: number,
    style: TableStyle
  ): void {
    const tableLayout = style.tableLayout || 'auto';
    const borderSpacing = style.borderSpacing || { horizontal: 0, vertical: 0 };
    
    if (tableLayout === 'fixed' && style.columnWidths) {
      // 固定布局：使用指定的列宽
      for (let i = 0; i < columns.length && i < style.columnWidths.length; i++) {
        columns[i].width = style.columnWidths[i];
      }
    } else {
      // 自动布局：根据内容计算
      // 简化实现：平均分配或根据内容
      const totalBorderSpacing = borderSpacing.horizontal * (columns.length - 1);
      const availableForColumns = availableWidth - totalBorderSpacing;
      
      // 计算每列的最小宽度（基于单元格内容）
      for (const cell of cells) {
        const col = columns[cell.column];
        if (col) {
          col.minWidth = Math.max(col.minWidth, cell.width / cell.columnSpan);
        }
      }
      
      // 分配宽度
      const totalMinWidth = columns.reduce((sum, col) => sum + col.minWidth, 0);
      if (totalMinWidth <= availableForColumns) {
        // 有剩余空间，按比例分配
        for (const col of columns) {
          col.width = col.minWidth + (availableForColumns - totalMinWidth) / columns.length;
        }
      } else {
        // 空间不足，使用最小宽度
        for (const col of columns) {
          col.width = col.minWidth;
        }
      }
    }
    
    // 计算列的位置
    let currentX = 0;
    for (const col of columns) {
      col.x = currentX;
      currentX += col.width + borderSpacing.horizontal;
    }
  }
  
  /**
   * 计算行高
   */
  private calculateRowHeights(
    rows: TableRowData[],
    cells: TableCellData[],
    style: TableStyle
  ): void {
    const borderSpacing = style.borderSpacing || { horizontal: 0, vertical: 0 };
    
    // 计算每行的最小高度（基于单元格内容）
    for (const cell of cells) {
      const row = rows[cell.row];
      if (row) {
        row.height = Math.max(row.height, cell.height / cell.rowSpan);
      }
    }
    
    // 计算行的位置
    let currentY = 0;
    for (const row of rows) {
      row.y = currentY;
      currentY += row.height + borderSpacing.vertical;
    }
  }
  
  /**
   * 计算表格宽度
   */
  private calculateTableWidth(
    columns: TableColumnData[],
    _style: TableStyle
  ): number {
    if (columns.length === 0) {
      return 0;
    }
    
    const lastColumn = columns[columns.length - 1];
    return lastColumn.x + lastColumn.width;
  }
  
  /**
   * 计算表格高度
   */
  private calculateTableHeight(
    rows: TableRowData[],
    _style: TableStyle
  ): number {
    if (rows.length === 0) {
      return 0;
    }
    
    const lastRow = rows[rows.length - 1];
    return lastRow.y + lastRow.height;
  }
}
