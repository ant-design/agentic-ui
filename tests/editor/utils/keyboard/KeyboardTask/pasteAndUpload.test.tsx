import { createEditor, Editor } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReactEditor,
  withReact,
} from '../../../../../src/MarkdownEditor/editor/slate-react';
import { EditorStore } from '../../../../../src/MarkdownEditor/editor/store';
import { KeyboardTask } from '../../../../../src/MarkdownEditor/editor/utils/keyboard';

// Mock dependencies
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(() => vi.fn()),
  },
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    readText: vi.fn(),
  },
  writable: true,
});

// Mock document.createElement
const mockInputElement = {
  id: '',
  type: 'file',
  accept: 'image/*',
  value: '',
  dataset: {} as any,
  onchange: vi.fn(),
  click: vi.fn(),
  remove: vi.fn(),
};

// Mock EditorUtils
vi.mock('../../../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: {
    toggleFormat: vi.fn(),
    clearMarks: vi.fn(),
    wrapperCardNode: vi.fn((node) => node),
    isTop: vi.fn(() => true),
    createMediaNode: vi.fn(() => ({ type: 'media', url: 'test.jpg' })),
    p: { type: 'paragraph', children: [{ text: '' }] },
    findPrev: vi.fn(() => [0]),
    findNext: vi.fn(() => [1]),
  },
}));

vi.mock('../../../../../src/MarkdownEditor/editor/store', () => ({
  EditorStore: vi.fn(),
}));

describe('KeyboardTask - Paste and Upload Methods', () => {
  let editor: ReactEditor;
  let store: EditorStore;
  let keyboardTask: KeyboardTask;
  let mockProps: any;

  beforeEach(() => {
    editor = withReact(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'Test content' }],
      },
    ];

    store = {
      editor,
      markdownEditorRef: { current: null },
      setShowComment: vi.fn(),
    } as any;

    mockProps = {
      value: [{ type: 'paragraph', children: [{ text: 'Test content' }] }],
      onChange: vi.fn(),
      image: {
        upload: vi.fn(),
      },
    };

    keyboardTask = new KeyboardTask(store, mockProps);

    vi.clearAllMocks();
  });

  describe('pastePlainText', () => {
    it('应该粘贴纯文本到普通节点', async () => {
      const mockText = 'test text';
      (navigator.clipboard.readText as any).mockResolvedValue(mockText);

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const insertTextSpy = vi.spyOn(Editor, 'insertText');

      await keyboardTask.pastePlainText();

      expect(insertTextSpy).toHaveBeenCalledWith(editor, mockText);
    });

    it('应该粘贴纯文本到表格单元格并替换换行符', async () => {
      const mockText = 'test\ntext';
      (navigator.clipboard.readText as any).mockResolvedValue(mockText);

      const mockNode = [{ type: 'table-cell', children: [{ text: '' }] }, [0]];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const insertTextSpy = vi.spyOn(Editor, 'insertText');

      await keyboardTask.pastePlainText();

      expect(insertTextSpy).toHaveBeenCalledWith(editor, 'test text');
    });

    it('当剪贴板为空时不应该执行任何操作', async () => {
      (navigator.clipboard.readText as any).mockResolvedValue('');

      const insertTextSpy = vi.spyOn(Editor, 'insertText');

      await keyboardTask.pastePlainText();

      expect(insertTextSpy).not.toHaveBeenCalled();
    });
  });

  describe('uploadImage', () => {
    it('应该创建文件输入元素并触发点击', () => {
      keyboardTask.uploadImage();

      expect(mockInputElement.type).toBe('file');
      expect(mockInputElement.accept).toBe('image/*');
      expect(mockInputElement.click).toHaveBeenCalled();
      expect(mockInputElement.remove).toHaveBeenCalled();
    });

    it('应该处理文件上传成功', async () => {
      const mockFiles = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
      const mockUrl = 'https://example.com/test.jpg';
      mockProps.image.upload.mockResolvedValue(mockUrl);

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const insertNodesSpy = vi.spyOn(Editor, 'insertText');

      keyboardTask.uploadImage();

      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(mockProps.image.upload).toHaveBeenCalledWith(mockFiles);
      expect(insertNodesSpy).toHaveBeenCalled();
    });

    it('应该处理文件上传失败', async () => {
      const mockFiles = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
      mockProps.image.upload.mockRejectedValue(new Error('Upload failed'));

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      keyboardTask.uploadImage();

      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '图片上传失败:',
        expect.any(Error),
      );
    });

    it('当没有配置上传功能时应该显示错误', async () => {
      const mockFiles = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
      mockProps.image.upload = undefined;

      const { message } = await import('antd');

      keyboardTask.uploadImage();

      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(message.error).toHaveBeenCalledWith('图片上传功能未配置');
    });

    it('应该防止重复上传', async () => {
      mockInputElement.dataset.readonly = 'true';

      keyboardTask.uploadImage();

      expect(mockInputElement.click).not.toHaveBeenCalled();
    });

    it('应该处理空文件列表', async () => {
      const mockFiles: File[] = [];
      mockProps.image.upload.mockResolvedValue('https://example.com/test.jpg');

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      keyboardTask.uploadImage();

      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(mockProps.image.upload).toHaveBeenCalledWith(mockFiles);
    });

    it('应该处理多个文件上传', async () => {
      const mockFiles = [
        new File([''], 'test1.jpg', { type: 'image/jpeg' }),
        new File([''], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      const mockUrls = [
        'https://example.com/test1.jpg',
        'https://example.com/test2.jpg',
      ];
      mockProps.image.upload.mockResolvedValue(mockUrls);

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const insertNodesSpy = vi.spyOn(Editor, 'insertText');

      keyboardTask.uploadImage();

      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(insertNodesSpy).toHaveBeenCalledTimes(2);
    });

    it('应该处理空URL数组', async () => {
      const mockFiles = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
      mockProps.image.upload.mockResolvedValue([]);

      const mockNode = [{ type: 'paragraph', children: [{ text: '' }] }, [0]];
      vi.spyOn(Editor, 'nodes').mockReturnValue([mockNode] as any);

      const insertNodesSpy = vi.spyOn(Editor, 'insertText');

      keyboardTask.uploadImage();

      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(insertNodesSpy).not.toHaveBeenCalled();
    });

    it('应该处理空编辑器的情况', async () => {
      const mockFiles = [new File([''], 'test.jpg', { type: 'image/jpeg' })];
      const mockUrl = 'https://example.com/test.jpg';
      mockProps.image.upload.mockResolvedValue(mockUrl);

      vi.spyOn(Editor, 'nodes').mockReturnValue([] as any);

      const insertNodesSpy = vi.spyOn(Editor, 'insertText');

      keyboardTask.uploadImage();

      const mockEvent = {
        target: { files: mockFiles },
      };
      await mockInputElement.onchange(mockEvent);

      expect(insertNodesSpy).toHaveBeenCalledWith(
        editor,
        [expect.any(Object)],
        { select: true },
      );
    });
  });
});
