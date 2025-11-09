/**
 * 日志系统
 * 用于调试和性能分析
 * 
 * 对应 Chromium: 日志系统（概念上）
 */

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  None = 4,
}

/**
 * 日志接口
 */
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

/**
 * 控制台日志实现
 */
export class ConsoleLogger implements Logger {
  constructor(private level: LogLevel = LogLevel.Info) {}
  
  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.Debug) {
      console.debug(`[Layout] ${message}`, ...args);
    }
  }
  
  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.Info) {
      console.info(`[Layout] ${message}`, ...args);
    }
  }
  
  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.Warn) {
      console.warn(`[Layout] ${message}`, ...args);
    }
  }
  
  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.Error) {
      console.error(`[Layout] ${message}`, ...args);
    }
  }
  
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  getLevel(): LogLevel {
    return this.level;
  }
}

/**
 * 空日志实现（生产环境）
 */
export class NullLogger implements Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
  setLevel(): void {}
  getLevel(): LogLevel {
    return LogLevel.None;
  }
}

/**
 * 全局日志实例
 */
let globalLogger: Logger = new NullLogger();

/**
 * 设置全局日志
 */
export function setLogger(logger: Logger): void {
  globalLogger = logger;
}

/**
 * 获取全局日志
 */
export function getLogger(): Logger {
  return globalLogger;
}

/**
 * 根据环境初始化日志
 */
export function initializeLogger(): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    setLogger(new ConsoleLogger(LogLevel.Debug));
  } else {
    setLogger(new NullLogger());
  }
}

// 自动初始化（仅在 Node.js 环境）
// @ts-expect-error - window 在 Node.js 环境中不存在
if (typeof window === 'undefined') {
  // Node.js 环境
  if (typeof process !== 'undefined') {
  initializeLogger();
  }
}
