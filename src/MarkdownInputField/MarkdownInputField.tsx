import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import { useMergedState } from 'rc-util';
import React, {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { useRefFunction } from '../hooks/useRefFunction';
import {
  BaseMarkdownEditor,
  Elements,
  MarkdownEditorInstance,
  MarkdownEditorProps,
} from '../MarkdownEditor';
import {
  upLoadFileToServer,
  type AttachmentButtonProps,
} from './AttachmentButton';
import { AttachmentFileList } from './AttachmentButton/AttachmentFileList';
import type { AttachmentFile } from './AttachmentButton/types';
import { getFileListFromDataTransferItems } from './FilePaste';
import { useFileUploadManager } from './FileUploadManager';
import { QuickActions } from './QuickActions';
import { SendActions } from './SendActions';
import type { SkillModeConfig } from './SkillModeBar';
import { SkillModeBar } from './SkillModeBar';
import { addGlowBorderOffset, useStyle } from './style';
import { Suggestion } from './Suggestion';
import type { CreateRecognizer } from './VoiceInput';
import { useVoiceInputManager } from './VoiceInputManager';

/**
 * Markdown 输入字段的属性接口
 *
 * @interface MarkdownInputFieldProps
 * @property {string} [value] - 输入字段的当前文本值
 * @property {function} [onChange] - 当输入值改变时触发的回调函数
 * @property {string} [placeholder] - 输入字段的占位文本
 * @property {React.CSSProperties} [style] - 应用于输入字段的内联样式
 * @property {string} [className] - 应用于输入字段的 CSS 类名
 * @property {boolean} [disabled] - 是否禁用输入字段
 * @property {boolean} [typing] - 用户是否正在输入的状态标志
 * @property {'Enter' | 'Mod+Enter'} [triggerSendKey] - 触发发送操作的键盘快捷键
 * @property {function} [onSend] - 当内容发送时触发的异步回调函数
 */

export type MarkdownInputFieldProps = {
  /**
   * 当前的 markdown 文本值。
   * @example value="# Hello World"
   */
  value?: string;

  /**
   * 当输入值改变时触发的回调函数。
   * @param value The new markdown text value
   * @example onChange={(newValue) => setMarkdown(newValue)}
   */
  onChange?: (value: string) => void;

  /**
   * 输入字段的占位文本。
   * @example placeholder="Type markdown here..."
   */
  placeholder?: string;

  /**
   * 应用于输入字段的内联样式。
   * @example style={{ minHeight: '200px' }}
   */
  style?: React.CSSProperties;

  /**
   * 应用于输入字段的 CSS 类名。
   * @example className="custom-markdown-input"
   */
  className?: string;

  /**
   * 是否禁用输入字段。
   * @example disabled={isSubmitting}
   */
  disabled?: boolean;

  /**
   * 用户是否正在输入的状态标志。
   * @example typing={isComposing}
   */
  typing?: boolean;

  /**
   * 触发发送操作的键盘快捷键。
   * - 'Enter': 回车键触发发送
   * - 'Mod+Enter': 按下 Ctrl/Command + Enter 触发发送
   * @example triggerSendKey="Mod+Enter"
   */
  triggerSendKey?: 'Enter' | 'Mod+Enter';

  /**
   * 当内容发送时触发的异步回调函数。
   * 返回一个 Promise 对象，当发送成功后 resolve。
   * @param value The current markdown text value
   * @example onSend={async (text) => await submitMessage(text)}
   */
  onSend?: (value: string) => Promise<void>;

  /**
   * 正在输入中时点击发送按钮的回调函数。
   * @example onStop={() => console.log('Sending...')}
   */
  onStop?: () => void;

  /**
   * 当输入字段获得焦点时触发的回调函数。
   * @description 通过 markdownProps.onFocus 传递，当编辑器获得焦点时触发
   * @param value 当前的 markdown 文本值
   * @param schema 当前的编辑器 schema
   * @example onFocus={(value, schema) => console.log('Input focused:', value)}
   */
  onFocus?: (
    value: string,
    schema: Elements[],
    e: React.FocusEvent<HTMLDivElement, Element>,
  ) => void;

  /**
   * 当输入字段获得焦点时触发的回调函数。
   * @description 通过 markdownProps.onFocus 传递，当编辑器获得焦点时触发
   * @param value 当前的 markdown 文本值
   * @param schema 当前的编辑器 schema
   * @example onFocus={(value, schema) => console.log('Input focused:', value)}
   */
  onBlur?: (
    value: string,
    schema: Elements[],
    e: React.MouseEvent<HTMLDivElement, Element>,
  ) => void;

  tagInputProps?: MarkdownEditorProps['tagInputProps'];
  /**
   * 背景颜色列表 - 用于生成渐变背景效果
   * @description 推荐使用 3-4 种颜色以获得最佳视觉效果
   * @default ['#CD36FF', '#FFD972', '#eff0f1']
   */
  bgColorList?: string[];
  borderRadius?: number;

  beforeToolsRender?: (
    props: MarkdownInputFieldProps & {
      isHover: boolean;
      isLoading: boolean;
    },
  ) => React.ReactNode;

  /**
   * 附件配置
   * @description 配置附件功能，可以启用或禁用附件上传，并自定义附件按钮的属性
   * @example
   * ```tsx
   * <BubbleChat
   *   attachment={{
   *     enable: true,
   *     accept: '.pdf,.doc,.docx',
   *     maxSize: 10 * 1024 * 1024, // 10MB
   *     onUpload: async (file) => {
   *       const url = await uploadFile(file);
   *       return { url };
   *     }
   *   }}
   * />
   * ```
   */
  attachment?: {
    enable?: boolean;
  } & AttachmentButtonProps;

  /**
   * 语音输入配置
   * @description 由外部提供语音转写实现，组件仅负责控制与UI，传空不展示语音输入按钮。
   *
   * onPartial `onPartial(text)` 为根据语音识别出的的最新片段。拿到后根据上一句起始位置替换
   */
  voiceRecognizer?: CreateRecognizer;

  /**
   * 自定义操作按钮渲染函数
   * @description 用于自定义渲染输入框右侧的操作按钮区域
   * @param {Object} props - 包含组件所有属性以及当前状态的对象
   * @param {boolean} props.isHover - 当前是否处于悬停状态
   * @param {boolean} props.isLoading - 当前是否处于加载状态
   * @param {'uploading' | 'done' | 'error'} props.fileUploadStatus - 文件上传状态
   * @param {React.ReactNode[]} defaultActions - 默认的操作按钮列表
   * @returns {React.ReactNode[]} 返回要渲染的操作按钮节点数组
   * @example
   * ```tsx
   * <MarkdownInputField
   *   actionsRender={(props, defaultActions) => [
   *     <CustomButton key="custom" />,
   *     ...defaultActions
   *   ]}
   * />
   * ```
   */
  actionsRender?: (
    props: MarkdownInputFieldProps &
      MarkdownInputFieldProps['attachment'] & {
        isHover: boolean;
        isLoading: boolean;
        collapseSendActions?: boolean;
        fileUploadStatus: 'uploading' | 'done' | 'error';
      },
    defaultActions: React.ReactNode[],
  ) => React.ReactNode[];

  /**
   * 自定义工具栏渲染函数
   * @description 用于自定义渲染输入框左侧的工具栏区域
   * @param {Object} props - 包含组件所有属性以及当前状态的对象
   * @param {boolean} props.isHover - 当前是否处于悬停状态
   * @param {boolean} props.isLoading - 当前是否处于加载状态
   * @param {'uploading' | 'done' | 'error'} props.fileUploadStatus - 文件上传状态
   * @returns {React.ReactNode[]} 返回要渲染的工具栏节点数组
   * @example
   * ```tsx
   * <MarkdownInputField
   *   toolsRender={(props) => [
   *     <FormatButton key="format" />,
   *     <EmojiPicker key="emoji" />
   *   ]}
   * />
   * ```
   */
  toolsRender?: (
    props: MarkdownInputFieldProps &
      MarkdownInputFieldProps['attachment'] & {
        isHover: boolean;
        isLoading: boolean;
        fileUploadStatus: 'uploading' | 'done' | 'error';
      },
  ) => React.ReactNode[];

  /**
   * 自定义右上操作按钮渲染函数
   * @description 在编辑区域右上角、贴靠右侧渲染一组操作按钮，组件会根据其宽度为编辑区域自动预留右侧内边距，避免遮挡文本。
   * @param {Object} props - 包含组件所有属性以及当前状态的对象
   * @param {boolean} props.isHover - 当前是否处于悬停状态
   * @param {boolean} props.isLoading - 当前是否处于加载状态
   * @param {'uploading' | 'done' | 'error'} props.fileUploadStatus - 文件上传状态
   * @returns {React.ReactNode[]} 返回要渲染的操作按钮节点数组
   * @example
   * ```tsx
   * <MarkdownInputField
   *   quickActionRender={(props) => [
   *     <MyQuickAction key="quick-action" />,
   *   ]}
   * />
   * ```
   */
  quickActionRender?: (
    props: MarkdownInputFieldProps &
      MarkdownInputFieldProps['attachment'] & {
        isHover: boolean;
        isLoading: boolean;
        fileUploadStatus: 'uploading' | 'done' | 'error';
      },
  ) => React.ReactNode[];

  /**
   * 提示词优化配置
   * @description 提示词优化功能，透传当前文本A，返回优化后的文本B。
   * enable=true 时展示；点击后调用 onRefine，将当前文本A传入，使用返回文本B替换输入框内容。
   */
  refinePrompt?: {
    enable: boolean;
    onRefine: (input: string) => Promise<string>;
  };

  /**
   * Markdown 编辑器实例的引用
   * @description 用于获取编辑器实例，可以通过该实例调用编辑器的方法
   * @type {React.MutableRefObject<MarkdownEditorInstance | undefined>}
   * @example
   * ```tsx
   * const editorRef = useRef<MarkdownEditorInstance>();
   *
   * <MarkdownInputField
   *   inputRef={editorRef}
   * />
   *
   * // 使用编辑器实例
   * editorRef.current?.store?.clearContent();
   * ```
   */
  inputRef?: React.MutableRefObject<MarkdownEditorInstance | undefined>;

  /**
   * 自定义叶子节点渲染函数
   * @description 用于自定义文本节点的渲染方式，可以控制文本的样式和行为
   * @param props - 叶子节点渲染属性
   * @param defaultDom - 默认的叶子节点渲染结果
   * @returns 自定义的叶子节点渲染结果
   * @example
   * ```tsx
   * <MarkdownInputField
   *   leafRender={(props, defaultDom) => {
   *     if (props.leaf.bold) {
   *       return <strong style={{ color: 'red' }}>{props.children}</strong>;
   *     }
   *     return defaultDom;
   *   }}
   * />
   * ```
   */
  leafRender?: MarkdownEditorProps['leafRender'];

  /**
   * Markdown 编辑器的其他配置项
   */
  markdownProps?: MarkdownEditorProps;

  /**
   * 粘贴配置
   * @description 配置粘贴到编辑器时支持的内容类型
   * @example
   * ```tsx
   * <MarkdownInputField
   *   pasteConfig={{
   *     enabled: true,
   *     allowedTypes: ['text/plain', 'text/html', 'text/markdown']
   *   }}
   * />
   * ```
   */
  pasteConfig?: {
    /**
     * 是否启用粘贴功能
     * @default true
     */
    enabled?: boolean;
    /**
     * 允许的粘贴内容类型
     * @default ['application/x-slate-md-fragment', 'text/html', 'Files', 'text/markdown', 'text/plain']
     */
    allowedTypes?: Array<
      | 'application/x-slate-md-fragment'
      | 'text/html'
      | 'Files'
      | 'text/markdown'
      | 'text/plain'
    >;
  };

  /**
   * 技能模式配置
   * @description 配置技能模式的显示和行为，可以显示特定的技能或AI助手模式
   * @example
   * ```tsx
   * <MarkdownInputField
   *   skillMode={{
   *     open: skillModeEnabled,
   *     title: "AI助手模式",
   *     rightContent: [
   *       <Tag key="version">v2.0</Tag>,
   *       <Button key="settings" size="small">设置</Button>
   *     ],
   *     closable: true
   *   }}
   *   onSkillModeOpenChange={(open) => {
   *     console.log(`技能模式${open ? '打开' : '关闭'}`);
   *     setSkillModeEnabled(open);
   *   }}
   * />
   * ```
   */
  skillMode?: SkillModeConfig;

  /**
   * 技能模式开关状态变化时触发的回调函数
   * @description 监听技能模式 open 状态的所有变化，包括用户点击关闭按钮和外部直接修改状态
   * @param open 新的开关状态
   * @example onSkillModeOpenChange={(open) => {
   *   console.log(`技能模式${open ? '打开' : '关闭'}`);
   *   setSkillModeEnabled(open);
   * }}
   */
  onSkillModeOpenChange?: (open: boolean) => void;

  /**
   * 是否允许在内容为空时也触发发送
   * @description 默认情况下输入内容为空（且无附件、未录音）时点击发送按钮不会触发 onSend。开启该配置后即使内容为空字符串也会调用 onSend('')。
   * @default false
   * @example
   * <MarkdownInputField allowEmptySubmit onSend={(v) => submit(v)} /> // v 可能为 ''
   */
  allowEmptySubmit?: boolean;
};

/**
 * MarkdownInputField 组件 - Markdown输入字段组件
 *
 * 该组件提供一个功能完整的Markdown输入框，支持实时预览、文件附件、
 * 快捷键发送、自动完成等功能。是聊天应用中的核心输入组件。
 *
 * @component
 * @description Markdown输入字段组件，支持实时预览和文件附件
 * @param {MarkdownInputFieldProps} props - 组件属性
 * @param {string} [props.value] - 输入框的值
 * @param {(value: string) => void} [props.onChange] - 值变化时的回调
 * @param {(value: string) => Promise<void>} [props.onSend] - 发送消息的回调
 * @param {string} [props.placeholder] - 占位符文本
 * @param {string} [props.triggerSendKey='Mod+Enter'] - 触发发送的快捷键
 * @param {boolean} [props.disabled] - 是否禁用
 * @param {boolean} [props.typing] - 是否正在输入
 * @param {AttachmentProps} [props.attachment] - 附件配置
 * @param {string[]} [props.bgColorList] - 背景颜色列表，推荐使用3-4种颜色
 * @param {React.RefObject} [props.inputRef] - 输入框引用
 * @param {MarkdownRenderConfig} [props.markdownRenderConfig] - Markdown渲染配置
 * @param {SuggestionProps} [props.suggestion] - 自动完成配置
 *
 * @example
 * ```tsx
 * <MarkdownInputField
 *   value="# 标题"
 *   onChange={(value) => console.log(value)}
 *   onSend={(value) => Promise.resolve()}
 *   placeholder="请输入Markdown文本..."
 *   triggerSendKey="Mod+Enter"
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的Markdown输入字段组件
 *
 * @remarks
 * - 支持实时Markdown预览
 * - 支持文件附件上传
 * - 支持快捷键发送消息
 * - 支持自动完成功能
 * - 支持自定义渲染配置
 */
export const MarkdownInputField: React.FC<MarkdownInputFieldProps> = ({
  tagInputProps,
  markdownProps,
  borderRadius = 16,
  onBlur,
  onFocus,
  ...props
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const baseCls = getPrefixCls('md-input-field');
  const { wrapSSR, hashId } = useStyle(baseCls);
  const [isHover, setHover] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const markdownEditorRef = React.useRef<MarkdownEditorInstance>();
  const quickActionsRef = React.useRef<HTMLDivElement>(null);
  const actionsRef = React.useRef<HTMLDivElement>(null);
  const [collapseSendActions, setCollapseSendActions] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.innerWidth < 460) return true;
    return false;
  });

  const [value, setValue] = useMergedState('', {
    value: props.value,
    onChange: props.onChange,
  });

  const [rightPadding, setRightPadding] = useState(64);
  const [topRightPadding, setTopRightPadding] = useState(0);
  const [quickRightOffset, setQuickRightOffset] = useState(0);

  const computedRightPadding = useMemo(() => {
    const bottomOverlayPadding = props.toolsRender ? 0 : rightPadding || 52;
    const topOverlayPadding = (topRightPadding || 0) + (quickRightOffset || 0);
    return Math.max(bottomOverlayPadding, topOverlayPadding);
  }, [props.toolsRender, rightPadding, topRightPadding, quickRightOffset]);

  const [fileMap, setFileMap] = useMergedState<
    Map<string, AttachmentFile> | undefined
  >(undefined, {
    value: props.attachment?.fileMap,
    onChange: props.attachment?.onFileMapChange,
  });

  // 是否需要多行布局
  const isMultiRowLayout = useMemo(() => {
    return !!(
      props?.quickActionRender ||
      props?.refinePrompt?.enable ||
      props?.actionsRender ||
      props?.toolsRender
    );
  }, [
    props?.quickActionRender,
    props?.refinePrompt?.enable,
    props?.actionsRender,
    props?.toolsRender,
  ]);

  // 文件上传管理
  const {
    fileUploadDone,
    supportedFormat,
    uploadImage,
    updateAttachmentFiles,
    handleFileRemoval,
    handleFileRetry,
  } = useFileUploadManager({
    attachment: props.attachment,
    fileMap,
    onFileMapChange: setFileMap,
  });

  // 语音输入管理
  const { recording, startRecording, stopRecording } = useVoiceInputManager({
    voiceRecognizer: props.voiceRecognizer,
    editorRef: markdownEditorRef,
    onValueChange: setValue,
  });

  useEffect(() => {
    if (!markdownEditorRef.current) return;
    markdownEditorRef.current?.store?.setMDContent(value);
  }, [props.value]);

  useImperativeHandle(props.inputRef, () => markdownEditorRef.current);

  /**
   * 发送消息的函数
   * @description 该函数用于处理发送消息的逻辑，包括调用回调函数和清空输入框。
   * @returns {Promise<void>} 发送操作的Promise
   * @example
   * ```tsx
   * <MarkdownInputField
   *   value="# 示例"
   *   onChange={(value) => console.log(value)}
   *   onSend={(value) => Promise.resolve()}
   * />
   * ```
   */
  const sendMessage = useRefFunction(async () => {
    if (props.disabled) return;
    if (props.typing) return;
    // 如果处于录音中：优先停止录音或输入
    if (recording) await stopRecording();
    const mdValue = markdownEditorRef?.current?.store?.getMDContent();

    // 如果mdValue和value不一致，并且mdValue不为空，则调用onChange
    if (mdValue !== value && mdValue) {
      props.onChange?.(mdValue);
    }

    // allowEmptySubmit 开启时，即使内容为空也允许触发发送
    if (props.onSend && (props.allowEmptySubmit || mdValue)) {
      setIsLoading(true);
      try {
        await props.onSend(mdValue || '');
        markdownEditorRef?.current?.store?.clearContent();
        props.onChange?.('');
        setValue('');
        setFileMap?.(new Map());
      } finally {
        setIsLoading(false);
      }
    }
  });

  /**
   * 背景容器尺寸计算
   */
  const bgSize = useMemo(() => {
    const height = props.style?.height
      ? addGlowBorderOffset(props.style.height)
      : addGlowBorderOffset('100%');
    const width = props.style?.width
      ? addGlowBorderOffset(props.style.width)
      : addGlowBorderOffset('100%');
    return { height, width };
  }, [props.style?.height, props.style?.width]);

  const beforeTools = useMemo(() => {
    if (props.beforeToolsRender) {
      return props.beforeToolsRender({
        ...props,
        isHover,
        isLoading,
      });
    }
    return null;
  }, [props, isHover, isLoading]);

  const inputRef = useRef<HTMLDivElement>(null);

  const activeInput = useRefFunction((active: boolean) => {
    if (inputRef.current) {
      if (active) {
        inputRef.current.tabIndex = 1;
        inputRef.current?.classList.add('active');
      } else {
        inputRef.current.tabIndex = -1;
        inputRef.current?.classList.remove('active');
      }
    }
  });

  useEffect(() => {
    if (!inputRef.current) return;
    if (process.env.NODE_ENV === 'test') return;
    const handleResize = () => {
      if (!inputRef.current) return;
      if (process.env.NODE_ENV === 'test') return;
      if (inputRef.current?.clientWidth < 481) {
        setCollapseSendActions(true);
      } else {
        setCollapseSendActions(false);
      }
    };
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(inputRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 图片粘贴上传
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      const imageFiles = (await getFileListFromDataTransferItems(e)).filter(
        (file) => file.type.startsWith('image/'),
      );
      upLoadFileToServer(imageFiles, {
        ...markdownProps?.attachment,
        fileMap,
        onFileMapChange: setFileMap,
      });
    },
    [fileMap, markdownProps?.attachment],
  );

  return wrapSSR(
    <>
      {beforeTools ? (
        <div className={classNames(`${baseCls}-before-tools`, hashId)}>
          {beforeTools}
        </div>
      ) : null}
      <Suggestion
        tagInputProps={{
          enable: true,
          type: 'dropdown',
          ...tagInputProps,
        }}
      >
        <div
          ref={inputRef}
          className={classNames(baseCls, hashId, props.className, {
            [`${baseCls}-disabled`]: props.disabled,
            [`${baseCls}-typing`]: false,
            [`${baseCls}-loading`]: isLoading,
            [`${baseCls}-is-multi-row`]: isMultiRowLayout,
          })}
          style={{
            ...props.style,
            borderRadius: borderRadius || 16,
          }}
          tabIndex={1}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onKeyDown={(e) => {
            const { triggerSendKey = 'Enter' } = props;
            if (
              triggerSendKey === 'Enter' &&
              e.key === 'Enter' &&
              !(e.ctrlKey || e.metaKey)
            ) {
              e.stopPropagation();
              e.preventDefault();
              if (props.onSend) {
                sendMessage();
              }
              return;
            }
            if (
              triggerSendKey === 'Mod+Enter' &&
              (e.ctrlKey || e.metaKey) &&
              e.key === 'Enter'
            ) {
              e.stopPropagation();
              e.preventDefault();
              if (props.onSend) {
                sendMessage();
              }
            }
          }}
          onClick={(e) => {
            if (markdownEditorRef?.current?.store.inputComposition) {
              return;
            }
            if (props.disabled) {
              return;
            }
            if (actionsRef.current?.contains(e.target as Node)) {
              return;
            }
            if (quickActionsRef.current?.contains(e.target as Node)) {
              return;
            }
            if (
              markdownEditorRef.current?.store?.editor &&
              !ReactEditor.isFocused(markdownEditorRef.current?.store?.editor)
            ) {
              const editor =
                markdownEditorRef.current?.markdownEditorRef.current;
              if (editor) {
                ReactEditor.focus(editor);
                Transforms.move(editor, { distance: 1, unit: 'offset' });
                Transforms.select(editor, {
                  anchor: Editor.end(editor, []),
                  focus: Editor.end(editor, []),
                });
              }
            }
          }}
        >
          <div
            className={classNames(`${baseCls}-background`, hashId, {
              [`${baseCls}-hover`]: isHover,
            })}
            style={{
              minHeight: props.style?.minHeight || 0,
              height: bgSize.height,
              width: bgSize.width,
            }}
          />

          <div
            style={{
              flex: 1,
              backgroundColor: '#fff',
              width: '100%',
              display: 'flex',
              zIndex: 9,
              flexDirection: 'column',
              boxSizing: 'border-box',
              borderRadius: (borderRadius || 16) - 2 || 10,
              cursor: isLoading || props.disabled ? 'not-allowed' : 'auto',
              opacity: props.disabled ? 0.5 : 1,
              minHeight: isMultiRowLayout ? 114 : undefined,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: (borderRadius || 16) - 2 || 10,
                maxHeight: `min(${(Number(props.style?.maxHeight) || 400) + (props.attachment?.enable ? 90 : 0)}px)`,
                flex: 1,
              }}
              className={classNames(`${baseCls}-editor`, hashId, {
                [`${baseCls}-editor-hover`]: isHover,
                [`${baseCls}-editor-disabled`]: props.disabled,
              })}
            >
              {/* 技能模式部分 */}
              <SkillModeBar
                skillMode={props.skillMode}
                onSkillModeOpenChange={props.onSkillModeOpenChange}
              />

              <div className={classNames(`${baseCls}-editor-content`, hashId)}>
                {useMemo(() => {
                  return props.attachment?.enable ? (
                    <AttachmentFileList
                      fileMap={fileMap}
                      onDelete={handleFileRemoval}
                      onRetry={handleFileRetry}
                      onClearFileMap={() => {
                        updateAttachmentFiles(new Map());
                      }}
                    />
                  ) : null;
                }, [fileMap?.values(), props.attachment?.enable])}

                <BaseMarkdownEditor
                  editorRef={markdownEditorRef}
                  leafRender={props.leafRender}
                  style={{
                    width: '100%',
                    flex: 1,
                    padding: 0,
                    paddingRight: computedRightPadding,
                  }}
                  toolBar={{
                    enable: false,
                  }}
                  floatBar={{
                    enable: false,
                  }}
                  readonly={isLoading}
                  contentStyle={{
                    padding: '12px 8px 12px 12px',
                  }}
                  textAreaProps={{
                    enable: true,
                    placeholder: props.placeholder,
                    triggerSendKey: props.triggerSendKey || 'Enter',
                  }}
                  tagInputProps={{
                    enable: true,
                    type: 'dropdown',
                    ...tagInputProps,
                  }}
                  initValue={props.value}
                  onChange={(value) => {
                    setValue(value);
                    props.onChange?.(value);
                  }}
                  onFocus={(value, schema, e) => {
                    onFocus?.(value, schema, e);
                    activeInput(true);
                  }}
                  onBlur={(value, schema, e) => {
                    onBlur?.(value, schema, e);
                    activeInput(false);
                  }}
                  onPaste={(e) => {
                    handlePaste(e);
                  }}
                  titlePlaceholderContent={props.placeholder}
                  toc={false}
                  pasteConfig={props.pasteConfig}
                  {...markdownProps}
                />
              </div>
            </div>
            {props.toolsRender ? (
              <div
                style={{
                  display: 'flex',
                  boxSizing: 'border-box',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  width: '100%',
                  paddingRight: 8,
                  paddingLeft: 8,
                  paddingBottom: 12,
                }}
              >
                {props.toolsRender ? (
                  <div
                    ref={actionsRef}
                    contentEditable={false}
                    className={classNames(`${baseCls}-send-tools`, hashId)}
                  >
                    {props.toolsRender
                      ? props.toolsRender({
                          value,
                          fileMap,
                          onFileMapChange: setFileMap,
                          ...props,
                          isHover,
                          isLoading,
                          fileUploadStatus: fileUploadDone
                            ? 'done'
                            : 'uploading',
                        })
                      : []}
                  </div>
                ) : null}
                <SendActions
                  attachment={{
                    ...props.attachment,
                    supportedFormat,
                    fileMap,
                    onFileMapChange: setFileMap,
                  }}
                  voiceRecognizer={props.voiceRecognizer}
                  value={value}
                  disabled={props.disabled}
                  typing={props.typing}
                  isLoading={isLoading}
                  fileUploadDone={fileUploadDone}
                  recording={recording}
                  collapseSendActions={collapseSendActions}
                  allowEmptySubmit={props.allowEmptySubmit}
                  uploadImage={uploadImage}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  onSend={sendMessage}
                  onStop={() => {
                    setIsLoading(false);
                    props.onStop?.();
                  }}
                  actionsRender={props.actionsRender}
                  prefixCls={baseCls}
                  hashId={hashId}
                  hasTools={!!props.toolsRender}
                  onResize={setRightPadding}
                />
              </div>
            ) : (
              <SendActions
                attachment={{
                  ...props.attachment,
                  supportedFormat,
                  fileMap,
                  onFileMapChange: setFileMap,
                }}
                voiceRecognizer={props.voiceRecognizer}
                value={value}
                disabled={props.disabled}
                typing={props.typing}
                isLoading={isLoading}
                fileUploadDone={fileUploadDone}
                recording={recording}
                collapseSendActions={collapseSendActions}
                allowEmptySubmit={props.allowEmptySubmit}
                uploadImage={uploadImage}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onSend={sendMessage}
                onStop={() => {
                  setIsLoading(false);
                  props.onStop?.();
                }}
                actionsRender={props.actionsRender}
                prefixCls={baseCls}
                hashId={hashId}
                hasTools={!!props.toolsRender}
                onResize={setRightPadding}
              />
            )}
            {props?.quickActionRender || props.refinePrompt?.enable ? (
              <QuickActions
                ref={quickActionsRef}
                value={value}
                fileMap={fileMap}
                onFileMapChange={setFileMap}
                isHover={isHover}
                isLoading={isLoading}
                disabled={props.disabled}
                fileUploadStatus={fileUploadDone ? 'done' : 'uploading'}
                refinePrompt={props.refinePrompt}
                editorRef={markdownEditorRef}
                onValueChange={(text) => {
                  setValue(text);
                  props.onChange?.(text);
                }}
                quickActionRender={props.quickActionRender as any}
                prefixCls={baseCls}
                hashId={hashId}
                onResize={(width, rightOffset) => {
                  setTopRightPadding(width);
                  setQuickRightOffset(rightOffset);
                }}
              />
            ) : null}
          </div>
        </div>
      </Suggestion>
    </>,
  );
};
