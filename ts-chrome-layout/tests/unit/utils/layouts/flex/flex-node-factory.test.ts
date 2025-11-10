/**
 * Flex 节点工厂函数测试
 */

import { createFlexNode } from '../../../../../src/utils/layouts/flex/flex-node-factory';
import { FlexStyle } from '../../../../../src/types/layouts/flex/flex-style';
import { FlexDirection, FlexWrap, FlexJustifyContent, ItemAlignment } from '../../../../../src/types/common/enums';

describe('createFlexNode', () => {
  it('应该创建基本的 Flex 节点', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
    };
    
    const node = createFlexNode({
      id: 'flex-1',
      style,
    });
    
    expect(node.id).toBe('flex-1');
    expect(node.layoutType).toBe('flex');
    expect(node.style).toBe(style);
    expect(node.x).toBe(0);
    expect(node.y).toBe(0);
    expect(node.width).toBe(0);
    expect(node.height).toBe(0);
    expect(node.contentWidth).toBe(0);
    expect(node.contentHeight).toBe(0);
  });
  
  it('应该设置默认的 margin、padding、border', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
    };
    
    const node = createFlexNode({
      id: 'flex-2',
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
    const style: FlexStyle = {
      layoutType: 'flex',
    };
    
    const node = createFlexNode({
      id: 'flex-3',
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
    const style: FlexStyle = {
      layoutType: 'flex',
    };
    
    const node = createFlexNode({
      id: 'flex-4',
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
    const style: FlexStyle = {
      layoutType: 'flex',
    };
    
    const node = createFlexNode({
      id: 'flex-5',
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
    const style: FlexStyle = {
      layoutType: 'flex',
    };
    
    const child1: any = { id: 'child-1' };
    const child2: any = { id: 'child-2' };
    
    const node = createFlexNode({
      id: 'flex-6',
      style,
      children: [child1, child2],
    });
    
    expect(node.children).toHaveLength(2);
    expect(node.children[0]).toBe(child1);
    expect(node.children[1]).toBe(child2);
  });
  
  it('应该在没有子节点时使用空数组', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
    };
    
    const node = createFlexNode({
      id: 'flex-7',
      style,
    });
    
    expect(node.children).toEqual([]);
  });
  
  it('应该支持完整的 Flex 样式', () => {
    const style: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Column,
      flexWrap: FlexWrap.Wrap,
      justifyContent: FlexJustifyContent.SpaceBetween,
      alignItems: ItemAlignment.Center,
      alignContent: ItemAlignment.Stretch,
      gap: 10,
      rowGap: 5,
      columnGap: 15,
    };
    
    const node = createFlexNode({
      id: 'flex-8',
      style,
    });
    
    expect(node.style).toBe(style);
    expect((node.style as FlexStyle).flexDirection).toBe(FlexDirection.Column);
    expect((node.style as FlexStyle).justifyContent).toBe(FlexJustifyContent.SpaceBetween);
  });
});
