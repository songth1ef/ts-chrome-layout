/**
 * Transform 计算器
 * 
 * 对应 Chromium: core/layout/svg/transform_helper.h/cc
 */

import {
  TransformStyle,
  TransformOrigin,
  Point,
  Rect,
} from '../types/common/transform';
import { TransformMatrix } from './transform-matrix';

/**
 * Transform 计算器类
 */
export class TransformCalculator {
  /**
   * 计算变换矩阵
   * 
   * 对应 Chromium: TransformHelper::ComputeTransform()
   */
  static computeTransform(
    style: TransformStyle,
    referenceBox: Rect,
    includeTransformOrigin: boolean = true
  ): TransformMatrix {
    if (!style.transform || style.transform.length === 0) {
      return TransformMatrix.identity();
    }

    // 从变换操作列表创建矩阵
    let matrix = TransformMatrix.fromOperations(style.transform);

    // 应用变换原点
    if (includeTransformOrigin && style.transformOrigin) {
      const origin = this.computeTransformOrigin(style.transformOrigin, referenceBox);
      matrix = this.applyTransformOrigin(matrix, origin);
    }

    return matrix;
  }

  /**
   * 计算变换原点
   * 
   * 对应 Chromium: TransformHelper::ComputeTransformOrigin()
   */
  static computeTransformOrigin(
    origin: TransformOrigin,
    referenceBox: Rect
  ): Point {
    const x = this.parseLength(origin.x, referenceBox.width);
    const y = this.parseLength(origin.y, referenceBox.height);
    const z = origin.z || 0;

    return {
      x: referenceBox.x + x,
      y: referenceBox.y + y,
      z,
    };
  }

  /**
   * 应用变换原点
   */
  static applyTransformOrigin(
    transform: TransformMatrix,
    origin: Point
  ): TransformMatrix {
    // 先平移回原点，应用变换，再平移回去
    const z = origin.z || 0;
    const translate1 = TransformMatrix.identity().translate(-origin.x, -origin.y, -z);
    const translate2 = TransformMatrix.identity().translate(origin.x, origin.y, z);

    return translate2.multiply(transform).multiply(translate1);
  }

  /**
   * 计算透视矩阵
   */
  static computePerspective(
    perspective: number,
    origin: Point
  ): TransformMatrix {
    if (perspective <= 0) {
      return TransformMatrix.identity();
    }

    // 应用透视原点
    const z = origin.z || 0;
    const translate1 = TransformMatrix.identity().translate(-origin.x, -origin.y, -z);
    const persp = TransformMatrix.identity().perspective(perspective);
    const translate2 = TransformMatrix.identity().translate(origin.x, origin.y, z);

    return translate2.multiply(persp).multiply(translate1);
  }

  /**
   * 计算变换后的边界框
   */
  static computeTransformedBoundingBox(
    rect: Rect,
    transform: TransformMatrix
  ): Rect {
    return transform.mapRect(rect);
  }

  /**
   * 解析长度值（支持百分比和像素值）
   */
  private static parseLength(value: number | string, reference: number): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      // 处理百分比
      if (value.endsWith('%')) {
        const percent = parseFloat(value) / 100;
        return reference * percent;
      }

      // 处理像素值
      if (value.endsWith('px')) {
        return parseFloat(value);
      }

      // 默认尝试解析为数字
      return parseFloat(value) || 0;
    }

    return 0;
  }
}

