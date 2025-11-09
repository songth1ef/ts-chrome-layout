# 工程化文档

## 开发环境设置

### 必需工具

- Node.js >= 18.0.0
- npm >= 9.0.0
- TypeScript >= 5.0.0

### 推荐 VS Code 扩展

项目包含 `.vscode/extensions.json`，推荐安装：
- ESLint
- Prettier
- TypeScript

## 脚本命令

### 构建

```bash
npm run build          # 构建项目
npm run build:watch    # 监听模式构建
```

### 测试

```bash
npm test               # 运行测试
npm run test:watch     # 监听模式测试
npm run test:coverage  # 生成覆盖率报告
npm run test:ci        # CI 模式测试
```

### 代码质量

```bash
npm run lint           # 检查代码规范
npm run lint:fix       # 自动修复代码规范问题
npm run lint:ci        # CI 模式（零警告）
npm run format         # 格式化代码
npm run format:check   # 检查代码格式
npm run type-check     # 类型检查
npm run validate       # 完整验证（类型+规范+格式）
```

### CI/CD

```bash
npm run ci             # 完整 CI 流程
```

## 配置文件

### TypeScript

- `tsconfig.json` - 主配置
- `tsconfig.build.json` - 构建配置
- `tsconfig.test.json` - 测试配置

### ESLint

- `.eslintrc.json` - ESLint 规则配置

### Prettier

- `.prettierrc.json` - 代码格式化配置

### EditorConfig

- `.editorconfig` - 编辑器配置

## 性能优化

### 缓存机制

布局引擎支持结果缓存：

```typescript
const engine = new LayoutEngine({
  enableCache: true,
  cacheSize: 200, // 缓存大小
});
```

### 性能监控

```typescript
const engine = new LayoutEngine({
  enablePerformanceMonitoring: true,
});

// 执行布局
engine.layout(node, constraintSpace);

// 获取性能指标
const metrics = engine.getPerformanceMetrics();
console.log(metrics);
```

## 错误处理

### 错误类型

- `LayoutError` - 布局相关错误
- `LayoutErrorCode` - 错误代码枚举

### 自定义错误处理

```typescript
const engine = new LayoutEngine({
  errorHandler: {
    onError(error) {
      // 自定义错误处理
    },
    shouldThrow(error) {
      // 决定是否抛出错误
      return true;
    },
  },
});
```

## 日志系统

### 日志级别

- `Debug` - 调试信息
- `Info` - 一般信息
- `Warn` - 警告
- `Error` - 错误
- `None` - 禁用日志

### 使用日志

```typescript
import { setLogger, ConsoleLogger, LogLevel } from 'ts-chrome-layout';

// 设置日志
setLogger(new ConsoleLogger(LogLevel.Debug));

// 在代码中使用
import { getLogger } from 'ts-chrome-layout';
getLogger().debug('Debug message');
```

## 环境变量

支持以下环境变量：

- `LAYOUT_ENABLE_VALIDATION` - 启用验证（true/false）
- `LAYOUT_ENABLE_PERFORMANCE_MONITORING` - 启用性能监控
- `LAYOUT_ENABLE_CACHE` - 启用缓存
- `LAYOUT_CACHE_SIZE` - 缓存大小
- `LAYOUT_LOG_LEVEL` - 日志级别

## 最佳实践

1. **开发时**：启用验证和详细日志
2. **生产时**：禁用日志，启用缓存
3. **测试时**：启用严格验证
4. **调试时**：启用性能监控

## CI/CD

项目包含 GitHub Actions 工作流：

- 自动运行测试
- 代码质量检查
- 类型检查
- 构建验证

详见 `.github/workflows/ci.yml`

