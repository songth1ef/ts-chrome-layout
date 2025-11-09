/**
 * Grid 工具函数
 * 
 * 对应 Chromium: grid_layout_utils.h/cc
 */

import { GridItemData } from '../../../types/layouts/grid/grid-data';
import { GridLayoutData } from '../../../types/layouts/grid/grid-data';
import { GridSizingTree } from '../../../types/layouts/grid/grid-tree';
import { GridTrackCollectionImpl } from '../../../data-structures/layouts/grid/grid-track-collection';

/**
 * 检查节点是否为子网格
 * 
 * 对应 Chromium: 检查节点是否为 subgrid
 * 
 * @param node - 可以是 LayoutNode 或 GridItemData
 */
export function isSubgrid(node: any): boolean {
  // 如果传入的是 GridItemData，直接检查其属性
  if (node && typeof node === 'object') {
    if ('isSubgrid' in node && node.isSubgrid === true) {
      return true;
    }
    if (
      ('hasSubgriddedColumns' in node && node.hasSubgriddedColumns === true) ||
      ('hasSubgriddedRows' in node && node.hasSubgriddedRows === true)
    ) {
      return true;
    }
    // 如果传入的是 LayoutNode，检查其样式
    if ('style' in node && node.style) {
      const style = node.style as any;
      if (
        style.layoutType === 'grid' &&
        (style.gridTemplateColumns === 'subgrid' ||
          style.gridTemplateRows === 'subgrid')
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 计算网格区域大小
 * 
 * 对应 Chromium: GridItemData::CalculateAvailableSize()
 * 
 * @param item - 网格项数据
 * @param layoutData - 布局数据
 */
export function calculateGridAreaSize(
  item: GridItemData,
  layoutData: GridLayoutData
): { width: number; height: number } {
  const columns = layoutData.columns as GridTrackCollectionImpl;
  const rows = layoutData.rows as GridTrackCollectionImpl;
  
  const position = item.resolvedPosition;
  
  // 计算列方向的总尺寸
  let width = 0;
  if (columns && columns.sets.length > 0) {
    const columnStart = Math.max(0, position.columnStart);
    const columnEnd = Math.min(
      columns.sets.length,
      Math.max(columnStart + 1, position.columnEnd)
    );
    
    for (let i = columnStart; i < columnEnd; i++) {
      if (i < columns.sets.length) {
        width += columns.getSetSize(i);
      }
    }
  }
  
  // 计算行方向的总尺寸
  let height = 0;
  if (rows && rows.sets.length > 0) {
    const rowStart = Math.max(0, position.rowStart);
    const rowEnd = Math.min(
      rows.sets.length,
      Math.max(rowStart + 1, position.rowEnd)
    );
    
    for (let i = rowStart; i < rowEnd; i++) {
      if (i < rows.sets.length) {
        height += rows.getSetSize(i);
      }
    }
  }
  
  return { width, height };
}

/**
 * 计算总列尺寸
 * 
 * 对应 Chromium: GridLayoutTrackCollection::CalculateSetSpanSize()
 * 
 * @param sizingTree - Grid Sizing Tree，或直接传入 GridLayoutData
 */
export function calculateTotalColumnSize(
  sizingTree: GridSizingTree | GridLayoutData
): number {
  let layoutData: GridLayoutData;
  
  // 如果传入的是 GridSizingTree，获取第一个节点的布局数据
  if ('getNode' in sizingTree && typeof sizingTree.getNode === 'function') {
    const node = sizingTree.getNode(0);
    layoutData = node.layoutData;
  } else {
    // 如果直接传入的是 GridLayoutData
    layoutData = sizingTree as GridLayoutData;
  }
  
  const columns = layoutData.columns as GridTrackCollectionImpl;
  if (!columns || !columns.sets || columns.sets.length === 0) {
    return 0;
  }
  
  let totalSize = 0;
  for (const set of columns.sets) {
    totalSize += set.baseSize * set.trackCount;
  }
  
  return totalSize;
}

/**
 * 计算内在块尺寸
 * 
 * 对应 Chromium: GridLayoutAlgorithm::CalculateIntrinsicBlockSize()
 * 
 * 内在块尺寸是网格容器在块方向（通常是垂直方向）上的最小尺寸，
 * 基于所有行轨道的基础尺寸和网格项的内容需求。
 * 
 * @param gridItems - 网格项数组
 * @param layoutData - 布局数据
 */
export function calculateIntrinsicBlockSize(
  _gridItems: GridItemData[],
  layoutData: GridLayoutData
): number {
  const rows = layoutData.rows as GridTrackCollectionImpl;
  
  // 首先计算所有行轨道的基础尺寸总和
  let totalRowSize = 0;
  if (rows && rows.sets.length > 0) {
    for (const set of rows.sets) {
      totalRowSize += set.baseSize * set.trackCount;
    }
  }
  
  // 然后检查网格项的内容需求
  // 对于跨越多个行的项，需要确保其内容能够适应
  // 这里简化实现：返回行轨道的总尺寸
  // 完整的实现应该考虑：
  // 1. 每个网格项的内容尺寸
  // 2. 网格项跨越的行数
  // 3. 对齐方式的影响
  // 注意：gridItems 参数保留用于未来扩展
  
  return totalRowSize;
}

