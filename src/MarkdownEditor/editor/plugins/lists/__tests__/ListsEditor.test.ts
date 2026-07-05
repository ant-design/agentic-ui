import type { Editor } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListsEditor } from '../ListsEditor';
import * as lib from '../lib';
import * as Registry from '../registry';
import * as transformations from '../transformations';
import { ListType, type ListsSchema } from '../types';

vi.mock('../lib', () => ({
  isDeleteBackwardAllowed: vi.fn(() => true),
  getListItems: vi.fn(() => []),
  getLists: vi.fn(() => []),
  getListType: vi.fn(() => 'bulleted-list'),
  getNestedList: vi.fn(() => null),
  getParentList: vi.fn(() => null),
  getParentListItem: vi.fn(() => null),
  isAtStartOfListItem: vi.fn(() => false),
  isAtEmptyListItem: vi.fn(() => false),
  isInList: vi.fn(() => false),
  isListItemContainingText: vi.fn(() => false),
}));

vi.mock('../transformations', () => ({
  decreaseDepth: vi.fn(() => true),
  decreaseListItemDepth: vi.fn(() => true),
  increaseDepth: vi.fn(() => true),
  increaseListItemDepth: vi.fn(() => true),
  mergeListWithPreviousSiblingList: vi.fn(() => true),
  moveListItemsToAnotherList: vi.fn(() => true),
  moveListToListItem: vi.fn(() => true),
  setListType: vi.fn(() => true),
  splitListItem: vi.fn(() => true),
  unwrapList: vi.fn(() => true),
  wrapInList: vi.fn(() => true),
}));

const createMockSchema = (): ListsSchema => ({
  isConvertibleToListTextNode: vi.fn(() => true),
  isDefaultTextNode: vi.fn(() => true),
  isListNode: vi.fn(() => true),
  isListItemNode: vi.fn(() => true),
  isListItemTextNode: vi.fn(() => true),
  createDefaultTextNode: vi.fn((props) => ({
    type: 'paragraph',
    children: [{ text: '' }],
    ...props,
  })),
  createListNode: vi.fn((type, props) => ({
    type: type ?? ListType.UNORDERED,
    children: [],
    ...props,
  })),
  createListItemNode: vi.fn((props) => ({
    type: 'list-item',
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
    ...props,
  })),
  createListItemTextNode: vi.fn((props) => ({
    type: 'paragraph',
    children: [{ text: '' }],
    ...props,
  })),
});

describe('ListsEditor', () => {
  let editor: Editor;
  let schema: ListsSchema;

  beforeEach(() => {
    vi.clearAllMocks();
    editor = {} as Editor;
    schema = createMockSchema();
    Registry.register(editor, schema);
  });

  it('isListsEnabled / getListsSchema 应反映 registry 状态', () => {
    expect(ListsEditor.isListsEnabled(editor)).toBe(true);
    expect(ListsEditor.getListsSchema(editor)).toBe(schema);

    Registry.unregister(editor);
    expect(ListsEditor.isListsEnabled(editor)).toBe(false);
    expect(ListsEditor.getListsSchema(editor)).toBeUndefined();
  });

  it('schema 代理方法应转发到 ListsSchema', () => {
    const node = { text: 'x' };
    ListsEditor.isConvertibleToListTextNode(editor, node);
    ListsEditor.isDefaultTextNode(editor, node);
    ListsEditor.isListNode(editor, node, ListType.ORDERED);
    ListsEditor.isListItemNode(editor, node);
    ListsEditor.isListItemTextNode(editor, node);

    expect(schema.isConvertibleToListTextNode).toHaveBeenCalledWith(node);
    expect(schema.isListNode).toHaveBeenCalledWith(node, ListType.ORDERED);

    ListsEditor.createDefaultTextNode(editor, { id: 'p' });
    ListsEditor.createListNode(editor, ListType.ORDERED, { id: 'l' });
    ListsEditor.createListItemNode(editor, { id: 'li' });
    ListsEditor.createListItemTextNode(editor, { id: 'lit' });

    expect(schema.createListNode).toHaveBeenCalledWith(ListType.ORDERED, {
      id: 'l',
    });
  });

  it('lib 检查与 getter 应带上 schema 转发', () => {
    ListsEditor.isDeleteBackwardAllowed(editor);
    ListsEditor.isAtStartOfListItem(editor);
    ListsEditor.isAtEmptyListItem(editor);
    ListsEditor.isAtList(editor);
    ListsEditor.isListItemContainingText(editor, { text: '' });
    ListsEditor.getLists(editor, null);
    ListsEditor.getListItems(editor);
    ListsEditor.getListType(editor, { type: 'bulleted-list' });
    ListsEditor.getNestedList(editor, [0]);
    ListsEditor.getParentList(editor, [0]);
    ListsEditor.getParentListItem(editor, [0]);

    expect(lib.isDeleteBackwardAllowed).toHaveBeenCalledWith(
      editor,
      schema,
      editor.selection,
    );
    expect(lib.getNestedList).toHaveBeenCalledWith(editor, schema, [0]);
  });

  it('transformations 应带上 schema 转发', () => {
    const entry = [{ type: 'bulleted-list' }, [0]] as const;
    ListsEditor.increaseDepth(editor);
    ListsEditor.increaseListItemDepth(editor, [0, 0]);
    ListsEditor.decreaseDepth(editor);
    ListsEditor.decreaseListItemDepth(editor, [0, 0]);
    ListsEditor.mergeListWithPreviousSiblingList(editor, entry as any);
    ListsEditor.moveListItemsToAnotherList(editor, {} as any);
    ListsEditor.moveListToListItem(editor, {} as any);
    ListsEditor.setListType(editor, ListType.ORDERED);
    ListsEditor.splitListItem(editor);
    ListsEditor.unwrapList(editor);
    ListsEditor.wrapInList(editor, ListType.ORDERED);

    expect(transformations.wrapInList).toHaveBeenCalledWith(
      editor,
      schema,
      ListType.ORDERED,
      editor.selection,
    );
    expect(transformations.setListType).toHaveBeenCalledWith(
      editor,
      schema,
      ListType.ORDERED,
      editor.selection,
    );
  });
});
