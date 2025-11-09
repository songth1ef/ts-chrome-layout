import {
  LayoutNode,
  ArrangeResult,
  ChildLayout,
} from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { MeasureResult } from '../../types/common/layout-node';
import { BlockStyle } from '../../types/layouts/block/block-style';
import { BlockLayoutData } from '../../types/layouts/block/block-data';

/**
 * Block 排列算法
 * 
 * 对应 Chromium: BlockLayoutAlgorithm::Arrange()
 * 
 * 主要步骤：
 * 1. 计算 Block 项位置
 * 2. 处理浮动
 * 3. 布局子项
 */
export class BlockArrangeAlgorithm {
  /**
   * 排列阶段主流程
   * 
   * 对应 Chromium: BlockLayoutAlgorithm::Arrange()
   */
  arrange(
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    measureResult: MeasureResult
  ): ArrangeResult {
    const style = node.style as BlockStyle;
    if (!style || style.layoutType !== 'block') {
      throw new Error('Node must have block style');
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
    
    // 步骤 1: 计算 Block 项位置
    this.placeBlockItems(layoutData, style);
    
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
  private getLayoutDataFromMeasure(measureResult: MeasureResult): BlockLayoutData | null {
    if ((measureResult as any).blockLayoutData) {
      return (measureResult as any).blockLayoutData as BlockLayoutData;
    }
    return null;
  }
  
  /**
   * 放置 Block 项
   */
  private placeBlockItems(
    layoutData: BlockLayoutData,
    _style: BlockStyle
  ): void {
    let currentY = 0;
    const floatingLeft: typeof layoutData.blockItems = [];
    const floatingRight: typeof layoutData.blockItems = [];
    
    for (const item of layoutData.blockItems) {
      // 处理清除浮动
      if (item.clearsFloat) {
        const clearLeft = (item.node.style as any)?.clear === 'left' || (item.node.style as any)?.clear === 'both';
        const clearRight = (item.node.style as any)?.clear === 'right' || (item.node.style as any)?.clear === 'both';
        
        if (clearLeft && floatingLeft.length > 0) {
          const maxLeftFloatHeight = Math.max(...floatingLeft.map(f => f.y + f.height));
          currentY = Math.max(currentY, maxLeftFloatHeight);
        }
        
        if (clearRight && floatingRight.length > 0) {
          const maxRightFloatHeight = Math.max(...floatingRight.map(f => f.y + f.height));
          currentY = Math.max(currentY, maxRightFloatHeight);
        }
      }
      
      // 计算项的位置
      if (item.isFloating) {
        const floatDirection = (item.node.style as any)?.float;
        if (floatDirection === 'left') {
          // 左浮动：找到最左边的位置
          let x = item.margin.left;
          for (const floatItem of floatingLeft) {
            if (floatItem.y + floatItem.height > currentY) {
              x = Math.max(x, floatItem.x + floatItem.width + item.margin.left);
            }
          }
          item.x = x;
          item.y = currentY + item.margin.top;
          floatingLeft.push(item);
        } else if (floatDirection === 'right') {
          // 右浮动：找到最右边的位置
          let x = layoutData.width - item.width - item.margin.right;
          for (const floatItem of floatingRight) {
            if (floatItem.y + floatItem.height > currentY) {
              x = Math.min(x, floatItem.x - item.width - item.margin.right);
            }
          }
          item.x = x;
          item.y = currentY + item.margin.top;
          floatingRight.push(item);
        }
      } else {
        // 非浮动项：考虑浮动项的影响
        let x = item.margin.left;
        
        // 检查左侧浮动
        for (const floatItem of floatingLeft) {
          if (floatItem.y + floatItem.height > currentY) {
            x = Math.max(x, floatItem.x + floatItem.width + item.margin.left);
          }
        }
        
        // 检查右侧浮动
        let availableWidth = layoutData.width - x - item.margin.right;
        for (const floatItem of floatingRight) {
          if (floatItem.y + floatItem.height > currentY) {
            availableWidth = Math.min(availableWidth, floatItem.x - x - item.margin.right);
          }
        }
        
        item.x = x;
        item.y = currentY + item.margin.top;
        
        // 更新当前 Y 位置
        currentY = item.y + item.height + item.margin.bottom;
      }
    }
  }
  
  /**
   * 布局子项
   */
  private layoutChildren(
    node: LayoutNode,
    layoutData: BlockLayoutData,
    _constraintSpace: ConstraintSpace
  ): ChildLayout[] {
    const childLayouts: ChildLayout[] = [];
    
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const item = layoutData.blockItems[i];
      
      if (!item) {
        continue;
      }
      
      childLayouts.push({
        node: child,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
      });
    }
    
    return childLayouts;
  }
}
