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
    expect(cache.size()).toBe(0);
  });

  it('应该返回缓存大小', () => {
    const cache = new SimpleCache<string, number>();
    expect(cache.size()).toBe(0);
    
    cache.set('key1', 1);
    expect(cache.size()).toBe(1);
    
    cache.set('key2', 2);
    expect(cache.size()).toBe(2);
  });

  it('应该在更新现有项时不删除', () => {
    const cache = new SimpleCache<string, number>(2);
    cache.set('key1', 1);
    cache.set('key2', 2);
    
    // 更新现有项
    cache.set('key1', 10);
    
    expect(cache.get('key1')).toBe(10);
    expect(cache.get('key2')).toBe(2);
    expect(cache.size()).toBe(2);
  });

  it('应该处理空缓存', () => {
    const cache = new SimpleCache<string, number>();
    
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.has('key1')).toBe(false);
    expect(cache.size()).toBe(0);
  });

  it('应该使用默认最大大小', () => {
    const cache = new SimpleCache<string, number>();
    
    // 默认大小应该是 100
    for (let i = 0; i < 100; i++) {
      cache.set(`key${i}`, i);
    }
    
    expect(cache.size()).toBe(100);
    
    // 添加第 101 个项应该删除第一个
    cache.set('key100', 100);
    expect(cache.get('key0')).toBeUndefined();
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

  it('应该检查是否存在', () => {
    const cache = new LRUCache<string, number>();
    cache.set('key1', 100);
    
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('应该清除缓存', () => {
    const cache = new LRUCache<string, number>();
    cache.set('key1', 100);
    cache.clear();
    
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.size()).toBe(0);
  });

  it('应该返回缓存大小', () => {
    const cache = new LRUCache<string, number>();
    expect(cache.size()).toBe(0);
    
    cache.set('key1', 1);
    expect(cache.size()).toBe(1);
    
    cache.set('key2', 2);
    expect(cache.size()).toBe(2);
  });

  it('应该在更新现有项时保持大小', () => {
    const cache = new LRUCache<string, number>(2);
    cache.set('key1', 1);
    cache.set('key2', 2);
    
    expect(cache.size()).toBe(2);
    
    // 更新现有项
    cache.set('key1', 10);
    expect(cache.size()).toBe(2);
    expect(cache.get('key1')).toBe(10);
  });

  it('应该在达到最大大小时删除最旧的项', () => {
    const cache = new LRUCache<string, number>(2);
    
    cache.set('key1', 1);
    cache.set('key2', 2);
    cache.set('key3', 3);
    
    // key1 应该被删除
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe(2);
    expect(cache.get('key3')).toBe(3);
  });

  it('应该处理空缓存', () => {
    const cache = new LRUCache<string, number>();
    
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.has('key1')).toBe(false);
    expect(cache.size()).toBe(0);
  });
});

