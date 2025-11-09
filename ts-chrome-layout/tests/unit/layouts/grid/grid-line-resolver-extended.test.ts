/**
 * GridLineResolver 扩展测试 - 提高覆盖率
 */

import { GridLineResolver } from '../../../../src/layouts/grid/grid-line-resolver';
import { GridStyle } from '../../../../src/types/layouts/grid/grid-style';
import { GridTrackDirection } from '../../../../src/types/common/enums';
import { GridItemStyle } from '../../../../src/types/layouts/grid/grid-position';

describe('GridLineResolver - Extended', () => {
  describe('autoRepeatTrackCount', () => {
    it('应该计算自动重复轨道数', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          {
            type: 'repeat',
            count: 'auto-fill',
            tracks: [{ type: 'fixed', value: 100 }],
          },
        ],
        gridTemplateRows: [],
      };
      
      const resolver = new GridLineResolver(style, 5, 1);
      expect(resolver.autoRepeatTrackCount(GridTrackDirection.Column)).toBe(5);
    });

    it('应该处理 auto-fit', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateRows: [
          {
            type: 'repeat',
            count: 'auto-fit',
            tracks: [{ type: 'fixed', value: 50 }],
          },
        ],
        gridTemplateColumns: [],
      };
      
      const resolver = new GridLineResolver(style, 1, 3);
      expect(resolver.autoRepeatTrackCount(GridTrackDirection.Row)).toBe(3);
    });
  });

  describe('resolveGridPositionsFromStyle - 复杂场景', () => {
    it('应该处理 span 位置', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
          { type: 'fixed', value: 100 },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      };
      
      const resolver = new GridLineResolver(style);
      const itemStyle: GridItemStyle = {
        gridColumnStart: { type: 'explicit', value: 1 },
        gridColumnEnd: { type: 'span', value: 2 },
      };
      
      const columnSpan = resolver.resolveGridPositionsFromStyle(
        itemStyle,
        GridTrackDirection.Column
      );
      
      expect(columnSpan.start).toBeGreaterThanOrEqual(0);
      expect(columnSpan.size).toBe(2);
    });

    it('应该处理负数位置', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
          { type: 'fixed', value: 100 },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [],
      };
      
      const resolver = new GridLineResolver(style);
      const itemStyle: GridItemStyle = {
        gridColumnStart: { type: 'explicit', value: -1 },
        gridColumnEnd: { type: 'explicit', value: -1 },
      };
      
      const columnSpan = resolver.resolveGridPositionsFromStyle(
        itemStyle,
        GridTrackDirection.Column
      );
      
      expect(columnSpan.start).toBeGreaterThanOrEqual(0);
    });

    it('应该处理命名网格线', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [],
        namedGridLines: {
          columns: ['start', 'middle', 'end'],
        },
      };
      
      const resolver = new GridLineResolver(style);
      const itemStyle: GridItemStyle = {
        gridColumnStart: { type: 'explicit', value: 1, namedLine: 'middle' },
        gridColumnEnd: { type: 'explicit', value: 2 },
      };
      
      const columnSpan = resolver.resolveGridPositionsFromStyle(
        itemStyle,
        GridTrackDirection.Column
      );
      
      expect(columnSpan.start).toBeGreaterThanOrEqual(0);
    });

    it('应该处理命名区域', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
          { type: 'fixed', value: 50 },
        ],
        gridTemplateAreas: [
          ['header', 'header'],
          ['content', 'sidebar'],
        ],
      };
      
      const resolver = new GridLineResolver(style);
      const itemStyle: GridItemStyle = {
        gridColumnStart: { type: 'named-area', name: 'header', side: 'start' },
        gridColumnEnd: { type: 'named-area', name: 'header', side: 'end' },
      };
      
      const columnSpan = resolver.resolveGridPositionsFromStyle(
        itemStyle,
        GridTrackDirection.Column
      );
      
      expect(columnSpan.start).toBeGreaterThanOrEqual(0);
    });

    it('应该处理 auto 和 span 组合', () => {
      const style: GridStyle = {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
          { type: 'fixed', value: 100 },
        ],
        gridTemplateRows: [],
      };
      
      const resolver = new GridLineResolver(style);
      const itemStyle: GridItemStyle = {
        gridColumnStart: { type: 'auto' },
        gridColumnEnd: { type: 'span', value: 2 },
      };
      
      const columnSpan = resolver.resolveGridPositionsFromStyle(
        itemStyle,
        GridTrackDirection.Column
      );
      
      expect(columnSpan.size).toBe(2);
    });
  });
});
