import {
  GridTrackCollection,
  GridItemData,
  GridSet,
} from '../../types/layouts/grid/grid-data';
import {
  GridItemContributionType,
  SizingConstraint,
  GridTrackDirection,
} from '../../types/common/enums';

/**
 * 贡献大小函数类型
 */
export type ContributionSizeFunction = (
  contributionType: GridItemContributionType,
  item: GridItemData
) => number;

/**
 * Grid 轨道尺寸算法
 * 
 * 对应 Chromium: grid_track_sizing_algorithm.h/cc
 * 实现 CSS Grid 轨道尺寸计算（步骤 2-5）
 * 
 * 参考: https://drafts.csswg.org/css-grid-2/#algo-track-sizing
 */
export class GridTrackSizingAlgorithm {
  // private _containerStyle: any; // ComputedStyle (未使用，保留用于未来扩展)
  private availableSize: { width: number; height: number };
  // private _sizingConstraint: SizingConstraint; // 未使用，保留用于未来扩展
  
  // 优化：缓存项到集合的映射，避免重复计算
  private itemsBySetCache: Map<string, GridItemData[]> = new Map();
  
  constructor(
    _containerStyle: any, // 未使用，保留用于未来扩展
    availableSize: { width: number; height: number },
    _sizingConstraint: SizingConstraint // 未使用，保留用于未来扩展
  ) {
    // this._containerStyle = containerStyle;
    this.availableSize = availableSize;
    // this._sizingConstraint = sizingConstraint;
  }
  
  /**
   * 计算使用的轨道尺寸
   * 
   * 对应 Chromium: GridTrackSizingAlgorithm::ComputeUsedTrackSizes()
   * 
   * 算法步骤：
   * 1. 初始化（已在外部完成）
   * 2. 解析内在尺寸轨道
   * 3. 最大化轨道
   * 4. 扩展弹性轨道
   * 5. 拉伸 auto 轨道
   */
  computeUsedTrackSizes(
    contributionSize: ContributionSizeFunction,
    trackCollection: GridTrackCollection,
    gridItems: GridItemData[],
    needsIntrinsicTrackSize: boolean = false
  ): void {
    // 优化：清除之前的缓存
    this.clearCache();
    
    // 步骤 1: 初始化（已在外部完成）
    // 对应 Chromium: GridSizingTrackCollection::InitializeSets()
    
    // 步骤 2: 解析内在尺寸轨道
    // 对应 Chromium: ResolveIntrinsicTrackSizes()
    if (trackCollection.hasIntrinsicTrack?.()) {
      this.resolveIntrinsicTrackSizes(
        contributionSize,
        trackCollection,
        gridItems
      );
    }
    
    // 如果只需要计算内在轨道尺寸，提前返回
    if (needsIntrinsicTrackSize) {
      return;
    }
    
    // 设置无限增长限制为基础尺寸
    // 对应 Chromium: SetIndefiniteGrowthLimitsToBaseSize()
    
    // 步骤 3: 最大化轨道
    // 对应 Chromium: MaximizeTracks()
    this.maximizeTracks(trackCollection);
    
    // 步骤 4: 扩展弹性轨道
    // 对应 Chromium: ExpandFlexibleTracks()
    if (trackCollection.hasFlexibleTrack?.()) {
      this.expandFlexibleTracks(
        contributionSize,
        trackCollection,
        gridItems
      );
    }
    
    // 步骤 5: 拉伸 auto 轨道
    // 对应 Chromium: StretchAutoTracks()
    this.stretchAutoTracks(trackCollection);
  }
  
  /**
   * 解析内在尺寸轨道（步骤 2）
   * 
   * 对应 Chromium: GridTrackSizingAlgorithm::ResolveIntrinsicTrackSizes()
   * 
   * 内在尺寸轨道包括：
   * - min-content: 最小内容尺寸
   * - max-content: 最大内容尺寸
   * - auto: 自动尺寸（可能是 min-content 或 max-content）
   */
  private resolveIntrinsicTrackSizes(
    contributionSize: ContributionSizeFunction,
    trackCollection: GridTrackCollection,
    gridItems: GridItemData[]
  ): void {
    // 遍历所有轨道集合
    for (let setIndex = 0; setIndex < trackCollection.sets.length; setIndex++) {
      const set = trackCollection.sets[setIndex];
      const sizingFunction = set.sizingFunction;
      
      // 检查是否是内在尺寸轨道
      if (
        sizingFunction.type === 'min-content' ||
        sizingFunction.type === 'max-content' ||
        sizingFunction.type === 'auto' ||
        (sizingFunction.type === 'minmax' &&
          (sizingFunction.min.type === 'min-content' ||
            sizingFunction.min.type === 'max-content' ||
            sizingFunction.min.type === 'auto' ||
            sizingFunction.max.type === 'min-content' ||
            sizingFunction.max.type === 'max-content' ||
            sizingFunction.max.type === 'auto'))
      ) {
        // 找到跨越这个集合的所有网格项
        const itemsSpanningSet = this.findItemsSpanningSet(
          gridItems,
          setIndex,
          trackCollection.direction
        );
        
        if (itemsSpanningSet.length === 0) {
          // 如果没有项跨越这个集合，使用默认尺寸
          if (sizingFunction.type === 'min-content' || sizingFunction.type === 'auto') {
            set.baseSize = 0;
          } else if (sizingFunction.type === 'max-content') {
            set.baseSize = 0; // 简化实现
          }
          continue;
        }
        
        // 计算内在尺寸
        let intrinsicSize = 0;
        
        // 优化：提前检查项数量，避免不必要的循环
        if (itemsSpanningSet.length > 0) {
          if (sizingFunction.type === 'min-content' || sizingFunction.type === 'auto') {
            // min-content: 找到所有项的最小贡献
            // 优化：使用单次循环
            for (const item of itemsSpanningSet) {
              const contribution = contributionSize(
                GridItemContributionType.ForIntrinsicMinimums,
                item
              );
              intrinsicSize = Math.max(intrinsicSize, contribution);
            }
          } else if (sizingFunction.type === 'max-content') {
            // max-content: 找到所有项的最大贡献
            // 优化：使用单次循环
            for (const item of itemsSpanningSet) {
              const contribution = contributionSize(
                GridItemContributionType.ForMaxContentMinimums,
                item
              );
              intrinsicSize = Math.max(intrinsicSize, contribution);
            }
          } else if (sizingFunction.type === 'minmax') {
            // minmax: 分别计算最小和最大，然后取合适的值
            // 优化：合并循环，减少函数调用
            let minSize = 0;
            let maxSize = 0;
            
            for (const item of itemsSpanningSet) {
              const minContribution = contributionSize(
                GridItemContributionType.ForIntrinsicMinimums,
                item
              );
              const maxContribution = contributionSize(
                GridItemContributionType.ForMaxContentMinimums,
                item
              );
              minSize = Math.max(minSize, minContribution);
              maxSize = Math.max(maxSize, maxContribution);
            }
            
            // 根据 minmax 的约束选择尺寸
            // 简化实现：使用 min 和 max 的平均值
            intrinsicSize = Math.max(minSize, Math.min(maxSize, this.availableSize.width));
          }
        }
        
        // 更新基础尺寸
        set.baseSize = Math.max(set.baseSize, intrinsicSize);
        
        // 如果增长限制是无限的，也设置为内在尺寸
        if (!isFinite(set.growthLimit)) {
          set.growthLimit = set.baseSize;
        }
      }
    }
  }
  
  /**
   * 找到跨越指定集合的所有网格项
   * 
   * 优化：使用缓存避免重复计算
   */
  private findItemsSpanningSet(
    gridItems: GridItemData[],
    setIndex: number,
    direction: GridTrackDirection
  ): GridItemData[] {
    // 生成缓存键
    const cacheKey = `${direction}-${setIndex}`;
    
    // 检查缓存
    if (this.itemsBySetCache.has(cacheKey)) {
      return this.itemsBySetCache.get(cacheKey)!;
    }
    
    const items: GridItemData[] = [];
    
    // 优化：提前计算方向，避免在循环中重复判断
    const isColumn = direction === GridTrackDirection.Column;
    
    for (const item of gridItems) {
      const span = isColumn ? item.columnSpan : item.rowSpan;
      
      if (!span) {
        continue;
      }
      
      // 优化：简化条件判断
      // 检查项是否跨越这个集合
      // 完整实现需要根据集合的轨道索引范围来判断
      // 这里假设集合索引对应轨道索引
      if (span.start <= setIndex && span.end > setIndex) {
        items.push(item);
      }
    }
    
    // 缓存结果
    this.itemsBySetCache.set(cacheKey, items);
    
    return items;
  }
  
  /**
   * 清除缓存
   * 
   * 在重新计算前调用，确保使用最新数据
   */
  clearCache(): void {
    this.itemsBySetCache.clear();
  }
  
  /**
   * 最大化轨道（步骤 3）
   * 
   * 对应 Chromium: GridTrackSizingAlgorithm::MaximizeTracks()
   * 
   * 简化实现：将增长限制设置为基础尺寸（如果增长限制是无限的）
   */
  private maximizeTracks(trackCollection: GridTrackCollection): void {
    // 简化实现：遍历所有集合，更新增长限制
    for (const set of trackCollection.sets) {
      if (!isFinite(set.growthLimit)) {
        // 如果增长限制是无限的，设置为基础尺寸
        set.growthLimit = set.baseSize;
      }
    }
  }
  
  /**
   * 扩展弹性轨道（步骤 4）
   * 
   * 对应 Chromium: GridTrackSizingAlgorithm::ExpandFlexibleTracks()
   * 
   * 简化实现：按 fr 值比例分配可用空间
   */
  private expandFlexibleTracks(
    _contributionSize: ContributionSizeFunction,
    trackCollection: GridTrackCollection,
    _gridItems: GridItemData[]
  ): void {
    // 计算总 fr 值和可用空间
    let totalFr = 0;
    const frSets: GridSet[] = [];
    
    for (const set of trackCollection.sets) {
      if (set.sizingFunction.type === 'fr') {
        totalFr += set.sizingFunction.value * set.trackCount;
        frSets.push(set);
      }
    }
    
    if (totalFr === 0 || frSets.length === 0) {
      return;
    }
    
    const freeSpace = this.determineFreeSpace(trackCollection);
    if (freeSpace <= 0) {
      return;
    }
    
    // 按 fr 值比例分配空间
    for (const set of frSets) {
      const frValue = set.sizingFunction.type === 'fr' ? set.sizingFunction.value : 0;
      const share = (frValue * set.trackCount / totalFr) * freeSpace;
      set.baseSize += share;
      set.growthLimit = set.baseSize;
    }
  }
  
  /**
   * 拉伸 auto 轨道（步骤 5）
   * 
   * 对应 Chromium: GridTrackSizingAlgorithm::StretchAutoTracks()
   * 
   * 简化实现：如果有可用空间，按比例分配给 auto 轨道
   */
  private stretchAutoTracks(trackCollection: GridTrackCollection): void {
    // 简化实现：计算总可用空间和 auto 轨道数
    const freeSpace = this.determineFreeSpace(trackCollection);
    if (freeSpace <= 0) {
      return;
    }
    
    // 计算 auto 轨道数量
    let autoTrackCount = 0;
    for (const set of trackCollection.sets) {
      if (set.sizingFunction.type === 'auto') {
        autoTrackCount += set.trackCount;
      }
    }
    
    if (autoTrackCount === 0) {
      return;
    }
    
    // 平均分配空间给 auto 轨道
    const spacePerTrack = freeSpace / autoTrackCount;
    for (const set of trackCollection.sets) {
      if (set.sizingFunction.type === 'auto') {
        set.baseSize += spacePerTrack * set.trackCount;
        set.growthLimit = set.baseSize;
      }
    }
  }
  
  /**
   * 确定自由空间
   * 
   * 对应 Chromium: GridTrackSizingAlgorithm::DetermineFreeSpace()
   * 
   * 简化实现：计算可用空间减去已使用的空间
   */
  private determineFreeSpace(trackCollection: GridTrackCollection): number {
    const isColumn = trackCollection.direction === GridTrackDirection.Column;
    const availableSize = isColumn
      ? this.availableSize.width
      : this.availableSize.height;
    
    // 计算已使用的空间
    let usedSize = 0;
    for (const set of trackCollection.sets) {
      usedSize += set.baseSize;
    }
    
    return Math.max(0, availableSize - usedSize);
  }
}

