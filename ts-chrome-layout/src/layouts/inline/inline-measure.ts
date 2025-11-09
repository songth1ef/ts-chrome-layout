import { LayoutNode, MeasureResult } from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { InlineStyle } from '../../types/layouts/inline/inline-style';
import { InlineItemData, InlineLayoutData, LineData } from '../../types/layouts/inline/inline-data';
import { WritingMode, TextDirection } from '../../types/common/enums';

/**
 * Inline 测量算法
 * 
 * 对应 Chromium: InlineLayoutAlgorithm::Measure()
 * 
 * 主要步骤：
 * 1. 构建 Inline 项列表
 * 2. 分行（line breaking）
 * 3. 计算行高
 * 4. 计算容器尺寸
 */
export class InlineMeasureAlgorithm {
  /**
   * 测量阶段主流程
   */
  measure(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): MeasureResult {
    const style = node.style as InlineStyle;
    if (!style || style.layoutType !== 'inline') {
      throw new Error('Node must have inline style');
    }
    
    // 步骤 1: 构建 Inline 项列表
    const inlineItems = this.constructInlineItems(node, style);
    
    // 步骤 2: 确定书写模式
    const writingMode = style.writingMode || WritingMode.HorizontalTb;
    const direction = style.direction || TextDirection.Ltr;
    
    // 步骤 3: 计算可用空间
    const availableWidth = typeof constraintSpace.availableWidth === 'number'
      ? constraintSpace.availableWidth
      : Infinity;
    
    // 步骤 4: 分行
    const lines = this.breakLines(inlineItems, availableWidth, style);
    
    // 步骤 5: 计算容器尺寸
    const containerWidth = this.calculateContainerWidth(lines, availableWidth);
    const containerHeight = this.calculateContainerHeight(lines, style);
    
    // 创建布局数据
    const layoutData: InlineLayoutData = {
      writingMode,
      direction,
      width: containerWidth,
      height: containerHeight,
      inlineItems,
      lines,
      contentWidth: containerWidth,
      contentHeight: containerHeight,
    };
    
    return {
      width: containerWidth,
      height: containerHeight,
      inlineLayoutData: layoutData,
    };
  }
  
  /**
   * 构建 Inline 项列表
   */
  private constructInlineItems(node: LayoutNode, style: InlineStyle): InlineItemData[] {
    const inlineItems: InlineItemData[] = [];
    const lineHeight = typeof style.lineHeight === 'number' ? style.lineHeight : 20; // 默认行高
    
    for (const child of node.children) {
      const childStyle = child.style as any;
      const text = (child as any).text || '';
      
      const inlineItem: InlineItemData = {
        node: child,
        x: 0,
        y: 0,
        width: child.width || (text.length * 8), // 简化：假设每个字符 8px
        height: child.height || lineHeight,
        baseline: lineHeight * 0.8, // 简化：基线在 80% 位置
        inlineBox: {
          ascent: lineHeight * 0.8,
          descent: lineHeight * 0.2,
          lineHeight: lineHeight,
        },
        isLineBreak: text === '\n' || childStyle?.display === 'block',
        isWhitespace: /^\s+$/.test(text),
      };
      
      inlineItems.push(inlineItem);
    }
    
    return inlineItems;
  }
  
  /**
   * 分行（line breaking）
   */
  private breakLines(
    inlineItems: InlineItemData[],
    availableWidth: number,
    style: InlineStyle
  ): LineData[] {
    const lines: LineData[] = [];
    const lineHeight = typeof style.lineHeight === 'number' ? style.lineHeight : 20;
    const whiteSpace = style.whiteSpace || 'normal';
    
    let currentLine: InlineItemData[] = [];
    let currentLineWidth = 0;
    let currentY = 0;
    
    for (const item of inlineItems) {
      // 处理换行
      if (item.isLineBreak) {
        if (currentLine.length > 0) {
          lines.push(this.createLine(currentLine, currentY, lineHeight));
          currentLine = [];
          currentLineWidth = 0;
          currentY += lineHeight;
        }
        continue;
      }
      
      // 处理空白（根据 white-space 属性）
      if (item.isWhitespace) {
        if (whiteSpace === 'normal' || whiteSpace === 'pre-line') {
          // 折叠空白
          if (currentLine.length > 0) {
            currentLine.push(item);
            currentLineWidth += item.width;
          }
          continue;
        }
      }
      
      // 检查是否需要换行
      if (currentLineWidth + item.width > availableWidth && currentLine.length > 0) {
        lines.push(this.createLine(currentLine, currentY, lineHeight));
        currentLine = [];
        currentLineWidth = 0;
        currentY += lineHeight;
      }
      
      currentLine.push(item);
      currentLineWidth += item.width;
    }
    
    // 添加最后一行
    if (currentLine.length > 0) {
      lines.push(this.createLine(currentLine, currentY, lineHeight));
    }
    
    return lines;
  }
  
  /**
   * 创建行数据
   */
  private createLine(items: InlineItemData[], y: number, lineHeight: number): LineData {
    let x = 0;
    let maxAscent = 0;
    let maxDescent = 0;
    
    for (const item of items) {
      item.x = x;
      item.y = y;
      maxAscent = Math.max(maxAscent, item.inlineBox.ascent);
      maxDescent = Math.max(maxDescent, item.inlineBox.descent);
      x += item.width;
    }
    
    return {
      items,
      x: 0,
      y,
      width: x,
      height: maxAscent + maxDescent,
      baseline: y + maxAscent,
      lineHeight,
    };
  }
  
  /**
   * 计算容器宽度
   */
  private calculateContainerWidth(lines: LineData[], availableWidth: number): number {
    if (lines.length === 0) {
      return 0;
    }
    
    const maxLineWidth = Math.max(...lines.map(line => line.width));
    return Math.min(maxLineWidth, availableWidth);
  }
  
  /**
   * 计算容器高度
   */
  private calculateContainerHeight(lines: LineData[], _style: InlineStyle): number {
    if (lines.length === 0) {
      return 0;
    }
    
    const lastLine = lines[lines.length - 1];
    return lastLine.y + lastLine.height;
  }
}
