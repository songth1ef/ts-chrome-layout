import {
  GridSizingTree,
  GridSizingTreeNode,
  GridSizingSubtree,
} from '../../../types/layouts/grid/grid-tree';
import { GridTrackCollectionImpl } from './grid-track-collection';

/**
 * Grid Sizing Tree 实现
 * 
 * 对应 Chromium: grid_sizing_tree.h/cc
 */
export class GridSizingTreeImpl implements GridSizingTree {
  nodes: GridSizingTreeNode[] = [];
  
  /**
   * 获取节点
   * 
   * 对应 Chromium: GridSizingTree::At()
   */
  getNode(index: number): GridSizingTreeNode {
    if (index >= this.nodes.length) {
      throw new Error(`Node index ${index} out of bounds`);
    }
    return this.nodes[index];
  }
  
  /**
   * 获取子树
   * 
   * 对应 Chromium: GridSizingSubtree 构造函数
   */
  getSubtree(rootIndex: number): GridSizingSubtree {
    return {
      tree: this,
      rootIndex,
      getNode: () => this.getNode(rootIndex),
      getGridItems: () => this.getNode(rootIndex).gridItems,
      getLayoutData: () => this.getNode(rootIndex).layoutData,
      firstChild: () => {
        if (rootIndex + 1 < this.nodes.length) {
          return this.getSubtree(rootIndex + 1);
        }
        return null;
      },
      nextSibling: () => {
        const currentNode = this.getNode(rootIndex);
        const nextIndex = rootIndex + currentNode.subtreeSize;
        if (nextIndex < this.nodes.length) {
          return this.getSubtree(nextIndex);
        }
        return null;
      },
    };
  }
  
  /**
   * 查找子网格索引
   * 
   * 对应 Chromium: GridSizingTree::LookupSubgridIndex()
   * 
   * 在树中查找指定节点对应的子网格索引
   */
  lookupSubgridIndex(node: any): number | null {
    // 遍历所有节点，查找匹配的子网格节点
    for (let i = 0; i < this.nodes.length; i++) {
      const treeNode = this.nodes[i];
      
      // 检查这个节点的网格项中是否有匹配的子网格
      for (const item of treeNode.gridItems) {
        if (item.isSubgrid && item.node === node) {
          // 找到匹配的子网格，返回其在树中的索引
          // 子网格节点通常是当前节点的子节点
          // 简化实现：返回下一个节点的索引
          if (i + 1 < this.nodes.length) {
            return i + 1;
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * 添加节点
   * 
   * 对应 Chromium: GridSizingTree::SetSizingNodeData()
   */
  addNode(node: GridSizingTreeNode): number {
    const index = this.nodes.length;
    this.nodes.push(node);
    return index;
  }
  
  /**
   * 最终化布局树
   * 
   * 对应 Chromium: GridSizingTree::FinalizeTree()
   * 
   * 将可变的 GridSizingTree 转换为不可变的 GridLayoutTree
   */
  finalizeTree(): import('../../../types/layouts/grid/grid-tree').GridLayoutTree {
    
    if (this.nodes.length === 0) {
      // 返回一个空的布局树
      const emptyTree: any = {
        nodes: [],
        getNode: () => {
          throw new Error('Empty tree');
        },
        getSubtree: () => null,
        areSubtreesEqual: () => false,
      };
      return emptyTree;
    }
    
    // 创建 GridLayoutTree 节点数组
    const layoutNodes: import('../../../types/layouts/grid/grid-tree').GridLayoutTreeNode[] = [];
    
    // 遍历所有 sizing 节点，转换为 layout 节点
    for (const sizingNode of this.nodes) {
      // 创建不可变的布局节点
      const layoutNode: import('../../../types/layouts/grid/grid-tree').GridLayoutTreeNode = {
        // 布局数据（从 sizing 节点深度复制）
        layoutData: {
          columns: this.cloneTrackCollection(sizingNode.layoutData.columns),
          rows: this.cloneTrackCollection(sizingNode.layoutData.rows),
        },
        // 子树大小（保持不变）
        subtreeSize: sizingNode.subtreeSize,
        // 检查是否有未解析的几何
        // 如果有弹性轨道或内在尺寸轨道，可能还有未解析的几何
        hasUnresolvedGeometry: this.hasUnresolvedGeometry(sizingNode.layoutData),
      };
      
      layoutNodes.push(layoutNode);
    }
    
    // 创建并返回 GridLayoutTree
    const layoutTree: any = {
      nodes: layoutNodes,
      getNode: (index: number): import('../../../types/layouts/grid/grid-tree').GridLayoutTreeNode => {
        if (index < 0 || index >= layoutNodes.length) {
          throw new Error(`Node index ${index} out of bounds (0-${layoutNodes.length - 1})`);
        }
        return layoutNodes[index];
      },
      getSubtree: (rootIndex: number): import('../../../types/layouts/grid/grid-tree').GridLayoutSubtree | null => {
        if (rootIndex < 0 || rootIndex >= layoutNodes.length) {
          return null;
        }
        
        const subtree: import('../../../types/layouts/grid/grid-tree').GridLayoutSubtree = {
          tree: layoutTree,
          rootIndex,
          getNode: (): import('../../../types/layouts/grid/grid-tree').GridLayoutTreeNode => layoutNodes[rootIndex],
          getLayoutData: (): import('../../../types/layouts/grid/grid-data').GridLayoutData => 
            layoutNodes[rootIndex].layoutData,
          firstChild: (): import('../../../types/layouts/grid/grid-tree').GridLayoutSubtree | null => {
            // 第一个子节点是当前节点的下一个节点
            if (rootIndex + 1 < layoutNodes.length) {
              return layoutTree.getSubtree(rootIndex + 1);
            }
            return null;
          },
          nextSibling: (): import('../../../types/layouts/grid/grid-tree').GridLayoutSubtree | null => {
            // 下一个兄弟节点是跳过当前子树后的节点
            const currentNode = layoutNodes[rootIndex];
            const nextIndex = rootIndex + currentNode.subtreeSize;
            if (nextIndex < layoutNodes.length) {
              return layoutTree.getSubtree(nextIndex);
            }
            return null;
          },
        };
        
        return subtree;
      },
      areSubtreesEqual: (
        index1: number,
        tree2: import('../../../types/layouts/grid/grid-tree').GridLayoutTree,
        index2: number
      ): boolean => {
        // 比较两个子树的布局数据
        const node1 = layoutNodes[index1];
        const node2 = tree2.getNode(index2);
        
        // 比较布局数据
        return this.compareLayoutData(node1.layoutData, node2.layoutData);
      },
    };
    
    return layoutTree;
  }
  
  /**
   * 检查是否有未解析的几何
   */
  private hasUnresolvedGeometry(layoutData: import('../../../types/layouts/grid/grid-data').GridLayoutData): boolean {
    // 检查列和行轨道集合中是否有未解析的几何
    const columns = layoutData.columns as GridTrackCollectionImpl;
    const rows = layoutData.rows as GridTrackCollectionImpl;
    
    // 如果有弹性轨道或内在尺寸轨道，可能还有未解析的几何
    // 简化实现：检查是否有无限的增长限制
    for (const set of columns.sets) {
      if (!isFinite(set.growthLimit)) {
        return true;
      }
    }
    for (const set of rows.sets) {
      if (!isFinite(set.growthLimit)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 比较布局数据是否相等
   */
  private compareLayoutData(
    data1: import('../../../types/layouts/grid/grid-data').GridLayoutData,
    data2: import('../../../types/layouts/grid/grid-data').GridLayoutData
  ): boolean {
    // 比较列轨道集合
    if (!this.compareTrackCollection(data1.columns, data2.columns)) {
      return false;
    }
    
    // 比较行轨道集合
    if (!this.compareTrackCollection(data1.rows, data2.rows)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 比较轨道集合是否相等
   */
  private compareTrackCollection(collection1: any, collection2: any): boolean {
    if (collection1.sets.length !== collection2.sets.length) {
      return false;
    }
    
    for (let i = 0; i < collection1.sets.length; i++) {
      const set1 = collection1.sets[i];
      const set2 = collection2.sets[i];
      
      if (
        set1.baseSize !== set2.baseSize ||
        set1.growthLimit !== set2.growthLimit ||
        set1.trackCount !== set2.trackCount
      ) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 克隆轨道集合（创建不可变副本）
   */
  private cloneTrackCollection(collection: any): any {
    // 创建新的轨道集合，复制所有数据
    return {
      direction: collection.direction,
      ranges: collection.ranges ? [...collection.ranges] : [],
      sets: collection.sets ? collection.sets.map((set: any) => ({
        baseSize: set.baseSize,
        growthLimit: set.growthLimit,
        trackCount: set.trackCount,
        sizingFunction: set.sizingFunction,
      })) : [],
    };
  }
}

