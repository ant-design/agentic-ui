﻿import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import React, { useContext, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { StopIcon } from '../../AgentRunBar/icons/StopIcon';
import { useStyle } from './style';

function SendIcon(
  props: React.SVGProps<SVGSVGElement> & {
    hover?: boolean;
    disabled?: boolean;
    typing?: boolean;
    onInit?: () => void;
  },
) {
  useEffect(() => {
    props.onInit?.();
  }, []);
  if (props.typing) {
    return <StopIcon />;
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width="1em"
      height="1em"
      viewBox="0 0 32 32"
      {...props}
    >
      <defs>
        <clipPath id="a">
          <rect x={8} y={8} width={16} height={16} rx={0} />
        </clipPath>
      </defs>
      <motion.circle
        cx="50%"
        cy="50%"
        r="0.5em"
        animate={{
          fill: props.hover ? '#14161C' : '#001C39',
          fillOpacity: props.hover ? 1 : 0.03530000150203705,
        }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
        }}
      ></motion.circle>
      <g>
        <motion.path
          d="M16.667 12.943l3.528 3.528a.667.667 0 00.943-.942l-4.666-4.667a.665.665 0 00-.943 0l-4.667 4.667a.667.667 0 10.943.942l3.528-3.528v7.724a.667.667 0 101.334 0v-7.724z"
          fillRule="evenodd"
          animate={{
            fill: props.hover ? '#fff' : '#00183D',
            fillOpacity: props.hover ? 1 : 0.24709999561309814,
          }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
        ></motion.path>
      </g>
    </svg>
  );
}

/**
 * Props for the SendButton component.
 */
type SendButtonProps = {
  /**
   * 指示按钮是否处于悬停状态
   * Indicates whether the button is in a hover state.
   */
  isHover: boolean;

  /**
   * 指示用户是否正在输入
   * Indicates whether the user is currently typing.
   */
  typing: boolean;

  /**
   * 点击按钮时触发的回调函数
   * Callback function triggered when the button is clicked.
   */
  onClick: () => void;

  /**
   * 应用于按钮的CSS样式
   * CSS styles to be applied to the button.
   */
  style?: React.CSSProperties;

  /**
   * 按钮初始化时触发的回调函数
   * Callback function triggered when the button is initialized.
   */
  onInit?: () => void;

  /**
   * 是否使用紧凑模式显示按钮
   * Whether to display the button in compact mode.
   */
  compact?: boolean;

  /**
   * 按钮是否禁用
   * Whether the button is disabled.
   */
  disabled?: boolean;
};

/**
 * SendButton 组件 - 发送按钮组件
 *
 * 该组件提供一个可点击的发送按钮，根据不同状态（悬停、禁用、输入中）
 * 呈现不同的视觉效果和动画。支持紧凑模式和自定义样式。
 *
 * @component
 * @description 发送按钮组件，支持多种状态和动画效果
 * @param {SendButtonProps} props - 组件属性
 * @param {boolean} props.isHover - 指示鼠标是否悬停在按钮上
 * @param {boolean} props.disabled - 指示按钮是否禁用
 * @param {boolean} props.typing - 指示是否处于输入状态
 * @param {() => void} props.onClick - 点击按钮时的回调函数
 * @param {React.CSSProperties} [props.style] - 应用于按钮容器的自定义样式
 * @param {() => void} [props.onInit] - 组件初始化时调用的可选回调函数
 * @param {boolean} [props.compact] - 是否使用紧凑模式样式
 *
 * @example
 * ```tsx
 * <SendButton
 *   isHover={false}
 *   disabled={false}
 *   typing={false}
 *   onClick={() => console.log('发送消息')}
 *   compact={false}
 * />
 * ```
 *
 * @returns {React.ReactElement|null} 渲染的发送按钮组件，SSR环境下返回null
 *
 * @remarks
 * - 支持悬停、禁用、输入中等多种状态
 * - 提供流畅的动画效果
 * - 支持紧凑模式显示
 * - 在SSR环境下不渲染
 */
export const SendButton: React.FC<SendButtonProps> = (props) => {
  const { isHover, disabled, typing, onClick, style } = props;
  useEffect(() => {
    props.onInit?.();
  }, []);
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const baseCls = getPrefixCls('md-input-field-send-button');
  const { wrapSSR, hashId } = useStyle(baseCls);

  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    !window.document
  ) {
    // SSR 环境下不渲染
    return null;
  }

  return wrapSSR(
    <div
      data-testid="send-button"
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
      style={style}
      className={classNames(baseCls, hashId, {
        [`${baseCls}-compact`]: props.compact,
        [`${baseCls}-disabled`]: disabled,
        [`${baseCls}-typing`]: typing,
      })}
    >
      <ErrorBoundary fallback={<div />}>
        <SendIcon
          hover={isHover && !disabled}
          disabled={disabled}
          typing={typing}
        />
      </ErrorBoundary>
    </div>,
  );
};
