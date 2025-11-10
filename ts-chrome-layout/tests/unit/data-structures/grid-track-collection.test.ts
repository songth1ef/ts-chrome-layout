/**
 * GridTrackCollection 测试
 */

import { GridTrackCollectionImpl } from '../../../src/data-structures/layouts/grid/grid-track-collection';
import { GridTrackDirection } from '../../../src/types/common/enums';
import { GridSet, TrackSpanProperties } from '../../../src/types/layouts/grid/grid-data';

const createDefaultProperties = (): TrackSpanProperties => ({
  hasAutoMinimumTrack: false,
  hasFixedMaximumTrack: false,
  hasFixedMinimumTrack: false,
  hasFlexibleTrack: false,
  hasIntrinsicTrack: false,
  isCollapsed: false,
  isImplicit: false,
});

describe('GridTrackCollectionImpl', () => {
  let collection: GridTrackCollectionImpl;

  beforeEach(() => {
    collection = new GridTrackCollectionImpl(GridTrackDirection.Column);
  });

  describe('构造函数', () => {
    it('应该创建指定方向的集合', () => {
      const colCollection = new GridTrackCollectionImpl(GridTrackDirection.Column);
      expect(colCollection.direction).toBe(GridTrackDirection.Column);

      const rowCollection = new GridTrackCollectionImpl(GridTrackDirection.Row);
      expect(rowCollection.direction).toBe(GridTrackDirection.Row);
    });

    it('应该初始化空数组', () => {
      expect(collection.ranges).toEqual([]);
      expect(collection.sets).toEqual([]);
    });
  });

  describe('getSetOffset', () => {
    it('应该在集合为空时返回 0', () => {
      expect(collection.getSetOffset(0)).toBe(0);
      expect(collection.getSetOffset(5)).toBe(0);
    });

    it('应该计算第一个集合的偏移量', () => {
      const set1: GridSet = {
        baseSize: 100,
        growthLimit: 200,
        trackCount: 2,
        sizingFunction: { type: 'fixed', value: 100 },
      };
      collection.sets.push(set1);

      expect(collection.getSetOffset(0)).toBe(0);
    });

    it('应该计算多个集合的偏移量', () => {
      const set1: GridSet = {
        baseSize: 100,
        growthLimit: 200,
        trackCount: 2,
        sizingFunction: { type: 'fixed', value: 100 },
      };
      const set2: GridSet = {
        baseSize: 150,
        growthLimit: 300,
        trackCount: 1,
        sizingFunction: { type: 'fixed', value: 150 },
      };
      collection.sets.push(set1, set2);

      expect(collection.getSetOffset(0)).toBe(0);
      expect(collection.getSetOffset(1)).toBe(200); // 100 * 2
    });

    it('应该在索引无效时返回 0', () => {
      const set: GridSet = {
        baseSize: 100,
        growthLimit: 200,
        trackCount: 1,
        sizingFunction: { type: 'fixed', value: 100 },
      };
      collection.sets.push(set);

      expect(collection.getSetOffset(-1)).toBe(0);
      expect(collection.getSetOffset(10)).toBe(0);
    });
  });

  describe('getSetSize', () => {
    it('应该在集合为空时返回 0', () => {
      expect(collection.getSetSize(0)).toBe(0);
    });

    it('应该计算集合大小', () => {
      const set: GridSet = {
        baseSize: 100,
        growthLimit: 200,
        trackCount: 3,
        sizingFunction: { type: 'fixed', value: 100 },
      };
      collection.sets.push(set);

      expect(collection.getSetSize(0)).toBe(300); // 100 * 3
    });

    it('应该在索引无效时返回 0', () => {
      const set: GridSet = {
        baseSize: 100,
        growthLimit: 200,
        trackCount: 1,
        sizingFunction: { type: 'fixed', value: 100 },
      };
      collection.sets.push(set);

      expect(collection.getSetSize(-1)).toBe(0);
      expect(collection.getSetSize(10)).toBe(0);
    });
  });

  describe('getRangeIndexFromLine', () => {
    it('应该在 ranges 为空时返回 -1', () => {
      expect(collection.getRangeIndexFromLine(0)).toBe(-1);
    });

    it('应该找到包含指定网格线的范围', () => {
      collection.ranges.push(
        { startLine: 0, beginSetIndex: 0, setCount: 1, trackCount: 2, properties: createDefaultProperties() },
        { startLine: 2, beginSetIndex: 1, setCount: 1, trackCount: 3, properties: createDefaultProperties() },
        { startLine: 5, beginSetIndex: 2, setCount: 1, trackCount: 1, properties: createDefaultProperties() }
      );

      expect(collection.getRangeIndexFromLine(0)).toBe(0);
      expect(collection.getRangeIndexFromLine(1)).toBe(0);
      expect(collection.getRangeIndexFromLine(2)).toBe(1);
      expect(collection.getRangeIndexFromLine(4)).toBe(1);
      expect(collection.getRangeIndexFromLine(5)).toBe(2);
    });

    it('应该在网格线为负数时返回 0', () => {
      collection.ranges.push({ startLine: 0, beginSetIndex: 0, setCount: 1, trackCount: 2, properties: createDefaultProperties() });
      expect(collection.getRangeIndexFromLine(-1)).toBe(0);
    });

    it('应该在网格线超出范围时返回最后一个索引', () => {
      collection.ranges.push(
        { startLine: 0, beginSetIndex: 0, setCount: 1, trackCount: 2, properties: createDefaultProperties() },
        { startLine: 2, beginSetIndex: 1, setCount: 1, trackCount: 3, properties: createDefaultProperties() }
      );

      expect(collection.getRangeIndexFromLine(10)).toBe(1);
    });
  });

  describe('hasIntrinsicTrack', () => {
    it('应该在集合为空时返回 false', () => {
      expect(collection.hasIntrinsicTrack()).toBe(false);
    });

    it('应该识别 min-content 轨道', () => {
      const set: GridSet = {
        baseSize: 0,
        growthLimit: Infinity,
        trackCount: 1,
        sizingFunction: { type: 'min-content' },
      };
      collection.sets.push(set);

      expect(collection.hasIntrinsicTrack()).toBe(true);
    });

    it('应该识别 max-content 轨道', () => {
      const set: GridSet = {
        baseSize: 0,
        growthLimit: Infinity,
        trackCount: 1,
        sizingFunction: { type: 'max-content' },
      };
      collection.sets.push(set);

      expect(collection.hasIntrinsicTrack()).toBe(true);
    });

    it('应该识别 auto 轨道', () => {
      const set: GridSet = {
        baseSize: 0,
        growthLimit: Infinity,
        trackCount: 1,
        sizingFunction: { type: 'auto' },
      };
      collection.sets.push(set);

      expect(collection.hasIntrinsicTrack()).toBe(true);
    });

    it('应该识别 minmax 中的内在尺寸', () => {
      const set: GridSet = {
        baseSize: 0,
        growthLimit: Infinity,
        trackCount: 1,
        sizingFunction: {
          type: 'minmax',
          min: { type: 'min-content' },
          max: { type: 'fixed', value: 200 },
        },
      };
      collection.sets.push(set);

      expect(collection.hasIntrinsicTrack()).toBe(true);
    });

    it('应该在只有固定尺寸时返回 false', () => {
      const set: GridSet = {
        baseSize: 100,
        growthLimit: 200,
        trackCount: 1,
        sizingFunction: { type: 'fixed', value: 100 },
      };
      collection.sets.push(set);

      expect(collection.hasIntrinsicTrack()).toBe(false);
    });
  });

  describe('hasFlexibleTrack', () => {
    it('应该在集合为空时返回 false', () => {
      expect(collection.hasFlexibleTrack()).toBe(false);
    });

    it('应该识别 fr 轨道', () => {
      const set: GridSet = {
        baseSize: 0,
        growthLimit: Infinity,
        trackCount: 1,
        sizingFunction: { type: 'fr', value: 1 },
      };
      collection.sets.push(set);

      expect(collection.hasFlexibleTrack()).toBe(true);
    });

    it('应该识别 minmax 中的 fr', () => {
      const set: GridSet = {
        baseSize: 0,
        growthLimit: Infinity,
        trackCount: 1,
        sizingFunction: {
          type: 'minmax',
          min: { type: 'fixed', value: 100 },
          max: { type: 'fr', value: 1 },
        },
      };
      collection.sets.push(set);

      expect(collection.hasFlexibleTrack()).toBe(true);
    });

    it('应该在只有固定尺寸时返回 false', () => {
      const set: GridSet = {
        baseSize: 100,
        growthLimit: 200,
        trackCount: 1,
        sizingFunction: { type: 'fixed', value: 100 },
      };
      collection.sets.push(set);

      expect(collection.hasFlexibleTrack()).toBe(false);
    });
  });
});
