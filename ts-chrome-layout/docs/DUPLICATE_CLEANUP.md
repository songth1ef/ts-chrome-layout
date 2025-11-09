# 重复代码和文档清理总结

## 已完成的清理

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
- 根目录 `README.md` 内容过时

**解决方案**：
- `OPTIMIZATION.md` 专注于架构优化，引用 `ENGINEERING.md` 的工程化内容
- 更新根目录 `README.md`，使其更简洁，指向详细文档
- `CLEANUP.md` 添加对 `MIGRATION_GUIDE.md` 的引用

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
├── README.md          # 文档索引
├── ARCHITECTURE.md    # 架构设计
├── ENGINEERING.md     # 工程化（工具、流程）
├── OPTIMIZATION.md    # 架构优化（引用 ENGINEERING.md）
├── CLEANUP.md        # 清理记录（引用 MIGRATION_GUIDE.md）
└── ...
```

## 验证

清理后检查：
- ✅ 无重复的错误类型定义
- ✅ 文档职责清晰，无重复内容
- ✅ 所有导入路径正确
- ✅ 类型检查通过
- ✅ 无 linter 错误

## 注意事项

1. **向后兼容**：`LayoutErrorCode` 作为类型别名，保持 API 兼容
2. **文档引用**：文档之间相互引用，避免重复
3. **单一职责**：每个文件/文档都有明确的职责

