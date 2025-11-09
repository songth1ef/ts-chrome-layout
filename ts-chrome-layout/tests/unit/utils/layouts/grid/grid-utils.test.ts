/**
 * Grid 工具函数测试
 */

import {
  isSubgrid,
  calculateGridAreaSize,
  calculateTotalColumnSize,
  calculateIntrinsicBlockSize,
} from '../../../../../src/utils/layouts/grid/grid-utils';
import { GridItemData } from '../../../../../src/types/layouts/grid/grid-data';
import { GridLayoutData } from '../../../../../src/types/layouts/grid/grid-data';
import { GridSizingTreeImpl } from '../../../../../src/data-structures/layouts/grid/grid-sizing-tree';
import { GridTrackCollectionImpl } from '../../../../../src/data-structures/layouts/grid/grid-track-collection';
import { GridTrackDirection, WritingMode } from '../../../../../src/types/common/enums';
import { GridTrackSize } from '../../../../../src/types/layouts/grid/grid-style';
import { LayoutNode } from '../../../../../src/types/common/layout-node';

describe('Grid Utils', () => {
  describe('isSubgrid', () => {
    it('应该识别 GridItemData 中的子网格', () => {
      const item: Partial<GridItemData> = {
        isSubgrid: true,
      };
      expect(isSubgrid(item)).toBe(true);
    });

    it('应该识别 hasSubgriddedColumns', () => {
      const item: Partial<GridItemData> = {
        hasSubgriddedColumns: true,
      };
      expect(isSubgrid(item)).toBe(true);
    });

    it('应该识别 hasSubgriddedRows', () => {
      const item: Partial<GridItemData> = {
        hasSubgriddedRows: true,
      };
      expect(isSubgrid(item)).toBe(true);
    });

    it('应该识别 LayoutNode 中的子网格样式', () => {
      const node: Partial<LayoutNode> = {
        style: {
          layoutType: 'grid',
          gridTemplateColumns: 'subgrid' as any,
        } as any,
      };
      expect(isSubgrid(node)).toBe(true);
    });

    it('应该返回 false 对于非子网格节点', () => {
      const item: Partial<GridItemData> = {
        isSubgrid: false,
        hasSubgriddedColumns: false,
        hasSubgriddedRows: false,
      };
      expect(isSubgrid(item)).toBe(false);
    });
  });

  describe('calculateGridAreaSize', () => {
    it('应该计算网格区域大小', () => {
      const columns = new GridTrackCollectionImpl(GridTrackDirection.Column);
      columns.sets = [
        { baseSize: 100, growthLimit: 100, trackCount: 1, sizingFunction: { type: 'fixed', value: 100 } as GridTrackSize },
        { baseSize: 200, growthLimit: 200, trackCount: 1, sizingFunction: { type: 'fixed', value: 200 } as GridTrackSize },
      ];

      const rows = new GridTrackCollectionImpl(GridTrackDirection.Row);
      rows.sets = [
        { baseSize: 50, growthLimit: 50, trackCount: 1, sizingFunction: { type: 'fixed', value: 50 } as GridTrackSize },
        { baseSize: 75, growthLimit: 75, trackCount: 1, sizingFunction: { type: 'fixed', value: 75 } as GridTrackSize },
      ];

      const layoutData: GridLayoutData = {
        columns,
        rows,
      };

      const item: GridItemData = {
        node: {} as LayoutNode,
        resolvedPosition: {
          columnStart: 0,
          columnEnd: 2,
          rowStart: 0,
          rowEnd: 2,
        },
        columnSpan: { start: 0, end: 2, size: 2 },
        rowSpan: { start: 0, end: 2, size: 2 },
        isSubgrid: false,
        hasSubgriddedColumns: false,
        hasSubgriddedRows: false,
        columnAlignment: 'stretch' as any,
        rowAlignment: 'stretch' as any,
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
        columnSetIndices: { begin: 0, end: 1 },
        rowSetIndices: { begin: 0, end: 1 },
      };

      const result = calculateGridAreaSize(item, layoutData);
      expect(result.width).toBe(300); // 100 + 200
      expect(result.height).toBe(125); // 50 + 75
    });
  });

  describe('calculateTotalColumnSize', () => {
    it('应该从 GridLayoutData 计算总列尺寸', () => {
      const columns = new GridTrackCollectionImpl(GridTrackDirection.Column);
      columns.sets = [
        { baseSize: 100, growthLimit: 100, trackCount: 1, sizingFunction: { type: 'fixed', value: 100 } as GridTrackSize },
        { baseSize: 200, growthLimit: 200, trackCount: 1, sizingFunction: { type: 'fixed', value: 200 } as GridTrackSize },
        { baseSize: 150, growthLimit: 150, trackCount: 2, sizingFunction: { type: 'fixed', value: 150 } as GridTrackSize },
      ];

      const layoutData: GridLayoutData = {
        columns,
        rows: new GridTrackCollectionImpl(GridTrackDirection.Row),
      };

      const totalSize = calculateTotalColumnSize(layoutData);
      expect(totalSize).toBe(600); // 100 + 200 + (150 * 2)
    });

    it('应该从 GridSizingTree 计算总列尺寸', () => {
      const columns = new GridTrackCollectionImpl(GridTrackDirection.Column);
      columns.sets = [
        { baseSize: 100, growthLimit: 100, trackCount: 1, sizingFunction: { type: 'fixed', value: 100 } as GridTrackSize },
        { baseSize: 200, growthLimit: 200, trackCount: 1, sizingFunction: { type: 'fixed', value: 200 } as GridTrackSize },
      ];

      const layoutData: GridLayoutData = {
        columns,
        rows: new GridTrackCollectionImpl(GridTrackDirection.Row),
      };

      const sizingTree = new GridSizingTreeImpl();
      sizingTree.addNode({
        gridItems: [],
        layoutData,
        subtreeSize: 1,
        writingMode: WritingMode.HorizontalTb,
      });

      const totalSize = calculateTotalColumnSize(sizingTree);
      expect(totalSize).toBe(300); // 100 + 200
    });
  });

  describe('calculateIntrinsicBlockSize', () => {
    it('应该计算内在块尺寸', () => {
      const rows = new GridTrackCollectionImpl(GridTrackDirection.Row);
      rows.sets = [
        { baseSize: 50, growthLimit: 50, trackCount: 1, sizingFunction: { type: 'fixed', value: 50 } as GridTrackSize },
        { baseSize: 75, growthLimit: 75, trackCount: 1, sizingFunction: { type: 'fixed', value: 75 } as GridTrackSize },
        { baseSize: 100, growthLimit: 100, trackCount: 2, sizingFunction: { type: 'fixed', value: 100 } as GridTrackSize },
      ];

      const layoutData: GridLayoutData = {
        columns: new GridTrackCollectionImpl(GridTrackDirection.Column),
        rows,
      };

      const gridItems: GridItemData[] = [];

      const intrinsicSize = calculateIntrinsicBlockSize(gridItems, layoutData);
      expect(intrinsicSize).toBe(325); // 50 + 75 + (100 * 2)
    });

    it('应该处理空的行集合', () => {
      const layoutData: GridLayoutData = {
        columns: new GridTrackCollectionImpl(GridTrackDirection.Column),
        rows: new GridTrackCollectionImpl(GridTrackDirection.Row),
      };

      const intrinsicSize = calculateIntrinsicBlockSize([], layoutData);
      expect(intrinsicSize).toBe(0);
    });
  });
});
