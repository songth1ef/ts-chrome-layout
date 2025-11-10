import { createDefaultEngine } from '../../../src/utils/common/default-engine';
import { LayoutEngine } from '../../../src/core/layout-engine';
import { BoxStrut, LayoutNode } from '../../../src/types/common/layout-node';
import { createConstraintSpace } from '../../../src/utils/common/constraint-space-factory';
import { GridStyle } from '../../../src/types/layouts/grid/grid-style';
import { FlexStyle } from '../../../src/types/layouts/flex/flex-style';
import { BlockStyle } from '../../../src/types/layouts/block/block-style';
import { InlineStyle } from '../../../src/types/layouts/inline/inline-style';
import { TableStyle } from '../../../src/types/layouts/table/table-style';
import { FlexDirection } from '../../../src/types/common/enums';

function createZeroStrut(): BoxStrut {
  return { top: 0, right: 0, bottom: 0, left: 0 };
}

describe('createDefaultEngine', () => {
  it('should create a LayoutEngine instance', () => {
    const engine = createDefaultEngine();
    expect(engine).toBeInstanceOf(LayoutEngine);
  });

  it('should register all layout algorithms', () => {
    const engine = createDefaultEngine();

    const gridStyle: GridStyle = {
      layoutType: 'grid',
      gridTemplateColumns: [{ type: 'fixed', value: 100 }],
      gridTemplateRows: [{ type: 'fixed', value: 50 }],
    };
    const gridNode: LayoutNode = {
      id: 'test-grid',
      layoutType: 'grid',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      margin: createZeroStrut(),
      padding: createZeroStrut(),
      border: createZeroStrut(),
      style: gridStyle,
      children: [],
    };

    const constraintSpace = createConstraintSpace({
      availableWidth: 300,
      availableHeight: 200,
    });

    // 如果算法未注册，layout会抛出错误
    expect(() => engine.layout(gridNode, constraintSpace)).not.toThrow();
  });

  it('should accept config options', () => {
    const engine = createDefaultEngine({
      enableValidation: false,
      enablePerformanceMonitoring: true,
    });

    expect(engine).toBeInstanceOf(LayoutEngine);
  });

  it('should be able to layout a grid node', () => {
    const engine = createDefaultEngine();

    const gridStyle: GridStyle = {
      layoutType: 'grid',
      gridTemplateColumns: [
        { type: 'fixed', value: 100 },
        { type: 'fr', value: 1 },
      ],
      gridTemplateRows: [{ type: 'fixed', value: 50 }],
    };
    const node: LayoutNode = {
      id: 'test-grid',
      layoutType: 'grid',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      margin: createZeroStrut(),
      padding: createZeroStrut(),
      border: createZeroStrut(),
      style: gridStyle,
      children: [],
    };

    const constraintSpace = createConstraintSpace({
      availableWidth: 300,
      availableHeight: 200,
    });

    const result = engine.layout(node, constraintSpace);
    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it('should be able to layout a flex node', () => {
    const engine = createDefaultEngine();

    const flexStyle: FlexStyle = {
      layoutType: 'flex',
      flexDirection: FlexDirection.Row,
    };
    const node: LayoutNode = {
      id: 'test-flex',
      layoutType: 'flex',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      margin: createZeroStrut(),
      padding: createZeroStrut(),
      border: createZeroStrut(),
      style: flexStyle,
      children: [],
    };

    const constraintSpace = createConstraintSpace({
      availableWidth: 300,
      availableHeight: 200,
    });

    const result = engine.layout(node, constraintSpace);
    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
  });

  it('should be able to layout a block node', () => {
    const engine = createDefaultEngine();

    const blockStyle: BlockStyle = {
      layoutType: 'block',
    };
    const node: LayoutNode = {
      id: 'test-block',
      layoutType: 'block',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      margin: createZeroStrut(),
      padding: createZeroStrut(),
      border: createZeroStrut(),
      style: blockStyle,
      children: [],
    };

    const constraintSpace = createConstraintSpace({
      availableWidth: 300,
      availableHeight: 200,
    });

    const result = engine.layout(node, constraintSpace);
    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
  });

  it('should be able to layout an inline node', () => {
    const engine = createDefaultEngine();

    const inlineStyle: InlineStyle = {
      layoutType: 'inline',
    };
    const node: LayoutNode = {
      id: 'test-inline',
      layoutType: 'inline',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      margin: createZeroStrut(),
      padding: createZeroStrut(),
      border: createZeroStrut(),
      style: inlineStyle,
      children: [],
    };

    const constraintSpace = createConstraintSpace({
      availableWidth: 300,
      availableHeight: 200,
    });

    const result = engine.layout(node, constraintSpace);
    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
  });

  it('should be able to layout a table node', () => {
    const engine = createDefaultEngine();

    const tableStyle: TableStyle = {
      layoutType: 'table',
    };
    const node: LayoutNode = {
      id: 'test-table',
      layoutType: 'table',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      margin: createZeroStrut(),
      padding: createZeroStrut(),
      border: createZeroStrut(),
      style: tableStyle,
      children: [],
    };

    const constraintSpace = createConstraintSpace({
      availableWidth: 300,
      availableHeight: 200,
    });

    const result = engine.layout(node, constraintSpace);
    expect(result).toBeDefined();
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
  });

  it('应该处理配置选项合并', () => {
    const engine = createDefaultEngine({
      enableValidation: false,
      enablePerformanceMonitoring: false,
      autoRegisterDefaults: false,
    });

    expect(engine).toBeInstanceOf(LayoutEngine);
  });

  it('应该处理空配置', () => {
    const engine = createDefaultEngine({});
    expect(engine).toBeInstanceOf(LayoutEngine);
  });

  it('应该处理未定义的配置', () => {
    const engine = createDefaultEngine(undefined);
    expect(engine).toBeInstanceOf(LayoutEngine);
  });

  it('应该能够处理嵌套布局', () => {
    const engine = createDefaultEngine();

    const childStyle: GridStyle = {
      layoutType: 'grid',
      gridTemplateColumns: [{ type: 'fixed', value: 50 }],
      gridTemplateRows: [{ type: 'fixed', value: 50 }],
    };

    const parentStyle: GridStyle = {
      layoutType: 'grid',
      gridTemplateColumns: [{ type: 'fixed', value: 100 }],
      gridTemplateRows: [{ type: 'fixed', value: 100 }],
    };

    const childNode: LayoutNode = {
      id: 'child',
      layoutType: 'grid',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      margin: createZeroStrut(),
      padding: createZeroStrut(),
      border: createZeroStrut(),
      style: childStyle,
      children: [],
    };

    const parentNode: LayoutNode = {
      id: 'parent',
      layoutType: 'grid',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      margin: createZeroStrut(),
      padding: createZeroStrut(),
      border: createZeroStrut(),
      style: parentStyle,
      children: [childNode],
    };

    const constraintSpace = createConstraintSpace({
      availableWidth: 300,
      availableHeight: 200,
    });

    const result = engine.layout(parentNode, constraintSpace);
    expect(result).toBeDefined();
    expect(result.children).toBeDefined();
    if (result.children) {
      expect(result.children.length).toBeGreaterThan(0);
    }
  });
});
