import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { withAgenticLists } from '../../withAgenticLists';
import { mergeListWithPreviousSiblingList } from '../mergeListWithPreviousSiblingList';

describe('mergeListWithPreviousSiblingList', () => {
  it('returns false for non-list nodes', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
    expect(
      mergeListWithPreviousSiblingList(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);
  });

  it('returns false when there is no previous sibling list', () => {
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
    expect(
      mergeListWithPreviousSiblingList(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);
  });

  it('returns false when previous sibling is not a list', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      { type: 'paragraph', children: [{ text: 'before' }] },
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
      mergeListWithPreviousSiblingList(editor, agenticListsSchema, [
        editor.children[1],
        [1],
      ]),
    ).toBe(false);
  });

  it('returns false for adjacent lists with different types at root level', () => {
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
      {
        type: ListType.ORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'b' }] }],
          },
        ],
      },
    ];
    expect(
      mergeListWithPreviousSiblingList(editor, agenticListsSchema, [
        editor.children[1],
        [1],
      ]),
    ).toBe(false);
  });

  it('merges adjacent lists of the same type', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'first' }] }],
          },
        ],
      },
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'second' }] }],
          },
        ],
      },
    ];
    expect(
      mergeListWithPreviousSiblingList(editor, agenticListsSchema, [
        editor.children[1],
        [1],
      ]),
    ).toBe(true);
    expect(editor.children.length).toBe(1);
    expect((editor.children[0] as any).children.length).toBe(2);
  });

  it('merges nested lists even when list types differ', () => {
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
                      { type: 'paragraph', children: [{ text: 'nested-a' }] },
                    ],
                  },
                ],
              },
              {
                type: ListType.ORDERED,
                children: [
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'nested-b' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    expect(
      mergeListWithPreviousSiblingList(editor, agenticListsSchema, [
        (editor.children[0] as any).children[0].children[2],
        [0, 0, 2],
      ]),
    ).toBe(true);
  });
});
