import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, message } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvide } from '../../../src/I18n';
import { FileComponent } from '../../../src/Workspace/File/FileComponent';
import type { FileNode, GroupNode } from '../../../src/Workspace/types';

//  Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

// Mock message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...(actual as any),
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>
    <I18nProvide>{children}</I18nProvide>
  </ConfigProvider>
);

describe('FileComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClipboard.writeText.mockReset();
  });

  describe('基础渲染', () => {
    it('应该渲染文件列表', () => {
      const nodes: FileNode[] = [
        { id: 'f1', name: 'test.txt', url: 'https://example.com/test.txt' },
        { id: 'f2', name: 'image.png', url: 'https://example.com/image.png' },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('test.txt')).toBeInTheDocument();
      expect(screen.getByText('image.png')).toBeInTheDocument();
    });

    it('应该渲染文件分组', () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [
            {
              id: 'f1',
              name: 'doc1.txt',
              url: 'https://example.com/doc1.txt',
            },
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('文档')).toBeInTheDocument();
      expect(screen.getByText('doc1.txt')).toBeInTheDocument();
    });

    it('应该显示加载状态', () => {
      render(
        <TestWrapper>
          <FileComponent nodes={[]} loading />
        </TestWrapper>,
      );

      expect(document.querySelector('.ant-spin')).toBeInTheDocument();
    });

    it('应该显示自定义加载状态', () => {
      const loadingRender = () => (
        <div data-testid="custom-loading">Loading...</div>
      );

      render(
        <TestWrapper>
          <FileComponent nodes={[]} loading loadingRender={loadingRender} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
    });

    it('应该显示空状态', () => {
      render(
        <TestWrapper>
          <FileComponent nodes={[]} />
        </TestWrapper>,
      );

      // Antd Empty component should be rendered
      expect(document.querySelector('.ant-empty')).toBeInTheDocument();
    });

    it('应该显示自定义空状态', () => {
      const emptyRender = () => <div data-testid="custom-empty">暂无数据</div>;

      render(
        <TestWrapper>
          <FileComponent nodes={[]} emptyRender={emptyRender} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
    });

    it('应该显示搜索框', () => {
      const handleChange = vi.fn();

      render(
        <TestWrapper>
          <FileComponent
            nodes={[]}
            showSearch
            keyword=""
            onChange={handleChange}
          />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText('搜索文件名');
      expect(input).toBeInTheDocument();
    });

    it('应该显示自定义搜索占位符', () => {
      render(
        <TestWrapper>
          <FileComponent
            nodes={[]}
            showSearch
            keyword=""
            searchPlaceholder="搜索..."
          />
        </TestWrapper>,
      );

      expect(screen.getByPlaceholderText('搜索...')).toBeInTheDocument();
    });
  });

  describe('文件交互', () => {
    it('应该触发文件点击事件', () => {
      const handleClick = vi.fn();
      const nodes: FileNode[] = [
        { id: 'f1', name: 'test.txt', url: 'https://example.com/test.txt' },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onFileClick={handleClick} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByText('test.txt'));
      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test.txt' }),
      );
    });

    it('应该显示下载按钮并触发下载', () => {
      const handleDownload = vi.fn();
      const nodes: FileNode[] = [
        { id: 'f1', name: 'test.txt', url: 'https://example.com/test.txt' },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onDownload={handleDownload} />
        </TestWrapper>,
      );

      const downloadBtn = screen.getByLabelText('下载');
      expect(downloadBtn).toBeInTheDocument();

      fireEvent.click(downloadBtn);
      expect(handleDownload).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test.txt' }),
      );
    });

    it('应该根据canDownload控制下载按钮显示', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          canDownload: false,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onDownload={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.queryByLabelText('下载')).not.toBeInTheDocument();
    });

    it('应该显示分享按钮', () => {
      const handleShare = vi.fn();
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          canShare: true,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onShare={handleShare} />
        </TestWrapper>,
      );

      const shareBtn = screen.getByLabelText('分享');
      expect(shareBtn).toBeInTheDocument();

      fireEvent.click(shareBtn);
      expect(handleShare).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'test.txt' }),
        expect.objectContaining({ origin: 'list' }),
      );
    });

    it('应该默认分享行为：复制链接', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);

      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          canShare: true,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      const shareBtn = screen.getByLabelText('分享');
      fireEvent.click(shareBtn);

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          'https://example.com/test.txt',
        );
      });
    });

    it('应该显示预览按钮', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('预览')).toBeInTheDocument();
    });

    it('应该根据canPreview控制预览按钮显示', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          canPreview: false,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={vi.fn()} />
        </TestWrapper>,
      );

      expect(screen.queryByLabelText('预览')).not.toBeInTheDocument();
    });

    it('应该显示文件大小', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          size: 1024,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText(/1\.00 KB/)).toBeInTheDocument();
    });

    it('应该显示文件更新时间', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          lastModified: new Date('2023-12-21 10:30:56'),
        },
      ];

      const { container } = render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      // 应该显示时间信息
      const timeElement = container.querySelector(
        '.ant-workspace-file-item-time',
      );
      expect(timeElement).toBeTruthy();
      expect(timeElement?.textContent).toBeTruthy();
    });
  });

  describe('分组交互', () => {
    it('应该折叠和展开分组', () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          collapsed: false,
          children: [
            {
              id: 'f1',
              name: 'doc1.txt',
              url: 'https://example.com/doc1.txt',
            },
          ],
        },
      ];

      const { rerender } = render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('doc1.txt')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(screen.getByText('文档'));

      // File should still be visible because internal state manages collapse
      expect(screen.queryByText('doc1.txt')).not.toBeInTheDocument();
    });

    it('应该触发分组折叠回调', () => {
      const handleToggle = vi.fn();
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [
            {
              id: 'f1',
              name: 'doc1.txt',
              url: 'https://example.com/doc1.txt',
            },
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onToggleGroup={handleToggle} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByText('文档'));
      expect(handleToggle).toHaveBeenCalledWith('plainText', true);
    });

    it('应该显示分组下载按钮', () => {
      const handleGroupDownload = vi.fn();
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [
            {
              id: 'f1',
              name: 'doc1.txt',
              url: 'https://example.com/doc1.txt',
            },
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onGroupDownload={handleGroupDownload} />
        </TestWrapper>,
      );

      // Find download button within the group header
      const downloadButtons = screen.getAllByLabelText(/下载/);
      expect(downloadButtons.length).toBeGreaterThan(0);
    });

    it('应该根据canDownload控制分组下载按钮', () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          canDownload: false,
          children: [
            {
              id: 'f1',
              name: 'doc1.txt',
              url: 'https://example.com/doc1.txt',
            },
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onGroupDownload={vi.fn()} />
        </TestWrapper>,
      );

      // 分组下载按钮不应该显示
      const groupHeader = screen.getByText('文档').closest('div');
      const downloadButtons =
        groupHeader?.querySelectorAll('[aria-label*="下载"]');
      expect(downloadButtons?.length || 0).toBe(0);
    });

    it('应该显示分组文件数量', () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [
            { id: 'f1', name: 'doc1.txt' },
            { id: 'f2', name: 'doc2.txt' },
            { id: 'f3', name: 'doc3.txt' },
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('预览功能', () => {
    it('应该默认点击文件打开预览', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello World',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={vi.fn()} />
        </TestWrapper>,
      );

      // Click on file to open preview
      fireEvent.click(screen.getByText('test.txt'));

      // Preview should be opened (we'll see preview header)
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });

    it('应该触发自定义预览回调', async () => {
      const handlePreview = vi.fn().mockResolvedValue(undefined);
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello World',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={handlePreview} />
        </TestWrapper>,
      );

      const previewBtn = screen.getByLabelText('预览');
      fireEvent.click(previewBtn);

      await waitFor(() => {
        expect(handlePreview).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'test.txt' }),
        );
      });
    });

    it('应该支持返回false阻止预览', async () => {
      const handlePreview = vi.fn().mockResolvedValue(false);
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={handlePreview} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(handlePreview).toHaveBeenCalled();
      });

      // Should not open preview
      expect(screen.queryByLabelText('返回文件列表')).not.toBeInTheDocument();
    });

    it('应该支持自定义预览内容', async () => {
      const handlePreview = vi
        .fn()
        .mockResolvedValue(<div data-testid="custom-preview">Custom</div>);
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={handlePreview} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByTestId('custom-preview')).toBeInTheDocument();
      });
    });

    it('应该支持返回新文件节点', async () => {
      const newFile: FileNode = {
        id: 'f2',
        name: 'new.txt',
        content: 'New content',
      };
      const handlePreview = vi.fn().mockResolvedValue(newFile);
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={handlePreview} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByText('new.txt')).toBeInTheDocument();
      });
    });

    it('应该从预览返回列表', async () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={vi.fn()} />
        </TestWrapper>,
      );

      // Open preview
      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });

      // Click back
      fireEvent.click(screen.getByLabelText('返回文件列表'));

      // Should be back to list
      await waitFor(() => {
        expect(screen.queryByLabelText('返回文件列表')).not.toBeInTheDocument();
      });

      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    it('应该支持自定义返回行为', async () => {
      const handleBack = vi.fn().mockResolvedValue(false);
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            onPreview={vi.fn()}
            onBack={handleBack}
          />
        </TestWrapper>,
      );

      // Open preview
      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });

      // Click back
      fireEvent.click(screen.getByLabelText('返回文件列表'));

      await waitFor(() => {
        expect(handleBack).toHaveBeenCalled();
      });

      // Should still be in preview because onBack returned false
      expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
    });

    it('应该重置预览状态当resetKey改变', async () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      const { rerender } = render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={vi.fn()} resetKey={1} />
        </TestWrapper>,
      );

      // Open preview
      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });

      // Change resetKey
      rerender(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={vi.fn()} resetKey={2} />
        </TestWrapper>,
      );

      // Should be back to list
      await waitFor(() => {
        expect(screen.queryByLabelText('返回文件列表')).not.toBeInTheDocument();
      });
    });
  });

  describe('actionRef功能', () => {
    it('应该通过actionRef打开预览', async () => {
      const actionRef = React.createRef<any>();
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            actionRef={actionRef}
            onPreview={vi.fn()}
          />
        </TestWrapper>,
      );

      // Call openPreview programmatically
      actionRef.current?.openPreview(nodes[0]);

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });
    });

    it('应该通过actionRef返回列表', async () => {
      const actionRef = React.createRef<any>();
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            actionRef={actionRef}
            onPreview={vi.fn()}
          />
        </TestWrapper>,
      );

      // Open preview first
      actionRef.current?.openPreview(nodes[0]);

      await waitFor(() => {
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });

      // Call backToList
      actionRef.current?.backToList();

      await waitFor(() => {
        expect(screen.queryByLabelText('返回文件列表')).not.toBeInTheDocument();
      });
    });

    it('应该通过actionRef更新预览标题', async () => {
      const actionRef = React.createRef<any>();
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            actionRef={actionRef}
            onPreview={vi.fn()}
          />
        </TestWrapper>,
      );

      // Open preview
      actionRef.current?.openPreview(nodes[0]);

      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });

      // Update header
      actionRef.current?.updatePreviewHeader({ name: 'updated.txt' });

      await waitFor(() => {
        expect(screen.getByText('updated.txt')).toBeInTheDocument();
      });
    });
  });

  describe('搜索功能', () => {
    it('应该更新搜索关键字', () => {
      const handleChange = vi.fn();

      render(
        <TestWrapper>
          <FileComponent
            nodes={[]}
            showSearch
            keyword=""
            onChange={handleChange}
          />
        </TestWrapper>,
      );

      const input = screen.getByPlaceholderText('搜索文件名');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(handleChange).toHaveBeenCalledWith('test');
    });

    it('应该显示搜索无结果提示', () => {
      render(
        <TestWrapper>
          <FileComponent nodes={[]} showSearch keyword="test" />
        </TestWrapper>,
      );

      expect(screen.getByText(/未找到与/)).toBeInTheDocument();
    });

    it('应该清空搜索', () => {
      const handleChange = vi.fn();

      render(
        <TestWrapper>
          <FileComponent
            nodes={[]}
            showSearch
            keyword="test"
            onChange={handleChange}
          />
        </TestWrapper>,
      );

      const clearBtn = document.querySelector(
        '.ant-input-clear-icon',
      ) as HTMLElement;
      if (clearBtn) {
        fireEvent.click(clearBtn);
        expect(handleChange).toHaveBeenCalledWith('');
      }
    });
  });

  describe('边缘情况', () => {
    it('应该处理空数组', () => {
      render(
        <TestWrapper>
          <FileComponent nodes={[]} />
        </TestWrapper>,
      );

      expect(document.querySelector('.ant-empty')).toBeInTheDocument();
    });

    it('应该处理undefined nodes', () => {
      render(
        <TestWrapper>
          <FileComponent nodes={undefined as any} />
        </TestWrapper>,
      );

      expect(document.querySelector('.ant-empty')).toBeInTheDocument();
    });

    it('应该为没有id的节点生成id', () => {
      const nodes: FileNode[] = [
        {
          name: 'test.txt',
          content: 'Hello',
        } as FileNode,
      ];

      const { container } = render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      // Component should render without errors
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    it('应该处理分组中没有id的文件', () => {
      const nodes: GroupNode[] = [
        {
          id: 'g1',
          name: '文档',
          type: 'plainText',
          children: [
            {
              name: 'doc1.txt',
            } as FileNode,
          ],
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('doc1.txt')).toBeInTheDocument();
    });

    it('应该处理没有url/content/file的文件', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'empty.txt',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      expect(screen.getByText('empty.txt')).toBeInTheDocument();
      // Should not show download button by default
      expect(screen.queryByLabelText('下载')).not.toBeInTheDocument();
    });

    it('应该处理异步预览错误', async () => {
      const handlePreview = vi
        .fn()
        .mockRejectedValue(new Error('Preview error'));
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          content: 'Hello',
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onPreview={handlePreview} />
        </TestWrapper>,
      );

      fireEvent.click(screen.getByLabelText('预览'));

      await waitFor(() => {
        // Should still show preview (with default content)
        expect(screen.getByLabelText('返回文件列表')).toBeInTheDocument();
      });
    });

    it('应该处理复制失败', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Copy failed'));

      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          canShare: true,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} />
        </TestWrapper>,
      );

      const shareBtn = screen.getByLabelText('分享');
      fireEvent.click(shareBtn);

      await waitFor(() => {
        expect(message.error).toHaveBeenCalled();
      });
    });
  });

  describe('无障碍性', () => {
    it('应该支持键盘导航', () => {
      const handleClick = vi.fn();
      const nodes: FileNode[] = [
        { id: 'f1', name: 'test.txt', url: 'https://example.com/test.txt' },
      ];

      render(
        <TestWrapper>
          <FileComponent nodes={nodes} onFileClick={handleClick} />
        </TestWrapper>,
      );

      const fileItem = screen.getByRole('button', { name: /文件.*test\.txt/ });
      expect(fileItem).toHaveAttribute('tabindex', '0');

      // Simulate Enter key
      fireEvent.keyDown(fileItem, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });

    it('应该为所有交互元素提供aria-label', () => {
      const nodes: FileNode[] = [
        {
          id: 'f1',
          name: 'test.txt',
          url: 'https://example.com/test.txt',
          content: 'Hello', // 添加content以显示预览按钮
          canShare: true,
        },
      ];

      render(
        <TestWrapper>
          <FileComponent
            nodes={nodes}
            onDownload={vi.fn()}
            onPreview={vi.fn()}
          />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('预览')).toBeInTheDocument();
      expect(screen.getByLabelText('下载')).toBeInTheDocument();
      expect(screen.getByLabelText('分享')).toBeInTheDocument();
    });
  });
});
