/**
 * 网格轨道方向
 */
export enum GridTrackDirection {
  Column = 'column',
  Row = 'row',
}

/**
 * 网格自动流方向
 */
export enum GridAutoFlow {
  Row = 'row',
  Column = 'column',
  RowDense = 'row-dense',
  ColumnDense = 'column-dense',
}

/**
 * 内容对齐方式
 */
export enum ContentAlignment {
  Start = 'start',
  End = 'end',
  Center = 'center',
  Stretch = 'stretch',
  SpaceAround = 'space-around',
  SpaceBetween = 'space-between',
  SpaceEvenly = 'space-evenly',
}

/**
 * 项对齐方式
 */
export enum ItemAlignment {
  Start = 'start',
  End = 'end',
  Center = 'center',
  Stretch = 'stretch',
  Baseline = 'baseline',
}

/**
 * 书写模式
 */
export enum WritingMode {
  HorizontalTb = 'horizontal-tb',
  VerticalRl = 'vertical-rl',
  VerticalLr = 'vertical-lr',
}

/**
 * 文本方向
 */
export enum TextDirection {
  Ltr = 'ltr',
  Rtl = 'rtl',
}

/**
 * 尺寸约束
 */
export enum SizingConstraint {
  Layout = 'layout',
  MinContent = 'min-content',
  MaxContent = 'max-content',
}

/**
 * 网格项贡献类型
 */
export enum GridItemContributionType {
  ForIntrinsicMinimums = 'for-intrinsic-minimums',
  ForContentBasedMinimums = 'for-content-based-minimums',
  ForMaxContentMinimums = 'for-max-content-minimums',
  ForIntrinsicMaximums = 'for-intrinsic-maximums',
  ForMaxContentMaximums = 'for-max-content-maximums',
  ForFreeSpace = 'for-free-space',
}

// ========== Flex 相关枚举（未来扩展） ==========

/**
 * Flex 方向
 */
export enum FlexDirection {
  Row = 'row',
  RowReverse = 'row-reverse',
  Column = 'column',
  ColumnReverse = 'column-reverse',
}

/**
 * Flex 换行
 */
export enum FlexWrap {
  NoWrap = 'nowrap',
  Wrap = 'wrap',
  WrapReverse = 'wrap-reverse',
}

/**
 * Flex 对齐
 */
export enum FlexJustifyContent {
  FlexStart = 'flex-start',
  FlexEnd = 'flex-end',
  Center = 'center',
  SpaceBetween = 'space-between',
  SpaceAround = 'space-around',
  SpaceEvenly = 'space-evenly',
}

