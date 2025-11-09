import { LayoutNode, MeasureResult } from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { FlexStyle } from '../../types/layouts/flex/flex-style';
import { FlexItemData, FlexLayoutData } from '../../types/layouts/flex/flex-data';
import {
  FlexDirection,
  FlexWrap,
} from '../../types/common/enums';

/**
 * Flex 测量算法
 * 
 * 对应 Chromium: FlexLayoutAlgorithm::Measure()
 * 
 * 主要步骤：
 * 1. 构建 Flex 项列表
 * 2. 计算主轴尺寸
 * 3. 计算交叉轴尺寸
 * 4. 处理换行
 */
export class FlexMeasureAlgorithm {
  /**
   * 测量阶段主流程
   * 
   * 对应 Chromium: FlexLayoutAlgorithm::Measure()
   */
  measure(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): MeasureResult {
    const style = node.style as FlexStyle;
    if (!style || style.layoutType !== 'flex') {
      throw new Error('Node must have flex style');
    }
    
    // 步骤 1: 构建 Flex 项列表
    const flexItems = this.constructFlexItems(node);
    
    // 步骤 2: 确定主轴和交叉轴方向
    const direction = style.flexDirection || FlexDirection.Row;
    const isRow = direction === FlexDirection.Row || direction === FlexDirection.RowReverse;
    const wrap = style.flexWrap || FlexWrap.NoWrap;
    
    // 步骤 3: 计算可用空间
    const availableMainSize = isRow
      ? (typeof constraintSpace.availableWidth === 'number' ? constraintSpace.availableWidth : 0)
      : (typeof constraintSpace.availableHeight === 'number' ? constraintSpace.availableHeight : 0);
    const availableCrossSize = isRow
      ? (typeof constraintSpace.availableHeight === 'number' ? constraintSpace.availableHeight : 0)
      : (typeof constraintSpace.availableWidth === 'number' ? constraintSpace.availableWidth : 0);
    
    // 步骤 4: 计算主轴尺寸（简化实现）
    const mainSize = this.calculateMainSize(flexItems, availableMainSize, wrap);
    
    // 步骤 5: 计算交叉轴尺寸（简化实现）
    const crossSize = this.calculateCrossSize(flexItems, availableCrossSize);
    
    // 创建布局数据
    const layoutData: FlexLayoutData = {
      direction,
      mainSize,
      crossSize,
      flexItems,
      availableMainSize,
      availableCrossSize,
    };
    
    return {
      width: isRow ? mainSize : crossSize,
      height: isRow ? crossSize : mainSize,
      flexLayoutData: layoutData,
    };
  }
  
  /**
   * 构建 Flex 项列表
   */
  private constructFlexItems(node: LayoutNode): FlexItemData[] {
    const flexItems: FlexItemData[] = [];
    
    for (const child of node.children) {
      const flexItem: FlexItemData = {
        node: child,
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: 'auto',
        order: 0,
      };
      
      // TODO: 从子节点样式提取 flex 属性
      // 这里简化实现，使用默认值
      
      flexItems.push(flexItem);
    }
    
    // 按 order 排序
    flexItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return flexItems;
  }
  
  /**
   * 计算主轴尺寸
   */
  private calculateMainSize(
    flexItems: FlexItemData[],
    availableSize: number,
    wrap: FlexWrap
  ): number {
    // 简化实现：计算所有项的基础尺寸总和
    let totalSize = 0;
    
    for (const item of flexItems) {
      const basis = item.flexBasis;
      if (typeof basis === 'number') {
        totalSize += basis;
      } else if (basis === 'content') {
        // 内容尺寸
        totalSize += item.node.width || 0;
      } else {
        // auto: 使用节点尺寸
        totalSize += item.node.width || 0;
      }
    }
    
    // 如果允许换行，可能需要多行
    if (wrap !== FlexWrap.NoWrap && totalSize > availableSize && availableSize > 0) {
      // 简化实现：返回可用尺寸
      return availableSize;
    }
    
    return Math.max(totalSize, availableSize);
  }
  
  /**
   * 计算交叉轴尺寸
   */
  private calculateCrossSize(
    flexItems: FlexItemData[],
    availableSize: number
  ): number {
    // 简化实现：找到最高的项
    let maxSize = 0;
    
    for (const item of flexItems) {
      const itemSize = item.node.height || 0;
      maxSize = Math.max(maxSize, itemSize);
    }
    
    return Math.max(maxSize, availableSize);
  }
}
