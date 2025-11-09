# 迁移指南：从单布局到多布局架构

## 概述

本文档说明如何将项目从单一 Grid 布局架构迁移到支持多种布局模式的通用架构。

## 目录结构变化

### 旧结构
```
src/
├── types/
│   ├── layout-node.ts
│   ├── grid-data.ts
│   └── ...
├── algorithms/
│   ├── grid-layout-algorithm.ts
│   └── ...
```

### 新结构
```
src/
├── types/
│   ├── common/              # 通用类型
│   │   ├── layout-node.ts
│   │   ├── constraint-space.ts
│   │   └── style.ts
│   │
│   └── layouts/             # 布局特定类型
│       └── grid/
│           ├── grid-style.ts
│           └── grid-data.ts
│
├── layouts/                 # 布局算法实现
│   └── grid/
│       └── grid-layout-algorithm.ts
```

## 类型变化

### LayoutNode

**旧版本**：
```typescript
interface LayoutNode {
  layoutType: 'grid' | 'flex' | 'block' | 'inline';
  style?: GridStyle;  // 只支持 Grid
}
```

**新版本**：
```typescript
interface LayoutNode {
  layoutType: 'grid' | 'flex' | 'block' | 'inline';
  style?: LayoutStyle;  // 通用样式接口
}

// Grid 特定样式
interface GridStyle extends LayoutStyle {
  layoutType: 'grid';
  gridTemplateColumns: GridTrackList;
  // ...
}
```

### 样式系统

**旧版本**：只有 `GridStyle`

**新版本**：
- `LayoutStyle` - 基础接口
- `GridStyle extends LayoutStyle` - Grid 特定
- `FlexStyle extends LayoutStyle` - Flex 特定（未来）
- `BlockStyle extends LayoutStyle` - Block 特定（未来）

## API 变化

### LayoutEngine

**旧版本**：
```typescript
const engine = new LayoutEngine();
// 内部自动注册 Grid 算法
```

**新版本**：
```typescript
const engine = new LayoutEngine();
engine.register(new GridLayoutAlgorithm());
// 可以注册多个算法
engine.register(new FlexLayoutAlgorithm());
```

### 向后兼容

为了保持向后兼容，可以创建一个默认配置：

```typescript
// utils/default-engine.ts
export function createDefaultEngine(): LayoutEngine {
  const engine = new LayoutEngine();
  engine.register(new GridLayoutAlgorithm());
  // 未来可以添加更多默认算法
  return engine;
}
```

## 迁移步骤

### 步骤 1: 创建新目录结构

1. 创建 `src/types/common/` 目录
2. 创建 `src/types/layouts/grid/` 目录
3. 创建 `src/layouts/grid/` 目录

### 步骤 2: 移动和重构文件

1. 将通用类型移动到 `common/`
2. 将 Grid 特定类型移动到 `layouts/grid/`
3. 更新导入路径

### 步骤 3: 更新核心组件

1. 重构 `LayoutEngine` 使用注册机制
2. 创建 `AlgorithmRegistry`
3. 统一 `LayoutAlgorithm` 接口

### 步骤 4: 更新导出

在 `src/index.ts` 中重新导出，保持向后兼容：

```typescript
// 向后兼容导出
export { LayoutNode } from './types/common/layout-node';
export { GridStyle } from './types/layouts/grid/grid-style';
// ...

// 新架构导出
export { LayoutEngine } from './core/layout-engine';
export { AlgorithmRegistry } from './core/algorithm-registry';
```

## 添加新布局模式

### 添加 Flex 布局

1. **创建类型定义**：
   ```typescript
   // src/types/layouts/flex/flex-style.ts
   export interface FlexStyle extends LayoutStyle {
     layoutType: 'flex';
     flexDirection: FlexDirection;
     // ...
   }
   ```

2. **实现算法**：
   ```typescript
   // src/layouts/flex/flex-layout-algorithm.ts
   export class FlexLayoutAlgorithm extends BaseLayoutAlgorithm {
     readonly layoutType = 'flex';
     // ...
   }
   ```

3. **注册算法**：
   ```typescript
   const engine = new LayoutEngine();
   engine.register(new FlexLayoutAlgorithm());
   ```

完成！现在可以使用 Flex 布局了。

## 测试策略

1. **单元测试**：每个布局算法独立测试
2. **集成测试**：测试多种布局模式的组合
3. **兼容性测试**：确保旧代码仍能工作

## 注意事项

1. **类型安全**：使用 TypeScript 的类型系统确保正确性
2. **向后兼容**：保持现有 API 不变
3. **渐进迁移**：可以逐步迁移，不一次性完成
4. **文档更新**：及时更新文档反映新架构

## 未来扩展

### 计划支持的布局模式

- ✅ Grid（已完成）
- ⏳ Flex（计划中）
- ⏳ Block（计划中）
- ⏳ Inline（计划中）
- ⏳ Table（计划中）

### 扩展点

1. **新的布局类型**：只需实现 `LayoutAlgorithm` 接口
2. **新的样式属性**：扩展 `LayoutStyle` 接口
3. **新的约束空间属性**：在 `ConstraintSpace` 中添加

## 总结

新架构的优势：

1. ✅ **可扩展**：轻松添加新布局模式
2. ✅ **模块化**：每种布局独立
3. ✅ **类型安全**：TypeScript 类型系统
4. ✅ **可维护**：清晰的目录结构
5. ✅ **向后兼容**：不破坏现有代码

