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

## 当前目录结构

详见 [架构文档](./ARCHITECTURE.md)

## 清理原则

1. **保持新结构**：所有代码都在新的目录结构中
2. **删除重复**：删除所有旧位置的重复文件
3. **统一路径**：所有导入路径都指向新位置
4. **保持功能**：清理不影响功能，只是重新组织

## 验证

清理后，所有代码应该：
- ✅ 使用新的目录结构
- ✅ 导入路径指向新位置
- ✅ 没有重复文件
- ✅ 类型检查通过

