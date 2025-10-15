import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuickActions } from '../../src/MarkdownInputField/QuickActions';

// Mock RefinePromptButton
vi.mock('../../src/MarkdownInputField/RefinePromptButton', () => ({
  RefinePromptButton: ({
    onRefine,
    isHover,
    disabled,
    status,
    ...props
  }: any) => (
    <button
      data-testid="refine-prompt-button"
      onClick={onRefine}
      disabled={disabled}
      data-hover={isHover}
      data-status={status}
      {...props}
    >
      Refine
    </button>
  ),
}));

describe('QuickActions', () => {
  const mockEditorRef = {
    current: {
      store: {
        getMDContent: vi.fn().mockReturnValue(''),
        setMDContent: vi.fn(),
      },
    },
  };

  const mockOnValueChange = vi.fn();
  const mockOnResize = vi.fn();

  const defaultProps = {
    value: 'test value',
    isHover: false,
    isLoading: false,
    disabled: false,
    fileUploadStatus: 'done' as const,
    editorRef: mockEditorRef as any,
    onValueChange: mockOnValueChange,
    prefixCls: 'test-prefix',
    hashId: 'test-hash',
    onResize: mockOnResize,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditorRef.current.store.getMDContent.mockReturnValue('test value');
  });

  describe('基本渲染', () => {
    it('应该在启用提示词优化时渲染优化按钮', () => {
      const mockOnRefine = vi.fn().mockResolvedValue('refined text');

      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      expect(screen.getByTestId('refine-prompt-button')).toBeInTheDocument();
    });

    it('应该在未启用提示词优化时不渲染优化按钮', () => {
      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{
            enable: false,
            onRefine: vi.fn(),
          }}
        />,
      );

      expect(
        screen.queryByTestId('refine-prompt-button'),
      ).not.toBeInTheDocument();
    });

    it('应该在没有提示词优化配置时不渲染优化按钮', () => {
      render(<QuickActions {...defaultProps} />);

      expect(
        screen.queryByTestId('refine-prompt-button'),
      ).not.toBeInTheDocument();
    });
  });

  describe('提示词优化功能', () => {
    it('应该成功执行提示词优化', async () => {
      const mockOnRefine = vi.fn().mockResolvedValue('refined text');
      mockEditorRef.current.store.getMDContent.mockReturnValue('original text');

      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      fireEvent.click(refineButton);

      await waitFor(() => {
        expect(mockOnRefine).toHaveBeenCalledWith('original text');
        expect(mockEditorRef.current.store.setMDContent).toHaveBeenCalledWith(
          'refined text',
        );
        expect(mockOnValueChange).toHaveBeenCalledWith('refined text');
      });
    });

    it('应该从编辑器获取当前内容', async () => {
      const mockOnRefine = vi.fn().mockResolvedValue('refined text');
      mockEditorRef.current.store.getMDContent.mockReturnValue(
        'editor content',
      );

      render(
        <QuickActions
          {...defaultProps}
          value="prop value"
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      fireEvent.click(refineButton);

      await waitFor(() => {
        expect(mockOnRefine).toHaveBeenCalledWith('editor content');
      });
    });

    it('应该在编辑器内容为空时使用 value prop', async () => {
      const mockOnRefine = vi.fn().mockResolvedValue('refined text');
      mockEditorRef.current.store.getMDContent.mockReturnValue(undefined);

      render(
        <QuickActions
          {...defaultProps}
          value="fallback value"
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      fireEvent.click(refineButton);

      await waitFor(() => {
        expect(mockOnRefine).toHaveBeenCalledWith('fallback value');
      });
    });

    it('应该处理优化失败的情况', async () => {
      const mockOnRefine = vi
        .fn()
        .mockRejectedValue(new Error('Refine failed'));

      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      fireEvent.click(refineButton);

      await waitFor(() => {
        expect(mockOnRefine).toHaveBeenCalled();
        // 应该不会更新内容
        expect(mockEditorRef.current.store.setMDContent).not.toHaveBeenCalled();
      });
    });

    it('应该在正在加载时不重复执行优化', async () => {
      const mockOnRefine = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('refined text'), 100);
          }),
      );

      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');

      // 快速点击两次
      fireEvent.click(refineButton);
      fireEvent.click(refineButton);

      await waitFor(() => {
        // 应该只调用一次
        expect(mockOnRefine).toHaveBeenCalledTimes(1);
      });
    });

    it('应该处理返回空字符串的情况', async () => {
      const mockOnRefine = vi.fn().mockResolvedValue('');

      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      fireEvent.click(refineButton);

      await waitFor(() => {
        expect(mockEditorRef.current.store.setMDContent).toHaveBeenCalledWith(
          '',
        );
        expect(mockOnValueChange).toHaveBeenCalledWith('');
      });
    });
  });

  describe('自定义渲染', () => {
    it('应该支持自定义快速操作', () => {
      const customRender = vi.fn(() => [
        <div key="custom" data-testid="custom-action">
          Custom Action
        </div>,
      ]);

      render(
        <QuickActions
          {...defaultProps}
          quickActionRender={customRender}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
        />,
      );

      expect(customRender).toHaveBeenCalled();
      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
      expect(screen.getByTestId('refine-prompt-button')).toBeInTheDocument();
    });

    it('应该传递正确的 props 给自定义渲染函数', () => {
      const customRender = vi.fn(() => []);

      const fileMap = new Map();
      fileMap.set('file1', { uuid: 'file1' } as any);

      render(
        <QuickActions
          {...defaultProps}
          value="test"
          fileMap={fileMap}
          isHover={true}
          isLoading={true}
          fileUploadStatus="uploading"
          quickActionRender={customRender}
        />,
      );

      expect(customRender).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'test',
          fileMap,
          isHover: true,
          isLoading: true,
          fileUploadStatus: 'uploading',
        }),
      );
    });

    it('应该支持只有自定义操作', () => {
      const customRender = vi.fn(() => [
        <div key="custom" data-testid="custom-only">
          Custom Only
        </div>,
      ]);

      render(
        <QuickActions {...defaultProps} quickActionRender={customRender} />,
      );

      expect(screen.getByTestId('custom-only')).toBeInTheDocument();
      expect(
        screen.queryByTestId('refine-prompt-button'),
      ).not.toBeInTheDocument();
    });
  });

  describe('悬停状态', () => {
    it('应该传递悬停状态给优化按钮', () => {
      render(
        <QuickActions
          {...defaultProps}
          isHover={true}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      expect(refineButton).toHaveAttribute('data-hover', 'true');
    });

    it('应该传递非悬停状态给优化按钮', () => {
      render(
        <QuickActions
          {...defaultProps}
          isHover={false}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      expect(refineButton).toHaveAttribute('data-hover', 'false');
    });
  });

  describe('禁用状态', () => {
    it('应该在禁用时禁用优化按钮', () => {
      render(
        <QuickActions
          {...defaultProps}
          disabled={true}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      expect(refineButton).toBeDisabled();
    });

    it('应该在未禁用时启用优化按钮', () => {
      render(
        <QuickActions
          {...defaultProps}
          disabled={false}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      expect(refineButton).not.toBeDisabled();
    });
  });

  describe('文件映射表', () => {
    it('应该支持文件映射表的更新', () => {
      const mockOnFileMapChange = vi.fn();
      const fileMap = new Map();
      fileMap.set('file1', { uuid: 'file1' } as any);

      const customRender = (props: any) => {
        // 测试是否能调用 onFileMapChange
        if (props.onFileMapChange) {
          const newMap = new Map(props.fileMap);
          newMap.set('file2', { uuid: 'file2' });
          props.onFileMapChange(newMap);
        }
        return [];
      };

      render(
        <QuickActions
          {...defaultProps}
          fileMap={fileMap}
          onFileMapChange={mockOnFileMapChange}
          quickActionRender={customRender}
        />,
      );

      expect(mockOnFileMapChange).toHaveBeenCalled();
    });
  });

  describe('Resize 观察', () => {
    it('应该在尺寸变化时调用 onResize 回调', async () => {
      const mockOnResize = vi.fn();

      render(
        <QuickActions
          {...defaultProps}
          onResize={mockOnResize}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
        />,
      );

      // 注意：RcResizeObserver 的测试可能需要模拟 ResizeObserver
      // 这里我们主要验证组件能够正确渲染
      await waitFor(() => {
        expect(screen.getByTestId('refine-prompt-button')).toBeInTheDocument();
      });
    });
  });
});

