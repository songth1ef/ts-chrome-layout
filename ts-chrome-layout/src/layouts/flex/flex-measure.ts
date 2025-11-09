import { LayoutNode, MeasureResult } from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { FlexStyle } from '../../types/layouts/flex/flex-style';
import { FlexItemData, FlexLayoutData } from '../../types/layouts/flex/flex-data';
import { FlexItemStyle } from '../../types/layouts/flex/flex-item-style';
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
      const itemStyle = this.getItemStyleFromNode(child);
      
      const flexItem: FlexItemData = {
        node: child,
        flexGrow: itemStyle.flexGrow ?? 0,
        flexShrink: itemStyle.flexShrink ?? 1,
        flexBasis: itemStyle.flexBasis ?? 'auto',
        alignSelf: itemStyle.alignSelf ?? 'auto',
        order: itemStyle.order ?? 0,
      };
      
      flexItems.push(flexItem);
    }
    
    // 按 order 排序
    flexItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return flexItems;
  }
  
  /**
   * 从节点获取 Flex 项样式
   */
  private getItemStyleFromNode(node: LayoutNode): FlexItemStyle {
    // 从节点的 style 属性中提取
    const style = node.style as any;
    
    if (!style) {
      return {};
    }
    
    // 解析 flex 简写（如果存在）
    let flexGrow: number | undefined;
    let flexShrink: number | undefined;
    let flexBasis: number | 'auto' | 'content' | undefined;
    
    if (style.flex !== undefined) {
      const flexValue = this.parseFlexShorthand(style.flex);
      if (flexValue) {
        flexGrow = flexValue.grow;
        flexShrink = flexValue.shrink;
        flexBasis = flexValue.basis;
      }
    }
    
    return {
      flexGrow: flexGrow ?? style.flexGrow,
      flexShrink: flexShrink ?? style.flexShrink,
      flexBasis: flexBasis ?? style.flexBasis,
      alignSelf: style.alignSelf,
      order: style.order,
    };
  }
  
  /**
   * 解析 flex 简写属性
   * 
   * 对应 CSS: flex: <flex-grow> <flex-shrink> <flex-basis>
   * 
   * 简化实现：支持常见格式
   */
  private parseFlexShorthand(flex: string | number): {
    grow: number;
    shrink: number;
    basis: number | 'auto' | 'content';
  } | null {
    if (typeof flex === 'number') {
      // flex: <number> 等同于 flex: <number> 1 0
      return {
        grow: flex,
        shrink: 1,
        basis: 0,
      };
    }
    
    if (typeof flex !== 'string') {
      return null;
    }
    
    // flex: none 等同于 flex: 0 0 auto
    if (flex === 'none') {
      return {
        grow: 0,
        shrink: 0,
        basis: 'auto',
      };
    }
    
    // flex: auto 等同于 flex: 1 1 auto
    if (flex === 'auto') {
      return {
        grow: 1,
        shrink: 1,
        basis: 'auto',
      };
    }
    
    // flex: <number> 等同于 flex: <number> 1 0
    const singleNumber = parseFloat(flex);
    if (!isNaN(singleNumber)) {
      return {
        grow: singleNumber,
        shrink: 1,
        basis: 0,
      };
    }
    
    // 解析多个值：flex: <grow> <shrink> <basis>
    const parts = flex.trim().split(/\s+/);
    if (parts.length >= 1) {
      const grow = parseFloat(parts[0]);
      const shrink = parts.length >= 2 ? parseFloat(parts[1]) : 1;
      const basis = parts.length >= 3 ? parts[2] : '0';
      
      if (!isNaN(grow) && !isNaN(shrink)) {
        let parsedBasis: number | 'auto' | 'content' = 0;
        if (basis === 'auto') {
          parsedBasis = 'auto';
        } else if (basis === 'content') {
          parsedBasis = 'content';
        } else {
          const basisNum = parseFloat(basis);
          if (!isNaN(basisNum)) {
            parsedBasis = basisNum;
          }
        }
        
        return {
          grow,
          shrink,
          basis: parsedBasis,
        };
      }
    }
    
    return null;
  }
  
  /**
   * 计算主轴尺寸
   * 
   * 对应 Chromium: FlexLayoutAlgorithm::CalculateMainSize()
   * 
   * 主要步骤：
   * 1. 计算所有项的基础尺寸（flex-basis）
   * 2. 计算自由空间
   * 3. 应用 flex-grow 或 flex-shrink
   */
  private calculateMainSize(
    flexItems: FlexItemData[],
    availableSize: number,
    wrap: FlexWrap
  ): number {
    // 步骤 1: 计算所有项的基础尺寸
    let totalBasisSize = 0;
    
    for (const item of flexItems) {
      const basis = item.flexBasis;
      let basisSize = 0;
      
      if (typeof basis === 'number') {
        basisSize = basis;
      } else if (basis === 'content') {
        // 内容尺寸：使用节点的内在尺寸
        basisSize = item.node.width || 0;
      } else {
        // auto: 使用节点尺寸
        basisSize = item.node.width || 0;
      }
      
      item.mainSize = basisSize;
      totalBasisSize += basisSize;
    }
    
    // 步骤 2: 计算自由空间
    const freeSpace = availableSize - totalBasisSize;
    
    // 步骤 3: 应用 flex-grow 或 flex-shrink
    if (freeSpace > 0) {
      // 有剩余空间，应用 flex-grow
      this.applyFlexGrow(flexItems, freeSpace);
    } else if (freeSpace < 0 && wrap === FlexWrap.NoWrap) {
      // 空间不足且不允许换行，应用 flex-shrink
      this.applyFlexShrink(flexItems, Math.abs(freeSpace));
    }
    
    // 计算最终总尺寸
    const finalSize = flexItems.reduce((sum, item) => {
      return sum + (item.mainSize || 0);
    }, 0);
    
    // 如果允许换行，可能需要多行
    if (wrap !== FlexWrap.NoWrap && finalSize > availableSize && availableSize > 0) {
      // 简化实现：返回可用尺寸
      return availableSize;
    }
    
    return Math.max(finalSize, availableSize);
  }
  
  /**
   * 应用 flex-grow
   * 
   * 对应 Chromium: FlexLayoutAlgorithm::DistributeFreeSpace()
   */
  private applyFlexGrow(flexItems: FlexItemData[], freeSpace: number): void {
    // 计算总的 flex-grow 值
    const totalGrow = flexItems.reduce((sum, item) => {
      return sum + (item.flexGrow || 0);
    }, 0);
    
    if (totalGrow === 0) {
      return; // 没有项可以增长
    }
    
    // 按比例分配空间
    for (const item of flexItems) {
      const grow = item.flexGrow || 0;
      if (grow > 0) {
        const additionalSize = (freeSpace * grow) / totalGrow;
        item.mainSize = (item.mainSize || 0) + additionalSize;
      }
    }
  }
  
  /**
   * 应用 flex-shrink
   * 
   * 对应 Chromium: FlexLayoutAlgorithm::DistributeNegativeFreeSpace()
   */
  private applyFlexShrink(flexItems: FlexItemData[], negativeSpace: number): void {
    // 计算总的 flex-shrink 加权值
    let totalShrinkWeight = 0;
    
    for (const item of flexItems) {
      const shrink = item.flexShrink || 1;
      const basis = item.mainSize || 0;
      totalShrinkWeight += shrink * basis;
    }
    
    if (totalShrinkWeight === 0) {
      return; // 没有项可以收缩
    }
    
    // 按比例收缩
    for (const item of flexItems) {
      const shrink = item.flexShrink || 1;
      const basis = item.mainSize || 0;
      
      if (shrink > 0 && basis > 0) {
        const shrinkWeight = shrink * basis;
        const shrinkSize = (negativeSpace * shrinkWeight) / totalShrinkWeight;
        item.mainSize = Math.max(0, basis - shrinkSize);
      }
    }
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
