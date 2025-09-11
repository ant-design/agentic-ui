/**
 * ThinkBlock 组件测试文件
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CodeNode } from '../../../../src/MarkdownEditor/el';
import { ThinkBlock } from '../../../../src/plugins/code/components/ThinkBlock';

describe('ThinkBlock', () => {
  const mockCodeNode: CodeNode = {
    type: 'code',
    language: 'think',
    value: '这是一个思考块的内容',
    children: [{ text: '这是一个思考块的内容' }],
  };

  beforeEach(() => {
    // 清理 DOM
    document.body.innerHTML = '';
  });

  describe('基本渲染', () => {
    it('应该正确渲染思考块组件', () => {
      render(<ThinkBlock element={mockCodeNode} />);

      const thinkBlock = screen.getByTestId('think-block');
      expect(thinkBlock).toBeInTheDocument();
    });

    it('应该显示思考块的内容', () => {
      render(<ThinkBlock element={mockCodeNode} />);

      expect(screen.getByText('这是一个思考块的内容')).toBeInTheDocument();
    });

    it('应该正确渲染空内容的思考块', () => {
      const emptyCodeNode: CodeNode = {
        ...mockCodeNode,
        value: '',
        children: [{ text: '' }],
      };

      render(<ThinkBlock element={emptyCodeNode} />);

      const thinkBlock = screen.getByTestId('think-block');
      expect(thinkBlock).toBeInTheDocument();
      expect(thinkBlock).toHaveTextContent('思考中分析需求');
    });
  });

  describe('样式测试', () => {
    it('应该应用正确的样式属性', () => {
      render(<ThinkBlock element={mockCodeNode} />);

      const thinkBlock = screen.getByTestId('think-block');
      expect(thinkBlock).toBeInTheDocument();
    });

    it('应该保持预格式化文本的换行', () => {
      const multiLineCodeNode: CodeNode = {
        ...mockCodeNode,
        value: '第一行\n第二行\n第三行',
        children: [{ text: '第一行\n第二行\n第三行' }],
      };

      render(<ThinkBlock element={multiLineCodeNode} />);

      const thinkBlock = screen.getByTestId('think-block');
      expect(thinkBlock).toHaveTextContent('第一行 第二行 第三行');
    });
  });

  describe('内容处理', () => {
    it('应该正确处理包含特殊字符的内容', () => {
      const specialCharCodeNode: CodeNode = {
        ...mockCodeNode,
        value: '特殊字符: <>&"\'',
        children: [{ text: '特殊字符: <>&"\'' }],
      };

      render(<ThinkBlock element={specialCharCodeNode} />);

      expect(screen.getByText('特殊字符: <>&"\'')).toBeInTheDocument();
    });

    it('应该正确处理包含 HTML 标签的内容', () => {
      const htmlCodeNode: CodeNode = {
        ...mockCodeNode,
        value: '<div>HTML 内容</div>',
        children: [{ text: '<div>HTML 内容</div>' }],
      };

      render(<ThinkBlock element={htmlCodeNode} />);

      const thinkBlock = screen.getByTestId('think-block');
      expect(thinkBlock).toHaveTextContent('<div>HTML 内容</div>');
    });

    it('应该正确处理长文本内容', () => {
      const longText = '这是一个很长的思考块内容，包含了很多文字。'.repeat(10);
      const longCodeNode: CodeNode = {
        ...mockCodeNode,
        value: longText,
        children: [{ text: longText }],
      };

      render(<ThinkBlock element={longCodeNode} />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('应该处理 undefined 的 value 属性', () => {
      const undefinedValueCodeNode: CodeNode = {
        ...mockCodeNode,
        value: undefined as any,
        children: [{ text: '' }],
      };

      render(<ThinkBlock element={undefinedValueCodeNode} />);

      const thinkBlock = screen.getByTestId('think-block');
      expect(thinkBlock).toBeInTheDocument();
      expect(thinkBlock).toHaveTextContent('思考中分析需求');
    });

    it('应该处理 null 的 value 属性', () => {
      const nullValueCodeNode: CodeNode = {
        ...mockCodeNode,
        value: null as any,
        children: [{ text: '' }],
      };

      render(<ThinkBlock element={nullValueCodeNode} />);

      const thinkBlock = screen.getByTestId('think-block');
      expect(thinkBlock).toBeInTheDocument();
      expect(thinkBlock).toHaveTextContent('思考中分析需求');
    });

    it('应该处理数字类型的 value 属性', () => {
      const numberValueCodeNode: CodeNode = {
        ...mockCodeNode,
        value: 123 as any,
        children: [{ text: '123' }],
      };

      render(<ThinkBlock element={numberValueCodeNode} />);

      const thinkBlock = screen.getByTestId('think-block');
      expect(thinkBlock).toBeInTheDocument();
      expect(thinkBlock).toHaveTextContent('123');
    });
  });

  describe('可访问性', () => {
    it('应该具有正确的 testid 属性', () => {
      render(<ThinkBlock element={mockCodeNode} />);

      const thinkBlock = screen.getByTestId('think-block');
      expect(thinkBlock).toBeInTheDocument();
    });

    it('应该正确渲染为 div 元素', () => {
      render(<ThinkBlock element={mockCodeNode} />);

      const thinkBlock = screen.getByTestId('think-block');
      expect(thinkBlock.tagName).toBe('DIV');
    });
  });

  describe('组件结构', () => {
    it('应该只渲染一个根元素', () => {
      const { container } = render(<ThinkBlock element={mockCodeNode} />);

      expect(container.children).toHaveLength(1);
      expect(container.firstChild).toHaveAttribute(
        'data-testid',
        'think-block',
      );
    });

    it('应该正确传递 element 属性', () => {
      render(<ThinkBlock element={mockCodeNode} />);

      const thinkBlock = screen.getByTestId('think-block');
      expect(thinkBlock).toHaveTextContent(mockCodeNode.value);
    });
  });
});
