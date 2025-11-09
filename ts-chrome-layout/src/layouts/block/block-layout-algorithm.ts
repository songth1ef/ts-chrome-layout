import { BaseLayoutAlgorithm } from '../../core/layout-algorithm';
import {
  LayoutNode,
  MeasureResult,
  ArrangeResult,
  LayoutResult,
} from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { BlockStyle } from '../../types/layouts/block/block-style';
import { BlockMeasureAlgorithm } from './block-measure';
import { BlockArrangeAlgorithm } from './block-arrange';

/**
 * Block 布局算法实现
 * 
 * 对应 Chromium: block_layout_algorithm.h/cc
 * 实现 CSS Block 布局算法
 * 
 * 参考: https://drafts.csswg.org/css-display-3/#block-layout
 */
export class BlockLayoutAlgorithm extends BaseLayoutAlgorithm {
  readonly layoutType = 'block';
  
  private measureAlgorithm: BlockMeasureAlgorithm;
  private arrangeAlgorithm: BlockArrangeAlgorithm;
  
  constructor() {
    super();
    this.measureAlgorithm = new BlockMeasureAlgorithm();
    this.arrangeAlgorithm = new BlockArrangeAlgorithm();
  }
  
  /**
   * 测量阶段：计算内容尺寸
   * 
   * 对应 Chromium: BlockLayoutAlgorithm::Measure()
   */
  measure(node: LayoutNode, constraintSpace: ConstraintSpace): MeasureResult {
    return this.measureAlgorithm.measure(node, constraintSpace);
  }
  
  /**
   * 排列阶段：计算最终位置
   * 
   * 对应 Chromium: BlockLayoutAlgorithm::Arrange()
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
   * 
   * 对应 Chromium: BlockLayoutAlgorithm::Layout()
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
   * 
   * 对应 Chromium: BlockLayoutAlgorithm::ComputeMinMaxSizes()
   */
  computeMinMaxSizes(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): { min: number; max: number } {
    const style = node.style as BlockStyle;
    if (!style || style.layoutType !== 'block') {
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
