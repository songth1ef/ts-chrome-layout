import { BaseLayoutAlgorithm } from '../../core/layout-algorithm';
import {
  LayoutNode,
  MeasureResult,
  ArrangeResult,
  LayoutResult,
} from '../../types/common/layout-node';
import { ConstraintSpace } from '../../types/common/constraint-space';
import { SizingConstraint } from '../../types/common/enums';
import { GridMeasureAlgorithm } from './grid-measure';
import { GridArrangeAlgorithm } from './grid-arrange';

/**
 * Grid 布局算法实现
 * 
 * 对应 Chromium: grid_layout_algorithm.h/cc
 * 保持与 Chromium 实现相同的计算逻辑
 */
export class GridLayoutAlgorithm extends BaseLayoutAlgorithm {
  readonly layoutType = 'grid';
  
  private measureAlgorithm: GridMeasureAlgorithm;
  private arrangeAlgorithm: GridArrangeAlgorithm;
  
  constructor() {
    super();
    this.measureAlgorithm = new GridMeasureAlgorithm();
    this.arrangeAlgorithm = new GridArrangeAlgorithm();
  }
  
  /**
   * 测量阶段：计算内容尺寸
   * 
   * 对应 Chromium: GridLayoutAlgorithm::Layout() -> ComputeGridGeometry()
   */
  measure(node: LayoutNode, constraintSpace: ConstraintSpace): MeasureResult {
    return this.measureAlgorithm.measure(node, constraintSpace);
  }
  
  /**
   * 排列阶段：计算最终位置
   * 
   * 对应 Chromium: GridLayoutAlgorithm::PlaceGridItems()
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
   * 对应 Chromium: GridLayoutAlgorithm::Layout()
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
   * 对应 Chromium: GridLayoutAlgorithm::ComputeMinMaxSizes()
   * 
   * 计算网格容器在指定方向上的最小和最大尺寸
   * - min: 最小内容尺寸（min-content）
   * - max: 最大内容尺寸（max-content）
   */
  computeMinMaxSizes(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): { min: number; max: number } {
    // 使用测量算法计算最小和最大尺寸
    const minMeasureResult = this.measureAlgorithm.measureWithConstraint(
      node,
      constraintSpace,
      SizingConstraint.MinContent
    );
    const maxMeasureResult = this.measureAlgorithm.measureWithConstraint(
      node,
      constraintSpace,
      SizingConstraint.MaxContent
    );
    
    // 返回最小和最大宽度
    return {
      min: minMeasureResult.width || 0,
      max: maxMeasureResult.width || 0,
    };
  }
}

