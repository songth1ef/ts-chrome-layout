import { GridItemData, GridPlacementData, GridArea } from '../../types/layouts/grid/grid-data';
import { GridStyle } from '../../types/layouts/grid/grid-style';
import { GridLineResolver } from './grid-line-resolver';
import { isIndefiniteSpan } from '../../types/layouts/grid/grid-data';

/**
 * Grid 放置算法
 * 
 * 对应 Chromium: grid_placement.h/cc
 * 实现 CSS Grid 自动放置算法
 * 
 * 参考: https://drafts.csswg.org/css-grid/#auto-placement-algo
 */
export class GridPlacementAlgorithm {
  // private _style: GridStyle; // 保留用于未来扩展
  private lineResolver: GridLineResolver;
  
  constructor(_style: GridStyle, lineResolver: GridLineResolver) {
    // this._style = style;
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
   */
  private placeGridItemsLockedToMajorAxis(
    gridItems: GridItemData[],
    positions: GridArea[]
  ): void {
    // 简化的实现：按顺序放置
    // TODO: 实现完整的锁定到主轴算法（考虑 grid-auto-flow）
    let cursor = { row: 0, column: 0 };
    
    for (let i = 0; i < gridItems.length; i++) {
      if (positions[i]) {
        // 已放置，跳过
        continue;
      }
      
      const item = gridItems[i];
      const columnSpan = item.columnSpan;
      const rowSpan = item.rowSpan;
      
      // 如果列位置确定，行位置自动
      if (!isIndefiniteSpan(columnSpan) && isIndefiniteSpan(rowSpan)) {
        positions[i] = {
          columnStart: columnSpan.start,
          columnEnd: columnSpan.end,
          rowStart: cursor.row,
          rowEnd: cursor.row + (rowSpan.size || 1),
        };
        cursor.row = positions[i].rowEnd;
      }
      // 如果行位置确定，列位置自动
      else if (isIndefiniteSpan(columnSpan) && !isIndefiniteSpan(rowSpan)) {
        positions[i] = {
          columnStart: cursor.column,
          columnEnd: cursor.column + (columnSpan.size || 1),
          rowStart: rowSpan.start,
          rowEnd: rowSpan.end,
        };
        cursor.column = positions[i].columnEnd;
      }
    }
  }
  
  /**
   * 自动放置剩余项
   * 
   * 对应 Chromium: GridPlacement::PlaceAutoBothAxisGridItem()
   * 
   * 处理完全自动的项（grid-column: auto / grid-row: auto）
   */
  private placeAutoBothAxisGridItem(
    gridItems: GridItemData[],
    positions: GridArea[]
  ): void {
    // 简化的自动放置：按顺序从左到右、从上到下
    // TODO: 实现完整的自动放置算法（包括密集模式和 grid-auto-flow）
    let cursor = { row: 0, column: 0 };
    const occupied = new Set<string>();
    
    // 标记已占用的位置
    for (let i = 0; i < positions.length; i++) {
      if (positions[i]) {
        const pos = positions[i];
        for (let r = pos.rowStart; r < pos.rowEnd; r++) {
          for (let c = pos.columnStart; c < pos.columnEnd; c++) {
            occupied.add(`${r},${c}`);
          }
        }
      }
    }
    
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
      let placed = false;
      for (let r = cursor.row; r < 100 && !placed; r++) {
        for (let c = cursor.column; c < 100 && !placed; c++) {
          // 检查是否可以放置在这里
          let canPlace = true;
          for (let dr = 0; dr < spanSize.row && canPlace; dr++) {
            for (let dc = 0; dc < spanSize.column && canPlace; dc++) {
              if (occupied.has(`${r + dr},${c + dc}`)) {
                canPlace = false;
              }
            }
          }
          
          if (canPlace) {
            positions[i] = {
              columnStart: c,
              columnEnd: c + spanSize.column,
              rowStart: r,
              rowEnd: r + spanSize.row,
            };
            
            // 标记为占用
            for (let dr = 0; dr < spanSize.row; dr++) {
              for (let dc = 0; dc < spanSize.column; dc++) {
                occupied.add(`${r + dr},${c + dc}`);
              }
            }
            
            cursor.column = c + spanSize.column;
            placed = true;
          }
        }
        if (!placed) {
          cursor.column = 0;
        }
      }
    }
  }
}

