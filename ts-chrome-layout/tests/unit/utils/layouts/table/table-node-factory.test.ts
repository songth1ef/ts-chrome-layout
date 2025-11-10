/**
 * Table 节点工厂函数测试
 */

import { createTableNode } from '../../../../../src/utils/layouts/table/table-node-factory';
import { TableStyle } from '../../../../../src/types/layouts/table/table-style';

describe('createTableNode', () => {
  it('应该创建基本的 Table 节点', () => {
    const style: TableStyle = {
      layoutType: 'table',
    };
    
    const node = createTableNode({
      id: 'table-1',
      style,
    });
    
    expect(node.id).toBe('table-1');
    expect(node.layoutType).toBe('table');
    expect(node.style).toBe(style);
    expect(node.x).toBe(0);
    expect(node.y).toBe(0);
    expect(node.width).toBe(0);
    expect(node.height).toBe(0);
    expect(node.contentWidth).toBe(0);
    expect(node.contentHeight).toBe(0);
  });
  
  it('应该设置默认的 margin、padding、border', () => {
    const style: TableStyle = {
      layoutType: 'table',
    };
    
    const node = createTableNode({
      id: 'table-2',
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
    const style: TableStyle = {
      layoutType: 'table',
    };
    
    const node = createTableNode({
      id: 'table-3',
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
    const style: TableStyle = {
      layoutType: 'table',
    };
    
    const node = createTableNode({
      id: 'table-4',
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
    const style: TableStyle = {
      layoutType: 'table',
    };
    
    const node = createTableNode({
      id: 'table-5',
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
    const style: TableStyle = {
      layoutType: 'table',
    };
    
    const child1: any = { id: 'child-1' };
    const child2: any = { id: 'child-2' };
    
    const node = createTableNode({
      id: 'table-6',
      style,
      children: [child1, child2],
    });
    
    expect(node.children).toHaveLength(2);
    expect(node.children[0]).toBe(child1);
    expect(node.children[1]).toBe(child2);
  });
  
  it('应该在没有子节点时使用空数组', () => {
    const style: TableStyle = {
      layoutType: 'table',
    };
    
    const node = createTableNode({
      id: 'table-7',
      style,
    });
    
    expect(node.children).toEqual([]);
  });
  
  it('应该支持完整的 Table 样式', () => {
    const style: TableStyle = {
      layoutType: 'table',
      tableLayout: 'fixed',
      borderCollapse: 'collapse',
      borderSpacing: {
        horizontal: 2,
        vertical: 2,
      },
      captionSide: 'top',
      emptyCells: 'show',
      width: 500,
      columnWidths: [100, 200, 200],
    };
    
    const node = createTableNode({
      id: 'table-8',
      style,
    });
    
    expect(node.style).toBe(style);
    expect((node.style as TableStyle).tableLayout).toBe('fixed');
    expect((node.style as TableStyle).borderCollapse).toBe('collapse');
    expect((node.style as TableStyle).columnWidths).toEqual([100, 200, 200]);
  });
});
