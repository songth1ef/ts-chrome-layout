/**
 * 哈希工具函数
 * 用于生成高效的缓存键
 */

/**
 * 简单的字符串哈希函数（djb2算法）
 * 用于快速生成缓存键
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // 转换为32位整数
  }
  return hash >>> 0; // 转换为无符号整数
}

/**
 * 哈希对象（递归）
 * 生成对象的稳定哈希值
 */
export function hashObject(obj: any): number {
  if (obj === null || obj === undefined) {
    return 0;
  }
  
  if (typeof obj === 'string') {
    return hashString(obj);
  }
  
  if (typeof obj === 'number') {
    return hashString(String(obj));
  }
  
  if (typeof obj === 'boolean') {
    return obj ? 1 : 0;
  }
  
  if (Array.isArray(obj)) {
    let hash = 0;
    for (const item of obj) {
      hash = ((hash << 5) - hash) + hashObject(item);
      hash = hash & hash;
    }
    return hash >>> 0;
  }
  
  if (typeof obj === 'object') {
    const keys = Object.keys(obj).sort();
    let hash = 0;
    for (const key of keys) {
      hash = ((hash << 5) - hash) + hashString(key);
      hash = hash & hash;
      hash = ((hash << 5) - hash) + hashObject(obj[key]);
      hash = hash & hash;
    }
    return hash >>> 0;
  }
  
  return hashString(String(obj));
}

/**
 * 快速哈希（用于简单对象）
 * 只哈希关键属性，性能更好
 */
export function quickHash(obj: any, keys?: string[]): string {
  if (keys) {
    const parts: string[] = [];
    for (const key of keys) {
      const value = obj[key];
      if (value !== undefined && value !== null) {
        parts.push(`${key}:${String(value)}`);
      }
    }
    return parts.join('|');
  }
  
  return String(hashObject(obj));
}
