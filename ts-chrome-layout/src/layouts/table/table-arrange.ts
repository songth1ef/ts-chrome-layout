import {
  LayoutNode,
  ArrangeResult,
  ChildLayout,
} from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { MeasureResult } from '../../types/common/layout-node';
import { TableStyle } from '../../types/layouts/table/table-style';
import { TableLayoutData } from '../../types/layouts/table/table-data';

/**
 * Table 排列算法
 * 
 * 对应 Chromium: TableLayoutAlgorithm::Arrange()
 * 
 * 主要步骤：
 * 1. 计算单元格位置
 * 2. 布局子项
 */
export class TableArrangeAlgorithm {
  /**
   * 排列阶段主流程
   */
  arrange(
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    measureResult: MeasureResult
  ): ArrangeResult {
    const style = node.style as TableStyle;
    if (!style || style.layoutType !== 'table') {
      throw new Error('Node must have table style');
    }
    
    // 从 measureResult 获取布局数据
    const layoutData = this.getLayoutDataFromMeasure(measureResult);
    if (!layoutData) {
      return {
        x: 0,
        y: 0,
        width: node.width || 0,
        height: node.height || 0,
        children: [],
      };
    }
    
    // 步骤 1: 计算单元格位置
    this.placeCells(layoutData);
    
    // 步骤 2: 布局子项
    const childLayouts = this.layoutChildren(
      node,
      layoutData,
      constraintSpace
    );
    
    return {
      x: 0,
      y: 0,
      width: layoutData.width,
      height: layoutData.height,
      children: childLayouts,
    };
  }
  
  /**
   * 从测量结果获取布局数据
   */
  private getLayoutDataFromMeasure(measureResult: MeasureResult): TableLayoutData | null {
    if ((measureResult as any).tableLayoutData) {
      return (measureResult as any).tableLayoutData as TableLayoutData;
    }
    return null;
  }
  
  /**
   * 放置单元格
   */
  private placeCells(layoutData: TableLayoutData): void {
    for (const cell of layoutData.cells) {
      const row = layoutData.rows[cell.row];
      const column = layoutData.columns[cell.column];
      
      if (row && column) {
        // 计算单元格位置
        cell.x = column.x;
        cell.y = row.y;
        
        // 计算单元格尺寸（考虑跨度）
        let cellWidth = 0;
        for (let i = 0; i < cell.columnSpan; i++) {
          const col = layoutData.columns[cell.column + i];
          if (col) {
            cellWidth += col.width;
            if (i > 0) {
              cellWidth += layoutData.borderSpacing.horizontal;
            }
          }
        }
        
        let cellHeight = 0;
        for (let i = 0; i < cell.rowSpan; i++) {
          const r = layoutData.rows[cell.row + i];
          if (r) {
            cellHeight += r.height;
            if (i > 0) {
              cellHeight += layoutData.borderSpacing.vertical;
            }
          }
        }
        
        cell.width = cellWidth;
        cell.height = cellHeight;
      }
    }
  }
  
  /**
   * 布局子项
   */
  private layoutChildren(
    _node: LayoutNode,
    layoutData: TableLayoutData,
    _constraintSpace: ConstraintSpace
  ): ChildLayout[] {
    const childLayouts: ChildLayout[] = [];
    
    for (const cell of layoutData.cells) {
      childLayouts.push({
        node: cell.node,
        x: cell.x,
        y: cell.y,
        width: cell.width,
        height: cell.height,
      });
    }
    
    return childLayouts;
  }
}
