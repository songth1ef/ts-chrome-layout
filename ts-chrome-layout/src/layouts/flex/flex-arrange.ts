import {
  LayoutNode,
  ArrangeResult,
  ChildLayout,
} from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { MeasureResult } from '../../types/common/layout-node';
import { FlexStyle } from '../../types/layouts/flex/flex-style';
import { FlexLayoutData } from '../../types/layouts/flex/flex-data';
import {
  FlexDirection,
  FlexJustifyContent,
  ItemAlignment,
} from '../../types/common/enums';

/**
 * Flex 排列算法
 * 
 * 对应 Chromium: FlexLayoutAlgorithm::Arrange()
 * 
 * 主要步骤：
 * 1. 计算 Flex 项位置
 * 2. 应用对齐
 * 3. 布局子项
 */
export class FlexArrangeAlgorithm {
  /**
   * 排列阶段主流程
   * 
   * 对应 Chromium: FlexLayoutAlgorithm::Arrange()
   */
  arrange(
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    measureResult: MeasureResult
  ): ArrangeResult {
    const style = node.style as FlexStyle;
    if (!style || style.layoutType !== 'flex') {
      throw new Error('Node must have flex style');
    }
    
    // 从 measureResult 获取布局数据
    const layoutData = this.getLayoutDataFromMeasure(measureResult);
    if (!layoutData) {
      // 简化实现：如果没有布局数据，使用默认值
      return {
        x: 0,
        y: 0,
        width: node.width || 0,
        height: node.height || 0,
        children: [],
      };
    }
    
    // 步骤 1: 计算 Flex 项位置
    const itemPlacements = this.placeFlexItems(node, layoutData, style);
    
    // 步骤 2: 应用对齐
    this.applyAlignment(itemPlacements, layoutData, style);
    
    // 步骤 3: 布局子项
    const childLayouts = this.layoutChildren(
      node,
      itemPlacements,
      constraintSpace,
      layoutData
    );
    
    return {
      x: 0,
      y: 0,
      width: layoutData.mainSize,
      height: layoutData.crossSize,
      children: childLayouts,
    };
  }
  
  /**
   * 从测量结果获取布局数据
   */
  private getLayoutDataFromMeasure(measureResult: MeasureResult): FlexLayoutData | null {
    if ((measureResult as any).flexLayoutData) {
      return (measureResult as any).flexLayoutData as FlexLayoutData;
    }
    return null;
  }
  
  /**
   * 放置 Flex 项
   */
  private placeFlexItems(
    _node: LayoutNode,
    layoutData: FlexLayoutData,
    style: FlexStyle
  ): Array<{ item: any; mainOffset: number; crossOffset: number }> {
    const placements: Array<{ item: any; mainOffset: number; crossOffset: number }> = [];
    
    let currentMainOffset = 0;
    
    for (const item of layoutData.flexItems) {
      placements.push({
        item,
        mainOffset: currentMainOffset,
        crossOffset: 0, // 简化实现，对齐会在后续步骤处理
      });
      
      // 更新偏移
      const itemMainSize = item.mainSize || item.node.width || 0;
      currentMainOffset += itemMainSize;
      
      // 添加间距
      const gap = style.gap || style.columnGap || 0;
      currentMainOffset += gap;
    }
    
    return placements;
  }
  
  /**
   * 应用对齐
   */
  private applyAlignment(
    placements: Array<{ item: any; mainOffset: number; crossOffset: number }>,
    layoutData: FlexLayoutData,
    style: FlexStyle
  ): void {
    const justifyContent = style.justifyContent || FlexJustifyContent.FlexStart;
    const alignItems = style.alignItems || ItemAlignment.Stretch;
    
    // 应用 justify-content（主轴对齐）
    this.applyJustifyContent(placements, layoutData, justifyContent);
    
    // 应用 align-items（交叉轴对齐）
    this.applyAlignItems(placements, layoutData, alignItems);
  }
  
  /**
   * 应用主轴对齐
   */
  private applyJustifyContent(
    placements: Array<{ item: any; mainOffset: number; crossOffset: number }>,
    layoutData: FlexLayoutData,
    justifyContent: FlexJustifyContent
  ): void {
    if (placements.length === 0) {
      return;
    }
    
    const totalMainSize = layoutData.mainSize;
    const itemsMainSize = placements.reduce((sum, p) => {
      return sum + (p.item.mainSize || p.item.node.width || 0);
    }, 0);
    const freeSpace = totalMainSize - itemsMainSize;
    
    let offset = 0;
    
    switch (justifyContent) {
      case FlexJustifyContent.FlexStart:
        offset = 0;
        break;
      case FlexJustifyContent.FlexEnd:
        offset = freeSpace;
        break;
      case FlexJustifyContent.Center:
        offset = freeSpace / 2;
        break;
      case FlexJustifyContent.SpaceBetween:
        // 简化实现：均匀分布
        if (placements.length > 1) {
          const gap = freeSpace / (placements.length - 1);
          for (let i = 0; i < placements.length; i++) {
            placements[i].mainOffset += i * gap;
          }
        }
        return;
      case FlexJustifyContent.SpaceAround:
        // 简化实现：均匀分布
        if (placements.length > 0) {
          const gap = freeSpace / placements.length;
          for (let i = 0; i < placements.length; i++) {
            placements[i].mainOffset += (i + 0.5) * gap;
          }
        }
        return;
      case FlexJustifyContent.SpaceEvenly:
        // 简化实现：均匀分布
        if (placements.length > 0) {
          const gap = freeSpace / (placements.length + 1);
          for (let i = 0; i < placements.length; i++) {
            placements[i].mainOffset += (i + 1) * gap;
          }
        }
        return;
    }
    
    // 应用偏移
    for (const placement of placements) {
      placement.mainOffset += offset;
    }
  }
  
  /**
   * 应用交叉轴对齐
   */
  private applyAlignItems(
    placements: Array<{ item: any; mainOffset: number; crossOffset: number }>,
    layoutData: FlexLayoutData,
    alignItems: ItemAlignment
  ): void {
    const totalCrossSize = layoutData.crossSize;
    
    for (const placement of placements) {
      const itemCrossSize = placement.item.crossSize || placement.item.node.height || 0;
      const freeSpace = totalCrossSize - itemCrossSize;
      
      switch (alignItems) {
        case ItemAlignment.Start:
          placement.crossOffset = 0;
          break;
        case ItemAlignment.End:
          placement.crossOffset = freeSpace;
          break;
        case ItemAlignment.Center:
          placement.crossOffset = freeSpace / 2;
          break;
        case ItemAlignment.Stretch:
          // stretch: 拉伸到容器高度
          placement.crossOffset = 0;
          // 设置项的高度为容器高度
          placement.item.crossSize = totalCrossSize;
          break;
        case ItemAlignment.Baseline:
          // baseline: 简化实现为 start
          placement.crossOffset = 0;
          break;
      }
    }
  }
  
  /**
   * 布局子项
   */
  private layoutChildren(
    node: LayoutNode,
    placements: Array<{ item: any; mainOffset: number; crossOffset: number }>,
    _constraintSpace: ConstraintSpace,
    layoutData: FlexLayoutData
  ): ChildLayout[] {
    const childLayouts: ChildLayout[] = [];
    const direction = layoutData.direction;
    const isRow = direction === FlexDirection.Row || direction === FlexDirection.RowReverse;
    
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const placement = placements[i];
      
      if (!placement) {
        continue;
      }
      
      // 计算位置
      const x = isRow ? placement.mainOffset : placement.crossOffset;
      const y = isRow ? placement.crossOffset : placement.mainOffset;
      
      // 计算尺寸
      const width = isRow
        ? (placement.item.mainSize || child.width || 0)
        : (placement.item.crossSize || child.width || 0);
      const height = isRow
        ? (placement.item.crossSize || child.height || 0)
        : (placement.item.mainSize || child.height || 0);
      
      childLayouts.push({
        node: child,
        x,
        y,
        width,
        height,
      });
    }
    
    return childLayouts;
  }
}
