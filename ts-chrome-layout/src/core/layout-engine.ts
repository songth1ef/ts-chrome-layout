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
import { quickHash } from '../utils/common/hash';

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
  
  // 缓存失效策略
  cacheInvalidationStrategy?: 'aggressive' | 'conservative' | 'smart';
  
  // 是否启用增量更新
  enableIncrementalUpdate?: boolean;
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
      cacheInvalidationStrategy: config.cacheInvalidationStrategy ?? 'smart',
      enableIncrementalUpdate: config.enableIncrementalUpdate ?? false,
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
   * 
   * 优化：支持增量更新和智能缓存失效
   */
  layout(node: LayoutNode, constraintSpace: ConstraintSpace): LayoutResult {
    // 生成缓存键
    const cacheKey = this.config.enableCache
      ? this.generateCacheKey(node, constraintSpace)
      : null;
    
    // 尝试从缓存获取
    if (cacheKey && this.config.cache?.has(cacheKey)) {
      const cachedResult = this.config.cache!.get(cacheKey)!;
      
      // 检查是否需要重新计算（增量更新）
      if (this.config.enableIncrementalUpdate) {
        if (!this.shouldInvalidateCache(node, constraintSpace, cachedResult)) {
          getLogger().debug(`Cache hit for node: ${node.id}`);
          return cachedResult;
        }
        getLogger().debug(`Cache invalidated for node: ${node.id}, recalculating...`);
      } else {
        getLogger().debug(`Cache hit for node: ${node.id}`);
        return cachedResult;
      }
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
   * 检查是否应该使缓存失效
   * 
   * 根据缓存失效策略决定是否重新计算
   */
  private shouldInvalidateCache(
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    cachedResult: LayoutResult
  ): boolean {
    const strategy = this.config.cacheInvalidationStrategy || 'smart';
    
    switch (strategy) {
      case 'aggressive':
        // 激进策略：总是重新计算
        return true;
        
      case 'conservative':
        // 保守策略：只在明显变化时失效
        return this.hasNodeChanged(node, cachedResult.node);
        
      case 'smart':
      default:
        // 智能策略：检查关键属性
        // 1. 检查约束空间是否变化
        if (constraintSpace.availableWidth !== cachedResult.constraintSpace?.availableWidth ||
            constraintSpace.availableHeight !== cachedResult.constraintSpace?.availableHeight) {
          return true;
        }
        
        // 2. 检查子项数量是否变化
        const currentChildrenCount = node.children?.length || 0;
        const cachedChildrenCount = cachedResult.node?.children?.length || 0;
        if (currentChildrenCount !== cachedChildrenCount) {
          return true;
        }
        
        // 3. 检查节点尺寸是否变化（如果已测量）
        if (node.width !== cachedResult.node?.width ||
            node.height !== cachedResult.node?.height) {
          return true;
        }
        
        return false;
    }
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
   * 
   * 优化：使用快速哈希而不是JSON.stringify，提升性能
   */
  private generateCacheKey(node: LayoutNode, constraintSpace: ConstraintSpace): string {
    // 使用快速哈希生成缓存键
    // 只包含影响布局结果的关键属性
    const keyData = {
      id: node.id,
      layoutType: node.layoutType,
      availableWidth: constraintSpace.availableWidth,
      availableHeight: constraintSpace.availableHeight,
      // 添加节点尺寸（如果已测量）
      width: node.width,
      height: node.height,
      // 添加子项数量（影响布局）
      childrenCount: node.children?.length || 0,
    };
    
    return quickHash(keyData, [
      'id',
      'layoutType',
      'availableWidth',
      'availableHeight',
      'width',
      'height',
      'childrenCount',
    ]);
  }
  
  /**
   * 检查节点是否可能影响缓存
   * 
   * 用于增量更新：如果节点没有变化，可以复用缓存
   */
  private hasNodeChanged(node: LayoutNode, cachedNode?: LayoutNode): boolean {
    if (!cachedNode) {
      return true;
    }
    
    // 检查关键属性是否变化
    if (node.id !== cachedNode.id ||
        node.layoutType !== cachedNode.layoutType ||
        (node.children?.length || 0) !== (cachedNode.children?.length || 0)) {
      return true;
    }
    
    // 检查样式是否变化（简化：只检查布局类型）
    // 完整实现应该深度比较样式对象
    return false;
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
