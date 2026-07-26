import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { withAgenticLists } from '../../withAgenticLists';
import { increaseDepth } from '../increaseDepth';

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

describe('increaseDepth', () => {
  it('returns false when selection is missing', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = twoItemList;
    editor.selection = null;

    expect(increaseDepth(editor, agenticListsSchema)).toBe(false);
  });

  it('returns false when no list item has a previous sibling', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'only' }] }],
          },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };

    expect(increaseDepth(editor, agenticListsSchema)).toBe(false);
  });

  it('indents list items that have a previous sibling', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = structuredClone(twoItemList);
    editor.selection = {
      anchor: { path: [0, 1, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0, 0], offset: 0 },
    };

    expect(increaseDepth(editor, agenticListsSchema)).toBe(true);
    const firstItem = editor.children[0] as any;
    expect(firstItem.children[0].children.length).toBeGreaterThan(1);
  });
});
