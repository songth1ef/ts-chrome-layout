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
  private containerStyle: any; // ComputedStyle
  private availableSize: { width: number; height: number };
  private sizingConstraint: SizingConstraint;
  
  constructor(
    containerStyle: any,
    availableSize: { width: number; height: number },
    sizingConstraint: SizingConstraint
  ) {
    this.containerStyle = containerStyle;
    this.availableSize = availableSize;
    this.sizingConstraint = sizingConstraint;
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
   */
  private resolveIntrinsicTrackSizes(
    _contributionSize: ContributionSizeFunction,
    _trackCollection: GridTrackCollection,
    _gridItems: GridItemData[]
  ): void {
    // TODO: 实现内在尺寸解析
    // 对应 Chromium: ResolveIntrinsicTrackSizes()
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

