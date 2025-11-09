/**
 * Cache 测试
 */

import { SimpleCache, LRUCache } from '../../../src/utils/common/cache';

describe('SimpleCache', () => {
  it('应该存储和获取值', () => {
    const cache = new SimpleCache<string, number>(10);
    
    cache.set('key1', 100);
    expect(cache.get('key1')).toBe(100);
  });

  it('应该在达到最大大小时删除旧项', () => {
    const cache = new SimpleCache<string, number>(2);
    
    cache.set('key1', 1);
    cache.set('key2', 2);
    cache.set('key3', 3);
    
    // key1 应该被删除
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe(2);
    expect(cache.get('key3')).toBe(3);
  });

  it('应该检查是否存在', () => {
    const cache = new SimpleCache<string, number>();
    cache.set('key1', 100);
    
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('应该清除缓存', () => {
    const cache = new SimpleCache<string, number>();
    cache.set('key1', 100);
    cache.clear();
    
    expect(cache.get('key1')).toBeUndefined();
  });
});

describe('LRUCache', () => {
  it('应该存储和获取值', () => {
    const cache = new LRUCache<string, number>(10);
    
    cache.set('key1', 100);
    expect(cache.get('key1')).toBe(100);
  });

  it('应该更新最近使用的项', () => {
    const cache = new LRUCache<string, number>(2);
    
    cache.set('key1', 1);
    cache.set('key2', 2);
    cache.get('key1'); // 访问 key1，使其成为最近使用的
    cache.set('key3', 3);
    
    // key2 应该被删除（因为 key1 是最近使用的）
    expect(cache.get('key1')).toBe(1);
    expect(cache.get('key2')).toBeUndefined();
    expect(cache.get('key3')).toBe(3);
  });
});

