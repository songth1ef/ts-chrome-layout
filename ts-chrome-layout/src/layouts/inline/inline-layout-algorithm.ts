import { BaseLayoutAlgorithm } from '../../core/layout-algorithm';
import {
  LayoutNode,
  MeasureResult,
  ArrangeResult,
  LayoutResult,
} from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { InlineStyle } from '../../types/layouts/inline/inline-style';
import { InlineMeasureAlgorithm } from './inline-measure';
import { InlineArrangeAlgorithm } from './inline-arrange';

/**
 * Inline 布局算法实现
 * 
 * 对应 Chromium: inline_layout_algorithm.h/cc
 * 实现 CSS Inline 布局算法
 * 
 * 参考: https://drafts.csswg.org/css-display-3/#inline-layout
 */
export class InlineLayoutAlgorithm extends BaseLayoutAlgorithm {
  readonly layoutType = 'inline';
  
  private measureAlgorithm: InlineMeasureAlgorithm;
  private arrangeAlgorithm: InlineArrangeAlgorithm;
  
  constructor() {
    super();
    this.measureAlgorithm = new InlineMeasureAlgorithm();
    this.arrangeAlgorithm = new InlineArrangeAlgorithm();
  }
  
  /**
   * 测量阶段：计算内容尺寸
   */
  measure(node: LayoutNode, constraintSpace: ConstraintSpace): MeasureResult {
    return this.measureAlgorithm.measure(node, constraintSpace);
  }
  
  /**
   * 排列阶段：计算最终位置
   */
  arrange(
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    measureResult: MeasureResult
  ): ArrangeResult {
    return this.arrangeAlgorithm.arrange(node, constraintSpace, measureResult);
  }
  
  /**
   * 完整布局流程（measure + arrange）
   */
  layout(node: LayoutNode, constraintSpace: ConstraintSpace): LayoutResult {
    const measureResult = this.measure(node, constraintSpace);
    const arrangeResult = this.arrange(node, constraintSpace, measureResult);
    
    return {
      width: arrangeResult.width,
      height: arrangeResult.height,
      minWidth: measureResult.minWidth,
      maxWidth: measureResult.maxWidth,
      minHeight: measureResult.minHeight,
      maxHeight: measureResult.maxHeight,
      children: arrangeResult.children,
    };
  }
  
  /**
   * 计算最小最大尺寸
   */
  computeMinMaxSizes(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): { min: number; max: number } {
    const style = node.style as InlineStyle;
    if (!style || style.layoutType !== 'inline') {
      return { min: 0, max: 0 };
    }
    
    // 创建测量约束空间
    const measureConstraintSpace: ConstraintSpace = {
      ...constraintSpace,
      availableWidth: 0,
      availableHeight: constraintSpace.availableHeight,
    };
    
    // 测量最小尺寸
    const minMeasureResult = this.measureAlgorithm.measure(node, measureConstraintSpace);
    
    // 测量最大尺寸（使用无限空间）
    const maxMeasureResult = this.measureAlgorithm.measure(node, {
      ...constraintSpace,
      availableWidth: Infinity,
      availableHeight: constraintSpace.availableHeight,
    });
    
    return {
      min: minMeasureResult.width,
      max: maxMeasureResult.width,
    };
  }
}
