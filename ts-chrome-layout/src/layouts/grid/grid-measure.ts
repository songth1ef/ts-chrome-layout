import { LayoutNode, MeasureResult } from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import {
  GridTrackDirection,
  SizingConstraint,
  WritingMode,
  ItemAlignment,
} from '../../types/common/enums';
import { GridStyle } from '../../types/layouts/grid/grid-style';
import { GridLineResolver } from './grid-line-resolver';
import { GridPlacementAlgorithm } from './grid-placement';
import { GridSizingTreeImpl } from '../../data-structures/layouts/grid/grid-sizing-tree';
import { GridItems } from '../../data-structures/layouts/grid/grid-items';
import { GridTrackCollectionImpl } from '../../data-structures/layouts/grid/grid-track-collection';
import {
  GridItemData,
  GridLayoutData,
} from '../../types/layouts/grid/grid-data';
import { GridItemStyle } from '../../types/layouts/grid/grid-position';
import { GridTrackSizingAlgorithm } from './grid-track-sizing';

/**
 * Grid 测量算法
 * 
 * 对应 Chromium: GridLayoutAlgorithm::ComputeGridGeometry()
 * 
 * 主要步骤：
 * 1. 构建 Grid Sizing Tree
 * 2. 初始化轨道尺寸
 * 3. 计算基线对齐
 * 4. 完成轨道尺寸算法（步骤 2-5）
 * 5. 计算内在块尺寸
 * 6. 最终化布局树
 */
export class GridMeasureAlgorithm {
  /**
   * 测量阶段主流程
   * 
   * 对应 Chromium: GridLayoutAlgorithm::ComputeGridGeometry()
   */
  measure(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): MeasureResult {
    return this.measureWithConstraint(node, constraintSpace, SizingConstraint.Layout);
  }
  
  /**
   * 使用指定约束进行测量
   * 
   * 对应 Chromium: GridLayoutAlgorithm::ComputeMinMaxSizes()
   * 
   * @param constraint - 尺寸约束（Layout、MinContent、MaxContent）
   */
  measureWithConstraint(
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    constraint: SizingConstraint
  ): MeasureResult {
    // 步骤 1: 检查是否有继承的 GridLayoutTree（子网格情况）
    // 对应 Chromium: constraint_space.GetGridLayoutSubtree()
    if (constraintSpace.gridLayoutTree) {
      return this.measureSubgrid(node, constraintSpace);
    }
    
    // 步骤 2: 构建 Grid Sizing Tree
    // 对应 Chromium: BuildGridSizingTree()
    const sizingTree = this.buildGridSizingTree(node, constraintSpace);
    
    // 步骤 3: 初始化轨道尺寸
    // 对应 Chromium: InitializeTrackSizes()
    this.initializeTrackSizes(sizingTree);
    
    // 步骤 4: 计算基线对齐
    // 对应 Chromium: ComputeGridItemBaselines()
    this.computeGridItemBaselines(sizingTree);
    
    // 步骤 5: 完成轨道尺寸算法
    // 对应 Chromium: CompleteTrackSizingAlgorithm()
    let needsAdditionalPass = false;
    this.completeTrackSizingAlgorithm(
      sizingTree,
      GridTrackDirection.Column,
      constraint,
      needsAdditionalPass,
      constraintSpace
    );
    this.completeTrackSizingAlgorithm(
      sizingTree,
      GridTrackDirection.Row,
      constraint,
      needsAdditionalPass,
      constraintSpace
    );
    
    // 步骤 6: 如果需要，执行第二遍计算（简化实现：跳过）
    // if (needsAdditionalPass) { ... }
    
    // 步骤 7: 计算内在块尺寸
    // 对应 Chromium: CalculateIntrinsicBlockSize()
    const layoutData = sizingTree.getNode(0).layoutData;
    const intrinsicBlockSize = this.calculateIntrinsicBlockSize(
      sizingTree.getNode(0).gridItems,
      layoutData
    );
    
    // 步骤 8: 最终化布局树（简化实现：跳过）
    // 对应 Chromium: sizingTree.FinalizeTree()
    // const layoutTree = sizingTree.finalizeTree();
    
    // 计算总宽度和高度
    const totalWidth = this.calculateTotalSize(
      layoutData.columns as GridTrackCollectionImpl
    );
    const totalHeight = intrinsicBlockSize;
    
    return {
      width: totalWidth,
      height: totalHeight,
      // 存储布局数据供 arrange 阶段使用
      gridLayoutData: layoutData,
      gridItems: sizingTree.getNode(0).gridItems,
      sizingTree: sizingTree,
    };
  }
  
  /**
   * 计算总尺寸
   */
  private calculateTotalSize(collection: GridTrackCollectionImpl | any): number {
    let total = 0;
    for (const set of collection.sets) {
      total += set.baseSize * set.trackCount;
    }
    return total;
  }
  
  /**
   * 计算内在块尺寸
   * 
   * 对应 Chromium: CalculateIntrinsicBlockSize()
   */
  private calculateIntrinsicBlockSize(
    _gridItems: GridItemData[],
    layoutData: GridLayoutData
  ): number {
    // 简化实现：计算所有行的总高度
    return this.calculateTotalSize(layoutData.rows as GridTrackCollectionImpl);
  }
  
  /**
   * 测量子网格
   * 
   * 对应 Chromium: GridLayoutAlgorithm::LayoutInternal() 中的子网格分支
   * 
   * 子网格从父网格继承 GridLayoutTree，使用父网格的轨道定义
   */
  private measureSubgrid(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): MeasureResult {
    // 从约束空间获取继承的 GridLayoutTree
    const parentLayoutTree = constraintSpace.gridLayoutTree;
    if (!parentLayoutTree) {
      throw new Error('Subgrid measurement requires gridLayoutTree in constraintSpace');
    }
    
    const style = node.style as GridStyle;
    if (!style || style.layoutType !== 'grid') {
      throw new Error('Subgrid node must have grid style');
    }
    
    // 检查子网格继承的方向
    // 子网格的 gridTemplateColumns 或 gridTemplateRows 应该是 'subgrid' 字符串
    // 或者是一个特殊的对象类型
    const hasSubgriddedColumns = 
      (typeof style.gridTemplateColumns === 'string' && style.gridTemplateColumns === 'subgrid') ||
      (Array.isArray(style.gridTemplateColumns) && style.gridTemplateColumns.length === 0) ||
      (style.gridTemplateColumns as any)?.type === 'subgrid';
    const hasSubgriddedRows = 
      (typeof style.gridTemplateRows === 'string' && style.gridTemplateRows === 'subgrid') ||
      (Array.isArray(style.gridTemplateRows) && style.gridTemplateRows.length === 0) ||
      (style.gridTemplateRows as any)?.type === 'subgrid';
    
    // 从父布局树获取布局数据
    const parentLayoutData = parentLayoutTree.getNode(0).layoutData;
    
    // 创建子网格的布局数据
    // 如果列方向是子网格，使用父网格的列；否则创建新的列轨道集合
    const columns = hasSubgriddedColumns
      ? parentLayoutData.columns
      : this.buildTrackCollectionFromStyle(
          style.gridTemplateColumns || [],
          GridTrackDirection.Column,
          constraintSpace
        );
    
    // 如果行方向是子网格，使用父网格的行；否则创建新的行轨道集合
    const rows = hasSubgriddedRows
      ? parentLayoutData.rows
      : this.buildTrackCollectionFromStyle(
          style.gridTemplateRows || [],
          GridTrackDirection.Row,
          constraintSpace
        );
    
    // 创建子网格的布局数据
    const layoutData: GridLayoutData = {
      columns,
      rows,
    };
    
    // 构建子网格的网格项（从子节点）
    const gridItemsCollection = this.constructGridItems(node, this.createLineResolver(node, constraintSpace));
    const gridItems = gridItemsCollection.getAll();
    
    // 初始化轨道尺寸（只初始化非子网格方向的轨道）
    if (!hasSubgriddedColumns) {
      this.initializeTrackSizesForCollection(columns as GridTrackCollectionImpl);
    }
    if (!hasSubgriddedRows) {
      this.initializeTrackSizesForCollection(rows as GridTrackCollectionImpl);
    }
    
    // 完成轨道尺寸算法（只对非子网格方向）
    let needsAdditionalPass = false;
    const sizingTree = this.createSizingTreeForSubgrid(layoutData, gridItems, constraintSpace);
    if (!hasSubgriddedColumns) {
      this.completeTrackSizingAlgorithm(
        sizingTree,
        GridTrackDirection.Column,
        SizingConstraint.Layout,
        needsAdditionalPass,
        constraintSpace
      );
    }
    if (!hasSubgriddedRows) {
      this.completeTrackSizingAlgorithm(
        sizingTree,
        GridTrackDirection.Row,
        SizingConstraint.Layout,
        needsAdditionalPass,
        constraintSpace
      );
    }
    
    // 计算总尺寸
    const totalWidth = this.calculateTotalSize(columns as GridTrackCollectionImpl);
    const intrinsicBlockSize = this.calculateIntrinsicBlockSize(gridItems, layoutData);
    
    return {
      width: totalWidth,
      height: intrinsicBlockSize,
      gridLayoutData: layoutData,
      gridItems,
    };
  }
  
  /**
   * 为子网格创建简化的 Sizing Tree
   */
  private createSizingTreeForSubgrid(
    layoutData: GridLayoutData,
    gridItems: GridItemData[],
    constraintSpace: ConstraintSpace
  ): GridSizingTreeImpl {
    const sizingTree = new GridSizingTreeImpl();
    sizingTree.addNode({
      gridItems,
      layoutData,
      subtreeSize: 1,
      writingMode: constraintSpace.writingMode || WritingMode.HorizontalTb,
    });
    return sizingTree;
  }
  
  /**
   * 初始化单个轨道集合的尺寸
   */
  private initializeTrackSizesForCollection(collection: GridTrackCollectionImpl): void {
    for (const set of collection.sets) {
      const sizingFunction = set.sizingFunction;
      
      if (sizingFunction.type === 'fixed') {
        set.baseSize = sizingFunction.value;
        set.growthLimit = sizingFunction.value;
      } else if (sizingFunction.type === 'fr') {
        set.baseSize = 0;
        set.growthLimit = Infinity;
      } else {
        set.baseSize = 0;
        set.growthLimit = Infinity;
      }
    }
  }
  
  /**
   * 从样式构建轨道集合（用于非子网格方向）
   */
  private buildTrackCollectionFromStyle(
    tracks: any[],
    direction: GridTrackDirection,
    _constraintSpace: ConstraintSpace
  ): GridTrackCollectionImpl {
    const collection = new GridTrackCollectionImpl(direction);
    
    // 简化实现：为每个轨道创建一个集合
    for (const track of tracks) {
      if (track.type === 'repeat') {
        const count = typeof track.count === 'number' ? track.count : 1;
        for (let i = 0; i < count; i++) {
          for (const subTrack of track.tracks) {
            collection.sets.push({
              baseSize: 0,
              growthLimit: Infinity,
              trackCount: 1,
              sizingFunction: subTrack,
            });
          }
        }
      } else {
        collection.sets.push({
          baseSize: 0,
          growthLimit: Infinity,
          trackCount: 1,
          sizingFunction: track,
        });
      }
    }
    
    return collection;
  }
  
  /**
   * 创建线解析器（用于子网格）
   */
  private createLineResolver(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): GridLineResolver {
    const style = node.style as GridStyle;
    return new GridLineResolver(
      style,
      this.calculateAutoRepetitions(style.gridTemplateColumns, constraintSpace),
      this.calculateAutoRepetitions(style.gridTemplateRows, constraintSpace)
    );
  }
  
  /**
   * 计算自动重复次数（用于子网格）
   * 
   * 对应 Chromium: GridLineResolver::ComputeAutoRepetitions()
   * 
   * 计算 auto-fill 或 auto-fit 的重复次数
   */
  private calculateAutoRepetitions(
    tracks: any[],
    constraintSpace: ConstraintSpace
  ): number {
    // 查找 auto-fill 或 auto-fit
    for (const track of tracks) {
      if (track.type === 'repeat' && (track.count === 'auto-fill' || track.count === 'auto-fit')) {
        // 使用 computeAutoRepetitions 方法计算
        // 需要确定是列还是行方向（简化：假设是列方向）
        const availableSize = typeof constraintSpace.availableWidth === 'number'
          ? constraintSpace.availableWidth
          : typeof constraintSpace.availableHeight === 'number'
          ? constraintSpace.availableHeight
          : 0;
        
        return this.computeAutoRepetitions([track], availableSize);
      }
    }
    return 1;
  }
  
  /**
   * 构建 Grid Sizing Tree
   * 
   * 对应 Chromium: GridLayoutAlgorithm::BuildGridSizingTree()
   */
  private buildGridSizingTree(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): GridSizingTreeImpl {
    const style = node.style as GridStyle;
    if (!style || style.layoutType !== 'grid') {
      throw new Error('Node must have grid style');
    }
    
    // 步骤 1: 创建 GridLineResolver
    const columnAutoRepetitions = this.computeAutoRepetitions(
      style.gridTemplateColumns,
      constraintSpace.availableWidth
    );
    const rowAutoRepetitions = this.computeAutoRepetitions(
      style.gridTemplateRows,
      constraintSpace.availableHeight
    );
    
    const lineResolver = new GridLineResolver(
      style,
      columnAutoRepetitions,
      rowAutoRepetitions
    );
    
    // 步骤 2: 构建 GridItems（从子节点）
    const gridItems = this.constructGridItems(node, lineResolver);
    
    // 步骤 3: 运行放置算法
    const placementAlgorithm = new GridPlacementAlgorithm(style, lineResolver);
    const placementData = placementAlgorithm.runAutoPlacementAlgorithm(
      gridItems.getAll()
    );
    
    // 更新网格项的位置
    for (let i = 0; i < gridItems.size(); i++) {
      const item = gridItems.get(i);
      const position = placementData.gridItemPositions[i];
      if (position) {
        item.resolvedPosition = position;
        item.columnSpan = {
          start: position.columnStart,
          end: position.columnEnd,
          size: position.columnEnd - position.columnStart,
        };
        item.rowSpan = {
          start: position.rowStart,
          end: position.rowEnd,
          size: position.rowEnd - position.rowStart,
        };
      }
    }
    
    // 步骤 4: 构建轨道集合
    const columns = this.buildTrackCollection(
      GridTrackDirection.Column,
      style,
      constraintSpace
    );
    const rows = this.buildTrackCollection(
      GridTrackDirection.Row,
      style,
      constraintSpace
    );
    
    // 步骤 5: 创建布局数据
    const layoutData: GridLayoutData = {
      columns,
      rows,
    };
    
    // 步骤 6: 创建 Sizing Tree
    const sizingTree = new GridSizingTreeImpl();
    sizingTree.addNode({
      gridItems: gridItems.getAll(),
      layoutData,
      subtreeSize: 1,
      writingMode: constraintSpace.writingMode || WritingMode.HorizontalTb,
    });
    
    return sizingTree;
  }
  
  /**
   * 从子节点构建网格项
   * 
   * 对应 Chromium: GridNode::ConstructGridItems()
   */
  private constructGridItems(
    node: LayoutNode,
    lineResolver: GridLineResolver
  ): GridItems {
    const gridItems = new GridItems();
    const style = node.style as GridStyle;
    
    for (const child of node.children) {
      // 从子节点样式解析位置
      const itemStyle = this.getItemStyleFromNode(child);
      const columnSpan = lineResolver.resolveGridPositionsFromStyle(
        itemStyle,
        GridTrackDirection.Column
      );
      const rowSpan = lineResolver.resolveGridPositionsFromStyle(
        itemStyle,
        GridTrackDirection.Row
      );
      
      // 创建网格项数据
      const gridItem: GridItemData = {
        node: child,
        resolvedPosition: {
          columnStart: columnSpan.start >= 0 ? columnSpan.start : 0,
          columnEnd: columnSpan.end >= 0 ? columnSpan.end : 1,
          rowStart: rowSpan.start >= 0 ? rowSpan.start : 0,
          rowEnd: rowSpan.end >= 0 ? rowSpan.end : 1,
        },
        columnSpan,
        rowSpan,
        isSubgrid: false,
        hasSubgriddedColumns: false,
        hasSubgriddedRows: false,
        columnAlignment: (style.justifyItems as any) || ItemAlignment.Stretch,
        rowAlignment: (style.alignItems as any) || ItemAlignment.Stretch,
        columnSpanProperties: {
          hasAutoMinimumTrack: false,
          hasFixedMaximumTrack: false,
          hasFixedMinimumTrack: false,
          hasFlexibleTrack: false,
          hasIntrinsicTrack: false,
          isCollapsed: false,
          isImplicit: false,
        },
        rowSpanProperties: {
          hasAutoMinimumTrack: false,
          hasFixedMaximumTrack: false,
          hasFixedMinimumTrack: false,
          hasFlexibleTrack: false,
          hasIntrinsicTrack: false,
          isCollapsed: false,
          isImplicit: false,
        },
        columnSetIndices: { begin: 0, end: 0 },
        rowSetIndices: { begin: 0, end: 0 },
      };
      
      gridItems.add(gridItem);
    }
    
    return gridItems;
  }
  
  /**
   * 从节点获取网格项样式
   */
  private getItemStyleFromNode(_node: LayoutNode): GridItemStyle {
    // 简化实现：从节点的 style 属性中提取
    // TODO: 实现完整的样式解析
    return {
      gridColumnStart: { type: 'auto' },
      gridColumnEnd: { type: 'auto' },
      gridRowStart: { type: 'auto' },
      gridRowEnd: { type: 'auto' },
    };
  }
  
  /**
   * 计算自动重复次数
   * 
   * 对应 Chromium: ComputeAutomaticRepetitions()
   */
  private computeAutoRepetitions(
    tracks: any[],
    availableSize: number | 'auto'
  ): number {
    if (typeof availableSize === 'string' && availableSize === 'auto') {
      return 1;
    }
    // 简化实现：如果有 auto-fill/auto-fit，计算重复次数
    // TODO: 实现完整的自动重复计算
    for (const track of tracks) {
      if (
        track.type === 'repeat' &&
        (track.count === 'auto-fill' || track.count === 'auto-fit')
      ) {
        if (typeof availableSize === 'number' && availableSize > 0) {
          // 简化的计算：假设每个轨道平均 100px
          return Math.max(1, Math.floor(availableSize / 100));
        }
        return 1;
      }
    }
    return 1;
  }
  
  /**
   * 构建轨道集合
   * 
   * 对应 Chromium: BuildSizingCollection()
   */
  private buildTrackCollection(
    direction: GridTrackDirection,
    style: GridStyle,
    constraintSpace: ConstraintSpace
  ): GridTrackCollectionImpl {
    const collection = new GridTrackCollectionImpl(direction);
    const tracks =
      direction === GridTrackDirection.Column
        ? style.gridTemplateColumns
        : style.gridTemplateRows;
    
    // 简化的实现：为每个轨道创建一个 Set
    for (const track of tracks) {
      if (track.type === 'repeat') {
        // 处理 repeat
        const count =
          typeof track.count === 'number'
            ? track.count
            : track.count === 'auto-fill' || track.count === 'auto-fit'
            ? this.computeAutoRepetitions(
                [track],
                direction === GridTrackDirection.Column
                  ? constraintSpace.availableWidth
                  : constraintSpace.availableHeight
              )
            : 1;
        
        for (let i = 0; i < count; i++) {
          for (const subTrack of track.tracks) {
            collection.sets.push({
              baseSize: this.getInitialTrackSize(subTrack),
              growthLimit: Infinity,
              trackCount: 1,
              sizingFunction: subTrack,
            });
          }
        }
      } else {
        collection.sets.push({
          baseSize: this.getInitialTrackSize(track),
          growthLimit: Infinity,
          trackCount: 1,
          sizingFunction: track,
        });
      }
    }
    
    return collection;
  }
  
  /**
   * 获取轨道的初始尺寸
   */
  private getInitialTrackSize(track: any): number {
    if (track.type === 'fixed') {
      return track.value;
    }
    if (track.type === 'fr') {
      return 0; // fr 轨道初始为 0
    }
    if (track.type === 'auto') {
      return 0; // auto 轨道初始为 0
    }
    if (track.type === 'minmax') {
      // 使用最小值作为初始尺寸
      return this.getInitialTrackSize(track.min);
    }
    // min-content, max-content 等
    return 0;
  }
  
  /**
   * 初始化轨道尺寸
   * 
   * 对应 Chromium: GridLayoutAlgorithm::InitializeTrackSizes()
   */
  private initializeTrackSizes(sizingTree: GridSizingTreeImpl): void {
    const node = sizingTree.getNode(0);
    const layoutData = node.layoutData;
    
    // 初始化列轨道
    this.initializeTrackCollection(
      layoutData.columns as GridTrackCollectionImpl
    );
    
    // 初始化行轨道
    this.initializeTrackCollection(layoutData.rows as GridTrackCollectionImpl);
  }
  
  /**
   * 初始化轨道集合
   */
  private initializeTrackCollection(collection: GridTrackCollectionImpl): void {
    for (const set of collection.sets) {
      // 如果基础尺寸未设置，根据轨道类型设置
      if (set.baseSize === 0) {
        if (set.sizingFunction.type === 'fixed') {
          set.baseSize = set.sizingFunction.value;
        } else if (set.sizingFunction.type === 'auto') {
          set.baseSize = 0; // auto 轨道初始为 0
        } else if (set.sizingFunction.type === 'minmax') {
          // 使用最小值
          set.baseSize = this.getInitialTrackSize(set.sizingFunction.min);
        }
      }
      
      // 设置增长限制
      if (set.sizingFunction.type === 'fixed') {
        set.growthLimit = set.baseSize;
      } else {
        set.growthLimit = Infinity; // 其他类型初始为无限
      }
    }
  }
  
  /**
   * 计算网格项基线
   * 
   * 对应 Chromium: GridLayoutAlgorithm::ComputeGridItemBaselines()
   * 
   * 基线对齐用于 align-items: baseline 和 align-self: baseline
   * 需要计算每个网格项的第一行基线位置
   */
  private computeGridItemBaselines(sizingTree: GridSizingTreeImpl): void {
    const rootNode = sizingTree.getNode(0);
    const gridItems = rootNode.gridItems;
    
    // 遍历所有网格项，计算基线
    for (const item of gridItems) {
      // 基线对齐只适用于行方向（align-items / align-self）
      // 列方向使用 justify-items / justify-self
      
      // 检查项是否使用基线对齐
      const rowAlignment = item.rowAlignment;
      if (rowAlignment === ItemAlignment.Baseline) {
        // 计算项的基线位置
        // 简化实现：假设基线在项高度的某个位置（通常是第一行文本的基线）
        // 完整实现需要：
        // 1. 测量子项的第一行基线
        // 2. 考虑项的 padding 和 border
        // 3. 存储基线位置供后续对齐使用
        
        // 这里简化实现：假设基线在项高度的 80% 位置（模拟文本基线）
        const itemHeight = item.node.height || 0;
        const baselineOffset = itemHeight * 0.8;
        
        // 存储基线偏移（可以存储在 item 的额外属性中）
        // 注意：这里简化实现，实际应该存储在 GridItemData 的基线属性中
        (item as any).baselineOffset = baselineOffset;
      }
    }
    
    // 计算行轨道的基线对齐偏移
    // 对于使用基线对齐的行，需要找到该行中所有项的基线，并计算对齐偏移
    const layoutData = rootNode.layoutData;
    const rows = layoutData.rows as GridTrackCollectionImpl;
    
    // 按行分组网格项
    const itemsByRow = new Map<number, GridItemData[]>();
    for (const item of gridItems) {
      const rowSpan = item.rowSpan || { start: 0, end: 1, size: 1 };
      const rowStart = rowSpan.start;
      
      if (!itemsByRow.has(rowStart)) {
        itemsByRow.set(rowStart, []);
      }
      itemsByRow.get(rowStart)!.push(item);
    }
    
    // 为每行计算基线对齐偏移
    for (const [rowIndex, items] of itemsByRow.entries()) {
      // 找到该行中所有使用基线对齐的项
      const baselineItems = items.filter(
        (item) => item.rowAlignment === ItemAlignment.Baseline
      );
      
      if (baselineItems.length > 0) {
        // 找到最大的基线偏移（用于对齐）
        let maxBaselineOffset = 0;
        for (const item of baselineItems) {
          const baselineOffset = (item as any).baselineOffset || 0;
          maxBaselineOffset = Math.max(maxBaselineOffset, baselineOffset);
        }
        
        // 存储行的基线对齐偏移（可以存储在行的额外属性中）
        // 注意：这里简化实现，实际应该存储在 GridSet 或 GridRange 的基线属性中
        if (rows.sets[rowIndex]) {
          (rows.sets[rowIndex] as any).baselineOffset = maxBaselineOffset;
        }
      }
    }
  }
  
  /**
   * 完成轨道尺寸算法
   * 
   * 对应 Chromium: GridLayoutAlgorithm::CompleteTrackSizingAlgorithm()
   */
  private completeTrackSizingAlgorithm(
    sizingTree: GridSizingTreeImpl,
    direction: GridTrackDirection,
    _constraint: SizingConstraint,
    _needsAdditionalPass: boolean,
    constraintSpace?: ConstraintSpace
  ): void {
    const node = sizingTree.getNode(0);
    const layoutData = node.layoutData;
    const trackCollection =
      (direction === GridTrackDirection.Column
        ? layoutData.columns
        : layoutData.rows) as GridTrackCollectionImpl;
    
    const style = node.gridItems[0]?.node?.style as GridStyle;
    
    // 从 constraintSpace 获取可用尺寸
    const availableSize = {
      width:
        constraintSpace && typeof constraintSpace.availableWidth === 'number'
          ? constraintSpace.availableWidth
          : 0,
      height:
        constraintSpace && typeof constraintSpace.availableHeight === 'number'
          ? constraintSpace.availableHeight
          : 0,
    };
    
    // 创建轨道尺寸算法
    const sizingAlgorithm = new GridTrackSizingAlgorithm(
      style || {},
      availableSize,
      _constraint
    );
    
    // 贡献大小函数（简化实现）
    const contributionSize: any = () => 0;
    
    // 运行轨道尺寸算法
    sizingAlgorithm.computeUsedTrackSizes(
      contributionSize,
      trackCollection,
      node.gridItems,
      false
    );
  }
}

