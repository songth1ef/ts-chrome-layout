# Chromium 布局引擎 TypeScript 重构计划

> 完整的 Chrome 布局计算系统重构，支持 Grid、Flex、Block、Inline 等多种布局模式

## 目录

1. [项目概述](#项目概述)
2. [架构设计](#架构设计)
3. [核心数据结构](#核心数据结构)
4. [算法流程设计](#算法流程设计)
5. [模块划分](#模块划分)
6. [接口设计](#接口设计)
7. [实现优先级](#实现优先级)
8. [测试策略](#测试策略)

---

## 项目概述

### 目标

将 Chromium 的完整布局计算系统从 C++ 重构为 TypeScript，支持多种布局模式（Grid、Flex、Block、Inline 等），保持算法逻辑一致性，同时提供更易用的 API 和更好的类型安全。

### 布局模式支持

- ✅ **Grid Layout** - CSS Grid 布局（当前实现中）
- ⏳ **Flexbox Layout** - CSS Flexbox 布局（计划中）
- ⏳ **Block Layout** - 块级布局（计划中）
- ⏳ **Inline Layout** - 行内布局（计划中）
- ⏳ **Table Layout** - 表格布局（计划中）

### 核心原则

1. **算法一致性**：保持与 Chromium 实现相同的计算逻辑
2. **类型安全**：充分利用 TypeScript 的类型系统
3. **模块化**：清晰的模块划分，便于维护和测试
4. **可扩展性**：支持多种布局模式，易于添加新的布局算法
5. **性能考虑**：合理的数据结构选择，避免不必要的计算
6. **统一接口**：所有布局模式实现统一的算法接口

---

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Layout Engine                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Flex       │  │    Grid      │  │    Block     │ │
│  │  Layout      │  │   Layout     │  │   Layout     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Grid Layout Algorithm                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Placement   │  │    Sizing    │  │   Layout    │  │
│  │   Algorithm  │  │  Algorithm   │  │  Algorithm   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 核心流程

```
Input: LayoutNode (layoutType='grid')
  │
  ├─► Measure Phase (测量阶段)
  │     ├─► Build Grid Tree
  │     ├─► Resolve Grid Lines
  │     ├─► Place Grid Items
  │     └─► Compute Track Sizes
  │
  ├─► Arrange Phase (排列阶段)
  │     ├─► Calculate Item Positions
  │     ├─► Apply Alignment
  │     └─► Finalize Layout
  │
  └─► Output: LayoutNode (with x, y, width, height)
```

---

## 核心数据结构

### 1. 基础布局节点

```typescript
// types/layout-node.ts

/**
 * 布局节点基础接口
 */
interface LayoutNode {
  // 节点标识
  id: string;
  layoutType: 'grid' | 'flex' | 'block' | 'inline';
  
  // 位置和尺寸
  x: number;
  y: number;
  width: number;
  height: number;
  
  // 内容尺寸（不含 padding/border）
  contentWidth: number;
  contentHeight: number;
  
  // 边距和填充
  margin: BoxStrut;
  padding: BoxStrut;
  border: BoxStrut;
  
  // 子节点
  children: LayoutNode[];
  
  // 约束空间
  constraintSpace?: ConstraintSpace;
  
  // 样式属性（Grid 特定）
  style?: GridStyle;
  
  // 布局结果缓存
  layoutResult?: LayoutResult;
}

/**
 * 盒子边距结构
 */
interface BoxStrut {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * 约束空间
 */
interface ConstraintSpace {
  // 可用尺寸
  availableWidth: number | 'auto';
  availableHeight: number | 'auto';
  
  // 最小/最大尺寸
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  
  // 书写方向
  writingMode: WritingMode;
  direction: TextDirection;
  
  // Grid 特定：继承的布局树
  gridLayoutTree?: GridLayoutTree;
}
```

### 2. Grid 特定数据结构

```typescript
// types/grid-data.ts

/**
 * Grid 样式配置
 */
interface GridStyle {
  // 轨道定义
  gridTemplateColumns: GridTrackList;
  gridTemplateRows: GridTrackList;
  
  // 自动重复
  gridAutoColumns: GridTrackSize;
  gridAutoRows: GridTrackSize;
  gridAutoFlow: GridAutoFlow;
  
  // 间距
  columnGap: number;
  rowGap: number;
  
  // 对齐方式
  justifyContent: ContentAlignment;
  alignContent: ContentAlignment;
  justifyItems: ItemAlignment;
  alignItems: ItemAlignment;
  
  // 命名区域
  gridTemplateAreas?: string[][];
  namedGridLines?: NamedGridLines;
}

/**
 * 轨道列表（列或行）
 */
type GridTrackList = GridTrackSize[];

/**
 * 轨道尺寸
 */
type GridTrackSize = 
  | { type: 'fixed'; value: number }           // 100px
  | { type: 'fr'; value: number }              // 1fr, 2fr
  | { type: 'auto' }                           // auto
  | { type: 'min-content' }                    // min-content
  | { type: 'max-content' }                   // max-content
  | { type: 'minmax'; min: GridTrackSize; max: GridTrackSize }  // minmax(100px, 1fr)
  | { type: 'repeat'; count: number | 'auto-fill' | 'auto-fit'; tracks: GridTrackSize[] };

/**
 * 网格项数据
 */
interface GridItemData {
  // 节点引用
  node: LayoutNode;
  
  // 解析后的位置
  resolvedPosition: GridArea;
  
  // 跨度信息
  columnSpan: GridSpan;
  rowSpan: GridSpan;
  
  // 是否子网格
  isSubgrid: boolean;
  hasSubgriddedColumns: boolean;
  hasSubgriddedRows: boolean;
  
  // 对齐方式
  columnAlignment: ItemAlignment;
  rowAlignment: ItemAlignment;
  
  // 轨道跨度属性（优化用）
  columnSpanProperties: TrackSpanProperties;
  rowSpanProperties: TrackSpanProperties;
  
  // 集合索引（快速查找用）
  columnSetIndices: Range;
  rowSetIndices: Range;
}

/**
 * 网格区域
 */
interface GridArea {
  columnStart: number;
  columnEnd: number;
  rowStart: number;
  rowEnd: number;
}

/**
 * 网格跨度
 */
interface GridSpan {
  start: number;
  end: number;
  size: number;
}

/**
 * 放置数据
 */
interface GridPlacementData {
  // 网格线解析器
  lineResolver: GridLineResolver;
  
  // 网格项位置
  gridItemPositions: GridArea[];
  
  // 偏移量
  columnStartOffset: number;
  rowStartOffset: number;
}

/**
 * 布局数据
 */
interface GridLayoutData {
  // 列和行轨道集合
  columns: GridTrackCollection;
  rows: GridTrackCollection;
}

/**
 * 轨道集合
 */
interface GridTrackCollection {
  direction: GridTrackDirection;
  ranges: GridRange[];
  sets: GridSet[];
  
  // 查询方法
  getSetOffset(setIndex: number): number;
  getSetSize(setIndex: number): number;
  getRangeIndexFromLine(line: number): number;
}

/**
 * 轨道范围
 */
interface GridRange {
  startLine: number;
  trackCount: number;
  beginSetIndex: number;
  setCount: number;
  properties: TrackSpanProperties;
}

/**
 * 轨道集合（Set）
 */
interface GridSet {
  baseSize: number;        // 基础尺寸
  growthLimit: number;      // 增长限制（可能是无限）
  trackCount: number;       // 包含的轨道数
  sizingFunction: GridTrackSize;
}

/**
 * 轨道跨度属性（位掩码）
 */
interface TrackSpanProperties {
  hasAutoMinimumTrack: boolean;
  hasFixedMaximumTrack: boolean;
  hasFixedMinimumTrack: boolean;
  hasFlexibleTrack: boolean;
  hasIntrinsicTrack: boolean;
  isCollapsed: boolean;
  isImplicit: boolean;
}
```

### 3. Grid Tree 结构

```typescript
// types/grid-tree.ts

/**
 * Grid Sizing Tree（尺寸计算树）
 */
interface GridSizingTree {
  nodes: GridSizingTreeNode[];
  
  // 查找方法
  getNode(index: number): GridSizingTreeNode;
  getSubtree(rootIndex: number): GridSizingSubtree;
  lookupSubgridIndex(node: LayoutNode): number | null;
}

/**
 * Grid Sizing Tree 节点
 */
interface GridSizingTreeNode {
  // 网格项
  gridItems: GridItemData[];
  
  // 布局数据（可变）
  layoutData: GridLayoutData;
  
  // 子树大小
  subtreeSize: number;
  
  // 书写模式
  writingMode: WritingMode;
}

/**
 * Grid Layout Tree（布局树，不可变）
 */
interface GridLayoutTree {
  nodes: GridLayoutTreeNode[];
  
  // 查找方法
  getNode(index: number): GridLayoutTreeNode;
  getSubtree(rootIndex: number): GridLayoutSubtree;
  areSubtreesEqual(index1: number, tree2: GridLayoutTree, index2: number): boolean;
}

/**
 * Grid Layout Tree 节点
 */
interface GridLayoutTreeNode {
  // 布局数据（不可变）
  layoutData: GridLayoutData;
  
  // 子树大小
  subtreeSize: number;
  
  // 是否有未解析的几何
  hasUnresolvedGeometry: boolean;
}
```

---

## 算法流程设计

### 1. 主布局算法接口

```typescript
// core/layout-core.ts

/**
 * 布局核心接口
 */
interface LayoutCore {
  /**
   * 测量阶段：计算内容尺寸
   */
  measure(node: LayoutNode, constraintSpace: ConstraintSpace): MeasureResult;
  
  /**
   * 排列阶段：计算最终位置
   */
  arrange(node: LayoutNode, constraintSpace: ConstraintSpace): ArrangeResult;
  
  /**
   * 完整布局流程（measure + arrange）
   */
  layout(node: LayoutNode, constraintSpace: ConstraintSpace): LayoutResult;
}

/**
 * Grid 布局算法实现
 */
class GridLayoutAlgorithm implements LayoutCore {
  measure(node: LayoutNode, constraintSpace: ConstraintSpace): MeasureResult {
    // 1. 构建 Grid Sizing Tree
    // 2. 解析网格线
    // 3. 放置网格项
    // 4. 计算轨道尺寸
    // 5. 返回测量结果
  }
  
  arrange(node: LayoutNode, constraintSpace: ConstraintSpace): ArrangeResult {
    // 1. 计算网格项位置
    // 2. 应用对齐
    // 3. 布局子项
    // 4. 返回排列结果
  }
  
  layout(node: LayoutNode, constraintSpace: ConstraintSpace): LayoutResult {
    const measureResult = this.measure(node, constraintSpace);
    const arrangeResult = this.arrange(node, constraintSpace);
    return { ...measureResult, ...arrangeResult };
  }
}
```

### 2. Measure 阶段详细流程

```typescript
// algorithms/grid-measure.ts

class GridMeasureAlgorithm {
  /**
   * 测量阶段主流程
   */
  measure(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): MeasureResult {
    // 步骤 1: 检查是否有继承的 GridLayoutTree（子网格情况）
    if (constraintSpace.gridLayoutTree) {
      return this.measureSubgrid(node, constraintSpace);
    }
    
    // 步骤 2: 构建 Grid Sizing Tree
    const sizingTree = this.buildGridSizingTree(node, constraintSpace);
    
    // 步骤 3: 初始化轨道尺寸
    this.initializeTrackSizes(sizingTree);
    
    // 步骤 4: 计算基线对齐
    this.computeGridItemBaselines(sizingTree);
    
    // 步骤 5: 完成轨道尺寸算法
    let needsAdditionalPass = false;
    this.completeTrackSizingAlgorithm(
      sizingTree,
      GridTrackDirection.Column,
      SizingConstraint.Layout,
      needsAdditionalPass
    );
    this.completeTrackSizingAlgorithm(
      sizingTree,
      GridTrackDirection.Row,
      SizingConstraint.Layout,
      needsAdditionalPass
    );
    
    // 步骤 6: 如果需要，执行第二遍计算
    if (needsAdditionalPass) {
      this.completeTrackSizingAlgorithm(
        sizingTree,
        GridTrackDirection.Column,
        SizingConstraint.Layout,
        needsAdditionalPass
      );
      this.completeTrackSizingAlgorithm(
        sizingTree,
        GridTrackDirection.Row,
        SizingConstraint.Layout,
        needsAdditionalPass
      );
    }
    
    // 步骤 7: 计算内在块尺寸
    const intrinsicBlockSize = this.calculateIntrinsicBlockSize(
      sizingTree.getNode(0).gridItems,
      sizingTree.getNode(0).layoutData
    );
    
    // 步骤 8: 最终化布局树
    const layoutTree = sizingTree.finalizeTree();
    
    return {
      width: this.calculateTotalColumnSize(sizingTree),
      height: intrinsicBlockSize,
      minWidth: this.computeMinMaxSizes(sizingTree, SizingConstraint.MinContent).min,
      maxWidth: this.computeMinMaxSizes(sizingTree, SizingConstraint.MaxContent).max,
      gridLayoutTree: layoutTree,
    };
  }
  
  /**
   * 构建 Grid Sizing Tree
   */
  private buildGridSizingTree(
    node: LayoutNode,
    constraintSpace: ConstraintSpace
  ): GridSizingTree {
    const sizingTree = new GridSizingTree();
    
    // 递归构建树
    this.buildGridSizingSubtree(
      sizingTree,
      node,
      constraintSpace,
      null, // opt_subgrid_data
      null, // opt_parent_line_resolver
      false, // must_invalidate_placement_cache
      false  // must_ignore_children
    );
    
    return sizingTree;
  }
  
  /**
   * 构建子树
   */
  private buildGridSizingSubtree(
    sizingTree: GridSizingTree,
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    subgridData: SubgriddedItemData | null,
    parentLineResolver: GridLineResolver | null,
    mustInvalidatePlacementCache: boolean,
    mustIgnoreChildren: boolean
  ): void {
    // 1. 解析网格线
    const lineResolver = this.createGridLineResolver(
      node,
      subgridData,
      parentLineResolver
    );
    
    // 2. 运行放置算法
    const placement = new GridPlacementAlgorithm(node.style, lineResolver);
    const placementData = placement.runAutoPlacementAlgorithm(
      this.constructGridItems(node, lineResolver)
    );
    
    // 3. 构建 GridItems
    const gridItems = this.constructGridItemsFromPlacement(
      node,
      placementData,
      constraintSpace
    );
    
    // 4. 初始化布局数据
    const layoutData = this.initializeLayoutData(
      node,
      placementData,
      constraintSpace
    );
    
    // 5. 添加到树
    const nodeIndex = sizingTree.addNode({
      gridItems,
      layoutData,
      subtreeSize: 1,
      writingMode: constraintSpace.writingMode,
    });
    
    // 6. 递归处理子网格
    for (const child of node.children) {
      if (this.isSubgrid(child)) {
        const subgridItemData = this.findSubgridItemData(
          gridItems,
          child
        );
        this.buildGridSizingSubtree(
          sizingTree,
          child,
          constraintSpace,
          subgridItemData,
          lineResolver,
          false,
          false
        );
      }
    }
    
    // 7. 更新子树大小
    this.updateSubtreeSize(sizingTree, nodeIndex);
  }
  
  /**
   * 完成轨道尺寸算法（步骤 2-5）
   */
  private completeTrackSizingAlgorithm(
    sizingTree: GridSizingTree,
    direction: GridTrackDirection,
    constraint: SizingConstraint,
    needsAdditionalPass: boolean
  ): void {
    const subtree = sizingTree.getSubtree(0);
    const trackCollection = subtree.layoutData.getCollection(direction);
    
    // 创建尺寸算法实例
    const sizingAlgorithm = new GridTrackSizingAlgorithm(
      subtree.node.style,
      constraintSpace,
      constraint
    );
    
    // 贡献大小函数
    const contributionSize = (
      contributionType: GridItemContributionType,
      item: GridItemData
    ): number => {
      return this.contributionSizeForGridItem(
        subtree,
        contributionType,
        direction,
        constraint,
        item
      );
    };
    
    // 执行尺寸计算
    sizingAlgorithm.computeUsedTrackSizes(
      contributionSize,
      trackCollection,
      subtree.gridItems,
      false // needs_intrinsic_track_size
    );
    
    // 检查是否需要第二遍
    if (this.checkNeedsAdditionalPass(trackCollection)) {
      needsAdditionalPass = true;
    }
  }
}
```

### 3. Arrange 阶段详细流程

```typescript
// algorithms/grid-arrange.ts

class GridArrangeAlgorithm {
  /**
   * 排列阶段主流程
   */
  arrange(
    node: LayoutNode,
    constraintSpace: ConstraintSpace,
    measureResult: MeasureResult
  ): ArrangeResult {
    const layoutTree = measureResult.gridLayoutTree!;
    const layoutData = layoutTree.getNode(0).layoutData;
    
    // 步骤 1: 计算网格项位置
    const itemPlacements = this.placeGridItems(
      node,
      layoutData,
      measureResult
    );
    
    // 步骤 2: 应用对齐
    this.applyAlignment(node, layoutData, itemPlacements);
    
    // 步骤 3: 布局子项
    const childLayouts = this.layoutChildren(
      node,
      itemPlacements,
      constraintSpace,
      layoutTree
    );
    
    // 步骤 4: 计算最终尺寸
    const finalSize = this.calculateFinalSize(
      layoutData,
      constraintSpace
    );
    
    return {
      x: 0, // 相对于父容器
      y: 0,
      width: finalSize.width,
      height: finalSize.height,
      children: childLayouts,
    };
  }
  
  /**
   * 放置网格项
   */
  private placeGridItems(
    node: LayoutNode,
    layoutData: GridLayoutData,
    measureResult: MeasureResult
  ): GridItemPlacement[] {
    const placements: GridItemPlacement[] = [];
    const gridItems = this.getGridItems(node);
    
    for (const item of gridItems) {
      // 计算网格区域
      const gridArea = this.calculateGridArea(
        item,
        layoutData
      );
      
      // 计算可用空间
      const availableSize = {
        width: gridArea.width,
        height: gridArea.height,
      };
      
      // 创建子约束空间
      const childConstraintSpace = this.createChildConstraintSpace(
        item.node,
        availableSize,
        layoutData
      );
      
      placements.push({
        item,
        gridArea,
        constraintSpace: childConstraintSpace,
      });
    }
    
    return placements;
  }
  
  /**
   * 布局子项
   */
  private layoutChildren(
    node: LayoutNode,
    placements: GridItemPlacement[],
    constraintSpace: ConstraintSpace,
    layoutTree: GridLayoutTree
  ): ChildLayout[] {
    const childLayouts: ChildLayout[] = [];
    let nextSubgridSubtree = layoutTree.getSubtree(1); // 第一个子网格
    
    for (const placement of placements) {
      const item = placement.item;
      
      // 如果是子网格，传递布局树
      if (item.isSubgrid) {
        const childConstraintSpace = {
          ...placement.constraintSpace,
          gridLayoutTree: nextSubgridSubtree,
        };
        
        const childResult = this.layoutCore.layout(
          item.node,
          childConstraintSpace
        );
        
        childLayouts.push({
          node: item.node,
          x: placement.gridArea.x,
          y: placement.gridArea.y,
          width: childResult.width,
          height: childResult.height,
        });
        
        nextSubgridSubtree = nextSubgridSubtree.nextSibling();
      } else {
        // 普通子项布局
        const childResult = this.layoutCore.measure(
          item.node,
          placement.constraintSpace
        );
        
        // 应用对齐
        const alignedPosition = this.applyItemAlignment(
          item,
          placement.gridArea,
          childResult
        );
        
        childLayouts.push({
          node: item.node,
          x: alignedPosition.x,
          y: alignedPosition.y,
          width: childResult.width,
          height: childResult.height,
        });
      }
    }
    
    return childLayouts;
  }
}
```

---

## 模块划分

### 目录结构

```
ts-chrome-layout/
├── src/
│   ├── types/                    # 类型定义
│   │   ├── layout-node.ts        # 基础布局节点
│   │   ├── grid-data.ts          # Grid 数据结构
│   │   ├── grid-tree.ts          # Grid Tree 结构
│   │   ├── constraint-space.ts    # 约束空间
│   │   └── enums.ts              # 枚举类型
│   │
│   ├── core/                     # 核心接口
│   │   ├── layout-core.ts        # 布局核心接口
│   │   └── layout-engine.ts     # 布局引擎
│   │
│   ├── algorithms/               # 算法实现
│   │   ├── grid-layout-algorithm.ts    # Grid 布局算法主类
│   │   ├── grid-measure.ts             # 测量算法
│   │   ├── grid-arrange.ts              # 排列算法
│   │   ├── grid-placement.ts            # 放置算法
│   │   ├── grid-track-sizing.ts         # 轨道尺寸算法
│   │   └── grid-line-resolver.ts        # 网格线解析
│   │
│   ├── data-structures/          # 数据结构实现
│   │   ├── grid-sizing-tree.ts   # Grid Sizing Tree
│   │   ├── grid-layout-tree.ts   # Grid Layout Tree
│   │   ├── grid-track-collection.ts    # 轨道集合
│   │   └── grid-items.ts         # 网格项集合
│   │
│   ├── utils/                    # 工具函数
│   │   ├── grid-utils.ts         # Grid 工具函数
│   │   ├── layout-utils.ts      # 布局工具函数
│   │   └── math-utils.ts        # 数学工具函数
│   │
│   └── index.ts                  # 入口文件
│
├── tests/                        # 测试文件
│   ├── unit/                     # 单元测试
│   ├── integration/              # 集成测试
│   └── fixtures/                 # 测试数据
│
├── docs/                         # 文档
│   ├── API.md                    # API 文档
│   ├── ARCHITECTURE.md           # 架构文档
│   └── EXAMPLES.md               # 使用示例
│
├── package.json
├── tsconfig.json
└── IMPLEMENTATION_PLAN.md        # 本文件
```

---

## 接口设计

### 1. 公共 API

```typescript
// src/index.ts

/**
 * 布局引擎
 */
export class LayoutEngine {
  /**
   * 执行布局
   */
  layout(node: LayoutNode, constraintSpace: ConstraintSpace): LayoutResult;
  
  /**
   * 仅测量
   */
  measure(node: LayoutNode, constraintSpace: ConstraintSpace): MeasureResult;
  
  /**
   * 仅排列
   */
  arrange(node: LayoutNode, constraintSpace: ConstraintSpace, measureResult: MeasureResult): ArrangeResult;
}

/**
 * 创建 Grid 布局节点
 */
export function createGridNode(config: GridNodeConfig): LayoutNode;

/**
 * 创建约束空间
 */
export function createConstraintSpace(config: ConstraintSpaceConfig): ConstraintSpace;
```

### 2. 内部接口

```typescript
// algorithms/grid-placement.ts

/**
 * 放置算法接口
 */
interface GridPlacementAlgorithm {
  /**
   * 运行自动放置算法
   */
  runAutoPlacementAlgorithm(gridItems: GridItemData[]): GridPlacementData;
}

// algorithms/grid-track-sizing.ts

/**
 * 轨道尺寸算法接口
 */
interface GridTrackSizingAlgorithm {
  /**
   * 计算使用的轨道尺寸
   */
  computeUsedTrackSizes(
    contributionSize: ContributionSizeFunction,
    trackCollection: GridTrackCollection,
    gridItems: GridItemData[],
    needsIntrinsicTrackSize: boolean
  ): void;
}

// algorithms/grid-line-resolver.ts

/**
 * 网格线解析器接口
 */
interface GridLineResolver {
  /**
   * 从样式解析网格位置
   */
  resolveGridPositionsFromStyle(
    itemStyle: ComputedStyle,
    direction: GridTrackDirection
  ): GridSpan;
  
  /**
   * 显式网格轨道数
   */
  explicitGridTrackCount(direction: GridTrackDirection): number;
  
  /**
   * 自动重复次数
   */
  autoRepetitions(direction: GridTrackDirection): number;
}
```

---

## 实现优先级

### Phase 1: 基础框架（核心功能）

1. **类型系统**
   - [ ] 基础 LayoutNode 接口
   - [ ] Grid 特定数据结构
   - [ ] ConstraintSpace 接口
   - [ ] 枚举类型定义

2. **核心接口**
   - [ ] LayoutCore 接口
   - [ ] GridLayoutAlgorithm 骨架
   - [ ] LayoutEngine 基础实现

3. **数据结构**
   - [ ] GridTrackCollection 基础实现
   - [ ] GridItemData 结构
   - [ ] GridLayoutData 结构

**目标**：能够创建 Grid 节点，定义基本数据结构

---

### Phase 2: 网格线解析和放置（基础算法）

1. **网格线解析**
   - [ ] GridLineResolver 实现
   - [ ] 命名网格线解析
   - [ ] 自动重复计算
   - [ ] 网格位置解析

2. **放置算法**
   - [ ] GridPlacementAlgorithm 实现
   - [ ] 非自动项放置
   - [ ] 自动放置（稀疏模式）
   - [ ] 自动放置（密集模式）

**目标**：能够解析 CSS Grid 语法，确定网格项位置

---

### Phase 3: 轨道尺寸计算（核心算法）

1. **初始化**
   - [ ] 轨道集合初始化
   - [ ] 基础尺寸和增长限制设置
   - [ ] Grid Sizing Tree 构建

2. **尺寸算法步骤**
   - [ ] 步骤 2：解析内在尺寸轨道
   - [ ] 步骤 3：最大化轨道
   - [ ] 步骤 4：扩展弹性轨道
   - [ ] 步骤 5：拉伸 auto 轨道

3. **贡献大小计算**
   - [ ] ContributionSizeForGridItem 实现
   - [ ] 内在尺寸计算
   - [ ] 边距和基线处理

**目标**：能够计算轨道尺寸，处理各种尺寸函数

---

### Phase 4: 测量和排列（完整流程）

1. **测量阶段**
   - [ ] GridMeasureAlgorithm 完整实现
   - [ ] Grid Sizing Tree 构建
   - [ ] 多阶段计算支持
   - [ ] 内在块尺寸计算

2. **排列阶段**
   - [ ] GridArrangeAlgorithm 完整实现
   - [ ] 网格项位置计算
   - [ ] 对齐应用
   - [ ] 子项布局

3. **集成**
   - [ ] LayoutCore 完整实现
   - [ ] 错误处理
   - [ ] 边界情况处理

**目标**：完整的 Grid 布局流程，能够布局简单网格

---

### Phase 5: 高级特性

1. **子网格支持**
   - [ ] Grid Tree 完整实现
   - [ ] 子网格识别和处理
   - [ ] 约束传递
   - [ ] 布局树最终化

2. **对齐和基线**
   - [ ] 基线对齐计算
   - [ ] 各种对齐方式支持
   - [ ] 对齐偏移计算

3. **响应式和自动重复**
   - [ ] auto-fill/auto-fit 完整支持
   - [ ] 响应式轨道计算
   - [ ] 隐式轨道处理

**目标**：支持所有 Grid 特性，包括 Subgrid

---

### Phase 6: 优化和测试

1. **性能优化**
   - [ ] 缓存机制
   - [ ] 增量更新
   - [ ] 数据结构优化

2. **测试覆盖**
   - [ ] 单元测试
   - [ ] 集成测试
   - [ ] 与 Chromium 结果对比测试

3. **文档和示例**
   - [ ] API 文档
   - [ ] 使用示例
   - [ ] 性能指南

**目标**：生产就绪的 Grid 布局引擎

---

## 测试策略

### 1. 单元测试

- **网格线解析测试**
  - 命名网格线解析
  - 自动重复计算
  - 位置解析边界情况

- **放置算法测试**
  - 明确位置放置
  - 自动放置（稀疏/密集）
  - 子网格放置

- **尺寸算法测试**
  - 各种尺寸函数
  - 弹性轨道计算
  - 内在尺寸解析

### 2. 集成测试

- **完整布局流程**
  - 简单网格布局
  - 复杂网格布局
  - 嵌套网格布局

- **与 Chromium 对比**
  - 相同输入，对比输出
  - 边界情况一致性

### 3. 性能测试

- 大规模网格性能
- 嵌套深度性能
- 内存使用分析

---

## 关键技术决策

### 1. 数值精度

- 使用 `number` 类型（JavaScript 的 64 位浮点数）
- 考虑未来支持 `LayoutUnit` 类型（定点数）以提高精度

### 2. 不可变性

- `GridLayoutTree` 不可变（类似 Chromium）
- `GridSizingTree` 可变（计算过程中修改）
- 使用 TypeScript 的 `readonly` 修饰符

### 3. 错误处理

- 使用 TypeScript 的异常机制
- 提供详细的错误信息
- 支持优雅降级

### 4. 性能考虑

- 避免不必要的数组复制
- 使用索引而非对象引用（在可能的情况下）
- 延迟计算（lazy evaluation）

---

## 下一步行动

1. **创建项目结构**
   - 初始化 TypeScript 项目
   - 配置构建工具
   - 设置测试框架

2. **实现 Phase 1**
   - 定义所有类型
   - 创建基础接口
   - 实现基础数据结构

3. **编写第一个测试**
   - 最简单的 Grid 布局测试
   - 验证基础流程

4. **迭代开发**
   - 按照优先级逐步实现
   - 每个阶段都有可运行的代码
   - 持续测试和重构

---

## 参考资料

- [CSS Grid Layout 规范](https://drafts.csswg.org/css-grid-2/)
- [Chromium Grid 布局实现](../README.md)
- [Grid 布局算法详解](../Grid布局算法详解-中文教程.md)

---

**文档版本**：1.0  
**创建日期**：2025年  
**最后更新**：2025年

