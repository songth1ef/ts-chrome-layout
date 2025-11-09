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

// Flex 布局
export { FlexLayoutAlgorithm } from './layouts/flex/flex-layout-algorithm';
export { FlexMeasureAlgorithm } from './layouts/flex/flex-measure';
export { FlexArrangeAlgorithm } from './layouts/flex/flex-arrange';
export * from './types/layouts/flex/flex-style';
export * from './types/layouts/flex/flex-data';
export * from './types/layouts/flex/flex-item-style';

// Block 布局
export { BlockLayoutAlgorithm } from './layouts/block/block-layout-algorithm';
export { BlockMeasureAlgorithm } from './layouts/block/block-measure';
export { BlockArrangeAlgorithm } from './layouts/block/block-arrange';
export * from './types/layouts/block/block-style';
export * from './types/layouts/block/block-data';

// Inline 布局
export { InlineLayoutAlgorithm } from './layouts/inline/inline-layout-algorithm';
export { InlineMeasureAlgorithm } from './layouts/inline/inline-measure';
export { InlineArrangeAlgorithm } from './layouts/inline/inline-arrange';
export * from './types/layouts/inline/inline-style';
export * from './types/layouts/inline/inline-data';

// Table 布局
export { TableLayoutAlgorithm } from './layouts/table/table-layout-algorithm';
export { TableMeasureAlgorithm } from './layouts/table/table-measure';
export { TableArrangeAlgorithm } from './layouts/table/table-arrange';
export * from './types/layouts/table/table-style';
export * from './types/layouts/table/table-data';

// Transform
export { AffineTransform } from './transforms/affine-transform';
export { TransformMatrix } from './transforms/transform-matrix';
export { TransformCalculator } from './transforms/transform-calculator';

// 工具
export { createConstraintSpace } from './utils/common/constraint-space-factory';
export { createGridNode } from './utils/layouts/grid/grid-node-factory';
export { createFlexNode } from './utils/layouts/flex/flex-node-factory';
export { createBlockNode } from './utils/layouts/block/block-node-factory';
export { createInlineNode } from './utils/layouts/inline/inline-node-factory';
export { createTableNode } from './utils/layouts/table/table-node-factory';

// 默认引擎
export { createDefaultEngine } from './utils/common/default-engine';
