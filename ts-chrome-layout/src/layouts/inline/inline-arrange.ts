import {
  LayoutNode,
  ArrangeResult,
  ChildLayout,
} from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { MeasureResult } from '../../types/common/layout-node';
import { InlineStyle } from '../../types/layouts/inline/inline-style';
import { InlineLayoutData } from '../../types/layouts/inline/inline-data';
import { TextDirection } from '../../types/common/enums';

/**
 * Inline 排列算法
 * 
 * 对应 Chromium: InlineLayoutAlgorithm::Arrange()
 * 
 * 主要步骤：
 * 1. 应用文本对齐
 * 2. 布局子项
 */
export class InlineArrangeAlgorithm {
  /**
   * 排列阶段主流程
   */
  arrange(
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    measureResult: MeasureResult
  ): ArrangeResult {
    const style = node.style as InlineStyle;
    if (!style || style.layoutType !== 'inline') {
      throw new Error('Node must have inline style');
    }
    
    // 从 measureResult 获取布局数据
    const layoutData = this.getLayoutDataFromMeasure(measureResult);
    if (!layoutData) {
      return {
        x: 0,
        y: 0,
        width: node.width || 0,
        height: node.height || 0,
        children: [],
      };
    }
    
    // 步骤 1: 应用文本对齐
    this.applyTextAlign(layoutData, style);
    
    // 步骤 2: 布局子项
    const childLayouts = this.layoutChildren(
      node,
      layoutData,
      constraintSpace
    );
    
    return {
      x: 0,
      y: 0,
      width: layoutData.width,
      height: layoutData.height,
      children: childLayouts,
    };
  }
  
  /**
   * 从测量结果获取布局数据
   */
  private getLayoutDataFromMeasure(measureResult: MeasureResult): InlineLayoutData | null {
    if ((measureResult as any).inlineLayoutData) {
      return (measureResult as any).inlineLayoutData as InlineLayoutData;
    }
    return null;
  }
  
  /**
   * 应用文本对齐
   */
  private applyTextAlign(
    layoutData: InlineLayoutData,
    style: InlineStyle
  ): void {
    const textAlign = style.textAlign || 'start';
    const direction = layoutData.direction;
    const containerWidth = layoutData.width;
    
    for (const line of layoutData.lines) {
      const lineWidth = line.width;
      const freeSpace = containerWidth - lineWidth;
      
      let offset = 0;
      
      switch (textAlign) {
        case 'left':
        case 'start':
          offset = direction === TextDirection.Ltr ? 0 : freeSpace;
          break;
        case 'right':
        case 'end':
          offset = direction === TextDirection.Ltr ? freeSpace : 0;
          break;
        case 'center':
          offset = freeSpace / 2;
          break;
        case 'justify':
          // 简化实现：均匀分布（实际应该只在单词之间分布）
          if (line.items.length > 1) {
            const gap = freeSpace / (line.items.length - 1);
            for (let i = 0; i < line.items.length; i++) {
              line.items[i].x += i * gap;
            }
          }
          return;
      }
      
      // 应用偏移
      for (const item of line.items) {
        item.x += offset;
      }
    }
  }
  
  /**
   * 布局子项
   */
  private layoutChildren(
    _node: LayoutNode,
    layoutData: InlineLayoutData,
    _constraintSpace: ConstraintSpace
  ): ChildLayout[] {
    const childLayouts: ChildLayout[] = [];
    
    for (const item of layoutData.inlineItems) {
      childLayouts.push({
        node: item.node,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
      });
    }
    
    return childLayouts;
  }
}
