import { BaseLayoutAlgorithm } from '../../core/layout-algorithm';
import {
  LayoutNode,
  MeasureResult,
  ArrangeResult,
  LayoutResult,
} from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { FlexStyle } from '../../types/layouts/flex/flex-style';
import { FlexDirection } from '../../types/common/enums';
import { FlexMeasureAlgorithm } from './flex-measure';
import { FlexArrangeAlgorithm } from './flex-arrange';

/**
 * Flex 布局算法实现
 * 
 * 对应 Chromium: flex_layout_algorithm.h/cc
 * 实现 CSS Flexbox 布局算法
 * 
 * 参考: https://drafts.csswg.org/css-flexbox-1/
 */
export class FlexLayoutAlgorithm extends BaseLayoutAlgorithm {
  readonly layoutType = 'flex';
  
  private measureAlgorithm: FlexMeasureAlgorithm;
  private arrangeAlgorithm: FlexArrangeAlgorithm;
  
  constructor() {
    super();
    this.measureAlgorithm = new FlexMeasureAlgorithm();
    this.arrangeAlgorithm = new FlexArrangeAlgorithm();
  }
  
  /**
   * 测量阶段：计算内容尺寸
   * 
   * 对应 Chromium: FlexLayoutAlgorithm::Measure()
   */
  measure(node: LayoutNode, constraintSpace: ConstraintSpace): MeasureResult {
    return this.measureAlgorithm.measure(node, constraintSpace);
  }
  
  /**
   * 排列阶段：计算最终位置
   * 
   * 对应 Chromium: FlexLayoutAlgorithm::Arrange()
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
   * 对应 Chromium: FlexLayoutAlgorithm::Layout()
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
   * 对应 Chromium: FlexLayoutAlgorithm::ComputeMinMaxSizes()
   * 
   * 计算 Flex 容器在主轴方向的最小和最大尺寸
   */
  computeMinMaxSizes(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): { min: number; max: number } {
    const style = node.style as FlexStyle;
    if (!style || style.layoutType !== 'flex') {
      return { min: 0, max: 0 };
    }
    
    const direction = style.flexDirection || FlexDirection.Row;
    const isRow = direction === FlexDirection.Row || direction === FlexDirection.RowReverse;
    
    // 创建测量约束空间
    const measureConstraintSpace: ConstraintSpace = {
      ...constraintSpace,
      availableWidth: isRow ? 'auto' : constraintSpace.availableWidth,
      availableHeight: isRow ? constraintSpace.availableHeight : 'auto',
    };
    
    // 测量最小尺寸（所有项的基础尺寸总和，不考虑 flex-grow）
    const minMeasureResult = this.measureAlgorithm.measure(node, {
      ...measureConstraintSpace,
      availableWidth: isRow ? 0 : constraintSpace.availableWidth,
      availableHeight: isRow ? constraintSpace.availableHeight : 0,
    });
    
    // 测量最大尺寸（允许 flex-grow，使用无限空间）
    const maxMeasureResult = this.measureAlgorithm.measure(node, {
      ...measureConstraintSpace,
      availableWidth: isRow ? Infinity : constraintSpace.availableWidth,
      availableHeight: isRow ? constraintSpace.availableHeight : Infinity,
    });
    
    return {
      min: isRow ? minMeasureResult.width : minMeasureResult.height,
      max: isRow ? maxMeasureResult.width : maxMeasureResult.height,
    };
  }
}
