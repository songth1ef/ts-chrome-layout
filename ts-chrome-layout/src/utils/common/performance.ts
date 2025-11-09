/**
 * 性能工具函数
 */

/**
 * 性能测量装饰器
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  _target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> {
  const originalMethod = descriptor.value!;
  
  descriptor.value = function (this: any, ...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    
    console.debug(`[Performance] ${propertyKey} took ${(end - start).toFixed(2)}ms`);
    
    return result;
  } as any;
  
  return descriptor;
}

/**
 * 异步性能测量
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.debug(`[Performance] ${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`[Performance] ${name} failed after ${(end - start).toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * 同步性能测量
 */
export function measureSync<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    const result = fn();
    const end = performance.now();
    console.debug(`[Performance] ${name} took ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`[Performance] ${name} failed after ${(end - start).toFixed(2)}ms`, error);
    throw error;
  }
}

