# ts-chrome-layout

TypeScript 实现的 Chromium 布局计算系统

## 简介

本项目是 Chromium 布局计算系统的 TypeScript 重构，旨在提供完整的布局算法实现，支持 Grid、Flex、Block、Inline 等主要布局模式，并保持与 Chromium 实现相同的计算逻辑。

## 功能特性

### ✅ 已实现

- **Grid Layout** - CSS Grid 布局算法（基础实现完成）
  - 网格线解析
  - 自动放置算法
  - 轨道尺寸计算
  - 测量和排列

- **Transform 变换系统** - CSS Transform 支持
  - 旋转（rotate）
  - 斜切（skew）✅
  - 缩放（scale）
  - 平移（translate）
  - 矩阵变换（matrix）
  - 3D 变换支持
  - 透视变换

### ⏳ 计划实现

- Flexbox Layout
- Block Layout
- Inline Layout
- Table Layout

## 安装

```bash
npm install
```

## 构建

```bash
npm run build
```

## 测试

```bash
npm test
```

## 使用示例

### Grid 布局

```typescript
import { LayoutEngine, createGridNode, createConstraintSpace } from 'ts-chrome-layout';

const engine = new LayoutEngine();
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
  children: [
    // 子节点
  ],
});

const constraintSpace = createConstraintSpace({
  availableWidth: 800,
  availableHeight: 600,
});

const result = engine.layout(node, constraintSpace);
```

### Transform 变换

```typescript
import { TransformMatrix, TransformCalculator } from 'ts-chrome-layout';

// 创建变换矩阵
const transform = TransformMatrix.identity()
  .translate(10, 20)
  .rotate(45)
  .scale(2, 2);

// 变换点
const point = transform.mapPoint(1, 1);
console.log(point); // { x: ..., y: ... }

// 变换矩形
const rect = transform.mapRect({ x: 0, y: 0, width: 100, height: 50 });
console.log(rect); // { x: ..., y: ..., width: ..., height: ... }
```

## 项目结构

```
ts-chrome-layout/
├── src/
│   ├── core/           # 核心引擎
│   ├── layouts/        # 布局算法
│   │   └── grid/       # Grid 布局
│   ├── transforms/     # Transform 变换
│   ├── types/          # 类型定义
│   ├── data-structures/# 数据结构
│   └── utils/          # 工具函数
├── tests/              # 测试
└── docs/               # 文档
```

## 文档

- [📊 进度概览](./docs/PROGRESS.md) - **简洁版进度报告（推荐）**
- [项目范围](./docs/PROJECT_SCOPE.md)
- [架构设计](./docs/ARCHITECTURE.md)
- [项目状态](./docs/STATUS.md)
- [Transform 实现计划](./docs/TRANSFORM_PLAN.md)
- [完成总结](./docs/COMPLETION_SUMMARY.md)

## 开发

```bash
# 开发模式（监听文件变化）
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 格式化
npm run format
```

## 许可证

MIT
