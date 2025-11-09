import { ConstraintSpace, ConstraintSpaceConfig } from '../../types/common/constraint-space';
import { WritingMode, TextDirection } from '../../types/common/enums';

/**
 * 创建约束空间
 */
export function createConstraintSpace(
  config: ConstraintSpaceConfig
): ConstraintSpace {
  return {
    availableWidth: config.availableWidth ?? 'auto',
    availableHeight: config.availableHeight ?? 'auto',
    minWidth: config.minWidth,
    maxWidth: config.maxWidth,
    minHeight: config.minHeight,
    maxHeight: config.maxHeight,
    writingMode: config.writingMode ?? WritingMode.HorizontalTb,
    direction: config.direction ?? TextDirection.Ltr,
    gridLayoutTree: config.gridLayoutTree,
  };
}

