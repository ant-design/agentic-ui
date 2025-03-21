import { message } from 'antd';
import isHotkey from 'is-hotkey';
import { action } from 'mobx';
import { useCallback, useEffect, useMemo } from 'react';
import { Subject } from 'rxjs';
import { Editor, Element, Node, Path, Range, Transforms } from 'slate';
import { MarkdownEditorProps } from '../../BaseMarkdownEditor';
import { AttachNode, ListItemNode, MediaNode, TableNode } from '../../el';
import { useSubject } from '../../hooks/subscribe';
import { parserMdToSchema } from '../parser/parserMdToSchema';
import { ReactEditor } from '../slate-react';
import { EditorStore } from '../store';
import { EditorUtils } from './editorUtils';

export type Methods<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

export class KeyboardTask {
  store: EditorStore;
  editor: EditorStore['editor'];
  props: MarkdownEditorProps;

  constructor(store: EditorStore, props: MarkdownEditorProps) {
    this.store = store;
    this.editor = store?.editor;
    this.props = props;
  }

  get curNodes() {
    return Editor.nodes<any>(this.editor, {
      mode: 'lowest',
      match: (m) => {
        return Element.isElement(m);
      },
    });
  }

  private openFloatBar() {
    setTimeout(() => {
      try {
        const domRange = window.getSelection()?.getRangeAt(0);
        const rect = domRange?.getBoundingClientRect();
        if (rect) {
          this.store.setState((state) => (state.domRect = rect));
        }
      } catch (e) {}
    });
  }

  selectAll() {
    const [node] = this.curNodes;
    if (node?.[0]?.type === 'table-cell') {
      Transforms.select(this.editor, Path.parent(Path.parent(node[1])));
    } else {
      Transforms.select(this.editor, {
        anchor: Editor.start(this.editor, []),
        focus: Editor.end(this.editor, []),
      });
    }
  }

  /**
   * 选择当前行的文本。
   *
   * 如果编辑器中有选区，则选择当前行的文本，并打开浮动工具栏。
   *
   * @remarks
   * 该方法首先检查编辑器中是否有选区。如果有选区，则选择当前行的文本路径。
   * 然后获取当前行的文本内容，如果文本内容存在，则打开浮动工具栏。
   */
  selectLine() {
    if (this.editor.selection) {
      Transforms.select(
        this.editor,
        Path.parent(this.editor.selection.anchor.path),
      );
      const text =
        Node.leaf(this.editor, this.editor.selection.anchor.path).text || '';
      if (text) {
        this.openFloatBar();
      }
    }
  }

  selectFormat() {
    if (this.editor.selection) {
      Transforms.select(this.editor, this.editor.selection.anchor.path);
    }
  }

  /**
   * 选择当前光标所在的单词或汉字。
   *
   * 如果当前选区是折叠的（即光标没有选中任何文本），则会尝试选择光标所在位置的整个单词或汉字。
   *
   * 具体步骤如下：
   * 1. 获取当前选区，如果选区是折叠的，则继续。
   * 2. 获取光标所在位置的文本内容。
   * 3. 根据光标位置，向前和向后查找单词或汉字的边界。
   * 4. 更新选区，使其包含整个单词或汉字。
   * 5. 如果选区不再是折叠的，则打开浮动工具栏。
   *
   * @remarks
   * 该方法支持英文单词和中文汉字的选择。
   */
  selectWord() {
    const sel = this.editor.selection;
    if (sel && Range.isCollapsed(sel)) {
      const text = Node.leaf(this.editor, sel.anchor.path).text || '';
      let start = sel.anchor.offset;
      let end = start;
      const next = text.slice(start);
      const pre = text.slice(0, start);
      let m1 = next.match(/^(\w+)/);
      if (m1) {
        end += m1[1].length;
        let m2 = pre.match(/(\w+)$/);
        if (m2) start = start - m2[1].length;
      } else {
        m1 = next.match(/^([\u4e00-\u9fa5]+)/);
        if (m1) {
          end += m1[1].length;
          let m2 = pre.match(/([\u4e00-\u9fa5]+)$/);
          if (m2) start = start - m2[1].length;
        } else {
          let m2 = pre.match(/(\w+)$/);
          if (!m2) m2 = pre.match(/([\u4e00-\u9fa5]+)$/);
          if (m2) start -= m2[1].length;
        }
      }
      if (start === sel.anchor.offset && end === sel.anchor.offset && next) {
        end = start + 1;
      }
      Transforms.select(this.editor, {
        anchor: { path: sel.anchor.path, offset: start },
        focus: { path: sel.anchor.path, offset: end },
      });
      if (!Range.isCollapsed(this.editor.selection!)) this.openFloatBar();
    }
  }

  /**
   * 从剪贴板粘贴纯文本内容到编辑器中。
   *
   * 该方法首先从剪贴板读取文本内容，然后根据当前节点的类型决定如何插入文本。
   * 如果当前节点是表格单元格类型，则将换行符替换为空格后插入文本；
   * 否则，直接插入文本。
   *
   * @returns {Promise<void>} 一个表示异步操作的 Promise 对象。
   */
  async pastePlainText() {
    const text = await navigator.clipboard.readText();
    if (text) {
      const [node] = this.curNodes;
      if (node[0].type === 'table-cell') {
        Editor.insertText(this.editor, text.replace(/\n/g, ' '));
      } else {
        Editor.insertText(this.editor, text);
      }
    }
  }
  /**
   * 上传图片
   */
  uploadImage() {
    const input = document.createElement('input');
    const [node] = this.curNodes;
    input.id = 'uploadImage' + '_' + Math.random();
    input.type = 'file';
    input.accept = 'image/*';
    const insertMedia = async (url: string) => {
      if (node && ['column-cell'].includes(node[0].type)) {
        Transforms.insertNodes(
          this.editor,
          [EditorUtils.createMediaNode(url, 'image', {})],
          {
            at: [...node[1], 0],
          },
        );
        return;
      }
      if (node) {
        Transforms.insertNodes(
          this.editor,
          [EditorUtils.createMediaNode(url, 'image', {})],
          {
            at: Path.next(node[1]),
          },
        );
      } else {
        Transforms.insertNodes(
          this.editor,
          [EditorUtils.createMediaNode(url, 'image', {})],
          {
            select: true,
          },
        );
      }
    };
    input.onchange = async (e: any) => {
      if (input.dataset.readonly) {
        return;
      }
      input.dataset.readonly = 'true';
      const hideLoading = message.loading('上传中...');
      try {
        const url =
          (await this.props?.image?.upload?.(
            (Array.from(e.target.files) as File[]) || [],
          )) || [];
        [url].flat().forEach((u: string) => {
          insertMedia(u);
        });
        message.success('上传成功');
      } catch (error) {
      } finally {
        hideLoading();
        input.value = '';
      }
    };
    if (input.dataset.readonly) {
      return;
    }
    input.click();
    input.remove();
  }

  /**
   * Asynchronously pastes Markdown code from the clipboard into the editor.
   *
   * This function reads Markdown text from the clipboard, parses it into a schema,
   * and inserts it into the editor at the current selection. It handles different
   * node types and ensures proper insertion based on the context of the current node.
   *
   * The function performs the following steps:
   * 1. Reads Markdown text from the clipboard.
   * 2. Parses the Markdown text into a schema.
   * 3. Checks if the current node is a paragraph and empty, then deletes it and inserts the new schema.
   * 4. If the schema's first node is a paragraph and the current node is a paragraph or table-cell, it inserts the first node's children.
   * 5. Inserts the remaining schema nodes based on the type of the current node.
   * 6. Refreshes the editor's highlight state after a short delay.
   *
   * @returns {Promise<void>} A promise that resolves when the paste operation is complete.
   */
  async pasteMarkdownCode() {
    const markdownCode = await navigator.clipboard.readText();
    if (markdownCode) {
      const [node] = this.curNodes;
      const res = await parserMdToSchema(markdownCode);

      if (
        node?.[0]?.type === 'paragraph' &&
        !Node.string(node[0]) &&
        node?.[0]?.children.length === 1
      ) {
        Transforms.delete(this.editor, { at: node[1] });
        Transforms.insertNodes(this.editor, res.schema, {
          at: node[1],
          select: true,
        });
        return;
      }
      if (
        res.schema[0]?.type === 'paragraph' &&
        ['paragraph', 'table-cell'].includes(node[0].type)
      ) {
        const first = res.schema.shift();
        Editor.insertNode(this.editor, (first as TableNode)?.children);
      }
      if (res.schema.length) {
        if (['table-cell'].includes(node[0].type)) {
          const [block] = Editor.nodes<any>(this.editor, {
            match: (n) => ['table', 'code', 'paragraph'].includes(n.type),
            mode: 'lowest',
          });
          Transforms.insertNodes(this.editor, res.schema, {
            at: Path.next(block[1]),
            select: true,
          });
        } else {
          Transforms.insertNodes(this.editor, res.schema, {
            at: Path.next(node[1]),
            select: true,
          });
        }
      }
    }
  }

  head(level: number) {
    const [node] = this.curNodes;
    if (level === 4) {
      this.paragraph();
      return;
    }
    if (
      node &&
      ['paragraph', 'head'].includes(node[0].type) &&
      EditorUtils.isTop(this.editor, node[1])
    ) {
      Transforms.setNodes(
        this.editor,
        { type: 'head', level },
        { at: node[1] },
      );
    }
  }

  paragraph() {
    const [node] = this.curNodes;
    if (node && ['head'].includes(node[0].type)) {
      Transforms.setNodes(this.editor, { type: 'paragraph' }, { at: node[1] });
    }
  }

  increaseHead() {
    const [node] = this.curNodes;
    if (
      node &&
      ['paragraph', 'head'].includes(node[0].type) &&
      EditorUtils.isTop(this.editor, node[1])
    ) {
      if (node[0].type === 'paragraph') {
        Transforms.setNodes(
          this.editor,
          { type: 'head', level: 4 },
          { at: node[1] },
        );
      } else if (node[0].level === 1) {
        Transforms.setNodes(
          this.editor,
          { type: 'paragraph' },
          { at: node[1] },
        );
      } else {
        Transforms.setNodes(
          this.editor,
          { level: node[0].level - 1 },
          { at: node[1] },
        );
      }
    }
  }

  decreaseHead() {
    const [node] = this.curNodes;
    if (
      node &&
      ['paragraph', 'head'].includes(node[0].type) &&
      EditorUtils.isTop(this.editor, node[1])
    ) {
      if (node[0].type === 'paragraph') {
        Transforms.setNodes(
          this.editor,
          { type: 'head', level: 1 },
          { at: node[1] },
        );
      } else if (node[0].level === 4) {
        Transforms.setNodes(
          this.editor,
          { type: 'paragraph' },
          { at: node[1] },
        );
      } else {
        Transforms.setNodes(
          this.editor,
          { level: node[0].level + 1 },
          { at: node[1] },
        );
      }
    }
  }

  insertQuote() {
    const [node] = this.curNodes;
    if (!['paragraph', 'head'].includes(node[0].type)) return;
    if (Node.parent(this.editor, node[1]).type === 'blockquote') {
      Transforms.unwrapNodes(this.editor, { at: Path.parent(node[1]) });
      return;
    }
    if (node[0].type === 'head') {
      Transforms.setNodes(
        this.editor,
        {
          type: 'paragraph',
        },
        { at: node[1] },
      );
    }
    Transforms.wrapNodes(this.editor, {
      type: 'blockquote',
      children: [],
    });
  }

  insertTable() {
    const [node] = this.curNodes;
    if (node && ['paragraph', 'head'].includes(node[0].type)) {
      const path =
        node[0].type === 'paragraph' && !Node.string(node[0])
          ? node[1]
          : Path.next(node[1]);
      Transforms.insertNodes(
        this.editor,
        EditorUtils.wrapperCardNode({
          type: 'table',
          otherProps: {
            colWidths: new Array(3).fill(200) as number[],
          },
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  title: true,
                  children: [{ text: '' }],
                },
                {
                  type: 'table-cell',
                  title: true,
                  children: [{ text: '' }],
                },
                {
                  type: 'table-cell',
                  title: true,
                  children: [{ text: '' }],
                },
              ],
            },
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: '' }] },
                {
                  type: 'table-cell',
                  children: [{ text: '' }],
                },
                { type: 'table-cell', children: [{ text: '' }] },
              ],
            },
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: '' }] },
                {
                  type: 'table-cell',
                  children: [{ text: '' }],
                },
                { type: 'table-cell', children: [{ text: '' }] },
              ],
            },
          ],
        }),
        { at: path },
      );
      if (node[0].type === 'paragraph' && !Node.string(node[0])) {
        Transforms.delete(this.editor, { at: Path.next(path) });
      }
      Transforms.select(this.editor, Editor.start(this.editor, path));
    }

    if (node && ['column-cell'].includes(node[0].type)) {
      Transforms.insertNodes(
        this.editor,
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', title: true, children: [{ text: '' }] },
                {
                  type: 'table-cell',
                  title: true,
                  children: [{ text: '' }],
                },
                { type: 'table-cell', title: true, children: [{ text: '' }] },
              ],
            },
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: '' }] },
                {
                  type: 'table-cell',
                  children: [{ text: '' }],
                },
                { type: 'table-cell', children: [{ text: '' }] },
              ],
            },
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: '' }] },
                {
                  type: 'table-cell',
                  children: [{ text: '' }],
                },
                { type: 'table-cell', children: [{ text: '' }] },
              ],
            },
          ],
        },
        { at: [...node[1], 0] },
      );
    }
  }

  insertColumn() {
    const [node] = this.curNodes;
    if (node) {
      const path = node[0].type === 'paragraph' ? node[1] : Path.next(node[1]);
      if (node[0].type === 'paragraph' && !Node.string(node[0])) {
        Transforms.delete(this.editor, { at: node[1] });
      }
      Transforms.insertNodes(
        this.editor,
        EditorUtils.wrapperCardNode({
          type: 'column-group',
          otherProps: {
            elementType: 'column',
          },
          style: {
            flex: 1,
          },
          children: [
            {
              type: 'column-cell',
              children: [{ text: '' }],
            },
            {
              type: 'column-cell',
              children: [{ text: '' }],
            },
          ],
        }),
        { at: path, select: true },
      );
    }
  }

  insertCode(type?: 'mermaid' | 'html') {
    const [node] = this.curNodes;
    if (node && ['column-cell'].includes(node[0].type)) {
      Transforms.insertNodes(
        this.editor,
        {
          type: 'code',
          language: undefined,
          value: '',
          children: [{ text: '' }],
          render: type === 'html' ? true : undefined,
        },
        { at: [...node[1], 0] },
      );
      return;
    }
    if (node && ['paragraph', 'head'].includes(node[0].type)) {
      const path =
        node[0].type === 'paragraph' && !Node.string(node[0])
          ? node[1]
          : Path.next(node[1]);
      let lang = '';
      if (type === 'mermaid') {
        lang = 'mermaid';
      }

      Transforms.insertNodes(
        this.editor,
        {
          type: 'code',
          language: lang ? lang : undefined,
          children: [
            {
              text: `flowchart TD\n    Start --> Stop`,
            },
          ],
          render: type === 'html' ? true : undefined,
        },
        { at: path },
      );

      Transforms.select(this.editor, Editor.end(this.editor, path));
    }
  }

  horizontalLine() {
    const [node] = this.curNodes;
    if (node && ['paragraph', 'head'].includes(node[0].type)) {
      const path =
        node[0].type === 'paragraph' && !Node.string(node[0])
          ? node[1]
          : Path.next(node[1]);
      Transforms.insertNodes(
        this.editor,
        {
          type: 'hr',
          children: [{ text: '' }],
        },
        { at: path },
      );
      if (Editor.hasPath(this.editor, Path.next(path))) {
        Transforms.select(
          this.editor,
          Editor.start(this.editor, Path.next(path)),
        );
      } else {
        Transforms.insertNodes(
          this.editor,
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
          { at: Path.next(path), select: true },
        );
      }
    }
  }

  list(mode: 'ordered' | 'unordered' | 'task') {
    const [curNode, curPath] = this.curNodes;
    if (curNode && ['paragraph', 'head'].includes(curNode[0].type)) {
      const parent = Editor.parent(this.editor, curNode[1]);
      if (parent[0].type === 'list-item' && !Path.hasPrevious(curNode[1])) {
        Transforms.setNodes(
          this.editor,
          {
            order: mode === 'ordered',
            task: mode === 'task',
          },
          { at: Path.parent(parent[1]) },
        );
        const listItems = Array.from<any>(
          Editor.nodes(this.editor, {
            match: (n) => n.type === 'list-item',
            at: Path.parent(parent[1]),
            reverse: true,
            mode: 'lowest',
          }),
        );
        Transforms.setNodes(
          this.editor,
          { start: undefined },
          { at: Path.parent(parent[1]) },
        );
        for (let l of listItems) {
          Transforms.setNodes(
            this.editor,
            { checked: mode === 'task' ? l[0].checked || false : undefined },
            { at: l[1] },
          );
        }
      } else {
        const childrenList: ListItemNode[] = [];
        const selectNodeList = [...this.curNodes];

        //删除选中的节点
        selectNodeList.forEach(() => {
          Transforms.delete(this.editor);
        });

        Transforms.delete(this.editor, {
          at: curPath,
        });
        Transforms.delete(this.editor, {
          at: curNode[1],
        });

        selectNodeList?.forEach((mapNode) => {
          const item = {
            type: 'list-item',
            checked: mode === 'task' ? false : undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: Node.string(mapNode[0]) }],
              },
            ],
          } as ListItemNode;
          childrenList.push(item);
        });

        Transforms.insertNodes(
          this.editor,
          {
            type: 'list',
            order: mode === 'ordered',
            task: mode === 'task',
            children: childrenList,
          },
          { at: curNode[1], select: true },
        );
      }
    }
  }

  format(type: string) {
    EditorUtils.toggleFormat(this!.editor, type);
  }

  clear() {
    if (this.editor.selection)
      EditorUtils.clearMarks(
        this.editor,
        !Range.isCollapsed(this.editor.selection),
      );
  }

  undo() {
    try {
      this.store?.editor.undo();
    } catch (e) {}
  }

  redo() {
    try {
      this.store?.editor.redo();
    } catch (e) {}
  }
}

const keyMap: [string, Methods<KeyboardTask>, any[]?, boolean?][] = [
  ['mod+shift+l', 'selectLine'],
  ['mod+e', 'selectFormat'],
  ['mod+d', 'selectWord'],
  ['mod+a', 'selectAll'],
  ['mod+option+v', 'pasteMarkdownCode'],
  ['mod+shift+v', 'pastePlainText'],
  ['mod+1', 'head', [1]],
  ['mod+2', 'head', [2]],
  ['mod+3', 'head', [3]],
  ['mod+4', 'head', [4]],
  ['mod+0', 'paragraph'],
  ['mod+]', 'increaseHead'],
  ['mod+[', 'decreaseHead'],
  ['option+q', 'insertQuote'],
  ['mod+option+t', 'insertTable'],
  ['mod+option+c', 'insertCode'],
  ['mod+option+/', 'horizontalLine'],
  ['mod+option+o', 'list', ['ordered']],
  ['mod+option+u', 'list', ['unordered']],
  ['mod+option+s', 'list', ['task']],
  ['mod+b', 'format', ['bold']],
  ['mod+i', 'format', ['italic']],
  ['mod+shift+s', 'format', ['strikethrough']],
  ['option+`', 'format', ['code']],
  ['mod+\\', 'clear'],
  ['mod+option+m', 'insertCode', ['mermaid']],
];

export const useSystemKeyboard = (
  keyTask$: Subject<{
    key: Methods<KeyboardTask>;
    args?: any[];
  }>,
  store: EditorStore,
  props: MarkdownEditorProps,
) => {
  const task = useMemo(() => {
    return new KeyboardTask(store, props);
  }, [props.readonly]);

  useSubject(keyTask$, ({ key, args }: any) => {
    // @ts-ignore
    task[key](...(args || []));
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const keydown = useCallback(
    action((e: KeyboardEvent) => {
      if (!store) return;

      if (isHotkey('mod+c', e) || isHotkey('mod+x', e)) {
        const [node] = Editor.nodes<MediaNode | AttachNode>(store?.editor, {
          mode: 'lowest',
          match: (m) =>
            Element.isElement(m) && (m.type === 'media' || m.type === 'attach'),
        });
        if (!node) return;
        let readlUrl = node[0]?.url as string;

        if (node[0].type === 'media') {
          const url = `media://file?url=${readlUrl}&height=${
            node[0].height || ''
          }`;
          try {
            navigator.clipboard.writeText(url);
          } catch (error) {}
          if (isHotkey('mod+x', e)) {
            Transforms.delete(store?.editor, { at: node[1] });
            ReactEditor.focus(store?.editor);
          }
        }
        if (node[0].type === 'attach') {
          const url = `attach://file?size=${node[0].size}&name=${node[0].name}&url=${node[0]?.url}`;
          try {
            navigator.clipboard.writeText(url);
          } catch (error) {}

          if (isHotkey('mod+x', e)) {
            Transforms.delete(store?.editor, { at: node[1] });
            ReactEditor.focus(store?.editor);
          }
        }
      }

      if (isHotkey('backspace', e)) {
        if (!store.focus) return;
        const [node] = task.curNodes;
        if (node?.[0].type === 'media') {
          e.preventDefault();
          Transforms.removeNodes(task.editor, { at: node[1] });
          Transforms.insertNodes(task.editor, EditorUtils.p, {
            at: node[1],
            select: true,
          });
          ReactEditor.focus(task.editor);
        }
      }
      if (isHotkey('arrowUp', e) || isHotkey('arrowDown', e)) {
        const [node] = task.curNodes;
        if (node?.[0].type === 'media') {
          e.preventDefault();
          if (isHotkey('arrowUp', e)) {
            Transforms.select(
              task.editor,
              Editor.end(
                task.editor,
                EditorUtils.findPrev(task.editor, node[1]),
              ),
            );
          } else if (EditorUtils.findNext(task.editor, node[1])) {
            Transforms.select(
              task.editor,
              Editor.start(
                task.editor,
                EditorUtils.findNext(task.editor, node[1])!,
              ),
            );
          }
          ReactEditor.focus(task.editor);
        }
      }
      for (let key of keyMap) {
        if (isHotkey(key[0], e)) {
          e.preventDefault();
          e.stopPropagation();
          if (!key[3] && !store.focus) return;
          // @ts-ignore
          task[key[1]](...(key[2] || []));
          break;
        }
      }
    }),
    [],
  );

  useEffect(() => {
    window.addEventListener('keydown', keydown);
    return () => {
      window.removeEventListener('keydown', keydown);
    };
  }, []);
};
