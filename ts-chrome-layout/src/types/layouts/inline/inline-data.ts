import type { LayoutNode } from '../../common/layout-node';
import { TextDirection, WritingMode } from '../../common/enums';

/**
 * Inline 项数据
 * 
 * 对应 Chromium: inline_layout_algorithm.h - InlineItemData
 */
export interface InlineItemData {
  // 节点引用
  node: LayoutNode;
  
  // 计算后的位置
  x: number;
  y: number;
  
  // 计算后的尺寸
  width: number;
  height: number;
  
  // 基线位置
  baseline: number;
  
  // 行内框信息
  inlineBox: {
    ascent: number;
    descent: number;
    lineHeight: number;
  };
  
  // 是否换行
  isLineBreak: boolean;
  
  // 是否空白
  isWhitespace: boolean;
}

/**
 * 行数据
 */
export interface LineData {
  // 行内项列表
  items: InlineItemData[];
  
  // 行位置
  x: number;
  y: number;
  
  // 行尺寸
  width: number;
  height: number;
  
  // 基线位置
  baseline: number;
  
  // 行高
  lineHeight: number;
}

/**
 * Inline 容器数据
 * 
 * 对应 Chromium: inline_layout_algorithm.h - InlineLayoutData
 */
export interface InlineLayoutData {
  // 书写模式
  writingMode: WritingMode;
  
  // 文本方向
  direction: TextDirection;
  
  // 容器尺寸
  width: number;
  height: number;
  
  // Inline 项列表
  inlineItems: InlineItemData[];
  
  // 行列表
  lines: LineData[];
  
  // 内容区域尺寸
  contentWidth: number;
  contentHeight: number;
}
