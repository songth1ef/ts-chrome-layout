# Transform 变换系统实现计划

## 概述

Transform 变换系统用于处理 CSS Transform 相关的功能，包括旋转、斜切、缩放、平移等变换操作。这些变换会影响元素的视觉呈现，同时也可能影响布局计算（如 fixed 定位在 transform 容器中的行为）。

## 对应 Chromium 实现

### 核心文件映射

- **TypeScript**: `src/transforms/transform-matrix.ts`
  - **Chromium**: `third_party/blink/renderer/platform/transforms/transform_operations.h/cc`
  
- **TypeScript**: `src/transforms/transform-calculator.ts`
  - **Chromium**: `third_party/blink/renderer/core/layout/svg/transform_helper.h/cc`
  
- **TypeScript**: `src/transforms/affine-transform.ts`
  - **Chromium**: `third_party/blink/renderer/platform/transforms/affine_transform.h/cc`

- **TypeScript**: `src/types/common/transform.ts`
  - **Chromium**: `third_party/blink/renderer/core/style/computed_style.h` (Transform 相关属性)

## 实现计划

### Phase 5.1: 基础类型定义

#### 1. Transform 类型定义

**文件**: `src/types/common/transform.ts`

```typescript
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
  | { type: 'matrix3d'; values: number[] } // 16 values
  | { type: 'perspective'; distance: number };

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
```

#### 2. 矩阵类型定义

**文件**: `src/types/common/transform.ts`

```typescript
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
```

### Phase 5.2: 矩阵运算实现

#### 1. AffineTransform 类

**文件**: `src/transforms/affine-transform.ts`

**对应 Chromium**: `platform/transforms/affine_transform.h/cc`

**功能**:
- 2D 变换矩阵的创建和操作
- 矩阵乘法
- 矩阵应用（点、矩形）
- 矩阵分解（提取 translate、rotate、scale）

**主要方法**:
```typescript
class AffineTransform {
  // 创建变换
  static identity(): AffineTransform;
  static translate(x: number, y: number): AffineTransform;
  static rotate(angle: number): AffineTransform;
  static scale(x: number, y?: number): AffineTransform;
  static skew(x: number, y: number): AffineTransform;
  
  // 矩阵运算
  multiply(other: AffineTransform): AffineTransform;
  invert(): AffineTransform | null;
  
  // 应用变换
  mapPoint(x: number, y: number): { x: number; y: number };
  mapRect(rect: Rect): Rect;
  
  // 矩阵分解
  decompose(): { translate: Point; rotate: number; scale: Point; skew: Point };
}
```

#### 2. TransformMatrix 类

**文件**: `src/transforms/transform-matrix.ts`

**对应 Chromium**: `platform/transforms/transform_operations.h/cc`

**功能**:
- 3D 变换矩阵的创建和操作
- 支持所有 CSS Transform 操作
- 矩阵组合和链式应用
- 透视变换支持

**主要方法**:
```typescript
class TransformMatrix {
  // 创建变换
  static identity(): TransformMatrix;
  static fromOperations(operations: TransformList): TransformMatrix;
  
  // 应用变换操作
  rotate(angle: number, x?: number, y?: number, z?: number): TransformMatrix;
  scale(x: number, y?: number, z?: number): TransformMatrix;
  translate(x: number, y?: number, z?: number): TransformMatrix;
  skew(x: number, y: number): TransformMatrix;
  matrix(values: number[]): TransformMatrix;
  perspective(distance: number): TransformMatrix;
  
  // 矩阵运算
  multiply(other: TransformMatrix): TransformMatrix;
  preMultiply(other: TransformMatrix): TransformMatrix;
  invert(): TransformMatrix | null;
  flatten(): TransformMatrix; // 将 3D 变换扁平化为 2D
  
  // 应用变换
  mapPoint(x: number, y: number, z?: number): { x: number; y: number; z: number };
  mapRect(rect: Rect): Rect;
  
  // 检查
  isIdentity(): boolean;
  is2D(): boolean;
  creates3D(): boolean;
}
```

### Phase 5.3: Transform 计算器

#### 1. TransformCalculator 类

**文件**: `src/transforms/transform-calculator.ts`

**对应 Chromium**: `core/layout/svg/transform_helper.h/cc`

**功能**:
- 从样式计算变换矩阵
- 处理 transform-origin
- 处理 perspective
- 计算变换后的边界框

**主要方法**:
```typescript
class TransformCalculator {
  /**
   * 计算变换矩阵
   * 
   * 对应 Chromium: TransformHelper::ComputeTransform()
   */
  static computeTransform(
    style: TransformStyle,
    referenceBox: Rect,
    includeTransformOrigin?: boolean
  ): TransformMatrix;
  
  /**
   * 计算变换原点
   * 
   * 对应 Chromium: TransformHelper::ComputeTransformOrigin()
   */
  static computeTransformOrigin(
    origin: TransformOrigin,
    referenceBox: Rect
  ): Point;
  
  /**
   * 应用变换原点
   */
  static applyTransformOrigin(
    transform: TransformMatrix,
    origin: Point
  ): TransformMatrix;
  
  /**
   * 计算透视矩阵
   */
  static computePerspective(
    perspective: number,
    origin: Point
  ): TransformMatrix;
  
  /**
   * 计算变换后的边界框
   */
  static computeTransformedBoundingBox(
    rect: Rect,
    transform: TransformMatrix
  ): Rect;
}
```

### Phase 5.4: 布局集成

#### 1. LayoutNode 扩展

**文件**: `src/types/common/layout-node.ts`

**扩展**:
```typescript
export interface LayoutNode {
  // ... 现有属性
  
  // Transform 相关
  transform?: TransformList;
  transformOrigin?: TransformOrigin;
  transformStyle?: 'flat' | 'preserve-3d';
  perspective?: number | 'none';
  
  // 计算后的变换矩阵（缓存）
  computedTransform?: TransformMatrix;
  transformedBoundingBox?: Rect;
}
```

#### 2. 布局算法集成

**需要修改的文件**:
- `src/layouts/grid/grid-arrange.ts` - 在排列时考虑 transform
- `src/core/layout-engine.ts` - 在布局流程中应用 transform

**主要功能**:
- 在测量阶段计算变换后的边界框
- 在排列阶段应用变换
- 处理 fixed 定位在 transform 容器中的行为

## 实现步骤

### Step 1: 基础类型和矩阵运算（Phase 5.1-5.2）

1. 创建 `src/types/common/transform.ts`
2. 创建 `src/transforms/affine-transform.ts`
3. 创建 `src/transforms/transform-matrix.ts`
4. 实现基础矩阵运算（乘法、逆矩阵、应用）

### Step 2: Transform 计算（Phase 5.3）

1. 创建 `src/transforms/transform-calculator.ts`
2. 实现 `computeTransform()` - 从样式计算矩阵
3. 实现 `computeTransformOrigin()` - 计算变换原点
4. 实现 `computeTransformedBoundingBox()` - 计算变换后的边界框

### Step 3: 布局集成（Phase 5.4）

1. 扩展 `LayoutNode` 类型
2. 在测量阶段计算变换
3. 在排列阶段应用变换
4. 处理 transform 对布局的影响

### Step 4: 测试和优化

1. 单元测试（矩阵运算、变换计算）
2. 集成测试（布局中的 transform）
3. 性能优化（矩阵运算优化、缓存）

## 参考实现

### Chromium 相关文件

1. **矩阵运算**:
   - `platform/transforms/affine_transform.h/cc`
   - `platform/transforms/transform_operations.h/cc`
   - `platform/transforms/gfx/transform.h`

2. **Transform 计算**:
   - `core/layout/svg/transform_helper.h/cc`
   - `core/style/computed_style.h` (Transform 相关属性)

3. **布局集成**:
   - `core/layout/layout_box.cc` (MapLocalToAncestor)
   - `core/layout/layout_object.cc` (LocalToAncestorTransform)

## 注意事项

1. **精度问题**: 矩阵运算可能存在浮点数精度问题，需要处理
2. **性能**: 矩阵运算可能频繁调用，需要优化
3. **缓存**: 计算后的变换矩阵应该缓存，避免重复计算
4. **3D 变换**: 3D 变换比 2D 复杂，需要特别注意
5. **边界框计算**: 变换后的边界框计算需要考虑所有顶点

## 测试用例

### 基础变换测试

```typescript
// 旋转
transform: rotate(45deg)

// 缩放
transform: scale(2, 1.5)

// 平移
transform: translate(100px, 50px)

// 斜切
transform: skew(10deg, 5deg)

// 组合变换
transform: translate(50px, 50px) rotate(45deg) scale(2)
```

### 3D 变换测试

```typescript
// 3D 旋转
transform: rotateX(45deg) rotateY(30deg)

// 透视
perspective: 1000px
transform: rotateY(45deg)
```

### 布局影响测试

```typescript
// fixed 定位在 transform 容器中
.container { transform: rotate(45deg); }
.fixed { position: fixed; }
```

## 相关文档

- [CSS Transforms Module Level 1](https://www.w3.org/TR/css-transforms-1/)
- [CSS Transforms Module Level 2](https://www.w3.org/TR/css-transforms-2/)
- [Chromium Transform 实现](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/platform/transforms/)

