import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { withAgenticLists } from '../../withAgenticLists';
import { splitListItem } from '../splitListItem';

const bulletedList = (items: string[]) => [
  {
    type: ListType.UNORDERED,
    children: items.map((text) => ({
      type: 'list-item',
      children: [{ type: 'paragraph', children: [{ text }] }],
    })),
  },
];

describe('splitListItem', () => {
  it('returns false without a location', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = bulletedList(['a']);
    expect(splitListItem(editor, agenticListsSchema, null)).toBe(false);
  });

  it('returns false when cursor is not inside a list item', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(splitListItem(editor, agenticListsSchema)).toBe(false);
  });

  it('returns false when selection spans items but collapses to one after delete', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = structuredClone(bulletedList(['one', 'two']));
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0, 0], offset: 0 },
    };
    expect(splitListItem(editor, agenticListsSchema)).toBe(true);
  });

  it('inserts a sibling at the start of a list item', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = structuredClone(bulletedList(['hello']));
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };

    expect(splitListItem(editor, agenticListsSchema)).toBe(true);
    expect((editor.children[0] as any).children.length).toBe(2);
  });

  it('inserts a sibling after the item when cursor is at the end', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = structuredClone(bulletedList(['hello']));
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 5 },
      focus: { path: [0, 0, 0, 0], offset: 5 },
    };

    expect(splitListItem(editor, agenticListsSchema)).toBe(true);
    expect((editor.children[0] as any).children.length).toBe(2);
    expect(editor.selection?.anchor.path[1]).toBe(1);
  });

  it('splits text in the middle of a list item', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = structuredClone(bulletedList(['hello']));
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 2 },
      focus: { path: [0, 0, 0, 0], offset: 2 },
    };

    expect(splitListItem(editor, agenticListsSchema)).toBe(true);
    expect((editor.children[0] as any).children.length).toBe(2);
  });

  it('copies checked state onto the new list item', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            checked: true,
            children: [{ type: 'paragraph', children: [{ text: 'task' }] }],
          },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 4 },
      focus: { path: [0, 0, 0, 0], offset: 4 },
    };

    expect(splitListItem(editor, agenticListsSchema)).toBe(true);
    const newItem = (editor.children[0] as any).children[1];
    expect(newItem.checked).toBe(false);
  });

  it('moves nested list content to the new sibling item', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
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
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 3 },
      focus: { path: [0, 0, 0, 0], offset: 3 },
    };

    expect(splitListItem(editor, agenticListsSchema)).toBe(true);
    expect((editor.children[0] as any).children.length).toBe(2);
  });

  it('deletes expanded selection before splitting', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = structuredClone(bulletedList(['hello']));
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 1 },
      focus: { path: [0, 0, 0, 0], offset: 4 },
    };

    expect(splitListItem(editor, agenticListsSchema)).toBe(true);
    expect((editor.children[0] as any).children.length).toBeGreaterThan(1);
  });
});
