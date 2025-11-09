import {
  LayoutNode,
  MeasureResult,
  ArrangeResult,
  LayoutResult,
} from '../types/common/layout-node';
import { ConstraintSpace } from '../types/common/constraint-space';
import { LayoutType } from '../types/common/style';
import { LayoutContext } from './layout-context';

/**
 * 布局算法接口
 * 所有布局算法必须实现此接口
 * 
 * 对应 Chromium: LayoutAlgorithm 基类
 */
export interface LayoutAlgorithm {
  /**
   * 布局类型
   */
  readonly layoutType: LayoutType;
  
  /**
   * 测量阶段：计算内容尺寸
   * 
   * 对应 Chromium: LayoutAlgorithm::Measure()
   */
  measure(node: LayoutNode, constraintSpace: ConstraintSpace): MeasureResult;
  
  /**
   * 排列阶段：计算最终位置
   * 
   * 对应 Chromium: LayoutAlgorithm::Arrange()
   */
  arrange(
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    measureResult: MeasureResult
  ): ArrangeResult;
  
  /**
   * 完整布局流程（measure + arrange）
   * 
   * 对应 Chromium: LayoutAlgorithm::Layout()
   */
  layout(node: LayoutNode, constraintSpace: ConstraintSpace): LayoutResult;
  
  /**
   * 计算最小最大尺寸（可选）
   * 
   * 对应 Chromium: LayoutAlgorithm::ComputeMinMaxSizes()
   */
  computeMinMaxSizes?(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): { min: number; max: number };
}

/**
 * 布局算法基类
 * 提供默认实现，子类可以覆盖
 * 
 * 对应 Chromium: LayoutAlgorithm 基类
 */
export abstract class BaseLayoutAlgorithm implements LayoutAlgorithm {
  abstract readonly layoutType: LayoutType;
  
  abstract measure(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): MeasureResult;
  
  abstract arrange(
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    measureResult: MeasureResult
  ): ArrangeResult;
  
  /**
   * 默认实现：先测量，后排列
   * 
   * 对应 Chromium: LayoutAlgorithm::Layout() 的默认流程
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
   * 使用上下文执行布局（内部方法）
   * 允许算法访问上下文信息（性能监控、缓存等）
   */
  protected layoutWithContext(context: LayoutContext): LayoutResult {
    // 默认实现：使用标准方法
    return this.layout(context.node, context.constraintSpace);
  }
}
