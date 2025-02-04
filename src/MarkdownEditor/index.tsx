import { observable } from 'mobx';
import React, {
  ReactNode,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { parserMdToSchema } from './editor/parser/parserMdToSchema';
import { EditorStore, EditorStoreContext } from './editor/store';
import { TocHeading } from './editor/tools/Leading';
import { EditorUtils } from './editor/utils/editorUtils';
import {
  KeyboardTask,
  Methods,
  useSystemKeyboard,
} from './editor/utils/keyboard';

import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import { Subject } from 'rxjs';
import { createEditor, Selection } from 'slate';
import { withHistory } from 'slate-history';
import { CommentList } from './editor/components/CommentList';
import { MEditor } from './editor/Editor';
import { withMarkdown } from './editor/plugins';
import { withErrorReporting } from './editor/plugins/catchError';
import { withReact } from './editor/slate-react';
import {
  InsertAutocomplete,
  InsertAutocompleteProps,
} from './editor/tools/InsertAutocomplete';
import { InsertLink } from './editor/tools/InsertLink';
import { ToolBar } from './editor/tools/ToolBar';
import { ToolsKeyType } from './editor/tools/ToolBar/BaseBar';
import { FloatBar } from './editor/tools/ToolBar/FloatBar';
import { codeReady } from './editor/utils/highlight';
import { ElementProps, Elements, ListItemNode } from './el';
import './index.css';
import { useStyle } from './style';
export { EditorUtils, parserMdToSchema };

export * from './editor/elements';
export * from './editor/utils';
export * from './el';

/**
 * @typedef CommentDataType
 * @description 表示评论数据的类型。
 *
 * @property {Selection} selection - 用户选择的文本范围。
 * @property {number[]} path - 文档中选择路径的数组。
 * @property {number} anchorOffset - 选择范围的起始偏移量。
 * @property {number} focusOffset - 选择范围的结束偏移量。
 * @property {string} refContent - 参考内容。
 * @property {string} commentType - 评论的类型。
 * @property {string} content - 评论的内容。
 * @property {number} time - 评论的时间戳。
 * @property {string | number} id - 评论的唯一标识符。
 * @property {Object} [user] - 用户信息（可选）。
 * @property {string} user.name - 用户名。
 * @property {string} [user.avatar] - 用户头像（可选）。
 */
export type CommentDataType = {
  selection: Selection;
  path: number[];
  updateTime?: number;
  anchorOffset: number;
  focusOffset: number;
  refContent: string;
  commentType: string;
  content: string;
  time: number | string;
  id: string | number;
  user?: {
    name: string;
    avatar?: string;
  };
};

/**
 * 编辑器接口定义
 * @interface IEditor
 *
 * @property {IEditor[]} [children] - 子编辑器列表
 * @property {boolean} [expand] - 是否展开
 * @property {any[]} [schema] - 编辑器模式配置
 * @property {any} [history] - 编辑器历史记录
 */
export type IEditor = {
  children?: IEditor[];
  expand?: boolean;
};

/**
 * MarkdownEditor 实例
 */
export interface MarkdownEditorInstance {
  range?: Range;
  store: EditorStore;
}

/**
 * MarkdownEditor 的 props
 * @param props
 */
export type MarkdownEditorProps = {
  className?: string;
  width?: string | number;
  height?: string | number;

  /**
   * 代码高亮配置
   */
  codeProps?: {
    Languages?: string[];
  };
  /**
   * 配置图片数据
   */
  image?: {
    upload?: (file: File[] | string[]) => Promise<string[] | string>;
  };
  initValue?: string;
  /**
   * 只读模式
   */
  readonly?: boolean;
  /**
   * 样式
   */
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  editorStyle?: React.CSSProperties;
  /**
   * 是否显示目录
   */
  toc?: boolean;
  /**
   * 配置工具栏
   */
  toolBar?: {
    min?: boolean;
    enable?: boolean;
    extra?: React.ReactNode[];
    hideTools?: ToolsKeyType[];
  };

  /**
   * markdown 编辑器的根容器，用于外部获取实例
   * @default document.body
   */
  rootContainer?: React.MutableRefObject<HTMLDivElement | undefined>;

  fncProps?: {
    render: (
      props: { children: string },
      defaultDom: React.ReactNode,
    ) => React.ReactNode;
  };
  /**
   * 用于外部获取实例
   */
  editorRef?: React.MutableRefObject<MarkdownEditorInstance | undefined>;
  /**
   * 自定义渲染元素
   * @param props
   * @param defaultDom
   * @returns
   */
  eleItemRender?: (
    props: ElementProps,
    defaultDom: React.ReactNode,
  ) => React.ReactElement;
  initSchemaValue?: Elements[];
  /**
   * 内容变化回调
   * @param value:string
   * @param schema:Elements[]
   * @returns
   */
  onChange?: (value: string, schema: Elements[]) => void;

  /**
   * 是否开启报告模式,展示效果会发生变化
   * @default false
   */
  reportMode?: boolean;

  /**
   * ppt 模式
   * @default false
   */
  slideMode?: boolean;
  /**
   * 是否开启打字机模式
   */
  typewriter?: boolean;

  /**
   * 插入自动补全的能力
   */
  insertAutocompleteProps?: InsertAutocompleteProps;

  /**
   * 标题 placeholder
   */
  titlePlaceholderContent?: string;

  comment?: {
    enable?: boolean;
    onSubmit?: (id: string, comment: CommentDataType) => void;
    commentList?: CommentDataType[];
    deleteConfirmText?: string;
    loadMentions?: (
      keyword: string,
    ) => Promise<{ name: string; avatar?: string }[]>;
    mentionsPlaceholder?: string;
    editorRender?: (defaultDom: ReactNode) => ReactNode;
    previewRender?: (
      props: {
        comment: CommentDataType[];
      },
      defaultDom: ReactNode,
    ) => React.ReactElement;
    onDelete?: (id: string | number, item: CommentDataType) => void;
    listItemRender?: (
      doms: {
        checkbox: React.ReactNode;
        mentionsUser: React.ReactNode;
        children: React.ReactNode;
      },
      props: ElementProps<ListItemNode>,
    ) => React.ReactNode;
  };
};

/**
 * MarkdownEditor
 * @param props
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = (props) => {
  const {
    initValue,
    width,
    toolBar,
    editorRef,
    toc = true,
    readonly,
    style,
    contentStyle,
    editorStyle,
    height,
    ...rest
  } = props;
  const [mount, setMount] = useState(false);

  const keyTask$ = useMemo(
    () =>
      new Subject<{
        key: Methods<KeyboardTask>;
        args?: any[];
      }>(),
    [],
  );

  const markdownEditorRef = useRef(
    withMarkdown(withReact(withHistory(createEditor()))),
  );

  useEffect(() => {
    withErrorReporting(markdownEditorRef.current);
  }, []);

  const store = useMemo(() => new EditorStore(markdownEditorRef), []);

  /**
   * 初始化 schema
   */
  const initSchemaValue = useMemo(() => {
    const list = parserMdToSchema(initValue!)?.schema;
    if (!props.readonly) {
      list.push(EditorUtils.p);
    }
    const schema =
      props.initSchemaValue ||
      (initValue ? list : JSON.parse(JSON.stringify([EditorUtils.p])));

    return schema?.filter((item: any) => {
      if (item.type === 'p' && item.children.length === 0) {
        return false;
      }
      if (item.type === 'list' && item.children.length === 0) {
        return false;
      }
      if (item.type === 'listItem' && item.children.length === 0) {
        return false;
      }
      return true;
    });
  }, []);

  // 初始化实例
  const instance = useMemo(() => {
    return observable(
      {
        store,
      } as MarkdownEditorInstance,
      { range: false },
    );
  }, []);

  /**
   * 初始化代码高亮
   */
  useEffect(() => {
    instance.store.setState((value) => {
      value.refreshHighlight = Date.now();
    });
    codeReady({
      langs: props?.codeProps?.Languages || [],
    }).then(() => {
      instance.store.setState((value) => {
        value.refreshHighlight = Date.now();
      });
    });
  }, []);

  useSystemKeyboard(keyTask$, instance.store, props);

  // 导入外部 hooks
  useImperativeHandle(editorRef, () => instance, [instance]);

  // 初始化 readonly
  useEffect(() => {
    instance.store.setState((state) => (state.readonly = !!readonly));
  }, [readonly]);

  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context.getPrefixCls(`md-editor`);
  const { wrapSSR, hashId } = useStyle(baseClassName);

  const [showCommentList, setShowComment] = useState<CommentDataType[]>([]);

  const [schema, setSchema] = useState<Elements[]>(initSchemaValue);

  return wrapSSR(
    <EditorStoreContext.Provider
      value={{
        keyTask$,
        rootContainer: props.rootContainer,
        setShowComment,
        store: instance.store,
        typewriter: props.typewriter ?? false,
        readonly: props.readonly ?? false,
        editorProps: props || {},
        markdownEditorRef,
      }}
    >
      <div
        className={classNames(
          'markdown-editor',
          baseClassName,
          hashId,
          props.className,
          {
            [baseClassName + '-readonly']: readonly,
            [baseClassName + '-edit']: !readonly,
            [baseClassName + '-report']: props.reportMode,
            [baseClassName + '-slide']: props.slideMode,
          },
        )}
        style={{
          width: width || '400px',
          height: height || 'auto',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100%',
          ...style,
        }}
      >
        {!readonly && toolBar?.enable ? (
          <div
            style={{
              width: '100%',
              maxWidth: '100%',
              position: 'sticky',
              zIndex: 1000,
              top: 0,
            }}
            className={classNames('md-editor-toolbar-container', {
              [baseClassName + '-min-toolbar']: toolBar.min,
            })}
          >
            <ToolBar
              hideTools={toolBar.hideTools}
              extra={toolBar.extra}
              min={toolBar.min}
            />
          </div>
        ) : readonly ? null : null}
        <div
          style={{
            padding: props.readonly ? '8px' : '24px 24px',
            paddingLeft: props.readonly ? undefined : 32,
            overflow: 'auto',
            display: 'flex',
            height: !readonly && toolBar?.enable ? `calc(100% - 56px)` : '100%',
            position: 'relative',
            gap: 24,
            ...contentStyle,
          }}
          ref={(dom) => {
            instance.store.setState((state) => (state.container = dom));
            setMount(true);
          }}
        >
          <MEditor
            prefixCls={baseClassName}
            {...rest}
            onChange={(value, schema) => {
              setSchema(schema);
              rest?.onChange?.(value, schema);
            }}
            initSchemaValue={initSchemaValue}
            style={editorStyle}
            instance={instance}
          />
          {readonly ? (
            props.reportMode ? (
              <FloatBar readonly />
            ) : null
          ) : (
            <FloatBar readonly={false} />
          )}
          {mount && toc !== false && instance.store?.container ? (
            showCommentList?.length ? (
              <CommentList
                commentList={showCommentList}
                comment={props.comment}
              />
            ) : (
              <TocHeading schema={schema} />
            )
          ) : null}
        </div>
        {readonly ? (
          <></>
        ) : (
          <>
            <InsertLink />
            <InsertAutocomplete {...props.insertAutocompleteProps} />
          </>
        )}
      </div>
    </EditorStoreContext.Provider>,
  );
};
