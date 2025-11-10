import {
  LayoutNode,
  ArrangeResult,
  ChildLayout,
} from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { MeasureResult } from '../../types/common/layout-node';
import { GridStyle } from '../../types/layouts/grid/grid-style';
import { GridItemData, GridLayoutData } from '../../types/layouts/grid/grid-data';
import { GridTrackCollectionImpl } from '../../data-structures/layouts/grid/grid-track-collection';
import { ContentAlignment, ItemAlignment } from '../../types/common/enums';

/**
 * Grid 排列算法
 * 
 * 对应 Chromium: GridLayoutAlgorithm::PlaceGridItems()
 * 
 * 主要步骤：
 * 1. 计算网格项位置
 * 2. 应用对齐
 * 3. 布局子项
 * 4. 计算最终尺寸
 */
export class GridArrangeAlgorithm {
  /**
   * 排列阶段主流程
   * 
   * 对应 Chromium: GridLayoutAlgorithm::PlaceGridItems()
   */
  arrange(
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    measureResult: MeasureResult
  ): ArrangeResult {
    const style = node.style as GridStyle;
    if (!style || style.layoutType !== 'grid') {
      throw new Error('Node must have grid style');
    }
    
    // 从 measureResult 获取布局数据
    const layoutData = this.getLayoutDataFromMeasure(measureResult);
    if (!layoutData) {
      throw new Error('Grid layout data not found in measure result');
    }
    
    // 步骤 1: 计算网格项位置和偏移
    const itemPlacements = this.placeGridItems(
      node,
      layoutData,
      measureResult
    );
    
    // 步骤 2: 应用对齐
    // 对应 Chromium: 应用 align-content, justify-content 等
    const alignmentOffsets = this.applyAlignment(node, layoutData, itemPlacements);
    
    // 应用对齐偏移到所有项
    for (const placement of itemPlacements) {
      placement.x += alignmentOffsets.offsetX;
      placement.y += alignmentOffsets.offsetY;
    }
    
    // 步骤 3: 布局子项
    const childLayouts = this.layoutChildren(
      node,
      itemPlacements,
      constraintSpace,
      layoutData
    );
    
    // 步骤 4: 计算最终尺寸
    const finalSize = this.calculateFinalSize(layoutData, constraintSpace);
    
    return {
      x: 0,
      y: 0,
      width: finalSize.width,
      height: finalSize.height,
      children: childLayouts,
    };
  }
  
  /**
   * 从测量结果获取布局数据
   */
  private getLayoutDataFromMeasure(measureResult: MeasureResult): GridLayoutData | null {
    // 从 measureResult 中获取布局数据
    if ((measureResult as any).gridLayoutData) {
      return (measureResult as any).gridLayoutData as GridLayoutData;
    }
    return null;
  }
  
  /**
   * 从测量结果获取网格项数据
   */
  private getGridItemsFromMeasure(measureResult: MeasureResult): GridItemData[] {
    if ((measureResult as any).gridItems) {
      return (measureResult as any).gridItems as GridItemData[];
    }
    return [];
  }
  
  /**
   * 放置网格项
   * 
   * 对应 Chromium: GridLayoutAlgorithm::PlaceGridItems()
   * 
   * 计算每个网格项的最终位置（x, y 坐标）
   */
  private placeGridItems(
    node: LayoutNode,
    layoutData: GridLayoutData | null,
    _measureResult: MeasureResult
  ): Array<{ item: GridItemData; x: number; y: number }> {
    const style = node.style as GridStyle;
    const placements: Array<{ item: GridItemData; x: number; y: number }> = [];
    
    // 如果没有布局数据，使用简化计算
    if (!layoutData) {
      // 简化实现：假设所有项都是 1x1，按顺序放置
      let currentX = 0;
      let currentY = 0;
      const columnGap = style.columnGap || 0;
      
      for (const child of node.children) {
        placements.push({
          item: { node: child } as GridItemData,
          x: currentX,
          y: currentY,
        });
        currentX += (child.width || 100) + columnGap;
      }
      return placements;
    }
    
    // 计算列和行的累积偏移
    const columnOffsets = this.calculateTrackOffsets(
      layoutData.columns as GridTrackCollectionImpl,
      style.columnGap || 0
    );
    const rowOffsets = this.calculateTrackOffsets(
      layoutData.rows as GridTrackCollectionImpl,
      style.rowGap || 0
    );
    
    // 从 measureResult 获取网格项数据
    const gridItems = this.getGridItemsFromMeasure(_measureResult);
    
    // 为每个网格项计算位置
    for (const item of gridItems) {
      const columnSpan = item.columnSpan || { start: 0, end: 1, size: 1 };
      const rowSpan = item.rowSpan || { start: 0, end: 1, size: 1 };
      
      // 计算项的位置（基于轨道偏移）
      const x = columnOffsets[columnSpan.start] || 0;
      const y = rowOffsets[rowSpan.start] || 0;
      
      placements.push({
        item,
        x,
        y,
      });
    }
    
    // 如果没有网格项数据，使用简化实现
    if (gridItems.length === 0) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        // 简化实现：假设每个项占据一个单元格
        const columnIndex = i % columnOffsets.length;
        const rowIndex = Math.floor(i / columnOffsets.length);
        
        placements.push({
          item: { node: child } as GridItemData,
          x: columnOffsets[columnIndex] || 0,
          y: rowOffsets[rowIndex] || 0,
        });
      }
    }
    
    return placements;
  }
  
  /**
   * 计算轨道偏移量
   */
  private calculateTrackOffsets(
    collection: GridTrackCollectionImpl,
    gap: number
  ): number[] {
    const offsets: number[] = [0];
    let currentOffset = 0;
    
    for (const set of collection.sets) {
      for (let i = 0; i < set.trackCount; i++) {
        currentOffset += set.baseSize;
        offsets.push(currentOffset);
        if (i < set.trackCount - 1) {
          currentOffset += gap;
        }
      }
      if (set !== collection.sets[collection.sets.length - 1]) {
        currentOffset += gap;
      }
    }
    
    return offsets;
  }
  
  /**
   * 应用对齐
   * 
   * 对应 Chromium: 应用 align-content, justify-content 等
   * 
   * 对齐类型：
   * - justify-content / align-content: 控制整个网格在容器中的对齐
   * - justify-items / align-items: 控制网格项在网格区域内的对齐
   */
  private applyAlignment(
    node: LayoutNode,
    layoutData: GridLayoutData | null,
    itemPlacements: Array<{ item: GridItemData; x: number; y: number }>
  ): { offsetX: number; offsetY: number } {
    if (!layoutData) {
      return { offsetX: 0, offsetY: 0 };
    }
    
    const style = node.style as GridStyle;
    
    // 应用内容对齐（justify-content / align-content）
    // 这些对齐方式影响整个网格在容器中的位置
    const contentAlignmentOffsets = this.applyContentAlignment(
      node,
      layoutData,
      style.justifyContent,
      style.alignContent
    );
    
    // 应用项对齐（justify-items / align-items）
    // 这些对齐方式影响网格项在网格区域内的位置
    this.applyItemAlignment(
      layoutData,
      itemPlacements,
      style.justifyItems,
      style.alignItems
    );
    
    return contentAlignmentOffsets;
  }
  
  /**
   * 应用内容对齐（justify-content / align-content）
   * 
   * 对应 Chromium: 应用 justify-content 和 align-content
   * 
   * 这些属性控制整个网格在容器中的对齐方式
   * 
   * @returns 对齐偏移量（用于调整整个网格的位置）
   */
  private applyContentAlignment(
    node: LayoutNode,
    layoutData: GridLayoutData,
    justifyContent?: ContentAlignment | string,
    alignContent?: ContentAlignment | string
  ): { offsetX: number; offsetY: number } {
    // 计算网格总尺寸
    const columns = layoutData.columns as GridTrackCollectionImpl;
    const rows = layoutData.rows as GridTrackCollectionImpl;
    
    const gridStyle = node.style as GridStyle;
    const columnGap = gridStyle?.columnGap || 0;
    const rowGap = gridStyle?.rowGap || 0;
    const gridWidth = this.calculateTotalSize(columns, columnGap);
    const gridHeight = this.calculateTotalSize(rows, rowGap);
    
    // 计算轨道数量
    const columnCount = this.getTrackCount(columns);
    const rowCount = this.getTrackCount(rows);
    
    // 计算可用空间
    const availableWidth = typeof node.constraintSpace?.availableWidth === 'number'
      ? node.constraintSpace.availableWidth
      : gridWidth;
    const availableHeight = typeof node.constraintSpace?.availableHeight === 'number'
      ? node.constraintSpace.availableHeight
      : gridHeight;
    
    const freeWidth = Math.max(0, availableWidth - gridWidth);
    const freeHeight = Math.max(0, availableHeight - gridHeight);
    
    // 应用 justify-content（列方向）
    let offsetX = 0;
    if (justifyContent && freeWidth > 0) {
      offsetX = this.calculateContentAlignmentOffset(
        justifyContent as ContentAlignment,
        freeWidth,
        columnCount
      );
    }
    
    // 应用 align-content（行方向）
    let offsetY = 0;
    if (alignContent && freeHeight > 0) {
      offsetY = this.calculateContentAlignmentOffset(
        alignContent as ContentAlignment,
        freeHeight,
        rowCount
      );
    }
    
    return { offsetX, offsetY };
  }
  
  /**
   * 获取轨道数量
   */
  private getTrackCount(collection: GridTrackCollectionImpl): number {
    let count = 0;
    for (const set of collection.sets) {
      count += set.trackCount;
    }
    return count;
  }
  
  /**
   * 应用项对齐（justify-items / align-items）
   * 
   * 对应 Chromium: 应用 justify-items 和 align-items
   * 
   * 这些属性控制网格项在网格区域内的对齐方式
   */
  private applyItemAlignment(
    layoutData: GridLayoutData,
    itemPlacements: Array<{ item: GridItemData; x: number; y: number }>,
    justifyItems?: ItemAlignment | string,
    alignItems?: ItemAlignment | string
  ): void {
    const columns = layoutData.columns as GridTrackCollectionImpl;
    const rows = layoutData.rows as GridTrackCollectionImpl;
    
    for (const placement of itemPlacements) {
      const item = placement.item;
      
      // 计算网格区域尺寸
      const columnSpan = item.columnSpan || { start: 0, end: 1, size: 1 };
      const rowSpan = item.rowSpan || { start: 0, end: 1, size: 1 };
      
      const areaWidth = this.calculateSpanSize(columns, columnSpan, 0);
      const areaHeight = this.calculateSpanSize(rows, rowSpan, 0);
      
      // 获取项的实际尺寸（简化：使用节点尺寸）
      const itemWidth = item.node.width || 0;
      const itemHeight = item.node.height || 0;
      
      // 应用 justify-items（列方向对齐）
      if (justifyItems && areaWidth > itemWidth) {
        const offset = this.calculateItemAlignmentOffset(
          justifyItems,
          areaWidth,
          itemWidth
        );
        placement.x += offset;
      }
      
      // 应用 align-items（行方向对齐）
      if (alignItems && areaHeight > itemHeight) {
        const offset = this.calculateItemAlignmentOffset(
          alignItems,
          areaHeight,
          itemHeight
        );
        placement.y += offset;
      }
    }
  }
  
  /**
   * 计算内容对齐偏移量
   * 
   * 对应 Chromium: 计算 justify-content / align-content 的偏移
   * 
   * @param alignment - 对齐方式
   * @param freeSpace - 可用空间
   * @param trackCount - 轨道数量
   * @returns 对齐偏移量
   */
  private calculateContentAlignmentOffset(
    alignment: ContentAlignment | string,
    freeSpace: number,
    trackCount: number
  ): number {
    switch (alignment) {
      case ContentAlignment.Start:
      case 'start':
        return 0;
      case ContentAlignment.End:
      case 'end':
        return freeSpace;
      case ContentAlignment.Center:
      case 'center':
        return freeSpace / 2;
      case ContentAlignment.SpaceBetween:
      case 'space-between':
        // space-between: 第一个轨道在开始，最后一个轨道在结束，中间轨道均匀分布
        // 对于整个网格，偏移为 0（第一个轨道在开始位置）
        // 轨道之间的间距会在轨道尺寸计算中处理
        return 0;
      case ContentAlignment.SpaceAround:
      case 'space-around':
        // space-around: 每个轨道周围有相等的空间
        // 第一个轨道前的空间是轨道间空间的一半
        // 轨道间空间 = freeSpace / trackCount
        // 第一个轨道前的空间 = (freeSpace / trackCount) / 2
        if (trackCount <= 0) {
          return 0;
        }
        return freeSpace / (trackCount * 2);
      case ContentAlignment.SpaceEvenly:
      case 'space-evenly':
        // space-evenly: 所有空间均匀分布（包括两端）
        // 第一个轨道前的空间等于轨道间空间
        // 轨道间空间 = freeSpace / (trackCount + 1)
        // 第一个轨道前的空间 = freeSpace / (trackCount + 1)
        if (trackCount <= 0) {
          return 0;
        }
        return freeSpace / (trackCount + 1);
      case ContentAlignment.Stretch:
      case 'stretch':
        // stretch: 拉伸网格填充容器（在尺寸计算阶段处理）
        return 0;
      default:
        return 0;
    }
  }
  
  /**
   * 计算项对齐偏移量
   * 
   * 对应 Chromium: 计算 justify-items / align-items 的偏移
   * 
   * @param alignment - 对齐方式
   * @param areaSize - 网格区域尺寸
   * @param itemSize - 项尺寸
   * @returns 对齐偏移量
   */
  private calculateItemAlignmentOffset(
    alignment: ItemAlignment | string,
    areaSize: number,
    itemSize: number
  ): number {
    const freeSpace = areaSize - itemSize;
    
    switch (alignment) {
      case ItemAlignment.Start:
      case 'start':
        return 0;
      case ItemAlignment.End:
      case 'end':
        return freeSpace;
      case ItemAlignment.Center:
      case 'center':
        return freeSpace / 2;
      case ItemAlignment.Stretch:
      case 'stretch':
        // stretch 应该在布局阶段处理（拉伸项尺寸），这里返回 0
        return 0;
      case ItemAlignment.Baseline:
      case 'baseline':
        // baseline 需要基线计算，这里简化处理为 start
        // 完整实现应该使用 computeGridItemBaselines 计算的基线偏移
        return 0;
      default:
        return 0;
    }
  }
  
  /**
   * 计算轨道集合的总尺寸
   */
  private calculateTotalSize(
    collection: GridTrackCollectionImpl,
    gap: number
  ): number {
    let total = 0;
    for (let i = 0; i < collection.sets.length; i++) {
      const set = collection.sets[i];
      total += set.baseSize * set.trackCount;
      if (i < collection.sets.length - 1) {
        total += gap;
      }
    }
    return total;
  }
  
  /**
   * 计算跨度尺寸
   */
  private calculateSpanSize(
    collection: GridTrackCollectionImpl,
    span: { start: number; end: number; size: number },
    gap: number
  ): number {
    // 计算从 start 到 end 的所有轨道尺寸
    let totalSize = 0;
    let trackIndex = 0;
    
    // 遍历所有集合，找到跨越的轨道
    for (const set of collection.sets) {
      const setStart = trackIndex;
      const setEnd = trackIndex + set.trackCount;
      
      // 检查这个集合是否与跨度重叠
      if (span.end > setStart && span.start < setEnd) {
        // 计算重叠的轨道数
        const overlapStart = Math.max(span.start, setStart);
        const overlapEnd = Math.min(span.end, setEnd);
        const overlapCount = overlapEnd - overlapStart;
        
        // 添加轨道尺寸
        totalSize += set.baseSize * overlapCount;
        
        // 添加间距（轨道之间的间距）
        if (overlapCount > 1) {
          totalSize += gap * (overlapCount - 1);
        }
      }
      
      trackIndex = setEnd;
      
      // 如果已经超过跨度结束位置，可以提前退出
      if (trackIndex >= span.end) {
        break;
      }
      
      // 添加集合之间的间距
      if (trackIndex < span.end && set !== collection.sets[collection.sets.length - 1]) {
        totalSize += gap;
      }
    }
    
    return totalSize;
  }
  
  /**
   * 布局子项
   * 
   * 对应 Chromium: 递归调用子项的 Layout()
   * 
   * 为每个子项创建布局结果
   */
  private layoutChildren(
    node: LayoutNode,
    placements: Array<{ item: GridItemData; x: number; y: number }>,
    constraintSpace: ConstraintSpace,
    layoutData: GridLayoutData | null
  ): ChildLayout[] {
    const childLayouts: ChildLayout[] = [];
    const style = node.style as GridStyle;
    
    // 如果没有布局数据，使用简化实现
    if (!layoutData) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const placement = placements[i];
        
        if (!placement) {
          continue;
        }
        
        // 简化实现：直接使用子项的尺寸
        const childWidth = child.width || 100;
        const childHeight = child.height || 100;
        
        childLayouts.push({
          node: child,
          x: placement.x,
          y: placement.y,
          width: childWidth,
          height: childHeight,
        });
      }
      return childLayouts;
    }
    
    const columns = layoutData.columns as GridTrackCollectionImpl;
    const rows = layoutData.rows as GridTrackCollectionImpl;
    const columnGap = style.columnGap || 0;
    const rowGap = style.rowGap || 0;
    
    // 为每个网格项布局子节点
    for (const placement of placements) {
      const item = placement.item;
      const child = item.node;
      
      // 计算网格区域尺寸
      const columnSpan = item.columnSpan || { start: 0, end: 1, size: 1 };
      const rowSpan = item.rowSpan || { start: 0, end: 1, size: 1 };
      
      // 计算可用空间（基于轨道尺寸）
      const availableWidth = this.calculateSpanSize(columns, columnSpan, columnGap);
      const availableHeight = this.calculateSpanSize(rows, rowSpan, rowGap);
      
      // 创建子项的约束空间
      const childConstraintSpace: ConstraintSpace = {
        ...constraintSpace,
        availableWidth: availableWidth,
        availableHeight: availableHeight,
      };
      
      // 如果子项有布局引擎，递归调用布局
      if (child.layoutType !== 'none' && child.style) {
        // 导入布局引擎（避免循环依赖）
        // 注意：这里简化实现，实际应该通过依赖注入或工厂方法获取
        try {
          // 尝试从全局获取布局引擎
          const { LayoutEngine } = require('../../core/layout-engine');
          const engine = new LayoutEngine();
          
          // 执行子项布局
          const childResult = engine.layout(child, childConstraintSpace);
          
          childLayouts.push({
            node: child,
            x: placement.x,
            y: placement.y,
            width: childResult.width,
            height: childResult.height,
          });
        } catch (error) {
          // 如果无法获取布局引擎，使用简化实现
          const childWidth = child.width || availableWidth;
          const childHeight = child.height || availableHeight;
          
          childLayouts.push({
            node: child,
            x: placement.x,
            y: placement.y,
            width: childWidth,
            height: childHeight,
          });
        }
      } else {
        // 子项没有布局类型，使用简化实现
        const childWidth = child.width || availableWidth;
        const childHeight = child.height || availableHeight;
        
        childLayouts.push({
          node: child,
          x: placement.x,
          y: placement.y,
          width: childWidth,
          height: childHeight,
        });
      }
    }
    
    return childLayouts;
  }
  
  /**
   * 计算网格项的宽度
   * 
   * 根据网格项的列跨度计算实际宽度
   * @deprecated 当前未使用，保留用于未来扩展
   */
  // @ts-ignore - 保留用于未来扩展
  private calculateItemWidth(
    item: GridItemData,
    columns: GridTrackCollectionImpl,
    columnGap: number
  ): number {
    const columnSpan = item.columnSpan || { start: 0, end: 1, size: 1 };
    return this.calculateSpanSize(columns, columnSpan, columnGap);
  }
  
  /**
   * 计算网格项的高度
   * 
   * 根据网格项的行跨度计算实际高度
   * @deprecated 当前未使用，保留用于未来扩展
   */
  // @ts-ignore - 保留用于未来扩展
  private calculateItemHeight(
    item: GridItemData,
    rows: GridTrackCollectionImpl,
    rowGap: number
  ): number {
    const rowSpan = item.rowSpan || { start: 0, end: 1, size: 1 };
    return this.calculateSpanSize(rows, rowSpan, rowGap);
  }
  
  /**
   * 计算最终尺寸
   * 
   * 对应 Chromium: ComputeBlockSizeForFragment()
   * 
   * 计算网格容器的最终宽度和高度
   */
  private calculateFinalSize(
    layoutData: GridLayoutData | null,
    constraintSpace: ConstraintSpace
  ): { width: number; height: number } {
    if (!layoutData) {
      // 简化实现：如果没有布局数据，使用约束空间
      return {
        width:
          typeof constraintSpace.availableWidth === 'number'
            ? constraintSpace.availableWidth
            : 0,
        height:
          typeof constraintSpace.availableHeight === 'number'
            ? constraintSpace.availableHeight
            : 0,
      };
    }
    
    // 计算总宽度（所有列轨道 + 间距）
    const columns = layoutData.columns as GridTrackCollectionImpl;
    const rows = layoutData.rows as GridTrackCollectionImpl;
    
    let totalWidth = 0;
    let totalHeight = 0;
    
    // 计算列总宽度
    for (const set of columns.sets) {
      totalWidth += set.baseSize * set.trackCount;
    }
    
    // 计算行总高度
    for (const set of rows.sets) {
      totalHeight += set.baseSize * set.trackCount;
    }
    
    return {
      width: totalWidth,
      height: totalHeight,
    };
  }
}

