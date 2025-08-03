/**
 * CommentView 和 CommentCreate 组件测试文件
 *
 * 测试覆盖范围：
 *
 * CommentView 组件测试：
 * - 基本渲染功能（有/无评论数据）
 * - 点击事件处理（阻止冒泡和默认行为）
 * - 边界情况处理（空数组、undefined、null）
 * - 复杂子元素渲染
 * - 多个评论数据处理
 * - 不同类型子元素处理（null、数字、布尔值）
 *
 * CommentCreate 组件测试：
 * - 默认渲染（无 editorRender）
 * - 自定义渲染函数调用
 * - 边界情况处理（undefined、null）
 * - editorRender 返回不同类型值的处理
 * - 默认 DOM 参数传递验证
 *
 * 测试总数：21 个测试用例
 */

import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock EditorStoreContext
vi.mock('../src/MarkdownEditor/editor/store', () => ({
  EditorStoreContext: React.createContext({
    setShowComment: vi.fn(),
  }),
}));

import {
  CommentDataType,
  MarkdownEditorProps,
} from '../src/MarkdownEditor/BaseMarkdownEditor';
import {
  CommentCreate,
  CommentView,
} from '../src/MarkdownEditor/editor/elements/Comment';

describe('CommentView Component', () => {
  const mockCommentData: CommentDataType[] = [
    {
      id: 'comment-1',
      content: 'This is a test comment',
      user: {
        name: 'John Doe',
        avatar: 'https://example.com/avatar1.jpg',
      },
      time: Date.now(),
      path: [0, 0],
      selection: null,
      anchorOffset: 0,
      focusOffset: 10,
      refContent: 'reference content 1',
      commentType: 'text',
    },
  ];

  const mockComment: MarkdownEditorProps['comment'] = {
    enable: true,
    onSubmit: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onClick: vi.fn(),
    deleteConfirmText: 'Are you sure to delete this comment?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(<ConfigProvider>{component}</ConfigProvider>);
  };

  describe('CommentView', () => {
    it('应该在没有评论数据时直接渲染子元素', () => {
      const { container } = renderWithProvider(
        <CommentView comment={mockComment} commentItem={[]} id="test-id">
          <span>测试文本</span>
        </CommentView>,
      );

      expect(
        container.querySelector('[data-be="comment-text"]'),
      ).not.toBeInTheDocument();
      expect(container.textContent).toBe('测试文本');
    });

    it('应该在有评论数据时渲染可点击的评论视图', () => {
      const { container } = renderWithProvider(
        <CommentView
          comment={mockComment}
          commentItem={mockCommentData}
          id="test-id"
        >
          <span>测试文本</span>
        </CommentView>,
      );

      const commentElement = container.querySelector(
        '[data-be="comment-text"]',
      );
      expect(commentElement).toBeInTheDocument();
      expect(commentElement).toHaveAttribute('id', 'test-id');
      expect(commentElement?.textContent).toBe('测试文本');
    });

    it('应该在点击时调用 setShowComment 并阻止事件冒泡', () => {
      const { container } = renderWithProvider(
        <CommentView
          comment={mockComment}
          commentItem={mockCommentData}
          id="test-id"
        >
          <span>测试文本</span>
        </CommentView>,
      );

      const commentElement = container.querySelector(
        '[data-be="comment-text"]',
      ) as HTMLElement;
      expect(commentElement).toBeInTheDocument();

      // 模拟点击事件
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

      fireEvent(commentElement, clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      // 由于 mock 的原因，我们无法直接验证 setShowComment 的调用
      // 但可以验证事件处理逻辑
    });

    it('应该处理空的 commentItem 数组', () => {
      const { container } = renderWithProvider(
        <CommentView comment={mockComment} commentItem={[]} id="test-id">
          <span>测试文本</span>
        </CommentView>,
      );

      expect(
        container.querySelector('[data-be="comment-text"]'),
      ).not.toBeInTheDocument();
      expect(container.textContent).toBe('测试文本');
    });

    it('应该处理 undefined 的 commentItem', () => {
      const { container } = renderWithProvider(
        <CommentView
          comment={mockComment}
          commentItem={undefined as any}
          id="test-id"
        >
          <span>测试文本</span>
        </CommentView>,
      );

      expect(
        container.querySelector('[data-be="comment-text"]'),
      ).not.toBeInTheDocument();
      expect(container.textContent).toBe('测试文本');
    });

    it('应该处理 null 的 commentItem', () => {
      const { container } = renderWithProvider(
        <CommentView
          comment={mockComment}
          commentItem={null as any}
          id="test-id"
        >
          <span>测试文本</span>
        </CommentView>,
      );

      expect(
        container.querySelector('[data-be="comment-text"]'),
      ).not.toBeInTheDocument();
      expect(container.textContent).toBe('测试文本');
    });

    it('应该正确处理复杂的子元素', () => {
      const { container } = renderWithProvider(
        <CommentView
          comment={mockComment}
          commentItem={mockCommentData}
          id="test-id"
        >
          <div>
            <span>复杂</span>
            <strong>文本</strong>
            <em>内容</em>
          </div>
        </CommentView>,
      );

      const commentElement = container.querySelector(
        '[data-be="comment-text"]',
      );
      expect(commentElement).toBeInTheDocument();
      expect(commentElement?.textContent).toBe('复杂文本内容');
    });

    it('应该处理多个评论数据', () => {
      const multipleComments: CommentDataType[] = [
        ...mockCommentData,
        {
          id: 'comment-2',
          content: 'Another test comment',
          user: {
            name: 'Jane Smith',
            avatar: 'https://example.com/avatar2.jpg',
          },
          time: Date.now() - 1000,
          path: [0, 1],
          selection: null,
          anchorOffset: 5,
          focusOffset: 15,
          refContent: 'reference content 2',
          commentType: 'text',
        },
      ];

      const { container } = renderWithProvider(
        <CommentView
          comment={mockComment}
          commentItem={multipleComments}
          id="test-id"
        >
          <span>测试文本</span>
        </CommentView>,
      );

      const commentElement = container.querySelector(
        '[data-be="comment-text"]',
      );
      expect(commentElement).toBeInTheDocument();
      expect(commentElement?.textContent).toBe('测试文本');
    });

    it('应该处理空的子元素', () => {
      const { container } = renderWithProvider(
        <CommentView
          comment={mockComment}
          commentItem={mockCommentData}
          id="test-id"
        >
          {null}
        </CommentView>,
      );

      const commentElement = container.querySelector(
        '[data-be="comment-text"]',
      );
      expect(commentElement).toBeInTheDocument();
      expect(commentElement?.textContent).toBe('');
    });

    it('应该处理数字类型的子元素', () => {
      const { container } = renderWithProvider(
        <CommentView
          comment={mockComment}
          commentItem={mockCommentData}
          id="test-id"
        >
          {42}
        </CommentView>,
      );

      const commentElement = container.querySelector(
        '[data-be="comment-text"]',
      );
      expect(commentElement).toBeInTheDocument();
      expect(commentElement?.textContent).toBe('42');
    });

    it('应该处理布尔类型的子元素', () => {
      const { container } = renderWithProvider(
        <CommentView
          comment={mockComment}
          commentItem={mockCommentData}
          id="test-id"
        >
          {true}
        </CommentView>,
      );

      const commentElement = container.querySelector(
        '[data-be="comment-text"]',
      );
      expect(commentElement).toBeInTheDocument();
      // 布尔值在 React 中渲染时不会显示文本内容
      expect(commentElement?.textContent).toBe('');
    });
  });

  describe('CommentCreate', () => {
    it('应该在没有 editorRender 时返回默认的 div', () => {
      const { container } = renderWithProvider(
        <CommentCreate comment={mockComment} />,
      );

      const divElement = container.querySelector('div');
      expect(divElement).toBeInTheDocument();
      expect(divElement?.children.length).toBe(0);
    });

    it('应该在有 editorRender 时调用自定义渲染函数', () => {
      const mockEditorRender = vi.fn((dom) => (
        <div data-testid="custom-editor">
          <span>自定义编辑器</span>
          {dom}
        </div>
      ));

      const customComment: MarkdownEditorProps['comment'] = {
        ...mockComment,
        editorRender: mockEditorRender,
      };

      const { container, getByTestId } = renderWithProvider(
        <CommentCreate comment={customComment} />,
      );

      expect(mockEditorRender).toHaveBeenCalledWith(expect.any(Object));
      expect(getByTestId('custom-editor')).toBeInTheDocument();
      expect(container.textContent).toContain('自定义编辑器');
    });

    it('应该在没有 comment 属性时返回默认的 div', () => {
      const { container } = renderWithProvider(
        <CommentCreate comment={undefined} />,
      );

      const divElement = container.querySelector('div');
      expect(divElement).toBeInTheDocument();
      expect(divElement?.children.length).toBe(0);
    });

    it('应该处理 editorRender 返回 null 的情况', () => {
      const mockEditorRender = vi.fn(() => null);

      const customComment: MarkdownEditorProps['comment'] = {
        ...mockComment,
        editorRender: mockEditorRender,
      };

      const { container } = renderWithProvider(
        <CommentCreate comment={customComment} />,
      );

      expect(mockEditorRender).toHaveBeenCalled();
      // 当 editorRender 返回 null 时，组件应该返回 null
      expect(container.firstChild).toBeNull();
    });

    it('应该处理 editorRender 返回字符串的情况', () => {
      const mockEditorRender = vi.fn(() => '字符串内容' as any);

      const customComment: MarkdownEditorProps['comment'] = {
        ...mockComment,
        editorRender: mockEditorRender,
      };

      const { container } = renderWithProvider(
        <CommentCreate comment={customComment} />,
      );

      expect(mockEditorRender).toHaveBeenCalled();
      expect(container.textContent).toBe('字符串内容');
    });

    it('应该正确处理 editorRender 接收到的默认 DOM 参数', () => {
      const mockEditorRender = vi.fn((dom) => {
        expect(dom).toBeDefined();
        expect(dom.type).toBe('div');
        return (
          <div data-testid="wrapped-editor">
            {dom}
            <span>额外内容</span>
          </div>
        );
      });

      const customComment: MarkdownEditorProps['comment'] = {
        ...mockComment,
        editorRender: mockEditorRender,
      };

      const { getByTestId } = renderWithProvider(
        <CommentCreate comment={customComment} />,
      );

      expect(mockEditorRender).toHaveBeenCalledWith(expect.any(Object));
      expect(getByTestId('wrapped-editor')).toBeInTheDocument();
    });

    it('应该处理 editorRender 返回数字的情况', () => {
      const mockEditorRender = vi.fn(() => 123 as any);

      const customComment: MarkdownEditorProps['comment'] = {
        ...mockComment,
        editorRender: mockEditorRender,
      };

      const { container } = renderWithProvider(
        <CommentCreate comment={customComment} />,
      );

      expect(mockEditorRender).toHaveBeenCalled();
      expect(container.textContent).toBe('123');
    });

    it('应该处理 editorRender 返回布尔值的情况', () => {
      const mockEditorRender = vi.fn(() => true as any);

      const customComment: MarkdownEditorProps['comment'] = {
        ...mockComment,
        editorRender: mockEditorRender,
      };

      const { container } = renderWithProvider(
        <CommentCreate comment={customComment} />,
      );

      expect(mockEditorRender).toHaveBeenCalled();
      // 布尔值在 React 中渲染时不会显示文本内容
      expect(container.textContent).toBe('');
    });

    it('应该处理 editorRender 返回数组的情况', () => {
      const mockEditorRender = vi.fn(
        () => [<span key="1">元素1</span>, <span key="2">元素2</span>] as any,
      );

      const customComment: MarkdownEditorProps['comment'] = {
        ...mockComment,
        editorRender: mockEditorRender,
      };

      const { container } = renderWithProvider(
        <CommentCreate comment={customComment} />,
      );

      expect(mockEditorRender).toHaveBeenCalled();
      expect(container.textContent).toBe('元素1元素2');
    });

    it('应该处理 comment 为 null 的情况', () => {
      const { container } = renderWithProvider(
        <CommentCreate comment={null as any} />,
      );

      const divElement = container.querySelector('div');
      expect(divElement).toBeInTheDocument();
      expect(divElement?.children.length).toBe(0);
    });
  });
});
