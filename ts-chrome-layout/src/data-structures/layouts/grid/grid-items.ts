import { GridItemData } from '../../../types/layouts/grid/grid-data';

/**
 * Grid 项集合
 * 
 * 对应 Chromium: grid_item.h - GridItems
 */
export class GridItems {
  private items: GridItemData[] = [];
  
  /**
   * 添加项
   * 
   * 对应 Chromium: GridItems::Append()
   */
  add(item: GridItemData): void {
    this.items.push(item);
  }
  
  /**
   * 获取项
   * 
   * 对应 Chromium: GridItems::At()
   */
  get(index: number): GridItemData {
    return this.items[index];
  }
  
  /**
   * 获取所有项
   * 
   * 对应 Chromium: GridItems 迭代器
   */
  getAll(): GridItemData[] {
    return this.items;
  }
  
  /**
   * 获取数量
   * 
   * 对应 Chromium: GridItems::Size()
   */
  size(): number {
    return this.items.length;
  }
  
  /**
   * 迭代器
   */
  [Symbol.iterator](): Iterator<GridItemData> {
    return this.items[Symbol.iterator]();
  }
}

