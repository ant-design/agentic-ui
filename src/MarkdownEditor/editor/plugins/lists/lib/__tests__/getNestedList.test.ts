import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { getNestedList } from '../getNestedList';

describe('getNestedList', () => {
  it('returns nested list entry when list-item has child list', () => {
    const editor = createEditor();
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

    const nested = getNestedList(editor, agenticListsSchema, [0, 0]);
    expect(nested).not.toBeNull();
    expect(nested?.[0].type).toBe(ListType.UNORDERED);
    expect(nested?.[1]).toEqual([0, 0, 1]);
  });

  it('returns null when nested path is missing', () => {
    const editor = createEditor();
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

    expect(getNestedList(editor, agenticListsSchema, [0, 0])).toBeNull();
  });

  it('returns null when nested node is not a list', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'a' }] },
              { type: 'paragraph', children: [{ text: 'not-a-list' }] },
            ],
          },
        ],
      },
    ];

    expect(getNestedList(editor, agenticListsSchema, [0, 0])).toBeNull();
  });
});
