/**
 * 3D 变换矩阵
 * 
 * 对应 Chromium: platform/transforms/transform_operations.h/cc
 */

import { Matrix3D, TransformOperation, Point, Rect } from '../types/common/transform';
import { AffineTransform } from './affine-transform';

/**
 * 3D 变换矩阵类
 * 
 * 使用齐次坐标表示 4x4 矩阵
 */
export class TransformMatrix {
  private matrix: Matrix3D;

  constructor(matrix?: Matrix3D) {
    if (matrix) {
      this.matrix = { ...matrix };
    } else {
      this.matrix = this.identityMatrix();
    }
  }

  /**
   * 创建单位矩阵
   */
  static identity(): TransformMatrix {
    return new TransformMatrix();
  }

  /**
   * 从变换操作列表创建矩阵
   */
  static fromOperations(operations: TransformOperation[]): TransformMatrix {
    let result = TransformMatrix.identity();
    
    for (const op of operations) {
      result = result.applyOperation(op);
    }
    
    return result;
  }

  /**
   * 应用变换操作
   */
  applyOperation(operation: TransformOperation): TransformMatrix {
    switch (operation.type) {
      case 'rotate':
        return this.rotate(operation.angle, operation.x, operation.y, operation.z);
      case 'rotateX':
        return this.rotateX(operation.angle);
      case 'rotateY':
        return this.rotateY(operation.angle);
      case 'rotateZ':
        return this.rotateZ(operation.angle);
      case 'skew':
        return this.skew(operation.x, operation.y);
      case 'skewX':
        return this.skewX(operation.angle);
      case 'skewY':
        return this.skewY(operation.angle);
      case 'scale':
        return this.scale(operation.x, operation.y, operation.z);
      case 'scaleX':
        return this.scale(operation.value, 1, 1);
      case 'scaleY':
        return this.scale(1, operation.value, 1);
      case 'scaleZ':
        return this.scale(1, 1, operation.value);
      case 'translate':
        return this.translate(operation.x, operation.y, operation.z);
      case 'translateX':
        return this.translate(operation.value, 0, 0);
      case 'translateY':
        return this.translate(0, operation.value, 0);
      case 'translateZ':
        return this.translate(0, 0, operation.value);
      case 'matrix':
        return this.applyMatrix(operation.values);
      case 'matrix3d':
        return this.applyMatrix3d(operation.values);
      default:
        return this;
    }
  }

  /**
   * 旋转
   */
  rotate(angle: number, x?: number, y?: number, z?: number): TransformMatrix {
    if (x !== undefined && y !== undefined && z !== undefined) {
      // 绕任意轴旋转
      return this.rotateAroundAxis(angle, x, y, z);
    }
    // 默认绕 Z 轴旋转
    return this.rotateZ(angle);
  }

  /**
   * 绕 X 轴旋转
   */
  rotateX(angle: number): TransformMatrix {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const rot = TransformMatrix.identity();
    rot.matrix.m22 = cos;
    rot.matrix.m23 = sin;
    rot.matrix.m32 = -sin;
    rot.matrix.m33 = cos;
    
    return this.multiply(rot);
  }

  /**
   * 绕 Y 轴旋转
   */
  rotateY(angle: number): TransformMatrix {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const rot = TransformMatrix.identity();
    rot.matrix.m11 = cos;
    rot.matrix.m13 = -sin;
    rot.matrix.m31 = sin;
    rot.matrix.m33 = cos;
    
    return this.multiply(rot);
  }

  /**
   * 绕 Z 轴旋转
   */
  rotateZ(angle: number): TransformMatrix {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const rot = TransformMatrix.identity();
    rot.matrix.m11 = cos;
    rot.matrix.m12 = sin;
    rot.matrix.m21 = -sin;
    rot.matrix.m22 = cos;
    
    return this.multiply(rot);
  }

  /**
   * 绕任意轴旋转
   */
  private rotateAroundAxis(angle: number, x: number, y: number, z: number): TransformMatrix {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const oneMinusCos = 1 - cos;
    
    const length = Math.sqrt(x * x + y * y + z * z);
    if (length < 1e-10) {
      return this;
    }
    
    const nx = x / length;
    const ny = y / length;
    const nz = z / length;
    
    const rot = TransformMatrix.identity();
    rot.matrix.m11 = cos + nx * nx * oneMinusCos;
    rot.matrix.m12 = nx * ny * oneMinusCos - nz * sin;
    rot.matrix.m13 = nx * nz * oneMinusCos + ny * sin;
    rot.matrix.m21 = ny * nx * oneMinusCos + nz * sin;
    rot.matrix.m22 = cos + ny * ny * oneMinusCos;
    rot.matrix.m23 = ny * nz * oneMinusCos - nx * sin;
    rot.matrix.m31 = nz * nx * oneMinusCos - ny * sin;
    rot.matrix.m32 = nz * ny * oneMinusCos + nx * sin;
    rot.matrix.m33 = cos + nz * nz * oneMinusCos;
    
    return this.multiply(rot);
  }

  /**
   * 斜切
   */
  skew(x: number, y: number): TransformMatrix {
    const skewX = Math.tan((x * Math.PI) / 180);
    const skewY = Math.tan((y * Math.PI) / 180);
    
    const skew = TransformMatrix.identity();
    skew.matrix.m12 = skewY;
    skew.matrix.m21 = skewX;
    
    return this.multiply(skew);
  }

  /**
   * X 轴斜切
   */
  skewX(angle: number): TransformMatrix {
    return this.skew(angle, 0);
  }

  /**
   * Y 轴斜切
   */
  skewY(angle: number): TransformMatrix {
    return this.skew(0, angle);
  }

  /**
   * 缩放
   */
  scale(x: number, y?: number, z?: number): TransformMatrix {
    const scale = TransformMatrix.identity();
    scale.matrix.m11 = x;
    scale.matrix.m22 = y !== undefined ? y : x;
    scale.matrix.m33 = z !== undefined ? z : 1;
    
    return this.multiply(scale);
  }

  /**
   * 平移
   */
  translate(x: number, y?: number, z?: number): TransformMatrix {
    const trans = TransformMatrix.identity();
    trans.matrix.m41 = x;
    trans.matrix.m42 = y !== undefined ? y : 0;
    trans.matrix.m43 = z !== undefined ? z : 0;
    
    return this.multiply(trans);
  }

  /**
   * 2D 矩阵
   */
  applyMatrix(values: number[]): TransformMatrix {
    if (values.length !== 6) {
      throw new Error('2D matrix requires 6 values');
    }
    
    const mat = TransformMatrix.identity();
    mat.matrix.m11 = values[0];
    mat.matrix.m12 = values[1];
    mat.matrix.m21 = values[2];
    mat.matrix.m22 = values[3];
    mat.matrix.m41 = values[4];
    mat.matrix.m42 = values[5];
    
    return this.multiply(mat);
  }

  /**
   * 3D 矩阵
   */
  applyMatrix3d(values: number[]): TransformMatrix {
    if (values.length !== 16) {
      throw new Error('3D matrix requires 16 values');
    }
    
    const mat = TransformMatrix.identity();
    mat.matrix.m11 = values[0];
    mat.matrix.m12 = values[1];
    mat.matrix.m13 = values[2];
    mat.matrix.m14 = values[3];
    mat.matrix.m21 = values[4];
    mat.matrix.m22 = values[5];
    mat.matrix.m23 = values[6];
    mat.matrix.m24 = values[7];
    mat.matrix.m31 = values[8];
    mat.matrix.m32 = values[9];
    mat.matrix.m33 = values[10];
    mat.matrix.m34 = values[11];
    mat.matrix.m41 = values[12];
    mat.matrix.m42 = values[13];
    mat.matrix.m43 = values[14];
    mat.matrix.m44 = values[15];
    
    return this.multiply(mat);
  }

  /**
   * 透视
   */
  perspective(distance: number): TransformMatrix {
    if (distance <= 0) {
      return this;
    }
    
    const persp = TransformMatrix.identity();
    persp.matrix.m34 = -1 / distance;
    
    return this.multiply(persp);
  }

  /**
   * 矩阵乘法
   */
  multiply(other: TransformMatrix): TransformMatrix {
    const result = new TransformMatrix();
    const a = this.matrix;
    const b = other.matrix;
    
    result.matrix.m11 = a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31 + a.m14 * b.m41;
    result.matrix.m12 = a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32 + a.m14 * b.m42;
    result.matrix.m13 = a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33 + a.m14 * b.m43;
    result.matrix.m14 = a.m11 * b.m14 + a.m12 * b.m24 + a.m13 * b.m34 + a.m14 * b.m44;
    
    result.matrix.m21 = a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31 + a.m24 * b.m41;
    result.matrix.m22 = a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32 + a.m24 * b.m42;
    result.matrix.m23 = a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33 + a.m24 * b.m43;
    result.matrix.m24 = a.m21 * b.m14 + a.m22 * b.m24 + a.m23 * b.m34 + a.m24 * b.m44;
    
    result.matrix.m31 = a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31 + a.m34 * b.m41;
    result.matrix.m32 = a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32 + a.m34 * b.m42;
    result.matrix.m33 = a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33 + a.m34 * b.m43;
    result.matrix.m34 = a.m31 * b.m14 + a.m32 * b.m24 + a.m33 * b.m34 + a.m34 * b.m44;
    
    result.matrix.m41 = a.m41 * b.m11 + a.m42 * b.m21 + a.m43 * b.m31 + a.m44 * b.m41;
    result.matrix.m42 = a.m41 * b.m12 + a.m42 * b.m22 + a.m43 * b.m32 + a.m44 * b.m42;
    result.matrix.m43 = a.m41 * b.m13 + a.m42 * b.m23 + a.m43 * b.m33 + a.m44 * b.m43;
    result.matrix.m44 = a.m41 * b.m14 + a.m42 * b.m24 + a.m43 * b.m34 + a.m44 * b.m44;
    
    return result;
  }

  /**
   * 前置乘法
   */
  preMultiply(other: TransformMatrix): TransformMatrix {
    return other.multiply(this);
  }

  /**
   * 矩阵求逆
   */
  invert(): TransformMatrix | null {
    // 简化实现：使用 2D 部分求逆
    const a = this.matrix.m11;
    const b = this.matrix.m12;
    const c = this.matrix.m21;
    const d = this.matrix.m22;
    const e = this.matrix.m41;
    const f = this.matrix.m42;
    
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-10) {
      return null;
    }
    
    const invDet = 1 / det;
    const result = TransformMatrix.identity();
    
    result.matrix.m11 = d * invDet;
    result.matrix.m12 = -b * invDet;
    result.matrix.m21 = -c * invDet;
    result.matrix.m22 = a * invDet;
    result.matrix.m41 = (c * f - d * e) * invDet;
    result.matrix.m42 = (b * e - a * f) * invDet;
    
    return result;
  }

  /**
   * 扁平化为 2D
   */
  flatten(): TransformMatrix {
    // 如果已经是 2D，直接返回
    if (this.is2D()) {
      return this;
    }
    
    // 简化实现：提取 2D 部分
    const result = TransformMatrix.identity();
    result.matrix.m11 = this.matrix.m11;
    result.matrix.m12 = this.matrix.m12;
    result.matrix.m21 = this.matrix.m21;
    result.matrix.m22 = this.matrix.m22;
    result.matrix.m41 = this.matrix.m41;
    result.matrix.m42 = this.matrix.m42;
    
    return result;
  }

  /**
   * 变换点坐标
   */
  mapPoint(x: number, y: number, z: number = 0): Point {
    const w = this.matrix.m14 * x + this.matrix.m24 * y + this.matrix.m34 * z + this.matrix.m44;
    
    if (Math.abs(w) < 1e-10) {
      return { x: 0, y: 0, z: 0 };
    }
    
    const invW = 1 / w;
    return {
      x: (this.matrix.m11 * x + this.matrix.m21 * y + this.matrix.m31 * z + this.matrix.m41) * invW,
      y: (this.matrix.m12 * x + this.matrix.m22 * y + this.matrix.m32 * z + this.matrix.m42) * invW,
      z: (this.matrix.m13 * x + this.matrix.m23 * y + this.matrix.m33 * z + this.matrix.m43) * invW,
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
    const m = this.matrix;
    return (
      m.m11 === 1 && m.m12 === 0 && m.m13 === 0 && m.m14 === 0 &&
      m.m21 === 0 && m.m22 === 1 && m.m23 === 0 && m.m24 === 0 &&
      m.m31 === 0 && m.m32 === 0 && m.m33 === 1 && m.m34 === 0 &&
      m.m41 === 0 && m.m42 === 0 && m.m43 === 0 && m.m44 === 1
    );
  }

  /**
   * 检查是否为 2D 变换
   */
  is2D(): boolean {
    return (
      this.matrix.m13 === 0 &&
      this.matrix.m14 === 0 &&
      this.matrix.m23 === 0 &&
      this.matrix.m24 === 0 &&
      this.matrix.m31 === 0 &&
      this.matrix.m32 === 0 &&
      this.matrix.m33 === 1 &&
      this.matrix.m34 === 0 &&
      this.matrix.m43 === 0 &&
      this.matrix.m44 === 1
    );
  }

  /**
   * 检查是否创建 3D 变换
   */
  creates3D(): boolean {
    return !this.is2D();
  }

  /**
   * 获取矩阵值
   */
  getMatrix(): Matrix3D {
    return { ...this.matrix };
  }

  /**
   * 转换为 AffineTransform（2D）
   */
  toAffineTransform(): AffineTransform {
    if (!this.is2D()) {
      const flattened = this.flatten();
      return new AffineTransform({
        a: flattened.matrix.m11,
        b: flattened.matrix.m12,
        c: flattened.matrix.m21,
        d: flattened.matrix.m22,
        e: flattened.matrix.m41,
        f: flattened.matrix.m42,
      });
    }
    
    return new AffineTransform({
      a: this.matrix.m11,
      b: this.matrix.m12,
      c: this.matrix.m21,
      d: this.matrix.m22,
      e: this.matrix.m41,
      f: this.matrix.m42,
    });
  }

  /**
   * 单位矩阵
   */
  private identityMatrix(): Matrix3D {
    return {
      m11: 1, m12: 0, m13: 0, m14: 0,
      m21: 0, m22: 1, m23: 0, m24: 0,
      m31: 0, m32: 0, m33: 1, m34: 0,
      m41: 0, m42: 0, m43: 0, m44: 1,
    };
  }
}

