import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { withAgenticLists } from '../../withAgenticLists';
import { isDeleteBackwardAllowed } from '../isDeleteBackwardAllowed';

const twoItemList = [
  {
    type: ListType.UNORDERED,
    children: [
      {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: 'first' }] }],
      },
      {
        type: 'list-item',
        children: [{ type: 'paragraph', children: [{ text: 'second' }] }],
      },
    ],
  },
];

const nestedListDoc = [
  {
    type: ListType.UNORDERED,
    children: [
      {
        type: 'list-item',
        children: [
          { type: 'paragraph', children: [{ text: 'parent' }] },
          {
            type: ListType.UNORDERED,
            children: [
              {
                type: 'list-item',
                children: [
                  { type: 'paragraph', children: [{ text: 'nested' }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('isDeleteBackwardAllowed', () => {
  it('returns true outside list items', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    expect(isDeleteBackwardAllowed(editor, agenticListsSchema)).toBe(true);
  });

  it('returns false at start of first top-level list item', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = twoItemList;
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };

    expect(isDeleteBackwardAllowed(editor, agenticListsSchema)).toBe(false);
  });

  it('returns true at start of non-first list item', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = twoItemList;
    editor.selection = {
      anchor: { path: [0, 1, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0, 0], offset: 0 },
    };

    expect(isDeleteBackwardAllowed(editor, agenticListsSchema)).toBe(true);
  });

  it('returns true at start of nested list item', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = nestedListDoc;
    editor.selection = {
      anchor: { path: [0, 0, 1, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 1, 0, 0, 0], offset: 0 },
    };

    expect(isDeleteBackwardAllowed(editor, agenticListsSchema)).toBe(true);
  });
});
