import { createEditor, Editor, Node, type Descendant } from 'slate';
import { describe, expect, it } from 'vitest';
import { ListType } from '../../types';
import { withAgenticLists } from '../../withAgenticLists';

const normalize = (children: Descendant[]) => {
  const editor = withAgenticLists(createEditor());
  editor.children = children;
  Editor.normalize(editor, { force: true });
  return editor;
};

describe('list normalizations', () => {
  it('wraps pasted text directly under a list without losing its content', () => {
    const editor = normalize([
      {
        type: ListType.UNORDERED,
        children: [{ text: 'pasted item' }],
      },
    ]);

    expect(editor.children).toMatchObject([
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'pasted item' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('removes Word whitespace nodes while preserving valid list items', () => {
    const editor = normalize([
      {
        type: ListType.UNORDERED,
        children: [
          { text: '\u00a0 \t' },
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'keep me' }],
              },
            ],
          },
        ],
      },
    ]);

    const list = editor.children[0];
    expect(Node.string(list)).toBe('keep me');
    expect(list).toMatchObject({
      type: ListType.UNORDERED,
      children: [{ type: 'list-item' }],
    });
  });

  it('converts an orphan list item into a root paragraph', () => {
    const editor = normalize([
      {
        type: 'list-item',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'orphaned item' }],
          },
        ],
      },
    ]);

    expect(editor.children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'orphaned item' }],
      },
    ]);
  });
});
