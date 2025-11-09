import { LayoutStyle } from '../../common/style';
import {
  ContentAlignment,
  ItemAlignment,
  GridAutoFlow,
} from '../../common/enums';

/**
 * Grid 样式配置
 * 继承自 LayoutStyle，添加 Grid 特定属性
 */
export interface GridStyle extends LayoutStyle {
  layoutType: 'grid';
  
  // 轨道定义
  gridTemplateColumns: GridTrackList;
  gridTemplateRows: GridTrackList;
  
  // 自动重复
  gridAutoColumns?: GridTrackSize;
  gridAutoRows?: GridTrackSize;
  gridAutoFlow?: GridAutoFlow;
  
  // 间距
  columnGap?: number;
  rowGap?: number;
  
  // 对齐方式
  justifyContent?: ContentAlignment;
  alignContent?: ContentAlignment;
  justifyItems?: ItemAlignment;
  alignItems?: ItemAlignment;
  
  // 命名区域
  gridTemplateAreas?: string[][];
  namedGridLines?: NamedGridLines;
}

/**
 * 轨道列表（列或行）
 */
export type GridTrackList = GridTrackSize[];

/**
 * 轨道尺寸
 */
export type GridTrackSize =
  | { type: 'fixed'; value: number } // 100px
  | { type: 'fr'; value: number } // 1fr, 2fr
  | { type: 'auto' } // auto
  | { type: 'min-content' } // min-content
  | { type: 'max-content' } // max-content
  | {
      type: 'minmax';
      min: GridTrackSize;
      max: GridTrackSize;
    } // minmax(100px, 1fr)
  | {
      type: 'repeat';
      count: number | 'auto-fill' | 'auto-fit';
      tracks: GridTrackSize[];
    };

/**
 * 命名网格线
 */
export interface NamedGridLines {
  columns?: string[];
  rows?: string[];
}

