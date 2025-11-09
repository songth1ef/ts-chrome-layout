# 项目范围

## 项目定位

**ts-chrome-layout** 是一个完整的 Chromium 布局计算系统 TypeScript 重构项目，旨在：

1. **完整重构**：将 Chromium 的布局计算系统从 C++ 重构为 TypeScript
2. **多布局支持**：支持所有主要的布局模式（Grid、Flex、Block、Inline 等）
3. **算法一致性**：保持与 Chromium 实现相同的计算逻辑
4. **类型安全**：充分利用 TypeScript 的类型系统
5. **可扩展性**：易于添加新的布局模式和功能

## 支持的布局模式

### 当前实现

- ✅ **Grid Layout** - CSS Grid 布局算法（开发中）

### 计划实现

- ⏳ **Flexbox Layout** - CSS Flexbox 布局算法
- ⏳ **Block Layout** - 块级布局算法
- ⏳ **Inline Layout** - 行内布局算法
- ⏳ **Table Layout** - 表格布局算法
- ⏳ **Positioned Layout** - 定位布局算法

## 核心组件

### 1. 布局引擎（Layout Engine）

通用的布局引擎，支持：
- 算法注册机制
- 布局调度
- 结果聚合
- 性能监控
- 缓存机制

### 2. 布局算法（Layout Algorithms）

每种布局模式实现统一的算法接口：
- `measure()` - 测量阶段
- `arrange()` - 排列阶段
- `layout()` - 完整布局流程

### 3. 类型系统（Type System）

分层的类型系统：
- **通用类型**：所有布局共享的基础类型
- **布局特定类型**：每种布局模式的特定类型

### 4. 数据结构（Data Structures）

布局特定的数据结构：
- Grid: `GridSizingTree`, `GridTrackCollection`, `GridItems`
- Flex: （计划中）
- Block: （计划中）

### 5. Transform 变换系统

CSS Transform 相关功能：
- **变换类型**：rotate（旋转）、skew（斜切）、scale（缩放）、translate（平移）、matrix（矩阵）
- **变换计算**：变换矩阵计算、变换组合、变换链
- **变换原点**：transform-origin 计算
- **透视变换**：perspective 支持
- **3D 变换**：preserve-3d、3D 变换矩阵
- **布局影响**：变换对布局的影响（如 fixed 定位在 transform 容器中的行为）
- **边界框计算**：变换后的实际边界框（用于布局计算）

## 与 Chromium 的关系

### 对应关系

本项目是 Chromium 布局计算系统的 TypeScript 重构，保持：

1. **算法逻辑一致**：计算逻辑与 Chromium 保持一致
2. **数据结构对应**：数据结构与 Chromium 对应
3. **方法命名对应**：方法命名与 Chromium 对应

详见 [Chromium 代码映射](./CHROMIUM_MAPPING.md)

### 实现范围

**包含**：
- ✅ 布局算法实现
- ✅ 数据结构实现
- ✅ 类型系统
- ✅ 工具函数
- ✅ 错误处理
- ✅ 性能监控
- ⏳ **Transform 变换** - CSS Transform 相关功能（旋转、斜切、缩放、平移等）

**不包含**：
- ❌ DOM 操作
- ❌ 样式解析（CSS 解析）
- ❌ 渲染（Paint/Draw）
- ❌ 事件处理

## 使用场景

### 1. 布局计算引擎

作为独立的布局计算引擎，可以：
- 在 Node.js 环境中进行布局计算
- 在浏览器中进行布局计算
- 用于布局算法的研究和学习

### 2. 布局算法参考

作为 Chromium 布局算法的 TypeScript 参考实现：
- 理解 Chromium 的布局计算逻辑
- 学习布局算法实现
- 进行布局算法的实验和优化

### 3. 测试和验证

用于布局算法的测试和验证：
- 单元测试
- 集成测试
- 性能测试

## 项目目标

### 短期目标（Phase 1-2）

- ✅ 完成基础框架
- ✅ 实现 Grid 布局算法核心功能
- ✅ 建立完整的类型系统
- ✅ 实现性能监控和缓存

### 中期目标（Phase 3-4）

- ⏳ 完成 Grid 布局算法所有功能
- ⏳ 实现 Flexbox 布局算法
- ⏳ 实现 Block 布局算法
- ⏳ 实现 Transform 变换系统
- ⏳ 完善测试覆盖

### 长期目标（Phase 5+）

- ⏳ 实现所有主要布局模式
- ⏳ 优化性能和内存使用
- ⏳ 支持高级特性（Subgrid、Masonry 等）
- ⏳ 完善 Transform 变换系统（3D 变换、动画支持等）
- ⏳ 提供完整的文档和示例

## 技术栈

- **语言**：TypeScript
- **构建工具**：TypeScript Compiler
- **测试框架**：Jest
- **代码质量**：ESLint + Prettier
- **CI/CD**：GitHub Actions

## 相关文档

- [架构设计](./ARCHITECTURE.md) - 整体架构和设计原则
- [Chromium 代码映射](./CHROMIUM_MAPPING.md) - 与 Chromium 的对应关系
- [实现计划](../IMPLEMENTATION_PLAN.md) - 详细的实现计划
- [API 文档](./API.md) - API 使用说明

