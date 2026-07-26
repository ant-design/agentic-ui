import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { withAgenticLists } from '../../withAgenticLists';
import { moveListToListItem } from '../moveListToListItem';

describe('moveListToListItem', () => {
  it('no-ops when source is not a list', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'plain' }] },
      {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: 'target' }] }],
      },
    ];

    moveListToListItem(editor, agenticListsSchema, {
      at: [editor.children[0], [0]],
      to: [editor.children[1], [1]],
    });

    expect(editor.children.length).toBe(2);
  });

  it('no-ops when target is not a list item', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      },
      { type: 'paragraph', children: [{ text: 'plain' }] },
    ];

    moveListToListItem(editor, agenticListsSchema, {
      at: [editor.children[0], [0]],
      to: [editor.children[1], [1]],
    });

    expect((editor.children[0] as any).type).toBe(ListType.UNORDERED);
  });

  it('nests a list inside the target list item', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'target' }] }],
          },
        ],
      },
      {
        type: ListType.ORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'move-me' }] }],
          },
        ],
      },
    ];

    moveListToListItem(editor, agenticListsSchema, {
      at: [editor.children[1], [1]],
      to: [(editor.children[0] as any).children[0], [0, 0]],
    });

    expect(editor.children.length).toBe(1);
    const targetItem = (editor.children[0] as any).children[0];
    expect(targetItem.children.length).toBe(2);
    expect(targetItem.children[1].type).toBe(ListType.ORDERED);
  });
});
