# 使用示例

## 基础示例

### 简单 Grid 布局

```typescript
import {
  LayoutEngine,
  createGridNode,
  createConstraintSpace,
} from 'ts-chrome-layout';

// 创建 Grid 节点
const gridNode = createGridNode({
  id: 'grid-1',
  style: {
    gridTemplateColumns: [
      { type: 'fixed', value: 100 },
      { type: 'fr', value: 1 },
      { type: 'fixed', value: 100 },
    ],
    gridTemplateRows: [
      { type: 'fixed', value: 50 },
      { type: 'fr', value: 1 },
      { type: 'fixed', value: 50 },
    ],
    columnGap: 10,
    rowGap: 10,
  },
  children: [
    // 子节点将在后续实现中支持
  ],
});

// 创建约束空间
const constraintSpace = createConstraintSpace({
  availableWidth: 800,
  availableHeight: 600,
});

// 执行布局
const engine = new LayoutEngine();
const result = engine.layout(gridNode, constraintSpace);

console.log('Layout result:', result);
```

### 使用 fr 单位

```typescript
const gridNode = createGridNode({
  id: 'grid-2',
  style: {
    gridTemplateColumns: [
      { type: 'fr', value: 1 },
      { type: 'fr', value: 2 },
      { type: 'fr', value: 1 },
    ],
    gridTemplateRows: [
      { type: 'fixed', value: 100 },
      { type: 'fixed', value: 100 },
    ],
  },
});
```

### 使用 minmax

```typescript
const gridNode = createGridNode({
  id: 'grid-3',
  style: {
    gridTemplateColumns: [
      { type: 'fixed', value: 100 },
      {
        type: 'minmax',
        min: { type: 'fixed', value: 200 },
        max: { type: 'fr', value: 1 },
      },
    ],
  },
});
```

## 高级示例

### 响应式 Grid（计划中）

```typescript
// TODO: 实现 auto-fill/auto-fit 支持
const gridNode = createGridNode({
  id: 'grid-responsive',
  style: {
    gridTemplateColumns: [
      {
        type: 'repeat',
        count: 'auto-fill',
        tracks: [
          {
            type: 'minmax',
            min: { type: 'fixed', value: 200 },
            max: { type: 'fr', value: 1 },
          },
        ],
      },
    ],
  },
});
```

### 子网格（计划中）

```typescript
// TODO: 实现 Subgrid 支持
const parentGrid = createGridNode({
  id: 'parent-grid',
  style: {
    gridTemplateColumns: [
      { type: 'fixed', value: 200 },
      { type: 'fr', value: 1 },
    ],
    gridTemplateRows: [
      { type: 'fixed', value: 100 },
      { type: 'fr', value: 1 },
    ],
  },
  children: [
    // 子网格节点
  ],
});
```

## 更多示例

更多示例将在实现过程中逐步添加。

