import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { withAgenticLists } from '../../withAgenticLists';
import { increaseListItemDepth } from '../increaseListItemDepth';

describe('increaseListItemDepth', () => {
  it('returns false for the first list item without previous sibling', () => {
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

    expect(increaseListItemDepth(editor, agenticListsSchema, [0, 0])).toBe(
      false,
    );
  });

  it('nests the second item under the first when previous sibling exists', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
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

    expect(increaseListItemDepth(editor, agenticListsSchema, [0, 1])).toBe(
      true,
    );
    const firstItem = (editor.children[0] as any).children[0];
    expect(firstItem.children.length).toBeGreaterThan(1);
  });

  it('appends into existing nested list on previous sibling', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'first' }] },
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
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'second' }] }],
          },
        ],
      },
    ];

    expect(increaseListItemDepth(editor, agenticListsSchema, [0, 1])).toBe(
      true,
    );
  });
});
