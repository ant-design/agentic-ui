import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { withAgenticLists } from '../../withAgenticLists';
import { moveListItemsToAnotherList } from '../moveListItemsToAnotherList';

describe('moveListItemsToAnotherList', () => {
  it('returns false when source or target is not a list', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'plain' }] },
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'item' }] }],
          },
        ],
      },
    ];

    expect(
      moveListItemsToAnotherList(editor, agenticListsSchema, {
        at: [editor.children[0], [0]],
        to: [editor.children[1], [1]],
      }),
    ).toBe(false);
  });

  it('returns false when source list is empty', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      { type: ListType.UNORDERED, children: [] },
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'target' }] }],
          },
        ],
      },
    ];

    expect(
      moveListItemsToAnotherList(editor, agenticListsSchema, {
        at: [editor.children[0], [0]],
        to: [editor.children[1], [1]],
      }),
    ).toBe(false);
  });

  it('moves list items from source to target list', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'move-me' }] }],
          },
        ],
      },
      {
        type: ListType.ORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'keep' }] }],
          },
        ],
      },
    ];

    expect(
      moveListItemsToAnotherList(editor, agenticListsSchema, {
        at: [editor.children[0], [0]],
        to: [editor.children[1], [1]],
      }),
    ).toBe(true);
    const listWithItems = editor.children.find(
      (node: any) => node.children?.length === 2,
    );
    expect(listWithItems).toBeTruthy();
  });
});
