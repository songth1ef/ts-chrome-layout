import { LayoutNode, MeasureResult } from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { BlockStyle } from '../../types/layouts/block/block-style';
import { BlockItemData, BlockLayoutData } from '../../types/layouts/block/block-data';
import { WritingMode, TextDirection } from '../../types/common/enums';

/**
 * Block 测量算法
 * 
 * 对应 Chromium: BlockLayoutAlgorithm::Measure()
 * 
 * 主要步骤：
 * 1. 构建 Block 项列表
 * 2. 计算容器宽度
 * 3. 计算容器高度（垂直堆叠）
 * 4. 处理浮动
 */
export class BlockMeasureAlgorithm {
  /**
   * 测量阶段主流程
   * 
   * 对应 Chromium: BlockLayoutAlgorithm::Measure()
   */
  measure(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): MeasureResult {
    const style = node.style as BlockStyle;
    if (!style || style.layoutType !== 'block') {
      throw new Error('Node must have block style');
    }
    
    // 步骤 1: 构建 Block 项列表
    const blockItems = this.constructBlockItems(node);
    
    // 步骤 2: 确定书写模式
    const writingMode = style.writingMode || WritingMode.HorizontalTb;
    const direction = style.direction || TextDirection.Ltr;
    
    // 步骤 3: 计算可用空间
    const availableWidth = typeof constraintSpace.availableWidth === 'number'
      ? constraintSpace.availableWidth
      : Infinity;
    const availableHeight = typeof constraintSpace.availableHeight === 'number'
      ? constraintSpace.availableHeight
      : Infinity;
    
    // 步骤 4: 计算容器宽度
    const containerWidth = this.calculateContainerWidth(
      style,
      availableWidth,
      constraintSpace
    );
    
    // 步骤 5: 计算容器高度（垂直堆叠）
    const containerHeight = this.calculateContainerHeight(
      blockItems,
      containerWidth,
      availableHeight,
      style
    );
    
    // 创建布局数据
    const layoutData: BlockLayoutData = {
      writingMode,
      direction,
      width: containerWidth,
      height: containerHeight,
      blockItems,
      floatingItems: blockItems.filter(item => item.isFloating),
      contentWidth: containerWidth,
      contentHeight: containerHeight,
    };
    
    return {
      width: containerWidth,
      height: containerHeight,
      blockLayoutData: layoutData,
    };
  }
  
  /**
   * 构建 Block 项列表
   */
  private constructBlockItems(node: LayoutNode): BlockItemData[] {
    const blockItems: BlockItemData[] = [];
    
    for (const child of node.children) {
      const childStyle = child.style as any;
      
      const blockItem: BlockItemData = {
        node: child,
        x: 0,
        y: 0,
        width: child.width || 0,
        height: child.height || 0,
        margin: {
          top: childStyle?.margin?.top || 0,
          right: childStyle?.margin?.right || 0,
          bottom: childStyle?.margin?.bottom || 0,
          left: childStyle?.margin?.left || 0,
        },
        isFloating: childStyle?.float === 'left' || childStyle?.float === 'right',
        clearsFloat: childStyle?.clear !== 'none',
      };
      
      blockItems.push(blockItem);
    }
    
    return blockItems;
  }
  
  /**
   * 计算容器宽度
   */
  private calculateContainerWidth(
    style: BlockStyle,
    availableWidth: number,
    _constraintSpace: ConstraintSpace
  ): number {
    // 如果指定了宽度，使用指定宽度
    if (typeof style.width === 'number') {
      return Math.min(style.width, availableWidth);
    }
    
    // 考虑最小和最大宽度
    let width = availableWidth;
    
    if (style.minWidth !== undefined) {
      width = Math.max(width, style.minWidth);
    }
    
    if (style.maxWidth !== undefined) {
      width = Math.min(width, style.maxWidth);
    }
    
    return width;
  }
  
  /**
   * 计算容器高度（垂直堆叠）
   */
  private calculateContainerHeight(
    blockItems: BlockItemData[],
    _containerWidth: number,
    availableHeight: number,
    style: BlockStyle
  ): number {
    let currentY = 0;
    const floatingLeft: BlockItemData[] = [];
    const floatingRight: BlockItemData[] = [];
    
    for (const item of blockItems) {
      // 处理清除浮动
      if (item.clearsFloat) {
        const clearLeft = (item.node.style as any)?.clear === 'left' || (item.node.style as any)?.clear === 'both';
        const clearRight = (item.node.style as any)?.clear === 'right' || (item.node.style as any)?.clear === 'both';
        
        if (clearLeft) {
          const maxLeftFloatHeight = floatingLeft.length > 0
            ? Math.max(...floatingLeft.map(f => f.y + f.height))
            : 0;
          currentY = Math.max(currentY, maxLeftFloatHeight);
        }
        
        if (clearRight) {
          const maxRightFloatHeight = floatingRight.length > 0
            ? Math.max(...floatingRight.map(f => f.y + f.height))
            : 0;
          currentY = Math.max(currentY, maxRightFloatHeight);
        }
      }
      
      // 计算项的位置
      item.y = currentY + item.margin.top;
      
      // 如果是浮动项，添加到浮动列表
      if (item.isFloating) {
        const floatDirection = (item.node.style as any)?.float;
        if (floatDirection === 'left') {
          floatingLeft.push(item);
        } else if (floatDirection === 'right') {
          floatingRight.push(item);
        }
      } else {
        // 非浮动项，更新当前 Y 位置
        currentY = item.y + item.height + item.margin.bottom;
      }
    }
    
    // 计算总高度（包括浮动项）
    const maxFloatHeight = Math.max(
      floatingLeft.length > 0 ? Math.max(...floatingLeft.map(f => f.y + f.height)) : 0,
      floatingRight.length > 0 ? Math.max(...floatingRight.map(f => f.y + f.height)) : 0
    );
    
    const totalHeight = Math.max(currentY, maxFloatHeight);
    
    // 考虑最小和最大高度
    let height = totalHeight;
    
    if (style.minHeight !== undefined) {
      height = Math.max(height, style.minHeight);
    }
    
    if (style.maxHeight !== undefined) {
      height = Math.min(height, style.maxHeight);
    }
    
    if (typeof availableHeight === 'number' && availableHeight < Infinity) {
      height = Math.min(height, availableHeight);
    }
    
    return height;
  }
}
