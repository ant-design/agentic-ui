import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { ListType } from '../../types';
import { withAgenticLists } from '../../withAgenticLists';
import { decreaseDepth } from '../decreaseDepth';
import { setListType } from '../setListType';
import { unwrapList } from '../unwrapList';
import { wrapInList } from '../wrapInList';

const bulletedList = (items: string[]) => [
  {
    type: ListType.UNORDERED,
    children: items.map((text) => ({
      type: 'list-item',
      children: [{ type: 'paragraph', children: [{ text }] }],
    })),
  },
];

describe('setListType', () => {
  it('returns false without selection', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = bulletedList(['a']);
    editor.selection = null;
    expect(setListType(editor, agenticListsSchema, ListType.ORDERED)).toBe(
      false,
    );
  });

  it('returns false when no list is in selection', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'plain' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(setListType(editor, agenticListsSchema, ListType.ORDERED)).toBe(
      false,
    );
  });

  it('converts bulleted list to numbered list', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = structuredClone(bulletedList(['item']));
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };

    expect(setListType(editor, agenticListsSchema, ListType.ORDERED)).toBe(
      true,
    );
    expect((editor.children[0] as { type: string }).type).toBe(
      ListType.ORDERED,
    );
  });
});

describe('wrapInList', () => {
  it('returns false without selection', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = null;
    expect(wrapInList(editor, agenticListsSchema, ListType.UNORDERED)).toBe(
      false,
    );
  });

  it('wraps top-level paragraph into a list', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'hello' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };

    expect(wrapInList(editor, agenticListsSchema, ListType.UNORDERED)).toBe(
      true,
    );
    expect((editor.children[0] as { type: string }).type).toBe(
      ListType.UNORDERED,
    );
  });

  it('does not wrap paragraphs inside list items', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = bulletedList(['inside']);
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 6 },
    };

    expect(wrapInList(editor, agenticListsSchema, ListType.UNORDERED)).toBe(
      false,
    );
  });
});

describe('unwrapList', () => {
  it('returns false without selection', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = bulletedList(['a']);
    editor.selection = null;
    expect(unwrapList(editor, agenticListsSchema)).toBe(false);
  });

  it('unwraps list items in selection', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = structuredClone(bulletedList(['one', 'two']));
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0, 0], offset: 0 },
    };

    expect(unwrapList(editor, agenticListsSchema)).toBe(true);
    expect((editor.children[0] as { type: string }).type).toBe('paragraph');
  });
});

describe('decreaseDepth', () => {
  it('returns false without selection', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = bulletedList(['a']);
    editor.selection = null;
    expect(decreaseDepth(editor, agenticListsSchema)).toBe(false);
  });

  it('flattens nested list item to root level', () => {
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
      anchor: { path: [0, 0, 1, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 1, 0, 0, 0], offset: 6 },
    };

    expect(decreaseDepth(editor, agenticListsSchema)).toBe(true);
  });
});
