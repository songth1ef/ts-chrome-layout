import { WritingMode } from '../../common/enums';
import { GridItemData, GridLayoutData } from './grid-data';

/**
 * Grid Sizing Tree（尺寸计算树）
 * 
 * 对应 Chromium: grid_sizing_tree.h - GridSizingTree
 */
export interface GridSizingTree {
  nodes: GridSizingTreeNode[];
  
  // 查找方法
  getNode(index: number): GridSizingTreeNode;
  getSubtree(rootIndex: number): GridSizingSubtree;
  lookupSubgridIndex(node: any): number | null; // LayoutNode
  addNode(node: GridSizingTreeNode): number;
  finalizeTree(): any; // GridLayoutTree
}

/**
 * Grid Sizing Tree 节点
 * 
 * 对应 Chromium: grid_sizing_tree.h - GridTreeNode
 */
export interface GridSizingTreeNode {
  // 网格项
  gridItems: GridItemData[];
  
  // 布局数据（可变）
  layoutData: GridLayoutData;
  
  // 子树大小
  subtreeSize: number;
  
  // 书写模式
  writingMode: WritingMode;
}

/**
 * Grid Sizing Subtree
 * 
 * 对应 Chromium: grid_sizing_tree.h - GridSizingSubtree
 */
export interface GridSizingSubtree {
  tree: GridSizingTree;
  rootIndex: number;
  getNode(): GridSizingTreeNode;
  getGridItems(): GridItemData[];
  getLayoutData(): GridLayoutData;
  firstChild(): GridSizingSubtree | null;
  nextSibling(): GridSizingSubtree | null;
}

/**
 * Grid Layout Tree（布局树，不可变）
 * 
 * 对应 Chromium: grid_data.h - GridLayoutTree
 */
export interface GridLayoutTree {
  nodes: GridLayoutTreeNode[];
  
  // 查找方法
  getNode(index: number): GridLayoutTreeNode;
  getSubtree(rootIndex: number): GridLayoutSubtree;
  areSubtreesEqual(
    index1: number,
    tree2: GridLayoutTree,
    index2: number
  ): boolean;
}

/**
 * Grid Layout Tree 节点
 * 
 * 对应 Chromium: grid_data.h - GridLayoutTree::GridTreeNode
 */
export interface GridLayoutTreeNode {
  // 布局数据（不可变）
  layoutData: GridLayoutData;
  
  // 子树大小
  subtreeSize: number;
  
  // 是否有未解析的几何
  hasUnresolvedGeometry: boolean;
}

/**
 * Grid Layout Subtree
 * 
 * 对应 Chromium: grid_data.h - GridLayoutSubtree
 */
export interface GridLayoutSubtree {
  tree: GridLayoutTree;
  rootIndex: number;
  getNode(): GridLayoutTreeNode;
  getLayoutData(): GridLayoutData;
  firstChild(): GridLayoutSubtree | null;
  nextSibling(): GridLayoutSubtree | null;
}

