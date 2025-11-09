/**
 * GridItems 测试
 */

import { GridItems } from '../../../src/data-structures/layouts/grid/grid-items';
import { GridItemData } from '../../../src/types/layouts/grid/grid-data';
import { ItemAlignment } from '../../../src/types/common/enums';

describe('GridItems', () => {
  it('应该添加和获取网格项', () => {
    const items = new GridItems();
    const item: GridItemData = {
      node: {
        id: 'item1',
        layoutType: 'none',
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        contentWidth: 0,
        contentHeight: 0,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        border: { top: 0, right: 0, bottom: 0, left: 0 },
        children: [],
      },
      resolvedPosition: {
        columnStart: 0,
        columnEnd: 1,
        rowStart: 0,
        rowEnd: 1,
      },
      columnSpan: { start: 0, end: 1, size: 1 },
      rowSpan: { start: 0, end: 1, size: 1 },
      isSubgrid: false,
      hasSubgriddedColumns: false,
      hasSubgriddedRows: false,
      columnAlignment: ItemAlignment.Stretch,
      rowAlignment: ItemAlignment.Stretch,
      columnSpanProperties: {
        hasAutoMinimumTrack: false,
        hasFixedMaximumTrack: false,
        hasFixedMinimumTrack: false,
        hasFlexibleTrack: false,
        hasIntrinsicTrack: false,
        isCollapsed: false,
        isImplicit: false,
      },
      rowSpanProperties: {
        hasAutoMinimumTrack: false,
        hasFixedMaximumTrack: false,
        hasFixedMinimumTrack: false,
        hasFlexibleTrack: false,
        hasIntrinsicTrack: false,
        isCollapsed: false,
        isImplicit: false,
      },
      columnSetIndices: { begin: 0, end: 0 },
      rowSetIndices: { begin: 0, end: 0 },
    };
    
    items.add(item);
    
    expect(items.size()).toBe(1);
    expect(items.get(0)).toBe(item);
    expect(items.getAll().length).toBe(1);
  });
});

