import { useCallback } from 'react';
import { useGetSetState } from 'react-use';
import { BaseElement, Editor, Path, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { selChange$ } from '../editor/plugins/useOnchange';
import { EditorStore, useEditorStore } from '../editor/store';
import { EditorUtils } from '../editor/utils/editorUtils';
import { useSubject } from './subscribe';

/**
 * 自定义钩子 `useMEditor` 用于管理 Slate 编辑器中的节点更新和删除操作。
 *
 * @param el - 基础元素，用于确定操作的目标节点。
 * @returns 包含编辑器实例、更新函数和删除函数的元组。
 *
 * @example
 * ```typescript
 * const [editor, update, remove] = useMEditor(element);
 *
 * // 更新节点属性
 * update({ key: 'value' }, currentElement);
 *
 * // 删除节点
 * remove(currentElement);
 * ```
 *
 * @function
 * @name useMEditor
 * @param {BaseElement} el - 基础元素，用于确定操作的目标节点。
 * @returns {[Editor, (props: Record<string, any>, current?: BaseElement) => void, (current?: BaseElement) => void]}
 *          包含编辑器实例、更新函数和删除函数的元组。
 */
export const useMEditor = (el: BaseElement) => {
  const editor = useSlate();

  const update = useCallback(
    (props: Record<string, any>, current?: BaseElement) => {
      Transforms.setNodes(editor, props, {
        at: ReactEditor.findPath(editor, current || el),
      });
    },
    [editor, el],
  );

  const remove = useCallback(
    (current?: BaseElement) => {
      try {
        const path = ReactEditor.findPath(editor, current || el);
        Transforms.delete(editor, { at: path });
        if (
          Path.equals([0], path) &&
          !Editor.hasPath(editor, Path.next(path))
        ) {
          const dom = ReactEditor.toDOMNode(editor, editor);
          dom.focus();
          Transforms.insertNodes(
            editor,
            { type: 'paragraph', children: [{ text: '' }] },
            { select: true },
          );
        }
      } catch (e) {
        console.error('remove note', e);
      }
    },
    [editor, el],
  );

  return [editor, update, remove] as [
    typeof editor,
    typeof update,
    typeof remove,
  ];
};

/**
 * 自定义 Hook，用于获取编辑器中元素的选中状态和路径。
 *
 * @param element - 需要检查的元素。
 * @returns 一个包含选中状态、路径和编辑器存储的数组。
 *
 * @remarks
 * 该 Hook 使用 `useEditorStore` 获取编辑器存储，并使用 `useGetSetState` 管理组件状态。
 * 它通过 `useSubject` 订阅 `selChange$` 主题，以响应选中状态的变化。
 *
 * @example
 * ```typescript
 * const [isSelected, elementPath, editorStore] = useSelStatus(someElement);
 * ```
 */
export const useSelStatus = (element: any) => {
  const editor = useSlate();
  const { store } = useEditorStore();
  const [state, setState] = useGetSetState({
    selected: !store?.initializing && ReactEditor.isFocused(editor),
    path: EditorUtils.findPath(editor, element),
  });

  useSubject(
    selChange$,
    (ctx) => {
      const path = EditorUtils.findPath(store?.editor, element);
      if (!ctx) {
        return setState({
          selected: false,
          path,
        });
      }
      setState({
        path,
        selected: Path.equals(path, ctx.node?.[1] || []),
      });
    },
    [element],
  );
  return [state().selected, state().path, store] as [
    boolean,
    Path,
    EditorStore,
  ];
};
