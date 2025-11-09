# 架构设计文档

## 设计目标

构建一个通用的布局引擎，支持多种布局模式（Grid、Flex、Block、Inline 等），同时保持与 Chromium 布局计算的一致性。

## 整体架构

```
┌─────────────────────────────────────────────────────────┐
│              Chrome Layout Engine                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Layout Engine (通用引擎)                  │  │
│  │  - 算法注册机制                                    │  │
│  │  - 布局调度                                        │  │
│  │  - 结果聚合                                        │  │
│  │  - 性能监控                                        │  │
│  │  - 缓存机制                                        │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                 │
│        ┌───────────────┼───────────────┐               │
│        │               │               │                │
│        ▼               ▼               ▼                │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐            │
│  │  Grid   │    │  Flex   │    │  Block  │            │
│  │ Layout  │    │ Layout  │    │ Layout  │            │
│  └─────────┘    └─────────┘    └─────────┘            │
└─────────────────────────────────────────────────────────┘
```

## 目录结构

```
src/
├── core/                          # 核心引擎（通用，所有布局共享）
│   ├── layout-engine.ts           # 布局引擎主类
│   ├── layout-algorithm.ts        # 布局算法接口
│   ├── algorithm-registry.ts      # 算法注册表
│   ├── layout-context.ts          # 布局上下文
│   ├── validator.ts               # 输入验证
│   ├── logger.ts                  # 日志系统
│   └── config.ts                  # 全局配置
│
├── types/                         # 类型定义
│   ├── common/                    # 通用类型（所有布局共享）
│   │   ├── layout-node.ts        # 布局节点基础接口
│   │   ├── constraint-space.ts   # 约束空间
│   │   ├── style.ts              # 样式基础接口
│   │   ├── enums.ts              # 通用枚举
│   │   └── errors.ts             # 错误类型
│   │
│   └── layouts/                   # 布局特定类型
│       └── grid/                  # Grid 布局类型
│           ├── grid-style.ts      # Grid 样式
│           ├── grid-data.ts       # Grid 数据结构
│           └── grid-tree.ts       # Grid Tree
│
├── layouts/                       # 布局算法实现
│   └── grid/                      # Grid 布局算法
│       ├── grid-layout-algorithm.ts    # 主算法类
│       ├── grid-measure.ts             # 测量算法
│       ├── grid-arrange.ts              # 排列算法
│       ├── grid-placement.ts            # 放置算法
│       ├── grid-track-sizing.ts         # 轨道尺寸算法
│       └── grid-line-resolver.ts         # 网格线解析
│
├── data-structures/               # 数据结构实现
│   └── layouts/                   # 布局特定数据结构
│       └── grid/
│           ├── grid-sizing-tree.ts      # Grid Sizing Tree
│           ├── grid-track-collection.ts # 轨道集合
│           └── grid-items.ts            # 网格项集合
│
├── utils/                         # 工具函数
│   ├── common/                    # 通用工具
│   │   ├── constraint-space-factory.ts
│   │   ├── default-engine.ts
│   │   ├── assert.ts
│   │   ├── cache.ts
│   │   ├── math.ts
│   │   └── performance.ts
│   │
│   └── layouts/                   # 布局特定工具
│       └── grid/
│           ├── grid-node-factory.ts
│           └── grid-utils.ts
│
└── index.ts                       # 入口文件
```

## 核心设计原则

### 1. 类型系统分层

**基础类型层**（所有布局共享）：
- `LayoutNode` - 通用布局节点
- `ConstraintSpace` - 约束空间
- `LayoutStyle` - 样式基础接口
- `LayoutResult` - 布局结果

**特定布局类型层**（布局特定）：
- `GridStyle extends LayoutStyle` - Grid 样式
- `FlexStyle extends LayoutStyle` - Flex 样式（未来）
- `BlockStyle extends LayoutStyle` - Block 样式（未来）

### 2. 算法接口统一

所有布局算法实现统一的接口：

```typescript
interface LayoutAlgorithm {
  readonly layoutType: LayoutType;
  measure(node: LayoutNode, constraintSpace: ConstraintSpace): MeasureResult;
  arrange(node: LayoutNode, constraintSpace: ConstraintSpace, measureResult: MeasureResult): ArrangeResult;
  layout(node: LayoutNode, constraintSpace: ConstraintSpace): LayoutResult;
}
```

### 3. 算法注册机制

```typescript
const engine = new LayoutEngine();
engine.register(new GridLayoutAlgorithm());
engine.register(new FlexLayoutAlgorithm()); // 未来
```

### 4. 与 Chromium 对应

每个文件和方法都标注了对应的 Chromium 实现，确保：
- 算法逻辑一致
- 数据结构对应
- 方法命名对应

详见 [CHROMIUM_MAPPING.md](./CHROMIUM_MAPPING.md)

## 核心流程

### Measure 阶段

1. 构建 Grid Sizing Tree
2. 解析网格线
3. 放置网格项
4. 初始化轨道尺寸
5. 计算基线对齐
6. 完成轨道尺寸算法（步骤 2-5）
7. 计算内在块尺寸
8. 最终化布局树

### Arrange 阶段

1. 计算网格项位置
2. 应用对齐
3. 布局子项
4. 计算最终尺寸

## 数据流

```
LayoutNode + ConstraintSpace
    │
    ├─► [缓存检查] ──► 命中 ──► 返回缓存结果
    │
    ├─► [输入验证]
    │
    ├─► [性能监控开始]
    │
    ├─► Measure Phase
    │     ├─► Build Grid Sizing Tree
    │     ├─► Resolve Grid Lines
    │     ├─► Place Grid Items
    │     └─► Compute Track Sizes
    │
    ├─► Arrange Phase
    │     ├─► Calculate Item Positions
    │     ├─► Apply Alignment
    │     └─► Finalize Layout
    │
    ├─► [结果验证]
    │
    ├─► [性能监控结束]
    │
    ├─► [缓存结果]
    │
    └─► LayoutResult (x, y, width, height)
```

## 架构特性

### 1. 可扩展性

- **算法注册**：动态注册新布局算法
- **类型扩展**：通过继承扩展类型系统
- **插件机制**：未来可支持插件系统

### 2. 性能优化

- **结果缓存**：LRU 缓存布局结果
- **性能监控**：内置性能测量
- **延迟计算**：按需计算

### 3. 错误处理

- **类型化错误**：`LayoutError` 和错误代码
- **错误恢复**：可配置的错误处理策略
- **输入验证**：自动验证输入有效性

### 4. 可观测性

- **日志系统**：可配置的日志级别
- **性能指标**：详细的性能数据
- **调试选项**：开发时调试支持

### 5. 工程化

- **类型安全**：完整的 TypeScript 类型
- **代码质量**：ESLint + Prettier
- **测试支持**：Jest 配置
- **CI/CD**：GitHub Actions

## 扩展指南

### 添加新布局模式（以 Flex 为例）

1. **创建类型**：
   ```
   src/types/layouts/flex/
   ├── flex-style.ts
   └── flex-data.ts
   ```

2. **实现算法**：
   ```
   src/layouts/flex/
   └── flex-layout-algorithm.ts
   ```

3. **实现数据结构**：
   ```
   src/data-structures/layouts/flex/
   └── flex-container.ts
   ```

4. **注册算法**：
   ```typescript
   const engine = new LayoutEngine();
   engine.register(new FlexLayoutAlgorithm());
   ```

## 优势

1. **可扩展性**：轻松添加新的布局模式
2. **模块化**：每种布局独立，互不干扰
3. **类型安全**：TypeScript 类型系统确保正确性
4. **可维护性**：清晰的目录结构，易于理解
5. **算法一致性**：保持与 Chromium 实现相同的计算逻辑
6. **性能优化**：内置缓存和性能监控
7. **工程化完善**：完整的开发工具链

## 相关文档

- [Chromium 代码映射](./CHROMIUM_MAPPING.md) - TypeScript 与 Chromium 的对应关系
- [项目状态](./STATUS.md) - 当前实现状态
- [API 文档](./API.md) - API 使用说明
- [使用示例](./EXAMPLES.md) - 代码示例
- [工程化文档](./ENGINEERING.md) - 开发工具和流程
