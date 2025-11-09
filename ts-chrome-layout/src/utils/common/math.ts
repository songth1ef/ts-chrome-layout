/**
 * 数学工具函数
 * 用于布局计算
 */

/**
 * 安全除法，避免除以零
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }
  return numerator / denominator;
}

/**
 * 将值限制在范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 检查值是否为有限数
 */
export function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value) && !Number.isNaN(value);
}

/**
 * 检查值是否为正数
 */
export function isPositive(value: number): boolean {
  return isFiniteNumber(value) && value > 0;
}

/**
 * 检查值是否为非负数
 */
export function isNonNegative(value: number): boolean {
  return isFiniteNumber(value) && value >= 0;
}

/**
 * 计算百分比值
 */
export function percentage(value: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return (value / total) * 100;
}

/**
 * 四舍五入到指定精度
 */
export function roundTo(value: number, precision: number = 2): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

