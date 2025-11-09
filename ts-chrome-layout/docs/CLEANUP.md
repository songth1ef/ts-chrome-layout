# 代码清理记录

> 迁移指南请参考 [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)

## 已删除的旧文件

### types/ 目录
- ❌ `types/constraint-space.ts` → ✅ `types/common/constraint-space.ts`
- ❌ `types/enums.ts` → ✅ `types/common/enums.ts`
- ❌ `types/layout-node.ts` → ✅ `types/common/layout-node.ts`
- ❌ `types/grid-data.ts` → ✅ `types/layouts/grid/grid-data.ts`
- ❌ `types/grid-tree.ts` → ✅ `types/layouts/grid/grid-tree.ts`

### algorithms/ 目录（整个目录）
- ❌ `algorithms/grid-arrange.ts` → ✅ `layouts/grid/grid-arrange.ts`
- ❌ `algorithms/grid-layout-algorithm.ts` → ✅ `layouts/grid/grid-layout-algorithm.ts`
- ❌ `algorithms/grid-line-resolver.ts` → ✅ `layouts/grid/grid-line-resolver.ts`
- ❌ `algorithms/grid-measure.ts` → ✅ `layouts/grid/grid-measure.ts`
- ❌ `algorithms/grid-placement.ts` → ✅ `layouts/grid/grid-placement.ts`
- ❌ `algorithms/grid-track-sizing.ts` → ✅ `layouts/grid/grid-track-sizing.ts`

### data-structures/ 目录
- ❌ `data-structures/grid-items.ts` → ✅ `data-structures/layouts/grid/grid-items.ts`
- ❌ `data-structures/grid-sizing-tree.ts` → ✅ `data-structures/layouts/grid/grid-sizing-tree.ts`
- ❌ `data-structures/grid-track-collection.ts` → ✅ `data-structures/layouts/grid/grid-track-collection.ts`

### utils/ 目录
- ❌ `utils/constraint-space-factory.ts` → ✅ `utils/common/constraint-space-factory.ts`
- ❌ `utils/grid-node-factory.ts` → ✅ `utils/layouts/grid/grid-node-factory.ts`
- ❌ `utils/grid-utils.ts` → ✅ `utils/layouts/grid/grid-utils.ts`

### core/ 目录
- ❌ `core/layout-core.ts` → ✅ `core/layout-algorithm.ts`（已重构为更通用的接口）

---

## 重复代码和文档清理

### 1. 错误类型合并 ✅

**问题**：
- `src/types/common/errors.ts` 定义了 `ErrorCode` 和 `BaseError`
- `src/core/layout-context.ts` 定义了 `LayoutErrorCode` 和 `LayoutError`

**解决方案**：
- 将 `ErrorCode` 和 `BaseError` 移到 `layout-context.ts`（更合理的位置）
- `LayoutError` 继承 `BaseError`
- `LayoutErrorCode` 改为 `ErrorCode` 的类型别名，保持向后兼容
- 删除 `src/types/common/errors.ts`

**结果**：
- ✅ 统一错误类型定义
- ✅ 消除重复
- ✅ 保持向后兼容

### 2. 文档整理 ✅

**问题**：
- `docs/OPTIMIZATION.md` 和 `docs/ENGINEERING.md` 有部分重复内容
- 多个状态文档有重复内容

**解决方案**：
- `OPTIMIZATION.md` 专注于架构优化，引用 `ENGINEERING.md` 的工程化内容
- 合并所有状态文档到 `STATUS.md`
- 合并测试相关文档到 `BUG_FIXES_AND_TESTING.md`
- 合并清理相关文档到 `CLEANUP.md`

**结果**：
- ✅ 文档职责清晰
- ✅ 减少重复内容
- ✅ 更好的文档导航

### 3. 导出整理 ✅

**问题**：
- `src/index.ts` 中有重复的导出注释

**解决方案**：
- 合并重复的"工具函数"导出部分
- 统一导出错误类型

**结果**：
- ✅ 导出更清晰
- ✅ 无重复注释

---

## 清理后的结构

### 错误类型
```
src/core/layout-context.ts
├── ErrorCode (enum)
├── BaseError (class)
├── LayoutErrorCode (type alias = ErrorCode)
└── LayoutError (extends BaseError)
```

### 文档结构
```
docs/
├── README.md                    # 文档索引
├── ARCHITECTURE.md              # 架构设计
├── STATUS.md                    # 项目状态（统一的状态文档）
├── PROGRESS.md                  # 进度概览（简洁版）
├── NEXT_STEPS.md                # 下一步计划
├── BUG_FIXES_AND_TESTING.md     # Bug 修复和测试总结
├── CLEANUP.md                   # 代码清理记录（本文件）
├── ENGINEERING.md               # 工程化（工具、流程）
├── OPTIMIZATION.md              # 架构优化（引用 ENGINEERING.md）
└── ...
```

---

## 清理原则

1. **保持新结构**：所有代码都在新的目录结构中
2. **删除重复**：删除所有旧位置的重复文件和重复文档
3. **统一路径**：所有导入路径都指向新位置
4. **保持功能**：清理不影响功能，只是重新组织
5. **文档职责清晰**：每个文档都有明确的职责，避免重复

---

## 验证

清理后，所有代码和文档应该：
- ✅ 使用新的目录结构
- ✅ 导入路径指向新位置
- ✅ 没有重复文件
- ✅ 没有重复文档
- ✅ 类型检查通过
- ✅ 文档职责清晰

---

## 当前目录结构

详见 [架构文档](./ARCHITECTURE.md)
