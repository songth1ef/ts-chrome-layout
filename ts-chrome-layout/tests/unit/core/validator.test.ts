/**
 * LayoutValidator 测试
 */

import { LayoutValidator } from '../../../src/core/validator';
import { LayoutNode, LayoutResult } from '../../../src/types/common/layout-node';
import { LayoutError } from '../../../src/core/layout-context';

describe('LayoutValidator', () => {
  describe('validateNode', () => {
    it('应该在节点没有 id 时抛出错误', () => {
      const node: LayoutNode = {
        id: '',
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
        children: [],
      };
      
      expect(() => {
        LayoutValidator.validateNode(node);
      }).toThrow(LayoutError);
    });

    it('应该验证有效的节点', () => {
      const node: LayoutNode = {
        id: 'valid-node',
        layoutType: 'grid',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        contentWidth: 100,
        contentHeight: 100,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        border: { top: 0, right: 0, bottom: 0, left: 0 },
        children: [],
      };
      
      expect(() => {
        LayoutValidator.validateNode(node);
      }).not.toThrow();
    });
  });

  describe('validateLayoutResult', () => {
    it('应该验证布局结果', () => {
      const result: LayoutResult = {
        width: 100,
        height: 100,
        children: [],
      };
      
      expect(() => {
        LayoutValidator.validateLayoutResult(result);
      }).not.toThrow();
    });

    it('应该在结果无效时抛出错误', () => {
      const result: LayoutResult = {
        width: -1,
        height: 100,
        children: [],
      };
      
      expect(() => {
        LayoutValidator.validateLayoutResult(result);
      }).toThrow(LayoutError);
    });
  });
});

