import { LayoutEngine, LayoutEngineConfig } from '../../core/layout-engine';
import { GridLayoutAlgorithm } from '../../layouts/grid/grid-layout-algorithm';

/**
 * 创建默认配置的布局引擎
 * 自动注册 Grid 布局算法
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
  
  // 手动注册 Grid 算法（确保可用）
  try {
    engine.register(new GridLayoutAlgorithm());
  } catch (error) {
    // 如果 Grid 算法未实现，忽略错误
    console.warn('Grid layout algorithm not available');
  }
  
  return engine;
}

