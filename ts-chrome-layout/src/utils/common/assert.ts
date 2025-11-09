/**
 * 断言工具
 * 用于开发时的输入验证
 */

/**
 * 断言条件为真
 */
export function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * 断言值不为 null 或 undefined
 */
export function assertNotNull<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value is null or undefined');
  }
}

/**
 * 断言值在范围内
 */
export function assertInRange(
  value: number,
  min: number,
  max: number,
  message?: string
): void {
  if (value < min || value > max) {
    throw new Error(
      message || `Value ${value} is not in range [${min}, ${max}]`
    );
  }
}

/**
 * 断言数组不为空
 */
export function assertNotEmpty<T>(
  array: T[],
  message?: string
): asserts array is [T, ...T[]] {
  if (array.length === 0) {
    throw new Error(message || 'Array is empty');
  }
}

