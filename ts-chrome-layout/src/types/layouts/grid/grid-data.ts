import type { LayoutNode } from '../../common/layout-node';
import { GridTrackDirection, ItemAlignment } from '../../common/enums';
import type { GridTrackSize } from './grid-style';

/**
 * 网格项数据
 * 
 * 对应 Chromium: grid_item.h - GridItemData
 */
export interface GridItemData {
  // 节点引用
  node: LayoutNode;
  
  // 解析后的位置
  resolvedPosition: GridArea;
  
  // 跨度信息
  columnSpan: GridSpan;
  rowSpan: GridSpan;
  
  // 是否子网格
  isSubgrid: boolean;
  hasSubgriddedColumns: boolean;
  hasSubgriddedRows: boolean;
  
  // 对齐方式
  columnAlignment: ItemAlignment;
  rowAlignment: ItemAlignment;
  
  // 轨道跨度属性（优化用）
  columnSpanProperties: TrackSpanProperties;
  rowSpanProperties: TrackSpanProperties;
  
  // 集合索引（快速查找用）
  columnSetIndices: Range;
  rowSetIndices: Range;
}

/**
 * 网格区域
 */
export interface GridArea {
  columnStart: number;
  columnEnd: number;
  rowStart: number;
  rowEnd: number;
}

/**
 * 网格跨度
 * 
 * 对应 Chromium: grid_data.h - GridSpan
 */
export interface GridSpan {
  start: number; // 起始线索引（-1 表示不确定）
  end: number; // 结束线索引（-1 表示不确定）
  size: number; // 跨度大小
}

/**
 * 检查跨度是否为不确定跨度
 * 
 * 对应 Chromium: GridSpan::IsIndefinite()
 */
export function isIndefiniteSpan(span: GridSpan): boolean {
  return span.start === -1 || span.end === -1;
}

/**
 * 范围
 */
export interface Range {
  begin: number;
  end: number;
}

/**
 * 放置数据
 * 
 * 对应 Chromium: grid_data.h - GridPlacementData
 */
export interface GridPlacementData {
  // 网格线解析器
  lineResolver: any; // GridLineResolver
  
  // 网格项位置
  gridItemPositions: GridArea[];
  
  // 偏移量
  columnStartOffset: number;
  rowStartOffset: number;
}

/**
 * 轨道集合接口
 * 
 * 对应 Chromium: grid_track_collection.h - GridLayoutTrackCollection
 */
export interface GridTrackCollection {
  direction: GridTrackDirection;
  ranges: GridRange[];
  sets: GridSet[];
  getSetOffset(setIndex: number): number;
  getSetSize(setIndex: number): number;
  getRangeIndexFromLine(line: number): number;
  hasIntrinsicTrack?(): boolean;
  hasFlexibleTrack?(): boolean;
}

/**
 * 轨道范围
 * 
 * 对应 Chromium: grid_track_collection.h - GridRange
 */
export interface GridRange {
  startLine: number;
  trackCount: number;
  beginSetIndex: number;
  setCount: number;
  properties: TrackSpanProperties;
}

/**
 * 轨道集合（Set）
 * 
 * 对应 Chromium: grid_track_collection.h - GridSet
 */
export interface GridSet {
  baseSize: number; // 基础尺寸
  growthLimit: number; // 增长限制（可能是无限）
  trackCount: number; // 包含的轨道数
  sizingFunction: GridTrackSize;
}

/**
 * 布局数据
 * 
 * 对应 Chromium: grid_data.h - GridLayoutData
 */
export interface GridLayoutData {
  // 列和行轨道集合
  columns: GridTrackCollection;
  rows: GridTrackCollection;
}

/**
 * 轨道跨度属性
 * 
 * 对应 Chromium: grid_track_collection.h - TrackSpanProperties
 */
export interface TrackSpanProperties {
  hasAutoMinimumTrack: boolean;
  hasFixedMaximumTrack: boolean;
  hasFixedMinimumTrack: boolean;
  hasFlexibleTrack: boolean;
  hasIntrinsicTrack: boolean;
  isCollapsed: boolean;
  isImplicit: boolean;
}

