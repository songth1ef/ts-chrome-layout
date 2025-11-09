import { LayoutNode, LayoutResult, MeasureResult } from '../types/common/layout-node';
import { ConstraintSpace } from '../types/common/constraint-space';
import { LayoutAlgorithm } from './layout-algorithm';
import { AlgorithmRegistry } from './algorithm-registry';
import {
  LayoutContext,
  LayoutError,
  ErrorCode,
  PerformanceMonitor,
  PerformanceMetrics,
  DebugOptions,
  ErrorHandler,
  DefaultErrorHandler,
  DefaultPerformanceMonitor,
  LayoutCache,
} from './layout-context';
import { LayoutValidator } from './validator';
import { getLogger } from './logger';
import { LRUCache } from '../utils/common/cache';

/**
 * 布局引擎配置
 */
export interface LayoutEngineConfig {
  // 是否启用验证
  enableValidation?: boolean;
  
  // 是否启用性能监控
  enablePerformanceMonitoring?: boolean;
  
  // 是否启用缓存
  enableCache?: boolean;
  
  // 缓存大小
  cacheSize?: number;
  
  // 调试选项
  debugOptions?: DebugOptions;
  
  // 错误处理器
  errorHandler?: ErrorHandler;
  
  // 性能监控器
  performanceMonitor?: PerformanceMonitor;
  
  // 缓存实现
  cache?: LayoutCache;
  
  // 是否自动注册默认算法
  autoRegisterDefaults?: boolean;
}

/**
 * 布局引擎
 * 通用的布局引擎，支持多种布局模式
 * 
 * 使用算法注册机制，可以动态添加新的布局算法
 * 
 * 对应 Chromium: LayoutEngine (概念上)
 */
export class LayoutEngine {
  private registry: AlgorithmRegistry;
  private config: Required<Omit<LayoutEngineConfig, 'cache' | 'performanceMonitor' | 'errorHandler'>> & {
    cache?: LayoutCache;
    performanceMonitor?: PerformanceMonitor;
    errorHandler?: ErrorHandler;
  };
  
  constructor(config: LayoutEngineConfig = {}) {
    this.registry = new AlgorithmRegistry();
    
    // 设置默认配置
    this.config = {
      enableValidation: config.enableValidation ?? true,
      enablePerformanceMonitoring: config.enablePerformanceMonitoring ?? false,
      enableCache: config.enableCache ?? false,
      cacheSize: config.cacheSize ?? 100,
      debugOptions: config.debugOptions ?? {},
      errorHandler: config.errorHandler ?? new DefaultErrorHandler(),
      performanceMonitor: config.performanceMonitor ?? new DefaultPerformanceMonitor(),
      cache: config.cache ?? (config.enableCache ? new LRUCache<string, LayoutResult>(config.cacheSize ?? 100) as LayoutCache<LayoutResult> : undefined),
      autoRegisterDefaults: config.autoRegisterDefaults ?? false,
    };
    
    // 自动注册默认算法
    if (this.config.autoRegisterDefaults) {
      this.registerDefaults();
    }
  }
  
  /**
   * 注册默认算法
   */
  private registerDefaults(): void {
    // 延迟导入，避免循环依赖
    try {
      // 使用动态导入（ES modules）
      import('../layouts/grid/grid-layout-algorithm').then((module) => {
        this.register(new module.GridLayoutAlgorithm());
      }).catch((error) => {
        // Grid 算法可能还未实现，忽略错误
        getLogger().warn('Failed to register default Grid algorithm', error);
      });
    } catch (error) {
      // 如果动态导入失败，忽略错误
      getLogger().warn('Failed to register default Grid algorithm', error);
    }
  }
  
  /**
   * 注册布局算法
   * 
   * @example
   * ```typescript
   * const engine = new LayoutEngine();
   * engine.register(new GridLayoutAlgorithm());
   * engine.register(new FlexLayoutAlgorithm());
   * ```
   */
  register(algorithm: LayoutAlgorithm): void {
    this.registry.register(algorithm);
  }
  
  /**
   * 执行布局
   */
  layout(node: LayoutNode, constraintSpace: ConstraintSpace): LayoutResult {
    // 生成缓存键
    const cacheKey = this.config.enableCache
      ? this.generateCacheKey(node, constraintSpace)
      : null;
    
    // 尝试从缓存获取
    if (cacheKey && this.config.cache?.has(cacheKey)) {
      getLogger().debug(`Cache hit for node: ${node.id}`);
      return this.config.cache!.get(cacheKey)!;
    }
    
    const context: LayoutContext = {
      node,
      constraintSpace,
      performanceMonitor: this.config.enablePerformanceMonitoring
        ? this.config.performanceMonitor
        : undefined,
      debugOptions: this.config.debugOptions,
      errorHandler: this.config.errorHandler,
      cache: this.config.cache,
    };
    
    const result = this.layoutWithContext(context);
    
    // 缓存结果
    if (cacheKey && this.config.cache) {
      this.config.cache.set(cacheKey, result);
    }
    
    return result;
  }
  
  /**
   * 使用上下文执行布局
   */
  private layoutWithContext(context: LayoutContext): LayoutResult {
    const { node, constraintSpace } = context;
    
    // 验证输入
    if (this.config.enableValidation) {
      LayoutValidator.validateNode(node);
      LayoutValidator.validateConstraintSpace(constraintSpace);
    }
    
    // 性能监控
    if (context.performanceMonitor) {
      context.performanceMonitor.startMeasure('layout');
    }
    
    try {
      // 获取算法
      let algorithm: LayoutAlgorithm;
      try {
        algorithm = this.registry.get(node.layoutType);
      } catch (error) {
        // 将 registry 抛出的错误转换为 LayoutError
        throw new LayoutError(
          error instanceof Error ? error.message : `Layout algorithm for type "${node.layoutType}" is not registered`,
          ErrorCode.AlgorithmNotFound,
          node
        );
      }
      
      // 执行布局
      const result = algorithm.layout(node, constraintSpace);
      
      // 验证结果
      if (this.config.enableValidation) {
        LayoutValidator.validateLayoutResult(result);
      }
      
      // 性能监控
      if (context.performanceMonitor) {
        context.performanceMonitor.endMeasure('layout');
      }
      
      getLogger().debug(`Layout completed for node: ${node.id}`);
      
      return result;
    } catch (error) {
      // 错误处理
      if (error instanceof LayoutError) {
        context.errorHandler?.onError(error);
        // 对于算法未找到等关键错误，必须抛出（不依赖 shouldThrow）
        if (error.code === ErrorCode.AlgorithmNotFound) {
          throw error;
        }
        // 其他错误根据 shouldThrow 决定
        if (context.errorHandler?.shouldThrow(error)) {
          throw error;
        }
      } else {
        const layoutError = new LayoutError(
          error instanceof Error ? error.message : 'Unknown error',
          ErrorCode.CalculationError,
          node,
          undefined,
          error instanceof Error ? error : undefined
        );
        context.errorHandler?.onError(layoutError);
        if (context.errorHandler?.shouldThrow(layoutError)) {
          throw layoutError;
        }
      }
      
      // 返回默认结果（仅在错误被捕获且不抛出时）
      return {
        width: 0,
        height: 0,
        children: [],
      };
    }
  }
  
  /**
   * 生成缓存键
   */
  private generateCacheKey(node: LayoutNode, constraintSpace: ConstraintSpace): string {
    // 简单的缓存键生成（可以优化为更复杂的哈希）
    return JSON.stringify({
      id: node.id,
      layoutType: node.layoutType,
      availableWidth: constraintSpace.availableWidth,
      availableHeight: constraintSpace.availableHeight,
      // 可以添加更多关键属性
    });
  }
  
  /**
   * 仅测量
   */
  measure(node: LayoutNode, constraintSpace: ConstraintSpace) {
    if (this.config.enableValidation) {
      LayoutValidator.validateNode(node);
      LayoutValidator.validateConstraintSpace(constraintSpace);
    }
    
    const algorithm = this.registry.get(node.layoutType);
    return algorithm.measure(node, constraintSpace);
  }
  
  /**
   * 仅排列
   */
  arrange(
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    measureResult: MeasureResult
  ) {
    if (this.config.enableValidation) {
      LayoutValidator.validateNode(node);
      LayoutValidator.validateConstraintSpace(constraintSpace);
    }
    
    const algorithm = this.registry.get(node.layoutType);
    return algorithm.arrange(node, constraintSpace, measureResult);
  }
  
  /**
   * 获取已注册的布局类型
   */
  getRegisteredTypes(): string[] {
    return this.registry.getRegisteredTypes();
  }
  
  /**
   * 检查是否支持指定的布局类型
   */
  supports(layoutType: string): boolean {
    return this.registry.has(layoutType as any);
  }
  
  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics | null {
    if (!this.config.enablePerformanceMonitoring || !this.config.performanceMonitor) {
      return null;
    }
    return this.config.performanceMonitor.getMetrics();
  }
  
  /**
   * 清除缓存
   */
  clearCache(): void {
    this.config.cache?.clear();
    getLogger().debug('Layout cache cleared');
  }
  
  /**
   * 更新配置
   */
  updateConfig(config: Partial<LayoutEngineConfig>): void {
    if (config.enableCache !== undefined) {
      this.config.enableCache = config.enableCache;
      if (config.enableCache && !this.config.cache) {
        this.config.cache = new LRUCache<string, LayoutResult>(config.cacheSize ?? this.config.cacheSize);
      } else if (!config.enableCache) {
        this.config.cache = undefined;
      }
    }
    
    if (config.cacheSize !== undefined && this.config.cache) {
      // 如果缓存大小改变，需要重新创建缓存
      this.config.cache = new LRUCache<string, LayoutResult>(config.cacheSize);
      // 可以选择性地迁移一些数据（未来实现）
    }
    
    Object.assign(this.config, config);
  }
  
  /**
   * 重置性能监控
   */
  resetPerformanceMonitoring(): void {
    this.config.performanceMonitor?.reset();
  }
}
