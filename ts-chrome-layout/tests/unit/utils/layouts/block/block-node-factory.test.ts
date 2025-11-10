/**
 * Block 节点工厂函数测试
 */

import { createBlockNode } from '../../../../../src/utils/layouts/block/block-node-factory';
import { BlockStyle } from '../../../../../src/types/layouts/block/block-style';

describe('createBlockNode', () => {
  it('应该创建基本的 Block 节点', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };
    
    const node = createBlockNode({
      id: 'block-1',
      style,
    });
    
    expect(node.id).toBe('block-1');
    expect(node.layoutType).toBe('block');
    expect(node.style).toBe(style);
    expect(node.x).toBe(0);
    expect(node.y).toBe(0);
    expect(node.width).toBe(0);
    expect(node.height).toBe(0);
    expect(node.contentWidth).toBe(0);
    expect(node.contentHeight).toBe(0);
  });
  
  it('应该设置默认的 margin、padding、border', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };
    
    const node = createBlockNode({
      id: 'block-2',
      style,
    });
    
    expect(node.margin).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
    expect(node.padding).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
    expect(node.border).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });
  
  it('应该合并自定义的 margin', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };
    
    const node = createBlockNode({
      id: 'block-3',
      style,
      margin: {
        top: 10,
        right: 20,
      },
    });
    
    expect(node.margin).toEqual({
      top: 10,
      right: 20,
      bottom: 0,
      left: 0,
    });
  });
  
  it('应该合并自定义的 padding', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };
    
    const node = createBlockNode({
      id: 'block-4',
      style,
      padding: {
        left: 15,
        bottom: 25,
      },
    });
    
    expect(node.padding).toEqual({
      top: 0,
      right: 0,
      bottom: 25,
      left: 15,
    });
  });
  
  it('应该合并自定义的 border', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };
    
    const node = createBlockNode({
      id: 'block-5',
      style,
      border: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
    });
    
    expect(node.border).toEqual({
      top: 5,
      right: 5,
      bottom: 5,
      left: 5,
    });
  });
  
  it('应该设置子节点', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };
    
    const child1: any = { id: 'child-1' };
    const child2: any = { id: 'child-2' };
    
    const node = createBlockNode({
      id: 'block-6',
      style,
      children: [child1, child2],
    });
    
    expect(node.children).toHaveLength(2);
    expect(node.children[0]).toBe(child1);
    expect(node.children[1]).toBe(child2);
  });
  
  it('应该在没有子节点时使用空数组', () => {
    const style: BlockStyle = {
      layoutType: 'block',
    };
    
    const node = createBlockNode({
      id: 'block-7',
      style,
    });
    
    expect(node.children).toEqual([]);
  });
  
  it('应该支持完整的 Block 样式', () => {
    const style: BlockStyle = {
      layoutType: 'block',
      position: 'relative',
      float: 'left',
      clear: 'both',
      width: 100,
      height: 200,
      minWidth: 50,
      maxWidth: 150,
      overflow: 'hidden',
    };
    
    const node = createBlockNode({
      id: 'block-8',
      style,
    });
    
    expect(node.style).toBe(style);
    expect((node.style as BlockStyle).position).toBe('relative');
    expect((node.style as BlockStyle).float).toBe('left');
  });
});
