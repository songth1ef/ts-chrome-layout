import { BaseLayoutAlgorithm } from '../../core/layout-algorithm';
import {
  LayoutNode,
  MeasureResult,
  ArrangeResult,
  LayoutResult,
} from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { TableStyle } from '../../types/layouts/table/table-style';
import { TableMeasureAlgorithm } from './table-measure';
import { TableArrangeAlgorithm } from './table-arrange';

/**
 * Table 布局算法实现
 * 
 * 对应 Chromium: table_layout_algorithm.h/cc
 * 实现 CSS Table 布局算法
 * 
 * 参考: https://drafts.csswg.org/css-tables-3/
 */
export class TableLayoutAlgorithm extends BaseLayoutAlgorithm {
  readonly layoutType = 'table';
  
  private measureAlgorithm: TableMeasureAlgorithm;
  private arrangeAlgorithm: TableArrangeAlgorithm;
  
  constructor() {
    super();
    this.measureAlgorithm = new TableMeasureAlgorithm();
    this.arrangeAlgorithm = new TableArrangeAlgorithm();
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
    const style = node.style as TableStyle;
    if (!style || style.layoutType !== 'table') {
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
