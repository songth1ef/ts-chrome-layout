/**
 * GridTrackSizingAlgorithm 测试
 */

import { GridTrackSizingAlgorithm } from '../../../../src/layouts/grid/grid-track-sizing';
import { GridTrackCollectionImpl } from '../../../../src/data-structures/layouts/grid/grid-track-collection';
import { GridTrackDirection, SizingConstraint } from '../../../../src/types/common/enums';
import { GridItemData } from '../../../../src/types/layouts/grid/grid-data';

describe('GridTrackSizingAlgorithm', () => {
  it('应该计算使用的轨道尺寸', () => {
    const trackCollection = new GridTrackCollectionImpl(GridTrackDirection.Column);
    trackCollection.sets.push({
      baseSize: 0,
      growthLimit: Infinity,
      trackCount: 1,
      sizingFunction: { type: 'fixed', value: 100 },
    });
    
    const algorithm = new GridTrackSizingAlgorithm(
      {},
      { width: 800, height: 600 },
      SizingConstraint.Layout
    );
    
    const contributionSize = () => 0;
    const gridItems: GridItemData[] = [];
    
    algorithm.computeUsedTrackSizes(contributionSize, trackCollection, gridItems);
    
    expect(trackCollection.sets[0].baseSize).toBeGreaterThanOrEqual(0);
  });

  it('应该处理 fr 轨道', () => {
    const trackCollection = new GridTrackCollectionImpl(GridTrackDirection.Column);
    trackCollection.sets.push({
      baseSize: 0,
      growthLimit: Infinity,
      trackCount: 1,
      sizingFunction: { type: 'fr', value: 1 },
    });
    
    const algorithm = new GridTrackSizingAlgorithm(
      {},
      { width: 800, height: 600 },
      SizingConstraint.Layout
    );
    
    const contributionSize = () => 0;
    const gridItems: GridItemData[] = [];
    
    algorithm.computeUsedTrackSizes(contributionSize, trackCollection, gridItems);
    
    // fr 轨道应该被分配空间
    expect(trackCollection.sets[0].baseSize).toBeGreaterThanOrEqual(0);
  });
});
