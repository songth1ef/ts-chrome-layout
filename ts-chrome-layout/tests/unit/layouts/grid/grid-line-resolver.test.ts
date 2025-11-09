/**
 * GridLineResolver 测试
 */

import { GridLineResolver } from '../../../../src/layouts/grid/grid-line-resolver';
import { GridStyle } from '../../../../src/types/layouts/grid/grid-style';
import { GridTrackDirection } from '../../../../src/types/common/enums';
import { GridItemStyle } from '../../../../src/types/layouts/grid/grid-position';

describe('GridLineResolver', () => {
  describe('explicitGridTrackCount', () => {
    it('应该正确计算显式轨道数', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
          { type: 'fixed', value: 200 },
          { type: 'auto' },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const resolver = new GridLineResolver(style);
      expect(resolver.explicitGridTrackCount(GridTrackDirection.Column)).toBe(3);
      expect(resolver.explicitGridTrackCount(GridTrackDirection.Row)).toBe(1);
    });

    it('应该处理 repeat 语法', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          {
            type: 'repeat',
            count: 3,
            tracks: [{ type: 'fixed', value: 100 }],
          },
        ],
        gridTemplateRows: [],
      };
      
      const resolver = new GridLineResolver(style);
      expect(resolver.explicitGridTrackCount(GridTrackDirection.Column)).toBe(3);
    });
  });

  describe('resolveGridPositionsFromStyle', () => {
    it('应该解析显式位置', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
          { type: 'fixed', value: 200 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const resolver = new GridLineResolver(style);
      const itemStyle: GridItemStyle = {
        gridColumnStart: { type: 'explicit', value: 1 },
        gridColumnEnd: { type: 'explicit', value: 2 },
        gridRowStart: { type: 'explicit', value: 1 },
        gridRowEnd: { type: 'explicit', value: 2 },
      };
      
      const columnSpan = resolver.resolveGridPositionsFromStyle(
        itemStyle,
        GridTrackDirection.Column
      );
      const rowSpan = resolver.resolveGridPositionsFromStyle(
        itemStyle,
        GridTrackDirection.Row
      );
      
      // 注意：网格线索引从 0 开始
      expect(columnSpan.start).toBeGreaterThanOrEqual(0);
      expect(columnSpan.end).toBeGreaterThan(columnSpan.start);
      expect(rowSpan.start).toBeGreaterThanOrEqual(0);
      expect(rowSpan.end).toBeGreaterThan(rowSpan.start);
    });

    it('应该处理 auto 位置', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const resolver = new GridLineResolver(style);
      const itemStyle: GridItemStyle = {
        gridColumnStart: { type: 'auto' },
        gridColumnEnd: { type: 'auto' },
      };
      
      const columnSpan = resolver.resolveGridPositionsFromStyle(
        itemStyle,
        GridTrackDirection.Column
      );
      
      // auto 位置可能返回 -1（不确定跨度）或有效的索引
      expect(columnSpan.start).toBeGreaterThanOrEqual(-1);
      expect(columnSpan.end).toBeGreaterThanOrEqual(-1);
      // 如果是不确定跨度，end 可能等于 start
      if (columnSpan.start >= 0) {
        expect(columnSpan.end).toBeGreaterThan(columnSpan.start);
      }
    });
  });
});
