/**
 * ts-chrome-layout 主入口文件
 * 
 * 导出所有公共 API
 */

// 核心
export { LayoutEngine } from './core/layout-engine';
export { LayoutAlgorithm } from './core/layout-algorithm';
export { AlgorithmRegistry } from './core/algorithm-registry';
export { LayoutContext } from './core/layout-context';
export { LayoutError, ErrorCode } from './core/layout-context';

// 类型
export * from './types/common/layout-node';
export * from './types/common/constraint-space';
export * from './types/common/enums';
export * from './types/common/style';
export * from './types/common/transform';

// Grid 布局
export { GridLayoutAlgorithm } from './layouts/grid/grid-layout-algorithm';
export { GridLineResolver } from './layouts/grid/grid-line-resolver';
export { GridPlacementAlgorithm } from './layouts/grid/grid-placement';
export { GridMeasureAlgorithm } from './layouts/grid/grid-measure';
export { GridArrangeAlgorithm } from './layouts/grid/grid-arrange';
export { GridTrackSizingAlgorithm } from './layouts/grid/grid-track-sizing';
export * from './types/layouts/grid/grid-style';
export * from './types/layouts/grid/grid-data';
export * from './types/layouts/grid/grid-position';

// Transform
export { AffineTransform } from './transforms/affine-transform';
export { TransformMatrix } from './transforms/transform-matrix';
export { TransformCalculator } from './transforms/transform-calculator';

// 工具
export { createConstraintSpace } from './utils/common/constraint-space-factory';
export { createGridNode } from './utils/layouts/grid/grid-node-factory';

// 默认引擎
export { createDefaultEngine } from './utils/common/default-engine';
