/**
 * GridSizingTree 测试
 */

import { GridSizingTreeImpl } from '../../../src/data-structures/layouts/grid/grid-sizing-tree';
import { GridSizingTreeNode } from '../../../src/types/layouts/grid/grid-tree';
import { GridLayoutData } from '../../../src/types/layouts/grid/grid-data';
import { WritingMode } from '../../../src/types/common/enums';
import { GridTrackCollectionImpl } from '../../../src/data-structures/layouts/grid/grid-track-collection';
import { GridTrackDirection } from '../../../src/types/common/enums';

describe('GridSizingTreeImpl', () => {
  let tree: GridSizingTreeImpl;

  beforeEach(() => {
    tree = new GridSizingTreeImpl();
  });

  const createMockLayoutData = (): GridLayoutData => ({
    columns: new GridTrackCollectionImpl(GridTrackDirection.Column),
    rows: new GridTrackCollectionImpl(GridTrackDirection.Row),
  });

  const createMockNode = (): GridSizingTreeNode => ({
    gridItems: [],
    layoutData: createMockLayoutData(),
    subtreeSize: 1,
    writingMode: WritingMode.HorizontalTb,
  });

  describe('addNode', () => {
    it('应该添加节点并返回索引', () => {
      const node = createMockNode();
      
      const index = tree.addNode(node);
      expect(index).toBe(0);
      expect(tree.nodes.length).toBe(1);
    });

    it('应该按顺序添加多个节点', () => {
      const node1 = createMockNode();
      const node2 = createMockNode();
      
      const index1 = tree.addNode(node1);
      const index2 = tree.addNode(node2);
      
      expect(index1).toBe(0);
      expect(index2).toBe(1);
      expect(tree.nodes.length).toBe(2);
    });
  });

  describe('getNode', () => {
    it('应该获取指定索引的节点', () => {
      const node = createMockNode();
      
      tree.addNode(node);
      const retrieved = tree.getNode(0);
      
      expect(retrieved).toBe(node);
    });

    it('应该在索引超出范围时抛出错误', () => {
      expect(() => tree.getNode(0)).toThrow('Node index 0 out of bounds');
      expect(() => tree.getNode(10)).toThrow('Node index 10 out of bounds');
    });
  });

  describe('getSubtree', () => {
    it('应该创建子树', () => {
      const node = createMockNode();
      
      tree.addNode(node);
      const subtree = tree.getSubtree(0);
      
      expect(subtree).toBeDefined();
      expect(subtree.rootIndex).toBe(0);
      expect(subtree.getNode()).toBe(node);
    });

    it('应该正确获取子树的方法', () => {
      const node = createMockNode();
      
      tree.addNode(node);
      const subtree = tree.getSubtree(0);
      
      expect(subtree.getGridItems()).toEqual(node.gridItems);
      expect(subtree.getLayoutData()).toBe(node.layoutData);
    });

    it('应该处理 firstChild', () => {
      const node1 = createMockNode();
      node1.subtreeSize = 2;
      const node2 = createMockNode();
      
      tree.addNode(node1);
      tree.addNode(node2);
      
      const subtree = tree.getSubtree(0);
      const firstChild = subtree.firstChild();
      
      expect(firstChild).not.toBeNull();
      expect(firstChild?.rootIndex).toBe(1);
    });

    it('应该在无子节点时返回 null', () => {
      const node = createMockNode();
      
      tree.addNode(node);
      const subtree = tree.getSubtree(0);
      const firstChild = subtree.firstChild();
      
      expect(firstChild).toBeNull();
    });

    it('应该处理 nextSibling', () => {
      const node1 = createMockNode();
      const node2 = createMockNode();
      
      tree.addNode(node1);
      tree.addNode(node2);
      
      const subtree1 = tree.getSubtree(0);
      const nextSibling = subtree1.nextSibling();
      
      expect(nextSibling).not.toBeNull();
      expect(nextSibling?.rootIndex).toBe(1);
    });

    it('应该在无下一个兄弟节点时返回 null', () => {
      const node = createMockNode();
      
      tree.addNode(node);
      const subtree = tree.getSubtree(0);
      const nextSibling = subtree.nextSibling();
      
      expect(nextSibling).toBeNull();
    });
  });

  describe('lookupSubgridIndex', () => {
    it('应该返回 null（待实现）', () => {
      const result = tree.lookupSubgridIndex({});
      expect(result).toBeNull();
    });
  });

  describe('finalizeTree', () => {
    it('应该返回 null（待实现）', () => {
      const result = tree.finalizeTree();
      expect(result).toBeNull();
    });
  });
});

