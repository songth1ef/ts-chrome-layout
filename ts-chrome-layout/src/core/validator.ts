import { LayoutNode, LayoutResult } from '../types/common/layout-node';
import { ConstraintSpace } from '../types/common/constraint-space';
import { LayoutError, ErrorCode } from './layout-context';
import { isNonNegative, isFiniteNumber } from '../utils/common/math';

/**
 * 布局验证器
 * 验证输入的有效性
 * 
 * 对应 Chromium: 输入验证（概念上）
 */
export class LayoutValidator {
  /**
   * 验证布局节点
   */
  static validateNode(node: LayoutNode): void {
    if (!node.id) {
      throw new LayoutError(
        'Layout node must have an id',
        ErrorCode.InvalidNode,
        node
      );
    }
    
    if (!node.layoutType) {
      throw new LayoutError(
        'Layout node must have a layoutType',
        ErrorCode.InvalidNode,
        node
      );
    }
    
    // 验证尺寸
    if (!isNonNegative(node.width)) {
      throw new LayoutError(
        `Node width must be non-negative, got: ${node.width}`,
        ErrorCode.InvalidNode,
        node
      );
    }
    
    if (!isNonNegative(node.height)) {
      throw new LayoutError(
        `Node height must be non-negative, got: ${node.height}`,
        ErrorCode.InvalidNode,
        node
      );
    }
    
    // 验证边距
    if (node.margin) {
      this.validateBoxStrut(node.margin, 'margin', node);
    }
    
    // 验证填充
    if (node.padding) {
      this.validateBoxStrut(node.padding, 'padding', node);
    }
    
    // 验证边框
    if (node.border) {
      this.validateBoxStrut(node.border, 'border', node);
    }
    
    // 递归验证子节点
    if (node.children) {
      for (const child of node.children) {
        this.validateNode(child);
      }
    }
  }
  
  /**
   * 验证 BoxStrut
   */
  private static validateBoxStrut(
    strut: { top: number; right: number; bottom: number; left: number },
    name: string,
    node: LayoutNode
  ): void {
    const fields = ['top', 'right', 'bottom', 'left'] as const;
    for (const field of fields) {
      if (!isNonNegative(strut[field])) {
        throw new LayoutError(
          `Node ${name}.${field} must be non-negative, got: ${strut[field]}`,
          ErrorCode.InvalidNode,
          node
        );
      }
    }
  }
  
  /**
   * 验证约束空间
   */
  static validateConstraintSpace(space: ConstraintSpace): void {
    if (space.availableWidth !== 'auto' && !isFiniteNumber(space.availableWidth)) {
      throw new LayoutError(
        `availableWidth must be a finite number or "auto", got: ${space.availableWidth}`,
        ErrorCode.InvalidConstraintSpace
      );
    }
    
    if (space.availableWidth !== 'auto' && space.availableWidth < 0) {
      throw new LayoutError(
        `availableWidth must be positive or "auto", got: ${space.availableWidth}`,
        ErrorCode.InvalidConstraintSpace
      );
    }
    
    if (space.availableHeight !== 'auto' && !isFiniteNumber(space.availableHeight)) {
      throw new LayoutError(
        `availableHeight must be a finite number or "auto", got: ${space.availableHeight}`,
        ErrorCode.InvalidConstraintSpace
      );
    }
    
    if (space.availableHeight !== 'auto' && space.availableHeight < 0) {
      throw new LayoutError(
        `availableHeight must be positive or "auto", got: ${space.availableHeight}`,
        ErrorCode.InvalidConstraintSpace
      );
    }
    
    // 验证最小/最大尺寸
    if (space.minWidth !== undefined && !isNonNegative(space.minWidth)) {
      throw new LayoutError(
        `minWidth must be non-negative, got: ${space.minWidth}`,
        ErrorCode.InvalidConstraintSpace
      );
    }
    
    if (space.maxWidth !== undefined && !isNonNegative(space.maxWidth)) {
      throw new LayoutError(
        `maxWidth must be non-negative, got: ${space.maxWidth}`,
        ErrorCode.InvalidConstraintSpace
      );
    }
    
    if (space.minHeight !== undefined && !isNonNegative(space.minHeight)) {
      throw new LayoutError(
        `minHeight must be non-negative, got: ${space.minHeight}`,
        ErrorCode.InvalidConstraintSpace
      );
    }
    
    if (space.maxHeight !== undefined && !isNonNegative(space.maxHeight)) {
      throw new LayoutError(
        `maxHeight must be non-negative, got: ${space.maxHeight}`,
        ErrorCode.InvalidConstraintSpace
      );
    }
    
    // 验证最小/最大尺寸关系
    if (
      space.minWidth !== undefined &&
      space.maxWidth !== undefined &&
      space.minWidth > space.maxWidth
    ) {
      throw new LayoutError(
        `minWidth (${space.minWidth}) must be <= maxWidth (${space.maxWidth})`,
        ErrorCode.InvalidConstraintSpace
      );
    }
    
    if (
      space.minHeight !== undefined &&
      space.maxHeight !== undefined &&
      space.minHeight > space.maxHeight
    ) {
      throw new LayoutError(
        `minHeight (${space.minHeight}) must be <= maxHeight (${space.maxHeight})`,
        ErrorCode.InvalidConstraintSpace
      );
    }
  }
  
  /**
   * 验证布局结果
   */
  static validateLayoutResult(result: LayoutResult): void {
    if (!isNonNegative(result.width)) {
      throw new LayoutError(
        `Layout result width must be non-negative, got: ${result.width}`,
        ErrorCode.CalculationError
      );
    }
    
    if (!isNonNegative(result.height)) {
      throw new LayoutError(
        `Layout result height must be non-negative, got: ${result.height}`,
        ErrorCode.CalculationError
      );
    }
    
    // 验证子项
    if (result.children) {
      for (const child of result.children) {
        if (!isNonNegative(child.width) || !isNonNegative(child.height)) {
          throw new LayoutError(
            `Child layout dimensions must be non-negative`,
            ErrorCode.CalculationError
          );
        }
      }
    }
  }
}
