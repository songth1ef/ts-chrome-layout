import { LayoutAlgorithm } from './layout-algorithm';
import { LayoutType } from '../types/common/style';
import { getLogger } from './logger';

/**
 * 算法注册表
 * 管理所有布局算法的注册和查找
 * 
 * 对应 Chromium: 算法注册机制（概念上）
 */
export class AlgorithmRegistry {
  private algorithms: Map<LayoutType, LayoutAlgorithm> = new Map();
  
  /**
   * 注册布局算法
   * 
   * @throws 如果布局类型已注册，抛出错误
   */
  register(algorithm: LayoutAlgorithm): void {
    if (this.algorithms.has(algorithm.layoutType)) {
      throw new Error(
        `Layout algorithm for type "${algorithm.layoutType}" is already registered`
      );
    }
    
    this.algorithms.set(algorithm.layoutType, algorithm);
    getLogger().debug(`Registered layout algorithm: ${algorithm.layoutType}`);
  }
  
  /**
   * 注册或替换布局算法
   * 允许覆盖已注册的算法
   */
  registerOrReplace(algorithm: LayoutAlgorithm): void {
    const wasReplaced = this.algorithms.has(algorithm.layoutType);
    this.algorithms.set(algorithm.layoutType, algorithm);
    
    if (wasReplaced) {
      getLogger().warn(`Replaced layout algorithm: ${algorithm.layoutType}`);
    } else {
      getLogger().debug(`Registered layout algorithm: ${algorithm.layoutType}`);
    }
  }
  
  /**
   * 获取布局算法
   * 
   * @throws 如果算法未注册，抛出错误
   */
  get(layoutType: LayoutType): LayoutAlgorithm {
    const algorithm = this.algorithms.get(layoutType);
    
    if (!algorithm) {
      const availableTypes = Array.from(this.algorithms.keys()).join(', ');
      throw new Error(
        `Layout algorithm for type "${layoutType}" is not registered. ` +
        `Available types: ${availableTypes || 'none'}`
      );
    }
    
    return algorithm;
  }
  
  /**
   * 检查是否已注册
   */
  has(layoutType: LayoutType): boolean {
    return this.algorithms.has(layoutType);
  }
  
  /**
   * 获取所有已注册的类型
   */
  getRegisteredTypes(): LayoutType[] {
    return Array.from(this.algorithms.keys());
  }
  
  /**
   * 取消注册算法
   */
  unregister(layoutType: LayoutType): boolean {
    const removed = this.algorithms.delete(layoutType);
    if (removed) {
      getLogger().debug(`Unregistered layout algorithm: ${layoutType}`);
    }
    return removed;
  }
  
  /**
   * 清除所有注册
   */
  clear(): void {
    this.algorithms.clear();
    getLogger().debug('Cleared all registered layout algorithms');
  }
  
  /**
   * 获取注册数量
   */
  size(): number {
    return this.algorithms.size;
  }
}
