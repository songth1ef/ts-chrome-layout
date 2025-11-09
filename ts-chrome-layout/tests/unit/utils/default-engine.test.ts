import { createDefaultEngine } from '../../../src/utils/common/default-engine';
import { LayoutEngine } from '../../../src/core/layout-engine';
import { LayoutNode } from '../../../src/types/common/layout-node';
import { createConstraintSpace } from '../../../src/utils/common/constraint-space-factory';

describe('createDefaultEngine', () => {
  it('should create a LayoutEngine instance', () => {
    const engine = createDefaultEngine();
    expect(engine).toBeInstanceOf(LayoutEngine);
  });

  it('should register all layout algorithms', () => {
    const engine = createDefaultEngine();
    
    // 通过尝试布局来验证算法已注册
    const gridNode: LayoutNode = {
      id: 'test-grid',
      layoutType: 'grid',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      border: { top: 0, right: 0, bottom: 0, left: 0 },
      style: {
        layoutType: 'grid',
        gridTemplateColumns: [{ type: 'fixed', value: 100 }],
        gridTemplateRows: [{ type: 'fixed', value: 50 }],
      } as any,
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
    
    const node: LayoutNode = {
      id: 'test-grid',
      layoutType: 'grid',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      style: {
        layoutType: 'grid',
        gridTemplateColumns: [
          { type: 'fixed', value: 100 },
          { type: 'fr', value: 1 },
        ],
        gridTemplateRows: [
          { type: 'fixed', value: 50 },
        ],
      } as any,
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
    
    const node: LayoutNode = {
      id: 'test-flex',
      layoutType: 'flex',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      style: {
        layoutType: 'flex',
        flexDirection: 'row',
      },
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
    
    const node: LayoutNode = {
      id: 'test-block',
      layoutType: 'block',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      border: { top: 0, right: 0, bottom: 0, left: 0 },
      style: {
        layoutType: 'block',
      },
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
    
    const node: LayoutNode = {
      id: 'test-inline',
      layoutType: 'inline',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      border: { top: 0, right: 0, bottom: 0, left: 0 },
      style: {
        layoutType: 'inline',
      },
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
    
    const node: LayoutNode = {
      id: 'test-table',
      layoutType: 'table',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      border: { top: 0, right: 0, bottom: 0, left: 0 },
      style: {
        layoutType: 'table',
      },
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
});
