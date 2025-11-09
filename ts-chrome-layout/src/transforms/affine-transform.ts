/**
 * 2D 仿射变换矩阵
 * 
 * 对应 Chromium: platform/transforms/affine_transform.h/cc
 */

import { Matrix2D, Point, Rect } from '../types/common/transform';

/**
 * 2D 仿射变换矩阵类
 * 
 * 使用齐次坐标表示 3x3 矩阵：
 * [a c e]
 * [b d f]
 * [0 0 1]
 */
export class AffineTransform {
  private matrix: Matrix2D;

  constructor(matrix?: Matrix2D) {
    if (matrix) {
      this.matrix = { ...matrix };
    } else {
      this.matrix = this.identityMatrix();
    }
  }

  /**
   * 创建单位矩阵
   */
  static identity(): AffineTransform {
    return new AffineTransform();
  }

  /**
   * 创建平移变换
   */
  static translate(x: number, y: number): AffineTransform {
    const transform = new AffineTransform();
    transform.matrix.e = x;
    transform.matrix.f = y;
    return transform;
  }

  /**
   * 创建旋转变换
   */
  static rotate(angle: number): AffineTransform {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const transform = new AffineTransform();
    transform.matrix.a = cos;
    transform.matrix.b = sin;
    transform.matrix.c = -sin;
    transform.matrix.d = cos;
    return transform;
  }

  /**
   * 创建缩放变换
   */
  static scale(x: number, y?: number): AffineTransform {
    const transform = new AffineTransform();
    transform.matrix.a = x;
    transform.matrix.d = y !== undefined ? y : x;
    return transform;
  }

  /**
   * 创建斜切变换
   * 
   * skew(x, y) 表示：
   * - x: 沿 X 轴斜切的角度（影响 Y 坐标）
   * - y: 沿 Y 轴斜切的角度（影响 X 坐标）
   */
  static skew(x: number, y: number): AffineTransform {
    const transform = new AffineTransform();
    // CSS skew: [1, tan(y), tan(x), 1, 0, 0]
    transform.matrix.c = Math.tan((x * Math.PI) / 180); // skewX
    transform.matrix.b = Math.tan((y * Math.PI) / 180); // skewY
    return transform;
  }

  /**
   * 矩阵乘法
   */
  multiply(other: AffineTransform): AffineTransform {
    const a = this.matrix.a;
    const b = this.matrix.b;
    const c = this.matrix.c;
    const d = this.matrix.d;
    const e = this.matrix.e;
    const f = this.matrix.f;
    
    const oa = other.matrix.a;
    const ob = other.matrix.b;
    const oc = other.matrix.c;
    const od = other.matrix.d;
    const oe = other.matrix.e;
    const of = other.matrix.f;

    const result = new AffineTransform();
    result.matrix.a = a * oa + c * ob;
    result.matrix.b = b * oa + d * ob;
    result.matrix.c = a * oc + c * od;
    result.matrix.d = b * oc + d * od;
    result.matrix.e = a * oe + c * of + e;
    result.matrix.f = b * oe + d * of + f;
    
    return result;
  }

  /**
   * 矩阵求逆
   */
  invert(): AffineTransform | null {
    const det = this.matrix.a * this.matrix.d - this.matrix.b * this.matrix.c;
    
    if (Math.abs(det) < 1e-10) {
      return null; // 矩阵不可逆
    }

    const invDet = 1 / det;
    const result = new AffineTransform();
    
    result.matrix.a = this.matrix.d * invDet;
    result.matrix.b = -this.matrix.b * invDet;
    result.matrix.c = -this.matrix.c * invDet;
    result.matrix.d = this.matrix.a * invDet;
    result.matrix.e = (this.matrix.c * this.matrix.f - this.matrix.d * this.matrix.e) * invDet;
    result.matrix.f = (this.matrix.b * this.matrix.e - this.matrix.a * this.matrix.f) * invDet;
    
    return result;
  }

  /**
   * 变换点坐标
   */
  mapPoint(x: number, y: number): Point {
    return {
      x: this.matrix.a * x + this.matrix.c * y + this.matrix.e,
      y: this.matrix.b * x + this.matrix.d * y + this.matrix.f,
    };
  }

  /**
   * 变换矩形边界框
   */
  mapRect(rect: Rect): Rect {
    const p1 = this.mapPoint(rect.x, rect.y);
    const p2 = this.mapPoint(rect.x + rect.width, rect.y);
    const p3 = this.mapPoint(rect.x, rect.y + rect.height);
    const p4 = this.mapPoint(rect.x + rect.width, rect.y + rect.height);

    const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
    const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
    const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
    const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * 检查是否为单位矩阵
   */
  isIdentity(): boolean {
    return (
      this.matrix.a === 1 &&
      this.matrix.b === 0 &&
      this.matrix.c === 0 &&
      this.matrix.d === 1 &&
      this.matrix.e === 0 &&
      this.matrix.f === 0
    );
  }

  /**
   * 获取矩阵值
   */
  getMatrix(): Matrix2D {
    return { ...this.matrix };
  }

  /**
   * 单位矩阵
   */
  private identityMatrix(): Matrix2D {
    return {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
    };
  }
}

