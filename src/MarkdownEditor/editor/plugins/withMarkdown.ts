﻿import { Editor, Node, Path, Range, Transforms } from 'slate';

export const inlineNode = new Set(['break']);
const voidNode = new Set(['hr', 'break']);

const TableInlineNode = new Set([
  'inline-code',
  'inline-katex',
  'paragraph',
  'footnoteDefinition',
  'table-row',
  'break',
  'html',
  'table-cell',
  'media',
]);

function hasRange(editor: Editor, range: { anchor: any; focus: any }): boolean {
  const { anchor, focus } = range;
  return (
    Editor.hasPath(editor, anchor.path) && Editor.hasPath(editor, focus.path)
  );
}

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
export const withMarkdown = (editor: Editor) => {
  const { isInline, isVoid, apply, deleteBackward } = editor;

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
            select: true,
          },
        );
      }
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
            select: true,
          },
        );
      }
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

    if (operation.type === 'move_node') {
      const node = Node.get(editor, operation.path);
      if (node?.type === 'table-cell') return;
    }
    /**
     * 处理删除节点和插入文本的操作，主要用于富文本编辑器中的卡片、表格和链接相关逻辑。
 *
 * @operation.remove_node 删除操作：
 *  - 当删除一个`card`节点时：
 *    如果当前选中路径的父节点不是`card-after`类型，则选择新的路径并执行操作。这确保在删除卡片后，焦点移动到正确的位
置。
 *
 *  - 当删除的是一个`card-after`节点：
 *    移除该节点，并返回。这可能用于清理卡片结构，避免冗余节点。
 *
 *  - `card-before`类型节点的删除直接忽略，不做处理。
 *
 *  - 处理表格相关节点（`table-row`和`table-cell`）时，调用`apply(operation)`函数。此处假设`apply`负责更新或维护表格
结构。
 *
 *  - 如果父节点是`link-card`类型，则移除该节点，确保链接卡片的正确处理和清理。
 *
 * @operation.insert_text 插入文本：
 *  - 当插入位置在`card-after`节点内时：
 *    检查祖父节点是否为`card`。如果是，则插入新的段落节点，并设置焦点到新插入的位置，以允许继续编辑。
 */
    if (operation.type === 'remove_node') {
      const { node } = operation;
      const selectPath = editor.selection?.anchor?.path;
      const selectionNode = selectPath
        ? Node.get(editor, Path.parent(selectPath))
        : null;
      // 删除card时，选中card_AFTER 节点
      if (node.type === 'card' && selectionNode?.type !== 'card-after') {
        Transforms.select(editor, [...(operation.path || []), 2]);
        return;
      }
      if (node.type === 'card-after') {
        Transforms.removeNodes(editor, {
          at: Path.parent(operation.path),
        });
        return;
      }
      if (node.type === 'card-before') {
        return;
      }

      if (['table-row', 'table-cell'].includes(node.type)) {
        if (node.type === 'table-cell') {
          apply(operation);
          return;
        }
        if (node.type === 'table-row') {
          apply(operation);
          return;
        }
        return;
      }
      const parentNode = Node.get(editor, Path.parent(operation.path));
      if ('link-card' === parentNode.type) {
        Transforms.removeNodes(editor, {
          at: Path.parent(operation.path),
        });
        return;
      }
    }
    if (operation.type === 'insert_text') {
      const parentNode = Node.get(editor, Path.parent(operation.path));
      if (parentNode.type === 'card-after') {
        if (
          Node.get(editor, Path.parent(Path.parent(operation.path))).type ===
          'card'
        ) {
          Transforms.insertNodes(
            editor,
            [
              {
                type: 'paragraph',
                children: [{ text: operation.text }],
              },
            ],
            {
              at: Path.next(Path.parent(Path.parent(operation.path))),
              select: true,
            },
          );
          return;
        }
        return;
      }
    }
    if (operation.type === 'insert_node') {
      const parentNode = Node.get(editor, Path.parent(operation.path));

      // 表格内部的节点操作，只允许插入行内节点。
      if (
        parentNode.type === 'table-cell' ||
        parentNode.type === 'table-row' ||
        parentNode.type === 'column-cell'
      ) {
        if (TableInlineNode.has(operation.node.type) || !operation.node.type) {
          apply(operation);
          return;
        }
        if (operation.node.type === 'card') {
          const relativeNode = operation.node.children.at(1);
          if (TableInlineNode.has(relativeNode.type)) {
            apply(operation);
            return;
          }
        }
        console.log('parentNode', operation.node);
        console.error('表格内部只支持行内节点！');
        return;
      }
      if (!parentNode) {
        apply(operation);
        return;
      }
      if (
        parentNode.type === 'card-before' ||
        parentNode.type === 'card-after'
      ) {
        if (
          Node.get(editor, Path.parent(Path.parent(operation.path))).type ===
          'card'
        ) {
          Transforms.insertNodes(editor, operation.node, {
            at: Path.next(Path.parent(Path.parent(operation.path))),
          });
          return;
        }
        Transforms.insertNodes(editor, operation.node, {
          at: Path.parent(operation.path),
        });
        return;
      }
    }

    apply(operation);
  };

  editor.deleteBackward = (unit: any) => {
    const { selection } = editor;
    if (
      selection &&
      hasRange(editor, selection) &&
      Range.isCollapsed(selection)
    ) {
      const node = Node.get(editor, Path.parent(selection.anchor.path));
      if (node.type === 'card-before') {
        return;
      }
      if (node.type === 'card-after') {
        Transforms.removeNodes(editor, {
          at: Path.parent(selection.anchor.path),
        });
        return;
      }
    }

    deleteBackward(unit);
  };

  return editor;
};
