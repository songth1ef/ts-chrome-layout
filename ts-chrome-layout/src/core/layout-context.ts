import { LayoutNode } from '../types/common/layout-node';
import { ConstraintSpace } from '../types/common/constraint-space';

/**
 * 错误代码枚举
 * 
 * 对应 Chromium: 错误处理（概念上）
 */
export enum ErrorCode {
  // 通用错误
  UnknownError = 'UNKNOWN_ERROR',
  InvalidArgument = 'INVALID_ARGUMENT',
  InvalidState = 'INVALID_STATE',
  
  // 布局相关错误
  UnsupportedLayoutType = 'UNSUPPORTED_LAYOUT_TYPE',
  InvalidConstraintSpace = 'INVALID_CONSTRAINT_SPACE',
  InvalidNode = 'INVALID_NODE',
  AlgorithmNotFound = 'ALGORITHM_NOT_FOUND',
  CalculationError = 'CALCULATION_ERROR',
  
  // Grid 相关错误
  InvalidGridConfiguration = 'INVALID_GRID_CONFIGURATION',
  InvalidGridItem = 'INVALID_GRID_ITEM',
  GridPlacementError = 'GRID_PLACEMENT_ERROR',
  TrackSizingError = 'TRACK_SIZING_ERROR',
  
  // 引擎相关错误
  CacheError = 'CACHE_ERROR',
  PerformanceError = 'PERFORMANCE_ERROR',
}

/**
 * 基础错误类
 * 
 * 对应 Chromium: 错误处理（概念上）
 */
export class BaseError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 布局上下文
 * 包含布局计算所需的所有上下文信息
 * 
 * 对应 Chromium: LayoutAlgorithmParams
 */
export interface LayoutContext {
  // 节点和约束空间
  node: LayoutNode;
  constraintSpace: ConstraintSpace;
  
  // 性能监控（可选）
  performanceMonitor?: PerformanceMonitor;
  
  // 调试选项（可选）
  debugOptions?: DebugOptions;
  
  // 错误处理（可选）
  errorHandler?: ErrorHandler;
  
  // 缓存（可选）
  cache?: LayoutCache;
}

/**
 * 性能监控接口
 */
export interface PerformanceMonitor {
  startMeasure(name: string): void;
  endMeasure(name: string): number;
  getMetrics(): PerformanceMetrics;
  reset(): void;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  measures: Map<string, number>;
  totalTime: number;
  callCount: number;
}

/**
 * 调试选项
 */
export interface DebugOptions {
  enableLogging?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  traceLayout?: boolean;
  validateResults?: boolean;
  dumpLayoutTree?: boolean;
}

/**
 * 错误处理接口
 */
export interface ErrorHandler {
  onError(error: LayoutError): void;
  shouldThrow(error: LayoutError): boolean;
  onRecoverableError?(error: LayoutError): void;
}

/**
 * 布局缓存接口
 */
export interface LayoutCache<T = any> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  has(key: string): boolean;
  clear(): void;
}

/**
 * 布局错误代码
 * 使用 ErrorCode 的别名，保持向后兼容
 */
export type LayoutErrorCode = ErrorCode;

/**
 * 布局错误
 * 继承自 BaseError，添加布局特定的上下文信息
 */
export class LayoutError extends BaseError {
  constructor(
    message: string,
    code: LayoutErrorCode,
    public readonly node?: LayoutNode,
    public readonly context?: any,
    cause?: Error
  ) {
    super(message, code, cause);
    this.name = 'LayoutError';
  }
}

/**
 * 默认错误处理器
 */
export class DefaultErrorHandler implements ErrorHandler {
  onError(error: LayoutError): void {
    // 在测试环境中不输出错误日志（避免测试输出混乱）
    if (process.env.NODE_ENV !== 'test' && typeof process !== 'undefined') {
    console.error(`[LayoutError] ${error.code}: ${error.message}`, {
      node: error.node?.id,
      context: error.context,
      cause: error.cause,
    });
    }
  }
  
  shouldThrow(error: LayoutError): boolean {
    // 严重错误应该抛出
    return [
      ErrorCode.UnsupportedLayoutType,
      ErrorCode.AlgorithmNotFound,
      ErrorCode.InvalidNode,
    ].includes(error.code);
  }
  
  onRecoverableError?(error: LayoutError): void {
    // 默认实现：记录警告
    console.warn(`[LayoutWarning] ${error.code}: ${error.message}`);
  }
}

/**
 * 默认性能监控器
 */
export class DefaultPerformanceMonitor implements PerformanceMonitor {
  private measures: Map<string, { start: number; end?: number }> = new Map();
  private callCount: number = 0;
  
  startMeasure(name: string): void {
    this.measures.set(name, { start: performance.now() });
  }
  
  endMeasure(name: string): number {
    const measure = this.measures.get(name);
    if (!measure) {
      throw new Error(`Measure "${name}" not found`);
    }
    measure.end = performance.now();
    this.callCount++;
    return measure.end - measure.start;
  }
  
  getMetrics(): PerformanceMetrics {
    const measures = new Map<string, number>();
    let totalTime = 0;
    
    for (const [name, measure] of this.measures.entries()) {
      if (measure.end) {
        const duration = measure.end - measure.start;
        measures.set(name, duration);
        totalTime += duration;
      }
    }
    
    return { measures, totalTime, callCount: this.callCount };
  }
  
  reset(): void {
    this.measures.clear();
    this.callCount = 0;
  }
}
