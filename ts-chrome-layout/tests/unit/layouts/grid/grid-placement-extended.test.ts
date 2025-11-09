/**
 * GridPlacementAlgorithm 扩展测试 - 提高覆盖率
 */

import { GridPlacementAlgorithm } from '../../../../src/layouts/grid/grid-placement';
import { GridLineResolver } from '../../../../src/layouts/grid/grid-line-resolver';
import { GridStyle } from '../../../../src/types/layouts/grid/grid-style';
import { GridItemData } from '../../../../src/types/layouts/grid/grid-data';
import { ItemAlignment } from '../../../../src/types/common/enums';
import { createGridNode } from '../../../../src/utils/layouts/grid/grid-node-factory';

describe('GridPlacementAlgorithm - Extended', () => {
  let style: GridStyle;
  let lineResolver: GridLineResolver;
  let algorithm: GridPlacementAlgorithm;

  beforeEach(() => {
    style = {
      layoutType: 'grid',
      gridTemplateColumns: [
        { type: 'fixed', value: 100 },
        { type: 'fixed', value: 100 },
        { type: 'fixed', value: 100 },
      ],
      gridTemplateRows: [
        { type: 'fixed', value: 50 },
        { type: 'fixed', value: 50 },
      ],
    };
    
    lineResolver = new GridLineResolver(style);
    algorithm = new GridPlacementAlgorithm(style, lineResolver);
  });

  describe('placeNonAutoGridItems', () => {
    it('应该放置有确定位置的项', () => {
      const gridItems: GridItemData[] = [
        {
          node: createGridNode({ id: 'item1', style }).children[0] || {
            id: 'item1',
            layoutType: 'none',
            x: 0, y: 0, width: 0, height: 0,
            contentWidth: 0, contentHeight: 0,
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
        },
      ];
      
      const result = algorithm.runAutoPlacementAlgorithm(gridItems);
      expect(result.gridItemPositions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('placeGridItemsLockedToMajorAxis', () => {
    it('应该处理锁定到主轴的项', () => {
      const gridItems: GridItemData[] = [
        {
          node: createGridNode({ id: 'item1', style }).children[0] || {
            id: 'item1',
            layoutType: 'none',
            x: 0, y: 0, width: 0, height: 0,
            contentWidth: 0, contentHeight: 0,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            border: { top: 0, right: 0, bottom: 0, left: 0 },
            children: [],
          },
          resolvedPosition: {
            columnStart: 0,
            columnEnd: 1,
            rowStart: -1,
            rowEnd: -1,
          },
          columnSpan: { start: 0, end: 1, size: 1 },
          rowSpan: { start: -1, end: -1, size: 1 },
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
        },
      ];
      
      const result = algorithm.runAutoPlacementAlgorithm(gridItems);
      expect(result).toBeDefined();
    });
  });

  describe('placeAutoBothAxisGridItem', () => {
    it('应该处理完全自动的项', () => {
      const gridItems: GridItemData[] = [
        {
          node: createGridNode({ id: 'item1', style }).children[0] || {
            id: 'item1',
            layoutType: 'none',
            x: 0, y: 0, width: 0, height: 0,
            contentWidth: 0, contentHeight: 0,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            border: { top: 0, right: 0, bottom: 0, left: 0 },
            children: [],
          },
          resolvedPosition: {
            columnStart: -1,
            columnEnd: -1,
            rowStart: -1,
            rowEnd: -1,
          },
          columnSpan: { start: -1, end: -1, size: 1 },
          rowSpan: { start: -1, end: -1, size: 1 },
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
        },
      ];
      
      const result = algorithm.runAutoPlacementAlgorithm(gridItems);
      expect(result).toBeDefined();
      expect(result.gridItemPositions.length).toBeGreaterThanOrEqual(1);
    });
  });
});
