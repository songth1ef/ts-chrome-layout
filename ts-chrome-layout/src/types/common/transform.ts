/**
 * Transform 变换类型定义
 * 
 * 对应 Chromium: third_party/blink/renderer/core/style/computed_style.h
 */

/**
 * Transform 操作类型
 */
export type TransformOperation =
  | { type: 'rotate'; angle: number; x?: number; y?: number; z?: number }
  | { type: 'rotateX'; angle: number }
  | { type: 'rotateY'; angle: number }
  | { type: 'rotateZ'; angle: number }
  | { type: 'skew'; x: number; y: number }
  | { type: 'skewX'; angle: number }
  | { type: 'skewY'; angle: number }
  | { type: 'scale'; x: number; y?: number; z?: number }
  | { type: 'scaleX'; value: number }
  | { type: 'scaleY'; value: number }
  | { type: 'scaleZ'; value: number }
  | { type: 'translate'; x: number; y?: number; z?: number }
  | { type: 'translateX'; value: number }
  | { type: 'translateY'; value: number }
  | { type: 'translateZ'; value: number }
  | { type: 'matrix'; values: number[] } // 2D: 6 values, 3D: 16 values
  | { type: 'matrix3d'; values: number[] }; // 16 values

/**
 * Transform 列表
 */
export type TransformList = TransformOperation[];

/**
 * Transform Origin
 */
export interface TransformOrigin {
  x: number | string; // 可以是百分比或长度值
  y: number | string;
  z?: number; // 3D 变换
}

/**
 * Transform 样式
 */
export interface TransformStyle {
  transform?: TransformList;
  transformOrigin?: TransformOrigin;
  transformStyle?: 'flat' | 'preserve-3d';
  perspective?: number | 'none';
  perspectiveOrigin?: TransformOrigin;
  backfaceVisibility?: 'visible' | 'hidden';
}

/**
 * 2D 变换矩阵（3x3，使用齐次坐标）
 * [a c e]
 * [b d f]
 * [0 0 1]
 */
export interface Matrix2D {
  a: number; // scaleX
  b: number; // skewY
  c: number; // skewX
  d: number; // scaleY
  e: number; // translateX
  f: number; // translateY
}

/**
 * 3D 变换矩阵（4x4，使用齐次坐标）
 */
export interface Matrix3D {
  m11: number; m12: number; m13: number; m14: number;
  m21: number; m22: number; m23: number; m24: number;
  m31: number; m32: number; m33: number; m34: number;
  m41: number; m42: number; m43: number; m44: number;
}

/**
 * 点坐标
 */
export interface Point {
  x: number;
  y: number;
  z?: number;
}

/**
 * 矩形
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

