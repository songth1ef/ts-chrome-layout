import {
  GridTrackCollection,
  GridRange,
  GridSet,
} from '../../../types/layouts/grid/grid-data';
import { GridTrackDirection } from '../../../types/common/enums';

/**
 * Grid 轨道集合实现
 * 
 * 对应 Chromium: grid_track_collection.h/cc - GridLayoutTrackCollection
 */
export class GridTrackCollectionImpl implements GridTrackCollection {
  direction: GridTrackDirection;
  ranges: GridRange[] = [];
  sets: GridSet[] = [];
  
  constructor(direction: GridTrackDirection) {
    this.direction = direction;
  }
  
  /**
   * 获取集合偏移量
   * 
   * 对应 Chromium: GridLayoutTrackCollection::GetSetOffset()
   */
  getSetOffset(setIndex: number): number {
    if (setIndex < 0 || setIndex >= this.sets.length) {
      return 0;
    }
    let offset = 0;
    for (let i = 0; i < setIndex; i++) {
      offset += this.sets[i].baseSize * this.sets[i].trackCount;
    }
    return offset;
  }
  
  /**
   * 获取集合大小
   * 
   * 对应 Chromium: GridLayoutTrackCollection::GetSetSize()
   */
  getSetSize(setIndex: number): number {
    if (setIndex < 0 || setIndex >= this.sets.length) {
      return 0;
    }
    const set = this.sets[setIndex];
    return set.baseSize * set.trackCount;
  }
  
  /**
   * 从网格线获取范围索引
   * 
   * 对应 Chromium: GridTrackCollectionBase::RangeIndexFromGridLine()
   */
  getRangeIndexFromLine(line: number): number {
    if (line < 0) {
      return 0;
    }
    let currentLine = 0;
    for (let i = 0; i < this.ranges.length; i++) {
      const range = this.ranges[i];
      if (line >= currentLine && line < currentLine + range.trackCount) {
        return i;
      }
      currentLine += range.trackCount;
    }
    return this.ranges.length - 1;
  }
  
  /**
   * 是否有内在轨道
   * 
   * 对应 Chromium: 检查轨道集合中是否有内在尺寸轨道
   */
  hasIntrinsicTrack(): boolean {
    for (const set of this.sets) {
      const sizingFunction = set.sizingFunction;
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
        return true;
      }
    }
    return false;
  }
  
  /**
   * 是否有弹性轨道
   * 
   * 对应 Chromium: 检查轨道集合中是否有 fr 轨道
   */
  hasFlexibleTrack(): boolean {
    for (const set of this.sets) {
      const sizingFunction = set.sizingFunction;
      if (
        sizingFunction.type === 'fr' ||
        (sizingFunction.type === 'minmax' &&
          (sizingFunction.min.type === 'fr' || sizingFunction.max.type === 'fr'))
      ) {
        return true;
      }
    }
    return false;
  }
}

