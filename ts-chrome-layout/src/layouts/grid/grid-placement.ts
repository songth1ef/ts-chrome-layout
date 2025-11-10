import { GridItemData, GridPlacementData, GridArea } from '../../types/layouts/grid/grid-data';
import { GridStyle } from '../../types/layouts/grid/grid-style';
import { GridLineResolver } from './grid-line-resolver';
import { isIndefiniteSpan } from '../../types/layouts/grid/grid-data';
import { GridAutoFlow, GridTrackDirection } from '../../types/common/enums';

/**
 * Grid 放置算法
 * 
 * 对应 Chromium: grid_placement.h/cc
 * 实现 CSS Grid 自动放置算法
 * 
 * 参考: https://drafts.csswg.org/css-grid/#auto-placement-algo
 */
export class GridPlacementAlgorithm {
  private style: GridStyle;
  private lineResolver: GridLineResolver;
  
  constructor(style: GridStyle, lineResolver: GridLineResolver) {
    this.style = style;
    this.lineResolver = lineResolver;
  }
  
  /**
   * 运行自动放置算法
   * 
   * 对应 Chromium: GridPlacement::RunAutoPlacementAlgorithm()
   * 
   * 算法步骤：
   * 1. 放置非自动项
   * 2. 处理锁定到主轴的项
   * 3. 自动放置剩余项
   */
  runAutoPlacementAlgorithm(gridItems: GridItemData[]): GridPlacementData {
    const positions: GridArea[] = [];
    
    // 步骤 1: 放置非自动项（已有确定位置的项）
    const hasAutoItems = this.placeNonAutoGridItems(gridItems, positions);
    
    // 步骤 2: 处理锁定到主轴的项（如果 grid-auto-flow 是 row/column）
    if (hasAutoItems) {
      this.placeGridItemsLockedToMajorAxis(gridItems, positions);
    }
    
    // 步骤 3: 自动放置剩余项（完全自动的项）
    if (hasAutoItems) {
      this.placeAutoBothAxisGridItem(gridItems, positions);
    }
    
    return {
      lineResolver: this.lineResolver,
      gridItemPositions: positions,
      columnStartOffset: 0,
      rowStartOffset: 0,
    };
  }
  
  /**
   * 放置非自动项
   * 
   * 对应 Chromium: GridPlacement::PlaceNonAutoGridItems()
   * 
   * @returns 是否有需要自动放置的项
   */
  private placeNonAutoGridItems(
    gridItems: GridItemData[],
    positions: GridArea[]
  ): boolean {
    let hasAutoItems = false;
    
    for (let i = 0; i < gridItems.length; i++) {
      const item = gridItems[i];
      const columnSpan = item.columnSpan;
      const rowSpan = item.rowSpan;
      
      // 检查是否有不确定的位置（需要自动放置）
      if (isIndefiniteSpan(columnSpan) || isIndefiniteSpan(rowSpan)) {
        hasAutoItems = true;
        continue;
      }
      
      // 放置有确定位置的项
      positions[i] = {
        columnStart: columnSpan.start,
        columnEnd: columnSpan.end,
        rowStart: rowSpan.start,
        rowEnd: rowSpan.end,
      };
    }
    
    return hasAutoItems;
  }
  
  /**
   * 放置锁定到主轴的项
   * 
   * 对应 Chromium: GridPlacement::PlaceGridItemsLockedToMajorAxis()
   * 
   * 处理 grid-auto-flow: row 或 column 的情况
   * - row: 按行顺序放置，列位置确定时自动放置行位置
   * - column: 按列顺序放置，行位置确定时自动放置列位置
   */
  private placeGridItemsLockedToMajorAxis(
    gridItems: GridItemData[],
    positions: GridArea[]
  ): void {
    const autoFlow = this.style.gridAutoFlow || GridAutoFlow.Row;
    const isRowFlow = autoFlow === GridAutoFlow.Row || autoFlow === GridAutoFlow.RowDense;
    const isDense = autoFlow === GridAutoFlow.RowDense || autoFlow === GridAutoFlow.ColumnDense;
    
    // 构建占用网格
    const occupied = this.buildOccupiedGrid(positions);
    
    // 获取显式网格大小
    const explicitColumnCount = this.lineResolver.explicitGridTrackCount(
      GridTrackDirection.Column
    );
    const explicitRowCount = this.lineResolver.explicitGridTrackCount(
      GridTrackDirection.Row
    );
    
    if (isRowFlow) {
      // 行流：列位置确定，行位置自动
      let cursor = { row: 0 };
      
      for (let i = 0; i < gridItems.length; i++) {
        if (positions[i]) {
          continue;
        }
        
        const item = gridItems[i];
        const columnSpan = item.columnSpan;
        const rowSpan = item.rowSpan;
        
        // 只处理列位置确定、行位置自动的项
        if (!isIndefiniteSpan(columnSpan) && isIndefiniteSpan(rowSpan)) {
          const rowSize = rowSpan.size || 1;
          
          // 查找可用行位置
          let rowStart = cursor.row;
          if (isDense) {
            // 密集模式：从开始查找第一个可用位置
            rowStart = this.findFirstAvailableRow(
              columnSpan.start,
              columnSpan.end,
              rowSize,
              occupied,
              explicitRowCount
            );
          } else {
            // 稀疏模式：从游标位置查找
            rowStart = this.findNextAvailableRow(
              columnSpan.start,
              columnSpan.end,
              rowSize,
              occupied,
              rowStart,
              explicitRowCount
            );
          }
          
          positions[i] = {
            columnStart: columnSpan.start,
            columnEnd: columnSpan.end,
            rowStart,
            rowEnd: rowStart + rowSize,
          };
          
          // 更新占用网格
          this.markOccupied(positions[i], occupied);
          
          // 更新游标（稀疏模式）
          if (!isDense) {
            cursor.row = rowStart + rowSize;
          }
        }
      }
    } else {
      // 列流：行位置确定，列位置自动
      let cursor = { column: 0 };
      
      for (let i = 0; i < gridItems.length; i++) {
        if (positions[i]) {
          continue;
        }
        
        const item = gridItems[i];
        const columnSpan = item.columnSpan;
        const rowSpan = item.rowSpan;
        
        // 只处理行位置确定、列位置自动的项
        if (isIndefiniteSpan(columnSpan) && !isIndefiniteSpan(rowSpan)) {
          const columnSize = columnSpan.size || 1;
          
          // 查找可用列位置
          let columnStart = cursor.column;
          if (isDense) {
            // 密集模式：从开始查找第一个可用位置
            columnStart = this.findFirstAvailableColumn(
              rowSpan.start,
              rowSpan.end,
              columnSize,
              occupied,
              explicitColumnCount
            );
          } else {
            // 稀疏模式：从游标位置查找
            columnStart = this.findNextAvailableColumn(
              rowSpan.start,
              rowSpan.end,
              columnSize,
              occupied,
              columnStart,
              explicitColumnCount
            );
          }
          
          positions[i] = {
            columnStart,
            columnEnd: columnStart + columnSize,
            rowStart: rowSpan.start,
            rowEnd: rowSpan.end,
          };
          
          // 更新占用网格
          this.markOccupied(positions[i], occupied);
          
          // 更新游标（稀疏模式）
          if (!isDense) {
            cursor.column = columnStart + columnSize;
          }
        }
      }
    }
  }
  
  /**
   * 自动放置剩余项
   * 
   * 对应 Chromium: GridPlacement::PlaceAutoBothAxisGridItem()
   * 
   * 处理完全自动的项（grid-column: auto / grid-row: auto）
   * 支持 grid-auto-flow: row / column / row-dense / column-dense
   */
  private placeAutoBothAxisGridItem(
    gridItems: GridItemData[],
    positions: GridArea[]
  ): void {
    const autoFlow = this.style.gridAutoFlow || GridAutoFlow.Row;
    const isRowFlow = autoFlow === GridAutoFlow.Row || autoFlow === GridAutoFlow.RowDense;
    const isDense = autoFlow === GridAutoFlow.RowDense || autoFlow === GridAutoFlow.ColumnDense;
    
    // 构建占用网格
    const occupied = this.buildOccupiedGrid(positions);
    
    // 获取显式网格大小
    const explicitColumnCount = this.lineResolver.explicitGridTrackCount(
      GridTrackDirection.Column
    );
    const explicitRowCount = this.lineResolver.explicitGridTrackCount(
      GridTrackDirection.Row
    );
    
    // 游标位置
    let cursor = { row: 0, column: 0 };
    
    // 放置自动项
    for (let i = 0; i < gridItems.length; i++) {
      if (positions[i]) {
        continue;
      }
      
      const item = gridItems[i];
      const columnSpan = item.columnSpan;
      const rowSpan = item.rowSpan;
      
      const spanSize = {
        column: columnSpan.size || 1,
        row: rowSpan.size || 1,
      };
      
      // 查找可用位置
      let position: GridArea | null = null;
      
      if (isDense) {
        // 密集模式：从开始查找第一个可用位置
        position = this.findFirstAvailablePosition(
          spanSize,
          occupied,
          explicitColumnCount,
          explicitRowCount
        );
      } else {
        // 稀疏模式：按流方向查找
        if (isRowFlow) {
          // 行流：从左到右，从上到下
          position = this.findNextAvailablePositionRowFlow(
            spanSize,
            occupied,
            cursor,
            explicitColumnCount,
            explicitRowCount
          );
          if (position) {
            cursor.column = position.columnEnd;
            if (cursor.column >= explicitColumnCount) {
              cursor.column = 0;
              cursor.row = position.rowEnd;
            }
          }
        } else {
          // 列流：从上到下，从左到右
          position = this.findNextAvailablePositionColumnFlow(
            spanSize,
            occupied,
            cursor,
            explicitColumnCount,
            explicitRowCount
          );
          if (position) {
            cursor.row = position.rowEnd;
            if (cursor.row >= explicitRowCount) {
              cursor.row = 0;
              cursor.column = position.columnEnd;
            }
          }
        }
      }
      
      if (position) {
        positions[i] = position;
        this.markOccupied(position, occupied);
      }
    }
  }
  
  /**
   * 构建占用网格
   */
  private buildOccupiedGrid(positions: GridArea[]): Set<string> {
    const occupied = new Set<string>();
    
    for (const pos of positions) {
      if (pos) {
        for (let r = pos.rowStart; r < pos.rowEnd; r++) {
          for (let c = pos.columnStart; c < pos.columnEnd; c++) {
            occupied.add(`${r},${c}`);
          }
        }
      }
    }
    
    return occupied;
  }
  
  /**
   * 标记位置为占用
   */
  private markOccupied(position: GridArea, occupied: Set<string>): void {
    for (let r = position.rowStart; r < position.rowEnd; r++) {
      for (let c = position.columnStart; c < position.columnEnd; c++) {
        occupied.add(`${r},${c}`);
      }
    }
  }
  
  /**
   * 查找第一个可用行位置（密集模式）
   */
  private findFirstAvailableRow(
    columnStart: number,
    columnEnd: number,
    rowSize: number,
    occupied: Set<string>,
    maxRow: number
  ): number {
    for (let row = 0; row <= maxRow; row++) {
      if (this.canPlaceAt(row, columnStart, rowSize, columnEnd - columnStart, occupied)) {
        return row;
      }
    }
    return maxRow; // 如果找不到，返回最大行
  }
  
  /**
   * 查找下一个可用行位置（稀疏模式）
   */
  private findNextAvailableRow(
    columnStart: number,
    columnEnd: number,
    rowSize: number,
    occupied: Set<string>,
    startRow: number,
    maxRow: number
  ): number {
    for (let row = startRow; row <= maxRow; row++) {
      if (this.canPlaceAt(row, columnStart, rowSize, columnEnd - columnStart, occupied)) {
        return row;
      }
    }
    return maxRow; // 如果找不到，返回最大行
  }
  
  /**
   * 查找第一个可用列位置（密集模式）
   */
  private findFirstAvailableColumn(
    rowStart: number,
    rowEnd: number,
    columnSize: number,
    occupied: Set<string>,
    maxColumn: number
  ): number {
    for (let col = 0; col <= maxColumn; col++) {
      if (this.canPlaceAt(rowStart, col, rowEnd - rowStart, columnSize, occupied)) {
        return col;
      }
    }
    return maxColumn; // 如果找不到，返回最大列
  }
  
  /**
   * 查找下一个可用列位置（稀疏模式）
   */
  private findNextAvailableColumn(
    rowStart: number,
    rowEnd: number,
    columnSize: number,
    occupied: Set<string>,
    startColumn: number,
    maxColumn: number
  ): number {
    for (let col = startColumn; col <= maxColumn; col++) {
      if (this.canPlaceAt(rowStart, col, rowEnd - rowStart, columnSize, occupied)) {
        return col;
      }
    }
    return maxColumn; // 如果找不到，返回最大列
  }
  
  /**
   * 查找第一个可用位置（密集模式）
   */
  private findFirstAvailablePosition(
    spanSize: { column: number; row: number },
    occupied: Set<string>,
    maxColumn: number,
    maxRow: number
  ): GridArea | null {
    for (let r = 0; r <= maxRow; r++) {
      for (let c = 0; c <= maxColumn; c++) {
        if (this.canPlaceAt(r, c, spanSize.row, spanSize.column, occupied)) {
          return {
            columnStart: c,
            columnEnd: c + spanSize.column,
            rowStart: r,
            rowEnd: r + spanSize.row,
          };
        }
      }
    }
    return null;
  }
  
  /**
   * 查找下一个可用位置（行流，稀疏模式）
   */
  private findNextAvailablePositionRowFlow(
    spanSize: { column: number; row: number },
    occupied: Set<string>,
    cursor: { row: number; column: number },
    maxColumn: number,
    maxRow: number
  ): GridArea | null {
    for (let r = cursor.row; r <= maxRow; r++) {
      const startCol = r === cursor.row ? cursor.column : 0;
      for (let c = startCol; c <= maxColumn; c++) {
        if (this.canPlaceAt(r, c, spanSize.row, spanSize.column, occupied)) {
          return {
            columnStart: c,
            columnEnd: c + spanSize.column,
            rowStart: r,
            rowEnd: r + spanSize.row,
          };
        }
      }
    }
    return null;
  }
  
  /**
   * 查找下一个可用位置（列流，稀疏模式）
   */
  private findNextAvailablePositionColumnFlow(
    spanSize: { column: number; row: number },
    occupied: Set<string>,
    cursor: { row: number; column: number },
    maxColumn: number,
    maxRow: number
  ): GridArea | null {
    for (let c = cursor.column; c <= maxColumn; c++) {
      const startRow = c === cursor.column ? cursor.row : 0;
      for (let r = startRow; r <= maxRow; r++) {
        if (this.canPlaceAt(r, c, spanSize.row, spanSize.column, occupied)) {
          return {
            columnStart: c,
            columnEnd: c + spanSize.column,
            rowStart: r,
            rowEnd: r + spanSize.row,
          };
        }
      }
    }
    return null;
  }
  
  /**
   * 检查是否可以在指定位置放置
   * 
   * 优化：提前终止检查，避免不必要的循环
   */
  private canPlaceAt(
    rowStart: number,
    columnStart: number,
    rowSize: number,
    columnSize: number,
    occupied: Set<string>
  ): boolean {
    // 边界检查：确保位置在有效范围内
    if (rowStart < 0 || columnStart < 0 || rowSize <= 0 || columnSize <= 0) {
      return false;
    }
    
    // 优化：先检查边界单元格，通常冲突更容易发生在边界
    const rowEnd = rowStart + rowSize;
    const columnEnd = columnStart + columnSize;
    
    // 检查四个角
    if (occupied.has(`${rowStart},${columnStart}`) ||
        occupied.has(`${rowStart},${columnEnd - 1}`) ||
        occupied.has(`${rowEnd - 1},${columnStart}`) ||
        occupied.has(`${rowEnd - 1},${columnEnd - 1}`)) {
      return false;
    }
    
    // 检查所有单元格
    for (let r = rowStart; r < rowEnd; r++) {
      for (let c = columnStart; c < columnEnd; c++) {
        if (occupied.has(`${r},${c}`)) {
          return false;
        }
      }
    }
    return true;
  }
  
}

