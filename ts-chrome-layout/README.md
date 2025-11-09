# ts-chrome-layout

TypeScript 实现的 Chromium 布局计算系统 - 完整的布局引擎重构

## 简介

本项目是 Chromium 布局计算系统的 TypeScript 重构，提供完整的布局算法实现，支持 Grid、Flex、Block、Inline 等主要布局模式，保持与 Chromium 实现相同的计算逻辑和算法一致性。

## 核心特性

### ✅ 已实现（100%）

- **Grid Layout** - CSS Grid 布局算法 ✅
  - 网格线解析与命名网格线支持
  - 自动放置算法（稀疏/密集模式）
  - 轨道尺寸计算（固定、弹性、auto、minmax 等）
  - 测量（Measure）和排列（Arrange）完整流程
  - 子网格（Subgrid）支持
  - 基线对齐计算
  - 对齐应用（justify-content、align-content、justify-items、align-items）

- **Flexbox Layout** - CSS Flexbox 布局算法 ✅
  - flex-grow / flex-shrink 处理
  - flex-basis 支持（auto、content、数值）
  - justify-content 对齐（flex-start、flex-end、center、space-between、space-around、space-evenly）
  - align-items 对齐（start、end、center、stretch、baseline）
  - order 排序
  - flex 简写解析

- **Block Layout** - 块级布局算法 ✅
  - 垂直堆叠布局
  - 浮动（float: left / right）支持
  - 清除浮动（clear）处理
  - 边距和填充计算
  - 最小/最大宽度/高度支持

- **Inline Layout** - 行内布局算法 ✅
  - 文本分行（line breaking）
  - 行高计算
  - 文本对齐（text-align: left、right、center、justify）
  - 基线对齐（基础）
  - 空白处理（white-space）

- **Table Layout** - 表格布局算法 ✅
  - 表格结构构建
  - 列宽计算（auto / fixed 布局模式）
  - 行高计算
  - 单元格跨行/跨列支持（rowSpan / columnSpan）
  - 边框间距（border-spacing）支持

- **Transform 变换系统** - CSS Transform 完整支持 ✅
  - 2D/3D 变换（旋转、缩放、平移、斜切）
  - 矩阵变换与透视变换
  - 点、矩形、路径变换计算
  - 变换组合和链式应用
  - 变换后的边界框计算

## 快速开始

### 安装

```bash
npm install
```

### 构建

```bash
npm run build
```

### 使用示例

#### Grid 布局

```typescript
import { createDefaultEngine, createGridNode, createConstraintSpace } from 'ts-chrome-layout';

const engine = createDefaultEngine();
const node = createGridNode({
  id: 'grid-container',
  style: {
    layoutType: 'grid',
    gridTemplateColumns: [
      { type: 'fixed', value: 100 },
      { type: 'fr', value: 1 },
      { type: 'auto' }
    ],
    gridTemplateRows: [
      { type: 'fixed', value: 50 },
      { type: 'auto' }
    ],
  },
  children: [/* 子节点 */],
});

const constraintSpace = createConstraintSpace({
  availableWidth: 800,
  availableHeight: 600,
});

const result = engine.layout(node, constraintSpace);
```

#### Flex 布局

```typescript
import { createDefaultEngine, createFlexNode, createConstraintSpace } from 'ts-chrome-layout';

const engine = createDefaultEngine();
const node = createFlexNode({
  id: 'flex-container',
  style: {
    layoutType: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  children: [/* 子节点 */],
});

const constraintSpace = createConstraintSpace({
  availableWidth: 800,
  availableHeight: 600,
});

const result = engine.layout(node, constraintSpace);
```

#### Block 布局

```typescript
import { createDefaultEngine, createBlockNode, createConstraintSpace } from 'ts-chrome-layout';

const engine = createDefaultEngine();
const node = createBlockNode({
  id: 'block-container',
  style: {
    layoutType: 'block',
  },
  children: [/* 子节点 */],
});

const constraintSpace = createConstraintSpace({
  availableWidth: 800,
  availableHeight: 600,
});

const result = engine.layout(node, constraintSpace);
```

#### Transform 变换

```typescript
import { TransformMatrix } from 'ts-chrome-layout';

const transform = TransformMatrix.identity()
  .translate(10, 20)
  .rotate(45)
  .scale(2, 2);

const point = transform.mapPoint(1, 1);
const rect = transform.mapRect({ x: 0, y: 0, width: 100, height: 50 });
```

## 项目结构

```
ts-chrome-layout/
├── src/
│   ├── core/              # 核心引擎（LayoutEngine、算法注册等）
│   ├── layouts/           # 布局算法实现
│   │   └── grid/         # Grid 布局算法
│   ├── transforms/        # Transform 变换系统
│   ├── types/            # TypeScript 类型定义
│   ├── data-structures/  # 数据结构（Grid Tree、Track Collection 等）
│   └── utils/            # 工具函数和工厂方法
├── tests/                # 测试文件
└── docs/                 # 项目文档
```

## 核心架构

- **模块化设计**：清晰的模块划分，支持多种布局模式
- **类型安全**：完整的 TypeScript 类型系统
- **算法一致性**：与 Chromium 实现保持相同的计算逻辑
- **可扩展性**：统一的算法接口，易于添加新的布局模式

## 开发

```bash
# 开发模式（监听文件变化）
npm run dev

# 测试
npm test

# 类型检查
npm run type-check

# 代码检查与格式化
npm run lint
npm run format
```

## 文档

- [📊 进度概览](./docs/PROGRESS.md) - 项目进度报告
- [项目状态](./docs/STATUS.md) - 详细状态文档
- [架构设计](./docs/ARCHITECTURE.md) - 详细架构说明
- [API 文档](./docs/API.md) - 完整 API 参考
- [使用示例](./docs/EXAMPLES.md) - 更多使用示例
- [实现计划](./IMPLEMENTATION_PLAN.md) - 完整实现计划
- [文档索引](./docs/README.md) - 所有文档索引

## 许可证

MIT
