import { GridTrackDirection } from '../../common/enums';

/**
 * 网格位置类型
 * 
 * 对应 Chromium: grid_position.h - GridPosition
 */
export type GridPosition =
  | { type: 'auto' } // 自动位置
  | { type: 'span'; value: number; namedLine?: string } // span N 或 span <custom-ident>
  | { type: 'explicit'; value: number; namedLine?: string } // 整数位置或命名线
  | { type: 'named-area'; name: string; side: 'start' | 'end' }; // 命名区域

/**
 * 网格项样式（用于解析位置）
 * 
 * 对应 Chromium: ComputedStyle 中的 grid-* 属性
 */
export interface GridItemStyle {
  // 列位置
  gridColumnStart?: GridPosition;
  gridColumnEnd?: GridPosition;
  
  // 行位置
  gridRowStart?: GridPosition;
  gridRowEnd?: GridPosition;
}

/**
 * 检查位置是否为自动
 */
export function isAutoPosition(
  position: GridPosition
): position is Extract<GridPosition, { type: 'auto' }> {
  return position.type === 'auto';
}

/**
 * 检查位置是否为跨度
 */
export function isSpanPosition(
  position: GridPosition
): position is Extract<GridPosition, { type: 'span' }> {
  return position.type === 'span';
}

/**
 * 检查位置是否为显式位置
 */
export function isExplicitPosition(
  position: GridPosition
): position is Extract<GridPosition, { type: 'explicit' }> {
  return position.type === 'explicit';
}

/**
 * 检查位置是否应该相对于相反位置解析
 * 
 * 对应 Chromium: GridPosition::ShouldBeResolvedAgainstOppositePosition()
 */
export function shouldResolveAgainstOppositePosition(
  position: GridPosition
): boolean {
  return isAutoPosition(position) || isSpanPosition(position);
}

/**
 * 从样式获取初始和最终位置
 * 
 * 对应 Chromium: GridLineResolver::InitialAndFinalPositionsFromStyle()
 */
export function getPositionsFromStyle(
  itemStyle: GridItemStyle,
  direction: GridTrackDirection
): { initial: GridPosition; final: GridPosition } {
  const isColumn = direction === GridTrackDirection.Column;
  
  const initial = isColumn
    ? itemStyle.gridColumnStart || { type: 'auto' }
    : itemStyle.gridRowStart || { type: 'auto' };
  
  const final = isColumn
    ? itemStyle.gridColumnEnd || { type: 'auto' }
    : itemStyle.gridRowEnd || { type: 'auto' };
  
  // 如果两个都是 span，将 final 设为 auto
  // 对应 Chromium: if (initial_position.IsSpan() && final_position.IsSpan())
  if (isSpanPosition(initial) && isSpanPosition(final)) {
    return { initial, final: { type: 'auto' } };
  }
  
  // 如果 initial 是 auto 且 final 是带命名线的 span，将 span 设为 1
  if (
    isAutoPosition(initial) &&
    isSpanPosition(final) &&
    'namedLine' in final &&
    final.namedLine
  ) {
    return {
      initial,
      final: { type: 'span', value: 1 },
    };
  }
  
  // 如果 final 是 auto 且 initial 是带命名线的 span，将 span 设为 1
  if (
    isAutoPosition(final) &&
    isSpanPosition(initial) &&
    'namedLine' in initial &&
    initial.namedLine
  ) {
    return {
      initial: { type: 'span', value: 1 },
      final,
    };
  }
  
  return { initial, final };
}

