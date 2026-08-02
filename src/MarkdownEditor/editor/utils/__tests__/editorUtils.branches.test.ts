/**
 * editorUtils 分支覆盖：错误/回退路径、空选区、边界分支。
 */
import { createEditor, Editor, Point, Range, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { ReactEditor } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as domUtils from '../dom';
import {
  createDomRangeFromNodes,
  createSelectionFromNodes,
  EditorUtils,
  findByPathAndText,
  findLeafPath,
  getRelativePath,
  getSelectionFromDomSelection,
} from '../editorUtils';
import { READONLY_MARKDOWN_CONTAINER_KEY } from '../../../readonly/findTextInReadonlyMarkdownDom';

vi.mock('slate-react', () => ({
  ReactEditor: {
    focus: vi.fn(),
    blur: vi.fn(),
    findPath: vi.fn(),
    hasDOMNode: vi.fn(),
    toSlateNode: vi.fn(),
    toSlateRange: vi.fn(),
  },
}));

describe('editorUtils 分支覆盖', () => {
  let editor: ReturnType<typeof createEditor>;

  beforeEach(() => {
    editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'Hello world' }] },
      { type: 'paragraph', children: [{ text: 'Second' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('safeDeselect', () => {
    it('无选区时直接返回', () => {
      editor.selection = null;
      const deselectSpy = vi.spyOn(Transforms, 'deselect');
      EditorUtils.safeDeselect(editor);
      expect(deselectSpy).not.toHaveBeenCalled();
    });

    it('deselect 抛错时回退为 editor.selection = null', () => {
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      };
      vi.spyOn(Transforms, 'deselect').mockImplementation(() => {
        throw new Error('deselect failed');
      });
      EditorUtils.safeDeselect(editor);
      expect(editor.selection).toBeNull();
    });

    it('deselect 与 assignment 均抛错时静默忽略', () => {
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      };
      vi.spyOn(Transforms, 'deselect').mockImplementation(() => {
        throw new Error('deselect failed');
      });
      Object.defineProperty(editor, 'selection', {
        configurable: true,
        get: () => ({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        }),
        set: () => {
          throw new Error('selection assignment failed');
        },
      });
      expect(() => EditorUtils.safeDeselect(editor)).not.toThrow();
    });
  });

  describe('coalesceRootAllEmptyParagraphs', () => {
    it('null/undefined 输入返回单个空段落', () => {
      expect(EditorUtils.coalesceRootAllEmptyParagraphs(null as any)).toEqual([
        { type: 'paragraph', children: [{ text: '' }] },
      ]);
      expect(
        EditorUtils.coalesceRootAllEmptyParagraphs(undefined as any),
      ).toEqual([{ type: 'paragraph', children: [{ text: '' }] }]);
    });
  });

  describe('moveNodes', () => {
    it('超过 100 次移动后中断循环', () => {
      const moveSpy = vi.spyOn(Transforms, 'moveNodes').mockImplementation(() => {});
      vi.spyOn(Editor, 'hasPath').mockReturnValue(true);
      EditorUtils.moveNodes(editor, [0], [1], 0);
      expect(moveSpy.mock.calls.length).toBeLessThanOrEqual(101);
    });
  });

  describe('clearMarks', () => {
    it('numbered-list 选中时转换为段落', () => {
      editor.children = [
        {
          type: 'numbered-list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: 'Item', bold: true }] },
              ],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 4 },
      };
      EditorUtils.clearMarks(editor);
      expect(editor.children).toBeDefined();
    });

    it('list 类型选中时转换为段落', () => {
      editor.children = [
        {
          type: 'list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: 'Nested', italic: true }] },
              ],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 6 },
      };
      const removeSpy = vi.spyOn(Transforms, 'removeNodes');
      EditorUtils.clearMarks(editor);
      expect(removeSpy).toHaveBeenCalled();
    });

    it('list-item 嵌套在 paragraph 内时触发 liftNodes', () => {
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: 'outer' }],
        },
        {
          type: 'list-item',
          children: [
            { type: 'paragraph', children: [{ text: 'inner', bold: true }] },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [1, 0, 0], offset: 0 },
        focus: { path: [1, 0, 0], offset: 5 },
      };
      const liftSpy = vi.spyOn(Transforms, 'liftNodes');
      EditorUtils.clearMarks(editor);
      expect(liftSpy).toHaveBeenCalled();
    });

    it('内部抛错时捕获并记录 console.error', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      };
      const originalNodes = Editor.nodes;
      let nodesCallCount = 0;
      vi.spyOn(Editor, 'nodes').mockImplementation((...args) => {
        nodesCallCount += 1;
        if (nodesCallCount >= 2) {
          throw new Error('Editor.nodes failed');
        }
        return originalNodes(...args);
      });
      EditorUtils.clearMarks(editor);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in clearMarks:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('deleteAll', () => {
    it('编辑器无顶层元素时仍插入默认段落', () => {
      editor.children = [];
      editor.selection = null;
      EditorUtils.deleteAll(editor);
      expect(editor.children.length).toBeGreaterThanOrEqual(1);
      expect(editor.children[0]).toMatchObject({
        type: 'paragraph',
        children: [{ text: '' }],
      });
    });
  });

  describe('includeAll', () => {
    it('选区未覆盖整段时返回 false', () => {
      const range: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      };
      expect(EditorUtils.includeAll(editor, range, [0])).toBe(false);
    });

    it('选区完全覆盖节点时返回 true', () => {
      const end = Editor.end(editor, [0]);
      const range: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: end,
      };
      expect(EditorUtils.includeAll(editor, range, [0])).toBe(true);
    });
  });

  describe('findNext', () => {
    it('无直接 next 时向上遍历父路径', () => {
      editor.children = [
        {
          type: 'blockquote',
          children: [{ type: 'paragraph', children: [{ text: 'quote' }] }],
        },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ];
      const next = EditorUtils.findNext(editor, [0, 0, 0]);
      expect(next).toEqual([1]);
    });
  });

  describe('isDirtLeaf', () => {
    it('mark 属性视为脏 leaf', () => {
      expect(EditorUtils.isDirtLeaf({ text: 'x', mark: true } as any)).toBe(true);
    });
  });

  describe('wrapperCardNode', () => {
    it('数组节点展开为多个 content 子节点', () => {
      const nodes = [
        { type: 'paragraph', children: [{ text: 'A' }] },
        { type: 'paragraph', children: [{ text: 'B' }] },
      ];
      const result = EditorUtils.wrapperCardNode(nodes);
      expect(result.type).toBe('card');
      expect(result.children).toHaveLength(4);
      expect(result.children[1]).toMatchObject({ type: 'paragraph' });
      expect(result.children[2]).toMatchObject({ type: 'paragraph' });
    });
  });

  describe('createMediaNode', () => {
    it('try 块抛错时回退到 generic media 节点', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.spyOn(domUtils, 'getMediaType').mockImplementation(() => {
        throw new Error('getMediaType failed');
      });
      const result = EditorUtils.createMediaNode('https://example.com/x.mp4', 'video');
      expect(result).toMatchObject({ type: 'card' });
      expect((result as any).children[1].type).toBe('media');
      consoleSpy.mockRestore();
    });
  });

  describe('checkEnd', () => {
    it('Editor.nodes 抛错时返回 false', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.spyOn(Editor, 'nodes').mockImplementation(() => {
        throw new Error('nodes failed');
      });
      expect(EditorUtils.checkEnd(editor)).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('replaceEditorContent + safeDeselect', () => {
    it('replaceEditorContent 在有选区时调用 safeDeselect', () => {
      const historyEditor = withHistory(createEditor());
      historyEditor.children = [
        { type: 'paragraph', children: [{ text: 'old' }] },
      ];
      historyEditor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      };
      const deselectSpy = vi.spyOn(Transforms, 'deselect');
      EditorUtils.replaceEditorContent(historyEditor, [
        { type: 'paragraph', children: [{ text: 'new' }] },
      ]);
      expect(deselectSpy).toHaveBeenCalled();
      expect(historyEditor.selection).toBeNull();
    });
  });

  describe('findByPathAndText readonly 分支', () => {
    it('只读编辑器有 container 时走 DOM 搜索', () => {
      const container = document.createElement('div');
      container.innerHTML = '<p data-be="paragraph">readonly hello</p>';
      const readonlyEditor = createEditor() as any;
      readonlyEditor[READONLY_MARKDOWN_CONTAINER_KEY] = container;
      const results = findByPathAndText(readonlyEditor, [0], 'hello', {
        maxResults: 2,
      });
      expect(Array.isArray(results)).toBe(true);
    });

    it('只读编辑器无 container 时返回空数组', () => {
      const readonlyEditor = createEditor() as any;
      readonlyEditor[READONLY_MARKDOWN_CONTAINER_KEY] = null;
      expect(findByPathAndText(readonlyEditor, [0], 'hello')).toEqual([]);
    });
  });

  describe('getSelectionFromDomSelection', () => {
    it('anchor/focus 不可选时返回 null', () => {
      const range = document.createRange();
      range.setStart(document.body, 0);
      range.setEnd(document.body, 0);
      const domSelection = {
        rangeCount: 1,
        getRangeAt: () => range,
      } as unknown as Selection;
      vi.mocked(ReactEditor.hasDOMNode).mockReturnValue(false);
      expect(
        getSelectionFromDomSelection(editor as any, domSelection),
      ).toBeNull();
    });

    it('createAndConvertRange 抛错时返回 null', () => {
      const leaf = document.createElement('span');
      leaf.setAttribute('data-slate-leaf', 'true');
      const text = document.createElement('span');
      text.setAttribute('data-slate-node', 'text');
      text.appendChild(leaf);
      leaf.appendChild(document.createTextNode('x'));
      document.body.appendChild(text);

      const range = document.createRange();
      range.setStart(leaf.firstChild!, 0);
      range.setEnd(leaf.firstChild!, 1);
      const domSelection = {
        rangeCount: 1,
        getRangeAt: () => range,
      } as unknown as Selection;

      vi.mocked(ReactEditor.hasDOMNode).mockReturnValue(true);
      vi.mocked(ReactEditor.toSlateRange).mockImplementation(() => {
        throw new Error('toSlateRange failed');
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      expect(
        getSelectionFromDomSelection(editor as any, domSelection),
      ).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
      text.remove();
    });

    it('getRangeAt 返回 null 时返回 null', () => {
      const domSelection = {
        rangeCount: 1,
        getRangeAt: () => null,
      } as unknown as Selection;
      expect(
        getSelectionFromDomSelection(editor as any, domSelection),
      ).toBeNull();
    });
  });

  describe('createSelectionFromNodes', () => {
    it('window.getSelection 返回 null 时返回 null', () => {
      const original = window.getSelection;
      window.getSelection = vi.fn(() => null) as any;
      const anchor = document.createTextNode('a');
      const focus = document.createTextNode('b');
      expect(createSelectionFromNodes(anchor, 0, focus, 1)).toBeNull();
      window.getSelection = original;
    });
  });

  describe('createDomRangeFromNodes SSR', () => {
    it('window 未定义时返回 null', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error simulate SSR
      delete globalThis.window;
      expect(
        createDomRangeFromNodes(
          document.createTextNode('a'),
          0,
          document.createTextNode('b'),
          1,
        ),
      ).toBeNull();
      globalThis.window = originalWindow;
    });
  });

  describe('getRelativePath', () => {
    it('path 短于 anther 时提前返回零数组', () => {
      expect(getRelativePath([1], [0, 1, 2])).toEqual([0, 0, 0]);
    });
  });

  describe('findLeafPath', () => {
    it('Editor.leaf 无结果时返回原 path', () => {
      vi.spyOn(Editor, 'leaf').mockReturnValue(null as any);
      expect(findLeafPath(editor, [0, 0])).toEqual([0, 0]);
    });
  });

  describe('copyText / cutText 边界', () => {
    it('leaf.text 为 undefined 时使用空字符串', () => {
      const start: Point = { path: [0, 0], offset: 0 };
      vi.spyOn(Editor, 'leaf').mockReturnValue([
        { text: undefined } as any,
        [0, 0],
      ]);
      vi.spyOn(Editor, 'next').mockReturnValue(undefined as any);
      expect(EditorUtils.copyText(editor, start)).toBe('');
      expect(EditorUtils.cutText(editor, start)[0].text).toBe('');
    });
  });

  describe('getUrl 边界', () => {
    it('匹配节点 url 为空字符串时返回空', () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'link', url: '' }] },
      ];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      };
      expect(EditorUtils.getUrl(editor)).toBe('');
    });
  });

  describe('listToParagraph 边界', () => {
    it('list-item 无 children 时跳过', () => {
      const listNode = {
        type: 'list',
        children: [{ type: 'list-item' }],
      } as any;
      expect(EditorUtils.listToParagraph(editor, listNode)).toEqual([]);
    });
  });
});
