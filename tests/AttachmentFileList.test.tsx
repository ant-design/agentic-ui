import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock LoadingIcon
vi.mock('../src/icons/LoadingIcon', () => ({
  LoadingIcon: ({ style, ...props }: any) => (
    <div data-testid="loading-icon" style={style} {...props}>
      Loading...
    </div>
  ),
}));

import {
  AttachmentFile,
  AttachmentFileList,
  kbToSize,
} from '@ant-design/md-editor';

describe('kbToSize utility function', () => {
  it('should convert KB to readable format', () => {
    expect(kbToSize(1024)).toBe('1 MB');
    expect(kbToSize(1024 * 1024)).toBe('1 GB');
    expect(kbToSize(512)).toBe('512 KB');
    expect(kbToSize(1536)).toBe('1.5 MB');
  });

  it('should handle small values', () => {
    expect(kbToSize(1)).toBe('1 KB');
    // For values < 1, the result may be different due to log calculation
    expect(kbToSize(100)).toBe('100 KB');
  });

  it('should handle large values', () => {
    expect(kbToSize(1024 * 1024 * 1024)).toBe('1 TB');
  });
});

describe('AttachmentFileList', () => {
  const mockOnDelete = vi.fn();
  const mockOnPreview = vi.fn();
  const mockOnDownload = vi.fn();
  const mockOnClearFileMap = vi.fn();

  const createMockFile = (
    overrides: Partial<AttachmentFile> = {},
  ): AttachmentFile => {
    const fileName = overrides.name || 'test.txt';
    const fileType = overrides.type || 'text/plain';

    // Create a simple mock object with just the properties we need
    const mockFile = {
      // Basic File properties
      name: fileName,
      type: fileType,
      size: 1024,
      lastModified: Date.now(),
      webkitRelativePath: '',

      // Additional AttachmentFile properties
      uuid: overrides.uuid || 'test-uuid',
      status: overrides.status || 'done',
      url: overrides.url || 'http://example.com/test.txt',
      previewUrl: overrides.previewUrl || 'http://example.com/preview.txt',

      // Copy over any additional overrides (excluding name and type to avoid duplicates)
      ...Object.fromEntries(
        Object.entries(overrides).filter(
          ([key]) => key !== 'name' && key !== 'type',
        ),
      ),
    };

    return mockFile as AttachmentFile;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty list when no files provided', () => {
    const { container } = render(
      <AttachmentFileList
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    expect(
      container.querySelector('.ant-md-editor-attachment-list'),
    ).toHaveStyle({ height: '0px' });
  });

  it('should render empty list when fileMap is empty', () => {
    const { container } = render(
      <AttachmentFileList
        fileMap={new Map()}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    expect(
      container.querySelector('.ant-md-editor-attachment-list'),
    ).toHaveStyle({ height: '0px' });
  });

  it('should render file list when files are provided', () => {
    const fileMap = new Map();
    const file1 = createMockFile({ name: 'file1.txt', uuid: 'uuid1' });
    const file2 = createMockFile({ name: 'file2.txt', uuid: 'uuid2' });

    fileMap.set('uuid1', file1);
    fileMap.set('uuid2', file2);

    render(
      <AttachmentFileList
        fileMap={fileMap}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    expect(screen.getByText('file1')).toBeInTheDocument();
    expect(screen.getByText('file2')).toBeInTheDocument();
  });

  it('should show clear all button when all files are done', () => {
    const fileMap = new Map();
    const file = createMockFile({ name: 'test.txt', status: 'done' });
    fileMap.set('uuid1', file);

    render(
      <AttachmentFileList
        fileMap={fileMap}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
        onClearFileMap={mockOnClearFileMap}
      />,
    );

    // 通过类名查找清除按钮
    const clearButton = document.querySelector(
      '.ant-md-editor-attachment-list-close-icon',
    );
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear all button when files are uploading', () => {
    const fileMap = new Map();
    const file = createMockFile({ name: 'test.txt', status: 'uploading' });
    fileMap.set('uuid1', file);

    render(
      <AttachmentFileList
        fileMap={fileMap}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
        onClearFileMap={mockOnClearFileMap}
      />,
    );

    const clearButton = screen.queryByRole('img', { name: 'delete' });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should call onClearFileMap when clear button is clicked', async () => {
    const fileMap = new Map();
    const file = createMockFile({ name: 'test.txt', status: 'done' });
    fileMap.set('uuid1', file);

    const { container } = render(
      <AttachmentFileList
        fileMap={fileMap}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
        onClearFileMap={mockOnClearFileMap}
      />,
    );

    // IconButton 渲染为 div 包裹 button，查找 div 内的 button
    const clearButtonContainer = container.querySelector(
      '.ant-md-editor-attachment-list-close-icon',
    );
    expect(clearButtonContainer).toBeInTheDocument();

    const clearButton = clearButtonContainer?.querySelector('button');
    expect(clearButton).toBeInTheDocument();

    await act(async () => {
      if (clearButton) {
        fireEvent.click(clearButton);
      }
    });

    expect(mockOnClearFileMap).toHaveBeenCalledTimes(1);
  });

  it('should render files with uploading status', () => {
    const fileMap = new Map();
    const file = createMockFile({
      name: 'uploading.txt',
      status: 'uploading',
      uuid: 'uploading-uuid',
    });
    fileMap.set('uploading-uuid', file);

    const { container } = render(
      <AttachmentFileList
        fileMap={fileMap}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    // 验证文件名显示（不包含扩展名）
    expect(screen.getByText('uploading')).toBeInTheDocument();
    // 验证上传状态图标的容器存在
    const uploadingIcon = container.querySelector(
      '.ant-md-editor-attachment-list-item-uploading-icon',
    );
    expect(uploadingIcon).toBeInTheDocument();
  });

  it('should render files with error status', () => {
    const fileMap = new Map();
    const file = createMockFile({
      name: 'error.txt',
      status: 'error',
      uuid: 'error-uuid',
    });
    fileMap.set('error-uuid', file);

    const { container } = render(
      <AttachmentFileList
        fileMap={fileMap}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    // 验证文件名显示（不包含扩展名）
    expect(screen.getByText('error')).toBeInTheDocument();
    // 验证错误状态图标的容器存在
    const errorIcon = container.querySelector(
      '.ant-md-editor-attachment-list-item-uploading-icon',
    );
    expect(errorIcon).toBeInTheDocument();
  });

  it('should handle files without uuid by using name as key', () => {
    const fileMap = new Map();
    const file = createMockFile({ name: 'no-uuid.txt', status: 'done' });
    delete (file as any).uuid;
    fileMap.set('key1', file);

    const { container } = render(
      <AttachmentFileList
        fileMap={fileMap}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    // 验证文件名显示（不包含扩展名）
    expect(screen.getByText('no-uuid')).toBeInTheDocument();
    // 验证文件扩展名显示
    expect(screen.getByText('txt')).toBeInTheDocument();
    // 验证组件正常渲染
    expect(
      container.querySelector('.ant-md-editor-attachment-list-item'),
    ).toBeInTheDocument();
  });

  it('should use index as fallback key when no uuid or name', () => {
    const fileMap = new Map();
    const file = new File(['content'], '', {
      type: 'text/plain',
    }) as AttachmentFile;
    file.status = 'done';
    fileMap.set('key1', file);

    const { container } = render(
      <AttachmentFileList
        fileMap={fileMap}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    // Should render without crashing and use index as key
    expect(container.firstChild).toBeInTheDocument();
    // Verify the list container exists
    expect(
      container.querySelector('.ant-md-editor-attachment-list'),
    ).toBeInTheDocument();
  });

  it('should render image preview component', () => {
    const fileMap = new Map();
    const file = createMockFile({ name: 'test.txt', status: 'done' });
    fileMap.set('uuid1', file);

    const { container } = render(
      <AttachmentFileList
        fileMap={fileMap}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    // Image preview component should exist in the DOM
    const imagePreview = screen.getByAltText('Preview');
    expect(imagePreview).toBeInTheDocument();
    expect(imagePreview).toHaveStyle({ display: 'none' });
    // Verify file list is rendered
    expect(
      container.querySelector('.ant-md-editor-attachment-list'),
    ).toBeInTheDocument();
  });

  it('should handle motion.div variants correctly', () => {
    const fileMap = new Map();
    const file = createMockFile({ name: 'test.txt', status: 'done' });
    fileMap.set('uuid1', file);

    const { container } = render(
      <AttachmentFileList
        fileMap={fileMap}
        onDelete={mockOnDelete}
        onPreview={mockOnPreview}
        onDownload={mockOnDownload}
      />,
    );

    // Check that motion.div is rendered (mocked as div)
    expect(container.firstChild).toBeInTheDocument();
    // Verify the attachment list container exists
    const listContainer = container.querySelector(
      '.ant-md-editor-attachment-list',
    );
    expect(listContainer).toBeInTheDocument();
    // Verify file item is rendered
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
