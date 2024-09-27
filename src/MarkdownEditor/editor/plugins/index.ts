import { Editor, Node, Path, Transforms } from 'slate';
import { EditorStore } from '../store';

export const inlineNode = new Set(['break']);

const voidNode = new Set(['hr', 'break']);

/**
 * 为编辑器添加 Markdown 支持的插件。
 *
 * @param editor - 编辑器实例。
 * @param store - 编辑器存储实例。
 * @returns 修改后的编辑器实例。
 *
 * 该插件扩展了编辑器的以下功能：
 * - `isInline`：判断元素是否为行内元素。
 * - `isVoid`：判断元素是否为空元素。
 * - `apply`：自定义操作应用逻辑，处理特定类型的节点操作。
 *
 * 特别处理的操作类型包括：
 * - `merge_node`：合并节点操作，忽略 `table-cell` 类型的节点。
 * - `split_node`：拆分节点操作，处理 `link-card`、`schema` 和 `column-cell` 类型的节点。
 * - `remove_node`：删除节点操作，处理 `table-row` 和 `table-cell` 类型的节点。
 * - `move_node`：移动节点操作，处理 `table-cell` 类型的节点。
 *
 * 该插件还根据 `store.manual` 的值决定是否手动处理某些操作。
 */
export const withMarkdown = (editor: Editor, store: EditorStore) => {
  const { isInline, isVoid, apply } = editor;

  editor.isInline = (element) => {
    return inlineNode.has(element.type) || isInline(element);
  };

  editor.isVoid = (element) => {
    return voidNode.has(element.type) || isVoid(element);
  };

  editor.apply = (operation) => {
    if (
      operation.type === 'merge_node' &&
      operation.properties?.type === 'table-cell'
    ) {
      return;
    }

    if (
      operation.type === 'split_node' &&
      (operation.properties?.type === 'link-card' ||
        operation.properties?.type === 'media')
    ) {
      const node = Node.get(editor, operation.path);
      if (['link-card', 'media'].includes(node?.type)) {
        Transforms.insertNodes(
          editor,
          [
            {
              type: 'paragraph',
              children: [{ text: '', p: 'true' }],
            },
          ],
          {
            at: Path.next([operation.path.at(0)!]),
          },
        );
      }
      setTimeout(() => {
        Transforms.setSelection(editor, {
          anchor: { path: Path.next(operation.path), offset: 0 },
          focus: { path: Path.next(operation.path), offset: 0 },
        });
      }, 100);
      return;
    }

    if (
      operation.type === 'split_node' &&
      operation.properties?.type === 'schema'
    ) {
      const node = Node.get(editor, operation.path);
      if (node?.type === 'schema') {
        Transforms.insertNodes(
          editor,
          [
            {
              type: 'paragraph',
              children: [{ text: '', p: 'true' }],
            },
          ],
          {
            at: Path.next(operation.path),
          },
        );
      }
      setTimeout(() => {
        Transforms.setSelection(editor, {
          anchor: { path: Path.next(operation.path), offset: 0 },
          focus: { path: Path.next(operation.path), offset: 0 },
        });
      }, 100);
      return;
    }
    if (
      operation.type === 'split_node' ||
      operation.type === 'merge_node' ||
      operation.type === 'remove_node' ||
      operation.type === 'move_node'
    ) {
      if (operation.type === 'split_node' && operation.path?.at(1) === 1) {
        if (operation.properties.type === 'column-cell') {
          const next = Path.next([operation.path.at(0) || 0]);
          Transforms.insertNodes(
            editor,
            [
              {
                type: 'paragraph',
                children: [{ text: '', p: 'true' }],
              },
            ],
            {
              at: next,
            },
          );
          setTimeout(() => {
            Transforms.setSelection(editor, {
              anchor: { path: next, offset: 0 },
              focus: { path: next, offset: 0 },
            });
          }, 100);
          return;
        }
      }
      const node = Node.get(editor, operation.path);
      if (node?.type === 'column-cell') {
        return;
      }
    }

    if (!store.manual) {
      if (operation.type === 'move_node') {
        const node = Node.get(editor, operation.path);
        if (node?.type === 'table-cell') return;
      }
      if (operation.type === 'remove_node') {
        const { node } = operation;
        if (['table-row', 'table-cell'].includes(node.type)) {
          if (node.type === 'table-cell') {
            Transforms.insertFragment(editor, [{ text: '' }], {
              at: {
                anchor: Editor.start(editor, operation.path),
                focus: Editor.end(editor, operation.path),
              },
            });
          }
          if (node.type === 'table-row') {
            for (let i = 0; i < node.children?.length; i++) {
              Transforms.insertFragment(editor, [{ text: '' }], {
                at: {
                  anchor: Editor.start(editor, [...operation.path, i]),
                  focus: Editor.end(editor, [...operation.path, i]),
                },
              });
            }
          }
          return;
        }
      }
    }
    apply(operation);
  };

  return editor;
};
