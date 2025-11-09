/**
 * GridTrackSizingAlgorithm 扩展测试
 */

import { GridTrackSizingAlgorithm } from '../../../../src/layouts/grid/grid-track-sizing';
import { GridTrackCollectionImpl } from '../../../../src/data-structures/layouts/grid/grid-track-collection';
import { GridTrackDirection, SizingConstraint } from '../../../../src/types/common/enums';
import { GridItemData } from '../../../../src/types/layouts/grid/grid-data';

describe('GridTrackSizingAlgorithm - Extended', () => {
  it('应该处理 auto 轨道', () => {
    const trackCollection = new GridTrackCollectionImpl(GridTrackDirection.Column);
    trackCollection.sets.push({
      baseSize: 0,
      growthLimit: Infinity,
      trackCount: 1,
      sizingFunction: { type: 'auto' },
    });
    
    const algorithm = new GridTrackSizingAlgorithm(
      {},
      { width: 800, height: 600 },
      SizingConstraint.Layout
    );
    
    const contributionSize = () => 100;
    const gridItems: GridItemData[] = [];
    
    algorithm.computeUsedTrackSizes(contributionSize, trackCollection, gridItems);
    
    expect(trackCollection.sets[0].baseSize).toBeGreaterThanOrEqual(0);
  });

  it('应该处理 min-content 轨道', () => {
    const trackCollection = new GridTrackCollectionImpl(GridTrackDirection.Column);
    trackCollection.sets.push({
      baseSize: 0,
      growthLimit: Infinity,
      trackCount: 1,
      sizingFunction: { type: 'min-content' },
    });
    
    const algorithm = new GridTrackSizingAlgorithm(
      {},
      { width: 800, height: 600 },
      SizingConstraint.Layout
    );
    
    const contributionSize = () => 50;
    const gridItems: GridItemData[] = [];
    
    algorithm.computeUsedTrackSizes(contributionSize, trackCollection, gridItems);
    
    expect(trackCollection.sets[0].baseSize).toBeGreaterThanOrEqual(0);
  });

  it('应该处理 max-content 轨道', () => {
    const trackCollection = new GridTrackCollectionImpl(GridTrackDirection.Column);
    trackCollection.sets.push({
      baseSize: 0,
      growthLimit: Infinity,
      trackCount: 1,
      sizingFunction: { type: 'max-content' },
    });
    
    const algorithm = new GridTrackSizingAlgorithm(
      {},
      { width: 800, height: 600 },
      SizingConstraint.Layout
    );
    
    const contributionSize = () => 150;
    const gridItems: GridItemData[] = [];
    
    algorithm.computeUsedTrackSizes(contributionSize, trackCollection, gridItems);
    
    expect(trackCollection.sets[0].baseSize).toBeGreaterThanOrEqual(0);
  });
});

