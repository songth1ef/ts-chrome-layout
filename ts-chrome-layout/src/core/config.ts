/**
 * 全局配置管理
 * 
 * 对应 Chromium: 全局配置（概念上）
 */

/**
 * 布局引擎全局配置
 */
export interface GlobalConfig {
  // 默认启用验证
  defaultEnableValidation: boolean;
  
  // 默认启用性能监控
  defaultEnablePerformanceMonitoring: boolean;
  
  // 默认启用缓存
  defaultEnableCache: boolean;
  
  // 默认缓存大小
  defaultCacheSize: number;
  
  // 默认日志级别
  defaultLogLevel: 'debug' | 'info' | 'warn' | 'error' | 'none';
  
  // 是否在开发模式下启用详细日志
  enableDevLogging: boolean;
  
  // 是否在开发模式下启用严格验证
  enableStrictValidation: boolean;
}

/**
 * 默认全局配置
 */
const defaultConfig: GlobalConfig = {
  defaultEnableValidation: true,
  defaultEnablePerformanceMonitoring: false,
  defaultEnableCache: false,
  defaultCacheSize: 100,
  defaultLogLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  enableDevLogging: process.env.NODE_ENV === 'development',
  enableStrictValidation: process.env.NODE_ENV === 'development',
};

/**
 * 全局配置实例
 */
let globalConfig: GlobalConfig = { ...defaultConfig };

/**
 * 获取全局配置
 */
export function getGlobalConfig(): GlobalConfig {
  return { ...globalConfig };
}

/**
 * 更新全局配置
 */
export function setGlobalConfig(config: Partial<GlobalConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * 重置全局配置为默认值
 */
export function resetGlobalConfig(): void {
  globalConfig = { ...defaultConfig };
}

/**
 * 获取环境变量配置
 */
export function getEnvConfig(): Partial<GlobalConfig> {
  const config: Partial<GlobalConfig> = {};
  
  if (process.env.LAYOUT_ENABLE_VALIDATION !== undefined) {
    config.defaultEnableValidation = process.env.LAYOUT_ENABLE_VALIDATION === 'true';
  }
  
  if (process.env.LAYOUT_ENABLE_PERFORMANCE_MONITORING !== undefined) {
    config.defaultEnablePerformanceMonitoring =
      process.env.LAYOUT_ENABLE_PERFORMANCE_MONITORING === 'true';
  }
  
  if (process.env.LAYOUT_ENABLE_CACHE !== undefined) {
    config.defaultEnableCache = process.env.LAYOUT_ENABLE_CACHE === 'true';
  }
  
  if (process.env.LAYOUT_CACHE_SIZE !== undefined) {
    config.defaultCacheSize = parseInt(process.env.LAYOUT_CACHE_SIZE, 10);
  }
  
  if (process.env.LAYOUT_LOG_LEVEL !== undefined) {
    config.defaultLogLevel = process.env.LAYOUT_LOG_LEVEL as any;
  }
  
  return config;
}

// 初始化时从环境变量加载配置
if (typeof process !== 'undefined') {
  const envConfig = getEnvConfig();
  if (Object.keys(envConfig).length > 0) {
    setGlobalConfig(envConfig);
  }
}
