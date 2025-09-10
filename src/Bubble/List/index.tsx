import SkeletonList from './SkeletonList';

import { MutableRefObject, useContext, useMemo } from 'react';

import type { BubbleMetaData, BubbleProps, MessageBubbleData } from '../type';

import { ConfigProvider } from 'antd';
import cx from 'classnames';
import React from 'react';
import { Bubble } from '../Bubble';
import { BubbleConfigContext } from '../BubbleConfigProvide';
import { useStyle } from './style';

export type BubbleListProps = {
  /**
   * 聊天消息列表
   */
  bubbleList: MessageBubbleData[];

  readonly?: boolean;

  /**
   * 聊天列表的引用
   */
  bubbleListRef?: MutableRefObject<HTMLDivElement | null>;

  bubbleRef?: MutableRefObject<any | undefined>;
  /**
   * 是否正在加载
   */
  loading?: boolean;

  pure?: boolean;

  /**
   * 组件的类名
   */
  className?: string;

  /**
   * 聊天项的渲染配置
   */
  bubbleRenderConfig?: BubbleProps['bubbleRenderConfig'];

  /**
   * 组件的样式
   */
  style?: React.CSSProperties;

  /**
   * 用户元数据
   */
  userMeta?: BubbleMetaData;

  /**
   * 助手元数据
   */
  assistantMeta?: BubbleMetaData;

  styles?: {
    /**
     * 气泡根容器的自定义样式
     */
    bubbleStyle?: React.CSSProperties;

    /**
     * 头像标题区域的自定义样式
     */
    bubbleAvatarTitleStyle?: React.CSSProperties;

    /**
     * 主容器的自定义样式
     */
    bubbleContainerStyle?: React.CSSProperties;

    /**
     * 加载图标的自定义样式
     */
    bubbleLoadingIconStyle?: React.CSSProperties;

    /**
     * 名称区域的自定义样式
     */
    bubbleNameStyle?: React.CSSProperties;

    /**
     * 聊天项的样式
     */
    bubbleListItemStyle?: React.CSSProperties;

    /**
     * 聊天项内容的样式
     */
    bubbleListItemContentStyle?: React.CSSProperties;

    /**
     * 内容前置区域的自定义样式
     */
    bubbleListItemBeforeStyle?: React.CSSProperties;

    /**
     * 内容后置区域的自定义样式
     */
    bubbleListItemAfterStyle?: React.CSSProperties;

    /**
     * 聊天项左侧内容的样式
     */
    bubbleListLeftItemContentStyle?: React.CSSProperties;

    /**
     * 聊天项右侧内容的样式
     */
    bubbleListRightItemContentStyle?: React.CSSProperties;

    /**
     * 聊天项标题的样式
     */
    bubbleListItemTitleStyle?: React.CSSProperties;

    /**
     * 聊天项头像的样式
     */
    bubbleListItemAvatarStyle?: React.CSSProperties;

    /**
     * 聊天项额外内容的样式
     */
    bubbleListItemExtraStyle?: React.CSSProperties;
  };
  classNames?: {
    /**
     * 气泡根容器的自定义类名
     */
    bubbleClassName?: string;

    /**
     * 头像标题区域的自定义类名
     */
    bubbleAvatarTitleClassName?: string;

    /**
     * 主容器的自定义类名
     */
    bubbleContainerClassName?: string;

    /**
     * 加载图标的自定义类名
     */
    bubbleLoadingIconClassName?: string;

    /**
     * 名称区域的自定义类名
     */
    bubbleNameClassName?: string;

    /**
     * 聊天项的类名
     */
    bubbleListItemClassName?: string;

    /**
     * 聊天项内容的类名
     */
    bubbleListItemContentClassName?: string;

    /**
     * 内容前置区域的自定义类名
     */
    bubbleListItemBeforeClassName?: string;

    /**
     * 内容后置区域的自定义类名
     */
    bubbleListItemAfterClassName?: string;

    /**
     * 聊天项标题的类名
     */
    bubbleListItemTitleClassName?: string;

    /**
     * 聊天项头像的类名
     */
    bubbleListItemAvatarClassName?: string;
  };

  onDisLike?: BubbleProps['onDisLike'];
  onLike?: BubbleProps['onLike'];
  onCancelLike?: BubbleProps['onCancelLike'];
  onReply?: BubbleProps['onReply'];
  onAvatarClick?: BubbleProps['onAvatarClick'];
  onDoubleClick?: BubbleProps['onDoubleClick'];
  slidesModeProps?: BubbleProps['slidesModeProps'];
  markdownRenderConfig?: BubbleProps['markdownRenderConfig'];
  docListProps?: BubbleProps['docListProps'];

  /**
   * 动态控制复制按钮的显隐
   */
  shouldShowCopy?: boolean | ((bubbleItem: any) => boolean);

  /**
   * 滚动事件的回调
   */
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;

  /**
   * 滚轮事件的回调
   */
  onWheel?: (
    e: React.WheelEvent<HTMLDivElement>,
    bubbleListRef: HTMLDivElement | null,
  ) => void;

  /**
   * 触摸移动事件的回调
   */
  onTouchMove?: (
    e: React.TouchEvent<HTMLDivElement>,
    bubbleListRef: HTMLDivElement | null,
  ) => void;
};

/**
 * BubbleList 组件 - 聊天气泡列表组件
 *
 * 该组件用于渲染聊天气泡列表，支持用户和助手的消息显示、加载状态、滚动事件等。
 * 提供完整的聊天界面功能，包括消息渲染、交互操作、样式自定义等。
 *
 * @component
 * @description 聊天气泡列表组件，渲染聊天消息列表
 * @param {BubbleListProps} props - 组件属性
 * @param {BubbleProps[]} [props.bubbleList=[]] - 气泡列表数据
 * @param {React.RefObject} [props.bubbleListRef] - 气泡列表引用
 * @param {boolean} [props.loading] - 是否显示加载状态
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 * @param {BubbleRenderConfig} [props.bubbleRenderConfig] - 气泡渲染配置
 * @param {MarkdownRenderConfig} [props.markdownRenderConfig] - Markdown渲染配置
 * @param {BubbleMetaData} [props.userMeta] - 用户头像元数据
 * @param {BubbleMetaData} [props.assistantMeta] - 助手头像元数据
 * @param {BubbleStyles} [props.styles] - 自定义样式配置
 * @param {BubbleClassNames} [props.classNames] - 自定义类名配置
 * @param {boolean} [props.readonly] - 是否只读模式
 * @param {Function} [props.onScroll] - 滚动事件回调
 * @param {Function} [props.onWheel] - 滚轮事件回调
 * @param {Function} [props.onTouchMove] - 触摸移动事件回调
 * @param {Function} [props.onLike] - 点赞事件回调
 * @param {Function} [props.onDisLike] - 点踩事件回调
 * @param {Function} [props.onReply] - 回复事件回调
 * @param {Function} [props.onCancelLike] - 取消点赞事件回调
 * @param {Function} [props.onAvatarClick] - 头像点击事件回调
 * @param {Function} [props.onDoubleClick] - 双击事件回调
 * @param {boolean|Function} [props.shouldShowCopy] - 是否显示复制按钮
 *
 * @example
 * ```tsx
 * <BubbleList
 *   bubbleList={chatMessages}
 *   loading={false}
 *   userMeta={{ avatar: "user.jpg", title: "用户" }}
 *   assistantMeta={{ avatar: "assistant.jpg", title: "助手" }}
 *   onLike={(message) => console.log('点赞:', message)}
 *   onReply={(message) => console.log('回复:', message)}
 *   onAvatarClick={() => console.log('点击了头像')}
 *   onDoubleClick={() => console.log('双击了消息')}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的聊天气泡列表组件
 *
 * @remarks
 * - 支持用户和助手消息的不同布局
 * - 提供加载状态和骨架屏
 * - 支持消息交互操作（点赞、点踩、回复等）
 * - 支持自定义样式和类名
 * - 支持Markdown内容渲染
 * - 支持滚动和触摸事件
 * - 提供消息复制功能
 */
export const BubbleList: React.FC<BubbleListProps> = (props) => {
  const {
    bubbleListRef,
    bubbleRenderConfig,
    className,
    loading,
    styles,
    classNames,
    markdownRenderConfig,
    userMeta,
    assistantMeta,
    bubbleList = [],
    style,
    onScroll,
    onWheel,
    onTouchMove,
  } = props;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);

  const { compact } = useContext(BubbleConfigContext) || {};

  const prefixClass = getPrefixCls('agent-bubble-list');
  const { wrapSSR, hashId } = useStyle(prefixClass);
  const deps = useMemo(() => [props.style], [JSON.stringify(props.style)]);

  const bubbleListDom = useMemo(() => {
    return bubbleList.map((item, index) => {
      const isLast = bubbleList.length - 1 === index;
      const placement = item.role === 'user' ? 'right' : 'left';
      // 保持向后兼容性，设置isLatest
      (item as any).isLatest = isLast;
      return (
        <Bubble
          key={item.id}
          data-id={item.id}
          avatar={{
            ...(item.role === 'user' ? userMeta : assistantMeta),
            ...(item as any).meta,
          }}
          preMessage={bubbleList?.at(index - 1)}
          id={item.id}
          style={{
            ...styles?.bubbleListItemStyle,
          }}
          originData={item}
          placement={placement}
          time={item.updateAt || item.createAt}
          deps={deps}
          pure={props.pure}
          bubbleListRef={bubbleListRef}
          bubbleRenderConfig={bubbleRenderConfig}
          classNames={classNames}
          bubbleRef={props.bubbleRef}
          markdownRenderConfig={markdownRenderConfig}
          docListProps={props.docListProps}
          styles={{
            ...styles,
            bubbleListItemContentStyle: {
              ...styles?.bubbleListItemContentStyle,
              ...(placement === 'right'
                ? styles?.bubbleListRightItemContentStyle
                : styles?.bubbleListLeftItemContentStyle),
            },
          }}
          readonly={props.readonly}
          slidesModeProps={props.slidesModeProps}
          onReply={props.onReply}
          onDisLike={props.onDisLike}
          onLike={props.onLike}
          onCancelLike={props.onCancelLike}
          onAvatarClick={props.onAvatarClick}
          onDoubleClick={props.onDoubleClick}
          customConfig={props?.bubbleRenderConfig?.customConfig}
          shouldShowCopy={props.shouldShowCopy}
        />
      );
    });
  }, [bubbleList, props.style]);

  if (loading)
    return wrapSSR(
      <div
        className={cx(
          `${prefixClass} ${prefixClass}-loading`,
          className,
          hashId,
        )}
        ref={bubbleListRef}
        style={{
          padding: 24,
        }}
      >
        <SkeletonList />
      </div>,
    );

  return wrapSSR(
    <div
      className={cx(`${prefixClass}`, className, hashId, {
        [`${prefixClass}-readonly`]: props.readonly,
        [`${prefixClass}-compact`]: compact,
      })}
      data-chat-list={bubbleList.length}
      style={style}
      ref={bubbleListRef}
      onScroll={onScroll}
      onWheel={(e) => onWheel?.(e, bubbleListRef?.current || null)}
      onTouchMove={(e) => onTouchMove?.(e, bubbleListRef?.current || null)}
    >
      {bubbleListDom}
    </div>,
  );
};

export default BubbleList;
