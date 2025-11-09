import { GridStyle } from '../../types/layouts/grid/grid-style';
import { GridSpan } from '../../types/layouts/grid/grid-data';
import { GridTrackDirection } from '../../types/common/enums';
import {
  GridPosition,
  GridItemStyle,
  getPositionsFromStyle,
  shouldResolveAgainstOppositePosition,
  isExplicitPosition,
  isSpanPosition,
  isAutoPosition,
} from '../../types/layouts/grid/grid-position';

/**
 * Grid 线解析器
 * 
 * 对应 Chromium: grid_line_resolver.h/cc
 * 负责将 CSS Grid 语法转换为数字索引
 */
export class GridLineResolver {
  private style: GridStyle;
  private columnAutoRepetitions: number;
  private rowAutoRepetitions: number;
  
  constructor(
    style: GridStyle,
    columnAutoRepetitions: number = 1,
    rowAutoRepetitions: number = 1
  ) {
    this.style = style;
    this.columnAutoRepetitions = columnAutoRepetitions;
    this.rowAutoRepetitions = rowAutoRepetitions;
  }
  
  /**
   * 从样式解析网格位置
   * 
   * 对应 Chromium: GridLineResolver::ResolveGridPositionsFromStyle()
   */
  resolveGridPositionsFromStyle(
    itemStyle: GridItemStyle,
    direction: GridTrackDirection
  ): GridSpan {
    const { initial, final } = getPositionsFromStyle(itemStyle, direction);
    
    const initialShouldResolveAgainstOpposite =
      shouldResolveAgainstOppositePosition(initial);
    const finalShouldResolveAgainstOpposite =
      shouldResolveAgainstOppositePosition(final);
    
    // 如果两个位置都需要相对于相反位置解析，返回不确定跨度
    // 对应 Chromium: GridSpan::IndefiniteGridSpan()
    if (
      initialShouldResolveAgainstOpposite &&
      finalShouldResolveAgainstOpposite
    ) {
      const spanSize = isSpanPosition(initial)
        ? initial.value
        : isSpanPosition(final)
        ? final.value
        : 1;
      return {
        start: -1, // -1 表示不确定
        end: -1,
        size: spanSize,
      };
    }
    
    // 解析初始位置
    let startLine: number;
    if (initialShouldResolveAgainstOpposite) {
      // 从最终位置推断初始位置
      const endLine = this.resolveGridPosition(final, direction, 'end');
      startLine = this.resolveGridPositionAgainstOpposite(
        endLine,
        initial,
        direction,
        'start'
      );
    } else {
      startLine = this.resolveGridPosition(initial, direction, 'start');
    }
    
    // 解析最终位置
    let endLine: number;
    if (finalShouldResolveAgainstOpposite) {
      // 从初始位置推断最终位置
      endLine = this.resolveGridPositionAgainstOpposite(
        startLine,
        final,
        direction,
        'end'
      );
    } else {
      endLine = this.resolveGridPosition(final, direction, 'end');
    }
    
    // 确保 end >= start
    if (endLine < startLine) {
      [startLine, endLine] = [endLine, startLine];
    } else if (endLine === startLine) {
      endLine = startLine + 1;
    }
    
    return {
      start: startLine,
      end: endLine,
      size: endLine - startLine,
    };
  }
  
  /**
   * 解析网格位置为数字索引
   * 
   * 对应 Chromium: GridLineResolver::ResolveGridPosition()
   */
  private resolveGridPosition(
    position: GridPosition,
    direction: GridTrackDirection,
    side: 'start' | 'end'
  ): number {
    if (isExplicitPosition(position)) {
      // 处理显式位置（整数）
      if (position.namedLine) {
        // 命名线位置 - 需要查找命名线
        return this.resolveNamedGridLinePosition(position, direction, side);
      }
      
      // 整数位置
      if (position.value > 0) {
        // 正数：从 1 开始，转换为 0-based 索引
        return position.value - 1;
      } else {
        // 负数：从末尾开始计算
        const explicitSize = this.explicitGridSizeForSide(direction, side);
        return explicitSize - Math.abs(position.value) - 1;
      }
    }
    
    if (position.type === 'named-area') {
      // 命名区域位置
      return this.resolveNamedAreaPosition(position, direction, side);
    }
    
    // auto 和 span 不应该在这里处理
    throw new Error(
      `Cannot resolve ${position.type} position without opposite position`
    );
  }
  
  /**
   * 相对于相反位置解析位置
   * 
   * 对应 Chromium: GridLineResolver::ResolveGridPositionAgainstOppositePosition()
   */
  private resolveGridPositionAgainstOpposite(
    oppositeLine: number,
    position: GridPosition,
    _direction: GridTrackDirection,
    side: 'start' | 'end'
  ): number {
    if (isAutoPosition(position)) {
      // auto 位置：使用相反位置
      return oppositeLine;
    }
    
    if (isSpanPosition(position)) {
      // span 位置：从相反位置开始计算跨度
      const spanValue = position.value || 1;
      return side === 'start'
        ? oppositeLine - spanValue
        : oppositeLine + spanValue;
    }
    
    throw new Error(`Invalid position type for opposite resolution: ${position.type}`);
  }
  
  /**
   * 解析命名网格线位置
   * 
   * 对应 Chromium: GridLineResolver::ResolveNamedGridLinePosition()
   */
  private resolveNamedGridLinePosition(
    position: GridPosition,
    direction: GridTrackDirection,
    side: 'start' | 'end'
  ): number {
    if (!isExplicitPosition(position) || !position.namedLine) {
      throw new Error('Position must have a named line');
    }
    
    // 实现命名网格线查找
    // 对应 Chromium: GridNamedLineCollection
    const namedLines = this.getNamedLines(direction);
    const lineIndex = namedLines.indexOf(position.namedLine);
    
    if (lineIndex >= 0) {
      return lineIndex;
    }
    
    // 如果找不到命名线，返回显式网格的最后一行 + 1
    const explicitSize = this.explicitGridSizeForSide(direction, side);
    return explicitSize + 1;
  }
  
  /**
   * 解析命名区域位置
   * 
   * 对应 Chromium: GridLineResolver::ResolveGridPosition() - kNamedGridAreaPosition case
   */
  private resolveNamedAreaPosition(
    position: GridPosition,
    direction: GridTrackDirection,
    side: 'start' | 'end'
  ): number {
    if (position.type !== 'named-area') {
      throw new Error('Position must be a named area');
    }
    
    // 实现命名区域查找
    // 对应 Chromium: 查找 grid-template-areas 中的命名区域
    if (!this.style.gridTemplateAreas) {
      const explicitSize = this.explicitGridSizeForSide(direction, side);
      return explicitSize + 1;
    }
    
    const areas = this.style.gridTemplateAreas;
    const areaName = position.name;
    
    // 查找命名区域
    for (let row = 0; row < areas.length; row++) {
      for (let col = 0; col < areas[row].length; col++) {
        if (areas[row][col] === areaName) {
          if (direction === GridTrackDirection.Column) {
            return side === 'start' ? col : col + 1;
          } else {
            return side === 'start' ? row : row + 1;
          }
        }
      }
    }
    
    // 如果找不到命名区域，返回显式网格的最后一行 + 1
    const explicitSize = this.explicitGridSizeForSide(direction, side);
    return explicitSize + 1;
  }
  
  /**
   * 获取命名网格线列表
   */
  private getNamedLines(direction: GridTrackDirection): string[] {
    if (!this.style.namedGridLines) {
      return [];
    }
    
    return direction === GridTrackDirection.Column
      ? this.style.namedGridLines.columns || []
      : this.style.namedGridLines.rows || [];
  }

  /**
   * 获取显式网格大小（用于某一边）
   * 
   * 对应 Chromium: GridLineResolver::ExplicitGridSizeForSide()
   */
  private explicitGridSizeForSide(
    direction: GridTrackDirection,
    _side: 'start' | 'end'
  ): number {
    const trackCount = this.explicitGridTrackCount(direction);
    // 网格线数 = 轨道数 + 1
    return trackCount;
  }
  
  /**
   * 显式网格轨道数
   * 
   * 对应 Chromium: GridLineResolver::ExplicitGridTrackCount()
   */
  explicitGridTrackCount(direction: GridTrackDirection): number {
    const tracks =
      direction === GridTrackDirection.Column
        ? this.style.gridTemplateColumns
        : this.style.gridTemplateRows;
    
    let count = 0;
    for (const track of tracks) {
      if (track.type === 'repeat') {
        // 处理 repeat() - 计算重复次数
        if (typeof track.count === 'number') {
          count += track.count * track.tracks.length;
        } else {
          // auto-fill 或 auto-fit - 使用自动重复次数
          const autoRepetitions = this.autoRepetitions(direction);
          count += autoRepetitions * track.tracks.length;
        }
      } else {
        count += 1;
      }
    }
    
    return count;
  }
  
  /**
   * 自动重复次数
   * 
   * 对应 Chromium: GridLineResolver::AutoRepetitions()
   */
  autoRepetitions(direction: GridTrackDirection): number {
    return direction === GridTrackDirection.Column
      ? this.columnAutoRepetitions
      : this.rowAutoRepetitions;
  }
  
  /**
   * 自动重复轨道数
   * 
   * 对应 Chromium: GridLineResolver::AutoRepeatTrackCount()
   */
  autoRepeatTrackCount(direction: GridTrackDirection): number {
    const tracks =
      direction === GridTrackDirection.Column
        ? this.style.gridTemplateColumns
        : this.style.gridTemplateRows;
    
    // 查找 repeat(auto-fill) 或 repeat(auto-fit) 轨道
    for (const track of tracks) {
      if (
        track.type === 'repeat' &&
        (track.count === 'auto-fill' || track.count === 'auto-fit')
      ) {
        const autoRepetitions = this.autoRepetitions(direction);
        return autoRepetitions * track.tracks.length;
      }
    }
    
    return 0;
  }
  
  /**
   * 是否有独立轴
   * 
   * 对应 Chromium: GridLineResolver::HasStandaloneAxis()
   */
  hasStandaloneAxis(_direction: GridTrackDirection): boolean {
    // TODO: 实现独立轴检查
    // 对应 Chromium: HasStandaloneAxis()
    return true;
  }
}

