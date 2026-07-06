import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { ListType } from '../../types';
import { withAgenticLists } from '../../withAgenticLists';
import {
  onBackspaceDecreaseListDepth,
  onEnterEscapeFromEmptyList,
  onEnterSplitNonEmptyList,
  onShiftTabDecreaseListDepth,
  onTabIncreaseListDepth,
} from '../handlers';

const createKeyboardEvent = (
  key: string,
  options: Partial<KeyboardEvent> = {},
) => {
  const keyCodeMap: Record<string, number> = {
    Tab: 9,
    Enter: 13,
    Backspace: 8,
  };
  const base = {
    key,
    code: key,
    keyCode: keyCodeMap[key] ?? 0,
    which: keyCodeMap[key] ?? 0,
    preventDefault: vi.fn(),
    shiftKey: false,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    ...options,
  };
  return { ...base, nativeEvent: base } as KeyboardEvent;
};

describe('lists on-key-down handlers', () => {
  it('returns false when tab is pressed without a lists schema', () => {
    const editor = createEditor();
    expect(onTabIncreaseListDepth(editor, createKeyboardEvent('Tab'))).toBe(
      false,
    );
  });

  it('increases list depth on tab', () => {
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
    editor.selection = {
      anchor: { path: [0, 1, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0, 0], offset: 0 },
    };

    const event = createKeyboardEvent('Tab');
    expect(onTabIncreaseListDepth(editor, event)).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('decreases list depth on shift+tab', () => {
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
      focus: { path: [0, 0, 1, 0, 0, 0], offset: 0 },
    };

    const event = createKeyboardEvent('Tab', { shiftKey: true });
    expect(onShiftTabDecreaseListDepth(editor, event)).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('decreases depth on backspace at a blocked delete position', () => {
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
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };

    const event = createKeyboardEvent('Backspace');
    expect(onBackspaceDecreaseListDepth(editor, event)).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('unwraps empty list item on enter', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: '' }] }],
          },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };

    const event = createKeyboardEvent('Enter');
    expect(onEnterEscapeFromEmptyList(editor, event)).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('splits non-empty list item on enter', () => {
    const editor = withAgenticLists(createEditor());
    editor.children = [
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
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 4 },
      focus: { path: [0, 0, 0, 0], offset: 4 },
    };

    const event = createKeyboardEvent('Enter');
    expect(onEnterSplitNonEmptyList(editor, event)).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
