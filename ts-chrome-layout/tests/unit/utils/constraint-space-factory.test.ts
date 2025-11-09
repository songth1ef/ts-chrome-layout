/**
 * ConstraintSpaceFactory 测试
 */

import { createConstraintSpace } from '../../../src/utils/common/constraint-space-factory';
import { WritingMode, TextDirection } from '../../../src/types/common/enums';

describe('createConstraintSpace', () => {
  it('应该创建约束空间', () => {
    const space = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
    });
    
    expect(space.availableWidth).toBe(800);
    expect(space.availableHeight).toBe(600);
  });

  it('应该使用默认值', () => {
    const space = createConstraintSpace({});
    
    expect(space.writingMode).toBe(WritingMode.HorizontalTb);
    expect(space.direction).toBe(TextDirection.Ltr);
  });

  it('应该支持自定义值', () => {
    const space = createConstraintSpace({
      availableWidth: 800,
      availableHeight: 600,
      writingMode: WritingMode.VerticalRl,
      direction: TextDirection.Rtl,
    });
    
    expect(space.writingMode).toBe(WritingMode.VerticalRl);
    expect(space.direction).toBe(TextDirection.Rtl);
  });
});

