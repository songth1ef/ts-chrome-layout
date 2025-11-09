# Chromium 代码映射

本文档说明 TypeScript 实现与 Chromium C++ 实现的对应关系。

## 核心算法

| TypeScript | Chromium | 说明 |
|-----------|----------|------|
| `GridLayoutAlgorithm` | `grid_layout_algorithm.h/cc` | Grid 布局算法主类 |
| `GridMeasureAlgorithm` | `GridLayoutAlgorithm::ComputeGridGeometry()` | 测量阶段 |
| `GridArrangeAlgorithm` | `GridLayoutAlgorithm::PlaceGridItems()` | 排列阶段 |
| `GridPlacementAlgorithm` | `grid_placement.h/cc` | 自动放置算法 |
| `GridTrackSizingAlgorithm` | `grid_track_sizing_algorithm.h/cc` | 轨道尺寸算法 |
| `GridLineResolver` | `grid_line_resolver.h/cc` | 网格线解析 |

## 数据结构

| TypeScript | Chromium | 说明 |
|-----------|----------|------|
| `GridSizingTree` | `grid_sizing_tree.h` | 尺寸计算树 |
| `GridLayoutTree` | `grid_data.h::GridLayoutTree` | 布局树（不可变） |
| `GridTrackCollection` | `grid_track_collection.h` | 轨道集合 |
| `GridItemData` | `grid_item.h::GridItemData` | 网格项数据 |
| `GridLayoutData` | `grid_data.h::GridLayoutData` | 布局数据 |
| `GridPlacementData` | `grid_data.h::GridPlacementData` | 放置数据 |

## 算法步骤对应

### Measure 阶段

| 步骤 | TypeScript | Chromium |
|------|-----------|----------|
| 1. 检查继承的布局树 | `measureSubgrid()` | `constraint_space.GetGridLayoutSubtree()` |
| 2. 构建尺寸树 | `buildGridSizingTree()` | `BuildGridSizingTree()` |
| 3. 初始化轨道尺寸 | `initializeTrackSizes()` | `InitializeTrackSizes()` |
| 4. 计算基线对齐 | `computeGridItemBaselines()` | `ComputeGridItemBaselines()` |
| 5. 完成轨道尺寸算法 | `completeTrackSizingAlgorithm()` | `CompleteTrackSizingAlgorithm()` |
| 6. 计算内在块尺寸 | `calculateIntrinsicBlockSize()` | `CalculateIntrinsicBlockSize()` |
| 7. 最终化布局树 | `finalizeTree()` | `FinalizeTree()` |

### Track Sizing 算法（步骤 2-5）

| 步骤 | TypeScript | Chromium |
|------|-----------|----------|
| 步骤 2: 解析内在尺寸 | `resolveIntrinsicTrackSizes()` | `ResolveIntrinsicTrackSizes()` |
| 步骤 3: 最大化轨道 | `maximizeTracks()` | `MaximizeTracks()` |
| 步骤 4: 扩展弹性轨道 | `expandFlexibleTracks()` | `ExpandFlexibleTracks()` |
| 步骤 5: 拉伸 auto 轨道 | `stretchAutoTracks()` | `StretchAutoTracks()` |

### Placement 算法

| 步骤 | TypeScript | Chromium |
|------|-----------|----------|
| 1. 放置非自动项 | `placeNonAutoGridItems()` | `PlaceNonAutoGridItems()` |
| 2. 处理锁定到主轴的项 | `placeGridItemsLockedToMajorAxis()` | `PlaceGridItemsLockedToMajorAxis()` |
| 3. 自动放置剩余项 | `placeAutoBothAxisGridItem()` | `PlaceAutoBothAxisGridItem()` |

## 目录结构对应

### Chromium 结构
```
third_party/blink/renderer/core/layout/grid/
├── grid_layout_algorithm.h/cc
├── grid_placement.h/cc
├── grid_track_sizing_algorithm.h/cc
├── grid_line_resolver.h/cc
├── grid_data.h
├── grid_item.h
├── grid_sizing_tree.h
├── grid_track_collection.h
└── ...
```

### TypeScript 结构
```
src/layouts/grid/
├── grid-layout-algorithm.ts
├── grid-measure.ts
├── grid-arrange.ts
├── grid-placement.ts
├── grid-track-sizing.ts
└── grid-line-resolver.ts

src/types/layouts/grid/
├── grid-style.ts
├── grid-data.ts
└── grid-tree.ts

src/data-structures/layouts/grid/
├── grid-sizing-tree.ts
├── grid-track-collection.ts
└── grid-items.ts
```

## 关键方法对应

### GridLayoutAlgorithm

| TypeScript | Chromium |
|-----------|----------|
| `measure()` | `ComputeGridGeometry()` |
| `arrange()` | `PlaceGridItems()` |
| `layout()` | `Layout()` |
| `computeMinMaxSizes()` | `ComputeMinMaxSizes()` |

### GridTrackSizingAlgorithm

| TypeScript | Chromium |
|-----------|----------|
| `computeUsedTrackSizes()` | `ComputeUsedTrackSizes()` |
| `resolveIntrinsicTrackSizes()` | `ResolveIntrinsicTrackSizes()` |
| `maximizeTracks()` | `MaximizeTracks()` |
| `expandFlexibleTracks()` | `ExpandFlexibleTracks()` |
| `stretchAutoTracks()` | `StretchAutoTracks()` |

## 实现原则

1. **保持算法一致性**：确保计算逻辑与 Chromium 完全一致
2. **保持结构对应**：文件和方法命名尽量对应 Chromium
3. **添加注释说明**：每个主要方法都标注对应的 Chromium 方法
4. **类型安全**：利用 TypeScript 类型系统，但保持逻辑一致

## 参考文档

- [Chromium Grid 布局 README](../README.md)
- [Grid 布局算法详解](../Grid布局算法详解-中文教程.md)
- [Chromium 源代码](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/layout/grid/)

