import { createEditor, Editor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  handleMarkInsertBreak,
  handleMarkRemoveTextOperation,
  handleTagDeleteBackward,
  handleTagRemoveTextOperation,
  moveSelectionOutOfMarkLeaf,
  shouldExitMarkOnInsertBreak,
  tryInsertTextOutsideMarkOnDoubleSpace,
  tryInsertTextOutsideTagOnDoubleSpace,
} from '../codeTagLeafBehavior';

const tagNode = (text: string, extra: Record<string, unknown> = {}) => ({
  text,
  tag: true,
  code: true,
  ...extra,
});

describe('codeTagLeafBehavior 分支覆盖', () => {
  it('handleTagRemoveTextOperation 部分删除时走 apply 并返回 true', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [tagNode('hello')] }];
    const apply = vi.fn();

    expect(
      handleTagRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: 'he' },
        apply,
      ),
    ).toBe(true);
    expect(apply).toHaveBeenCalled();
  });

  it('handleMarkRemoveTextOperation 路径无效时 catch 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    const apply = vi.fn();

    expect(
      handleMarkRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [9, 9], offset: 0, text: 'x' },
        apply,
      ),
    ).toBe(false);
    expect(apply).not.toHaveBeenCalled();
  });

  it('handleMarkRemoveTextOperation 删后仅剩空白时清除 mark', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '   ', mark: true, markLabel: '@' }],
      },
    ];
    const apply = editor.apply.bind(editor);
    const unsetSpy = vi.spyOn(Transforms, 'unsetNodes');

    expect(
      handleMarkRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: ' ' },
        apply,
      ),
    ).toBe(true);
    expect(unsetSpy).toHaveBeenCalled();
    unsetSpy.mockRestore();
  });

  it('handleMarkRemoveTextOperation 非 mark 叶返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
    const apply = vi.fn();

    expect(
      handleMarkRemoveTextOperation(
        editor,
        { type: 'remove_text', path: [0, 0], offset: 0, text: 'p' },
        apply,
      ),
    ).toBe(false);
  });

  it('shouldExitMarkOnInsertBreak 仅换行符文本时允许退出', () => {
    expect(
      shouldExitMarkOnInsertBreak({ text: '\n', mark: true } as never, 1),
    ).toBe(true);
  });

  it('handleMarkInsertBreak 仅换行符 mark 叶走 breakOffset=0 分支', () => {
    const editor = createEditor();
    const insertBreak = vi.fn();
    editor.insertBreak = insertBreak;
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '\n', mark: true, markLabel: '@' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };

    const unsetSpy = vi.spyOn(Transforms, 'unsetNodes');
    expect(handleMarkInsertBreak(editor, insertBreak)).toBe(true);
    expect(unsetSpy).toHaveBeenCalled();
    expect(insertBreak).toHaveBeenCalled();
    unsetSpy.mockRestore();
  });

  it('handleMarkInsertBreak 无选区时返回 false', () => {
    const editor = createEditor();
    editor.selection = null;
    expect(handleMarkInsertBreak(editor, vi.fn())).toBe(false);
  });

  it('handleTagDeleteBackward 前一 tag 且当前单字符时插入段落', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [tagNode('x'), { text: 'y' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 1], offset: 1 },
      focus: { path: [0, 1], offset: 1 },
    };

    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    expect(handleTagDeleteBackward(editor, 'character', vi.fn())).toBe(true);
    expect(insertSpy).toHaveBeenCalled();
    insertSpy.mockRestore();
  });

  it('handleTagDeleteBackward 多子节点时 remove tag 节点', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [tagNode(' '), { text: '' }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 0 },
    };

    const removeSpy = vi.spyOn(Transforms, 'removeNodes');
    expect(handleTagDeleteBackward(editor, 'character', vi.fn())).toBe(true);
    expect(removeSpy).toHaveBeenCalled();
    removeSpy.mockRestore();
  });

  it('tryInsertTextOutsideMarkOnDoubleSpace tag+code 叶返回 false', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'a ', mark: true, tag: true, code: true }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, ' ')).toBe(false);
  });

  it('tryInsertTextOutsideMarkOnDoubleSpace 路径异常时返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'a ' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(tryInsertTextOutsideMarkOnDoubleSpace(editor, ' ')).toBe(false);
  });

  it('tryInsertTextOutsideTagOnDoubleSpace 非 tag 叶返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'a ' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(tryInsertTextOutsideTagOnDoubleSpace(editor, ' ')).toBe(false);
  });

  it('tryInsertTextOutsideTagOnDoubleSpace 非空格文本返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [tagNode('a ')] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(tryInsertTextOutsideTagOnDoubleSpace(editor, 'x')).toBe(false);
  });

  it('moveSelectionOutOfMarkLeaf 非空 mark 叶不清除 mark 属性', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'paragraph',
        children: [
          { text: 'hi', mark: true, markLabel: '@' },
          { text: 'next' },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    const unsetSpy = vi.spyOn(Transforms, 'unsetNodes');
    expect(moveSelectionOutOfMarkLeaf(editor)).toBe(true);
    expect(unsetSpy).not.toHaveBeenCalled();
    unsetSpy.mockRestore();
  });

  it('handleTagDeleteBackward 异常路径 catch 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.spyOn(Editor, 'previous').mockImplementation(() => {
      throw new Error('boom');
    });
    expect(handleTagDeleteBackward(editor, 'character', vi.fn())).toBe(false);
    vi.restoreAllMocks();
  });
});
