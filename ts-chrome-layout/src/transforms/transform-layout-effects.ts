/**
 * Transform 布局影响计算
 * 
 * 处理变换对定位、滚动、溢出等布局特性的影响
 * 
 * 对应 Chromium: 
 * - core/layout/layout_object.h (定位上下文)
 * - core/paint/paint_layer_scrollable_area.h (滚动)
 * - core/layout/layout_box.h (溢出处理)
 */

import { TransformMatrix } from './transform-matrix';
import { TransformStyle, Point, Rect } from '../types/common/transform';
import { TransformCalculator } from './transform-calculator';

/**
 * 定位上下文信息
 */
export interface PositioningContext {
  /**
   * 是否为定位上下文（transform 会创建新的定位上下文）
   */
  isPositioningContext: boolean;
  
  /**
   * 定位上下文的变换矩阵
   */
  transformMatrix?: TransformMatrix;
  
  /**
   * 定位上下文的边界框
   */
  boundingBox: Rect;
}

/**
 * 滚动上下文信息
 */
export interface ScrollContext {
  /**
   * 变换后的滚动区域
   */
  scrollArea: Rect;
  
  /**
   * 滚动偏移（考虑变换）
   */
  scrollOffset: Point;
  
  /**
   * 变换矩阵
   */
  transformMatrix?: TransformMatrix;
}

/**
 * 溢出处理信息
 */
export interface OverflowInfo {
  /**
   * 变换后的裁剪区域
   */
  clipRect: Rect;
  
  /**
   * 变换后的溢出边界框
   */
  overflowBoundingBox: Rect;
  
  /**
   * 是否需要裁剪
   */
  needsClipping: boolean;
}

/**
 * Transform 布局影响计算器
 */
export class TransformLayoutEffects {
  /**
   * 计算定位上下文
   * 
   * 根据 CSS 规范，transform 会创建新的定位上下文（positioning context）
   * - fixed 定位相对于最近的 transform 容器
   * - absolute 定位相对于最近的定位上下文
   * 
   * @param transformStyle 变换样式
   * @param referenceBox 参考框
   * @param parentContext 父级定位上下文（可选）
   * @returns 定位上下文信息
   */
  static computePositioningContext(
    transformStyle: TransformStyle | undefined,
    referenceBox: Rect,
    parentContext?: PositioningContext
  ): PositioningContext {
    // 如果没有变换，继承父级上下文或返回非定位上下文
    if (!transformStyle || !transformStyle.transform || transformStyle.transform.length === 0) {
      if (parentContext?.isPositioningContext) {
        return {
          isPositioningContext: true,
          transformMatrix: parentContext.transformMatrix,
          boundingBox: referenceBox,
        };
      }
      return {
        isPositioningContext: false,
        boundingBox: referenceBox,
      };
    }

    // 有变换时，创建新的定位上下文
    const transformMatrix = TransformCalculator.computeTransform(transformStyle, referenceBox);
    const transformedBoundingBox = TransformCalculator.computeTransformedBoundingBox(
      referenceBox,
      transformMatrix
    );

    return {
      isPositioningContext: true,
      transformMatrix,
      boundingBox: transformedBoundingBox,
    };
  }

  /**
   * 计算 fixed 定位在 transform 容器中的位置
   * 
   * fixed 定位相对于最近的 transform 容器，而不是视口
   * 
   * @param fixedPosition fixed 定位的位置（相对于视口）
   * @param transformContext 变换容器的定位上下文
   * @returns 相对于变换容器的位置
   */
  static computeFixedPositionInTransformContainer(
    fixedPosition: Point,
    transformContext: PositioningContext
  ): Point {
    if (!transformContext.isPositioningContext || !transformContext.transformMatrix) {
      return fixedPosition;
    }

    // 将 fixed 位置转换为相对于变换容器的位置
    // 需要将视口坐标转换为容器坐标
    const matrix = transformContext.transformMatrix;
    const inverseMatrix = matrix.invert();
    
    if (!inverseMatrix) {
      // 如果矩阵不可逆，返回原位置
      return fixedPosition;
    }

    // 应用逆变换
    const transformedPoint = inverseMatrix.mapPoint(fixedPosition.x, fixedPosition.y, fixedPosition.z || 0);
    return transformedPoint;
  }

  /**
   * 计算 absolute 定位在定位上下文中的位置
   * 
   * @param absolutePosition absolute 定位的位置
   * @param positioningContext 定位上下文
   * @returns 在定位上下文中的位置
   */
  static computeAbsolutePositionInContext(
    absolutePosition: Point,
    positioningContext: PositioningContext
  ): Point {
    if (!positioningContext.isPositioningContext) {
      return absolutePosition;
    }

    // 相对于定位上下文的位置
    return {
      x: absolutePosition.x - positioningContext.boundingBox.x,
      y: absolutePosition.y - positioningContext.boundingBox.y,
      z: absolutePosition.z,
    };
  }

  /**
   * 计算滚动上下文
   * 
   * 变换会影响滚动区域和滚动偏移的计算
   * 
   * @param transformStyle 变换样式
   * @param scrollArea 原始滚动区域
   * @param scrollOffset 原始滚动偏移
   * @param referenceBox 参考框
   * @returns 滚动上下文信息
   */
  static computeScrollContext(
    transformStyle: TransformStyle | undefined,
    scrollArea: Rect,
    scrollOffset: Point,
    referenceBox: Rect
  ): ScrollContext {
    if (!transformStyle || !transformStyle.transform || transformStyle.transform.length === 0) {
      return {
        scrollArea,
        scrollOffset,
      };
    }

    const transformMatrix = TransformCalculator.computeTransform(transformStyle, referenceBox);
    
    // 变换后的滚动区域
    const transformedScrollArea = TransformCalculator.computeTransformedBoundingBox(
      scrollArea,
      transformMatrix
    );

    // 变换后的滚动偏移
    const transformedOffset = transformMatrix.mapPoint(scrollOffset.x, scrollOffset.y, scrollOffset.z || 0);

    return {
      scrollArea: transformedScrollArea,
      scrollOffset: transformedOffset,
      transformMatrix,
    };
  }

  /**
   * 计算滚动偏移（考虑变换）
   * 
   * @param scrollOffset 原始滚动偏移
   * @param transformMatrix 变换矩阵
   * @returns 变换后的滚动偏移
   */
  static computeTransformedScrollOffset(
    scrollOffset: Point,
    transformMatrix: TransformMatrix
  ): Point {
    return transformMatrix.mapPoint(scrollOffset.x, scrollOffset.y, scrollOffset.z || 0);
  }

  /**
   * 计算滚动区域（考虑变换）
   * 
   * @param scrollArea 原始滚动区域
   * @param transformMatrix 变换矩阵
   * @returns 变换后的滚动区域
   */
  static computeTransformedScrollArea(
    scrollArea: Rect,
    transformMatrix: TransformMatrix
  ): Rect {
    return TransformCalculator.computeTransformedBoundingBox(scrollArea, transformMatrix);
  }

  /**
   * 计算溢出处理信息
   * 
   * 变换会影响溢出边界框和裁剪区域的计算
   * 
   * @param transformStyle 变换样式
   * @param contentRect 内容区域
   * @param clipRect 原始裁剪区域
   * @param referenceBox 参考框
   * @returns 溢出处理信息
   */
  static computeOverflowInfo(
    transformStyle: TransformStyle | undefined,
    contentRect: Rect,
    clipRect: Rect,
    referenceBox: Rect
  ): OverflowInfo {
    if (!transformStyle || !transformStyle.transform || transformStyle.transform.length === 0) {
      return {
        clipRect,
        overflowBoundingBox: contentRect,
        needsClipping: contentRect.x < clipRect.x ||
                      contentRect.y < clipRect.y ||
                      contentRect.x + contentRect.width > clipRect.x + clipRect.width ||
                      contentRect.y + contentRect.height > clipRect.y + clipRect.height,
      };
    }

    const transformMatrix = TransformCalculator.computeTransform(transformStyle, referenceBox);
    
    // 变换后的内容边界框
    const transformedContentRect = TransformCalculator.computeTransformedBoundingBox(
      contentRect,
      transformMatrix
    );

    // 变换后的裁剪区域（如果裁剪区域也需要变换）
    const transformedClipRect = TransformCalculator.computeTransformedBoundingBox(
      clipRect,
      transformMatrix
    );

    // 计算是否需要裁剪
    const needsClipping = 
      transformedContentRect.x < transformedClipRect.x ||
      transformedContentRect.y < transformedClipRect.y ||
      transformedContentRect.x + transformedContentRect.width > transformedClipRect.x + transformedClipRect.width ||
      transformedContentRect.y + transformedContentRect.height > transformedClipRect.y + transformedClipRect.height;

    return {
      clipRect: transformedClipRect,
      overflowBoundingBox: transformedContentRect,
      needsClipping,
    };
  }

  /**
   * 计算溢出边界框
   * 
   * @param contentRect 内容区域
   * @param transformMatrix 变换矩阵
   * @returns 变换后的溢出边界框
   */
  static computeOverflowBoundingBox(
    contentRect: Rect,
    transformMatrix: TransformMatrix
  ): Rect {
    return TransformCalculator.computeTransformedBoundingBox(contentRect, transformMatrix);
  }

  /**
   * 检查点是否在变换后的裁剪区域内
   * 
   * @param point 点坐标
   * @param clipRect 裁剪区域
   * @param transformMatrix 变换矩阵
   * @returns 是否在裁剪区域内
   */
  static isPointInClipRect(
    point: Point,
    clipRect: Rect,
    transformMatrix: TransformMatrix
  ): boolean {
    // 将点变换到裁剪区域的坐标系
    const inverseMatrix = transformMatrix.invert();
    if (!inverseMatrix) {
      return false;
    }

    const transformedPoint = inverseMatrix.mapPoint(point.x, point.y, point.z || 0);
    
    return transformedPoint.x >= clipRect.x &&
           transformedPoint.y >= clipRect.y &&
           transformedPoint.x <= clipRect.x + clipRect.width &&
           transformedPoint.y <= clipRect.y + clipRect.height;
  }
}
