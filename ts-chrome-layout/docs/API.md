# API 文档

## 核心 API

### LayoutEngine

布局引擎，根据节点的 `layoutType` 选择合适的布局算法。

```typescript
import { LayoutEngine } from 'ts-chrome-layout';

const engine = new LayoutEngine();
const result = engine.layout(node, constraintSpace);
```

#### 方法

##### `layout(node: LayoutNode, constraintSpace: ConstraintSpace): LayoutResult`

执行完整的布局流程（测量 + 排列）。

**参数：**
- `node`: 布局节点
- `constraintSpace`: 约束空间

**返回：** 布局结果

##### `measure(node: LayoutNode, constraintSpace: ConstraintSpace): MeasureResult`

仅执行测量阶段。

##### `arrange(node: LayoutNode, constraintSpace: ConstraintSpace, measureResult: MeasureResult): ArrangeResult`

仅执行排列阶段。

---

### createGridNode

创建 Grid 布局节点。

```typescript
import { createGridNode } from 'ts-chrome-layout';

const gridNode = createGridNode({
  id: 'grid-1',
  style: {
    gridTemplateColumns: [
      { type: 'fixed', value: 100 },
      { type: 'fr', value: 1 },
    ],
    gridTemplateRows: [
      { type: 'fixed', value: 50 },
      { type: 'fr', value: 1 },
    ],
  },
  children: [],
});
```

---

### createConstraintSpace

创建约束空间。

```typescript
import { createConstraintSpace } from 'ts-chrome-layout';

const constraintSpace = createConstraintSpace({
  availableWidth: 800,
  availableHeight: 600,
});
```

---

## 类型定义

### LayoutNode

布局节点基础接口。

```typescript
interface LayoutNode {
  id: string;
  layoutType: 'grid' | 'flex' | 'block' | 'inline';
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutNode[];
  style?: GridStyle;
  // ...
}
```

### GridStyle

Grid 样式配置。

```typescript
interface GridStyle {
  gridTemplateColumns: GridTrackList;
  gridTemplateRows: GridTrackList;
  columnGap?: number;
  rowGap?: number;
  // ...
}
```

### ConstraintSpace

约束空间。

```typescript
interface ConstraintSpace {
  availableWidth: number | 'auto';
  availableHeight: number | 'auto';
  writingMode: WritingMode;
  direction: TextDirection;
  // ...
}
```

---

## 算法接口

### GridLayoutAlgorithm

Grid 布局算法实现。

```typescript
class GridLayoutAlgorithm implements LayoutCore {
  measure(node: LayoutNode, constraintSpace: ConstraintSpace): MeasureResult;
  arrange(node: LayoutNode, constraintSpace: ConstraintSpace, measureResult: MeasureResult): ArrangeResult;
  layout(node: LayoutNode, constraintSpace: ConstraintSpace): LayoutResult;
}
```

---

## 数据结构

### GridSizingTree

Grid 尺寸计算树。

### GridLayoutTree

Grid 布局树（不可变）。

### GridTrackCollection

Grid 轨道集合。

---

更多详细信息请参考源代码和类型定义。

