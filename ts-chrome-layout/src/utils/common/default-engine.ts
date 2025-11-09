import { LayoutEngine, LayoutEngineConfig } from '../../core/layout-engine';
import { GridLayoutAlgorithm } from '../../layouts/grid/grid-layout-algorithm';
import { FlexLayoutAlgorithm } from '../../layouts/flex/flex-layout-algorithm';
import { BlockLayoutAlgorithm } from '../../layouts/block/block-layout-algorithm';
import { InlineLayoutAlgorithm } from '../../layouts/inline/inline-layout-algorithm';
import { TableLayoutAlgorithm } from '../../layouts/table/table-layout-algorithm';

/**
 * 创建默认配置的布局引擎
 * 自动注册所有布局算法（Grid、Flex、Block、Inline、Table）
 * 
 * @param config 可选的引擎配置
 * @returns 配置好的布局引擎
 */
export function createDefaultEngine(config?: LayoutEngineConfig): LayoutEngine {
  const engine = new LayoutEngine({
    autoRegisterDefaults: true,
    enableValidation: true,
    ...config,
  });
  
  // 手动注册所有算法（确保可用）
  try {
    engine.register(new GridLayoutAlgorithm());
  } catch (error) {
    console.warn('Grid layout algorithm not available');
  }
  
  try {
    engine.register(new FlexLayoutAlgorithm());
  } catch (error) {
    console.warn('Flex layout algorithm not available');
  }
  
  try {
    engine.register(new BlockLayoutAlgorithm());
  } catch (error) {
    console.warn('Block layout algorithm not available');
  }
  
  try {
    engine.register(new InlineLayoutAlgorithm());
  } catch (error) {
    console.warn('Inline layout algorithm not available');
  }
  
  try {
    engine.register(new TableLayoutAlgorithm());
  } catch (error) {
    console.warn('Table layout algorithm not available');
  }
  
  return engine;
}

