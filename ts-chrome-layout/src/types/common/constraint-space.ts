import { WritingMode, TextDirection } from './enums';

/**
 * 约束空间
 * 所有布局模式共享的约束空间定义
 */
export interface ConstraintSpace {
  // 可用尺寸
  availableWidth: number | 'auto';
  availableHeight: number | 'auto';
  
  // 最小/最大尺寸
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  
  // 书写方向
  writingMode: WritingMode;
  direction: TextDirection;
  
  // 布局特定的额外数据
  // Grid 特定：继承的布局树
  gridLayoutTree?: any; // GridLayoutTree - 将在后续实现
  
  // Flex 特定：可以添加 Flex 相关的约束（未来）
  // flexContainer?: FlexContainerData;
  
  // Block 特定：可以添加 Block 相关的约束（未来）
  // blockFormattingContext?: BlockFormattingContext;
  
  [key: string]: any; // 允许扩展
}

/**
 * 约束空间配置
 */
export interface ConstraintSpaceConfig {
  availableWidth?: number | 'auto';
  availableHeight?: number | 'auto';
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  writingMode?: WritingMode;
  direction?: TextDirection;
  
  // 布局特定的配置
  gridLayoutTree?: any;
  
  [key: string]: any; // 允许扩展
}

