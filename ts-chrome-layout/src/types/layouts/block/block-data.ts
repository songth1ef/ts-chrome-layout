import type { LayoutNode } from '../../common/layout-node';
import { TextDirection, WritingMode } from '../../common/enums';

/**
 * Block 项数据
 * 
 * 对应 Chromium: block_layout_algorithm.h - BlockItemData
 */
export interface BlockItemData {
  // 节点引用
  node: LayoutNode;
  
  // 计算后的位置
  x: number;
  y: number;
  
  // 计算后的尺寸
  width: number;
  height: number;
  
  // 边距
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // 是否浮动
  isFloating: boolean;
  
  // 是否清除浮动
  clearsFloat: boolean;
}

/**
 * Block 容器数据
 * 
 * 对应 Chromium: block_layout_algorithm.h - BlockLayoutData
 */
export interface BlockLayoutData {
  // 书写模式
  writingMode: WritingMode;
  
  // 文本方向
  direction: TextDirection;
  
  // 容器尺寸
  width: number;
  height: number;
  
  // Block 项列表
  blockItems: BlockItemData[];
  
  // 浮动项列表
  floatingItems: BlockItemData[];
  
  // 内容区域尺寸
  contentWidth: number;
  contentHeight: number;
}
