import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import { useMergedState } from 'rc-util';
import React, { useContext } from 'react';
import { useRefFunction } from '../hooks/useRefFunction';
import { ToolCall, ToolUseBarItem } from './ToolUseBarItem';
import { useStyle } from './style';
export * from './ToolUseBarItem';
export * from './ToolUseBarThink';

interface ToolUseBarProps {
  tools?: ToolCall[];
  onToolClick?: (id: string) => void;
  className?: string;
  activeKeys?: string[];
  defaultActiveKeys?: string[];
  onActiveKeysChange?: (activeKeys: string[]) => void;
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedKeysChange?: (
    expandedKeys: string[],
    removedKeys: string[],
  ) => void;
  testId?: string;
}

/**
 * ToolUseBar 组件 - 工具使用栏组件
 *
 * 该组件显示工具使用列表，支持工具的展开/折叠、激活状态管理等功能。
 * 每个工具项显示工具名称、目标、时间等信息，支持点击交互。
 *
 * @component
 * @description 工具使用栏组件，显示工具使用列表和状态
 * @param {ToolUseBarProps} props - 组件属性
 * @param {ToolUseItem[]} [props.tools] - 工具使用列表
 * @param {string[]} [props.activeKeys] - 当前激活的工具ID列表
 * @param {string[]} [props.defaultActiveKeys] - 默认激活的工具ID列表
 * @param {(keys: string[]) => void} [props.onActiveKeysChange] - 激活状态变化回调
 * @param {string[]} [props.expandedKeys] - 当前展开的工具ID列表
 * @param {string[]} [props.defaultExpandedKeys] - 默认展开的工具ID列表
 * @param {(keys: string[]) => void} [props.onExpandedKeysChange] - 展开状态变化回调
 * @param {(tool: ToolUseItem) => void} [props.onToolClick] - 工具点击回调
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 *
 * @example
 * ```tsx
 * <ToolUseBar
 *   tools={toolList}
 *   activeKeys={['tool1', 'tool2']}
 *   onActiveKeysChange={(keys) => setActiveKeys(keys)}
 *   expandedKeys={['tool1']}
 *   onExpandedKeysChange={(keys) => setExpandedKeys(keys)}
 *   onToolClick={(tool) => console.log('点击工具:', tool.toolName)}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的工具使用栏组件
 *
 * @remarks
 * - 支持工具列表的受控和非受控展开/折叠
 * - 支持工具的受控和非受控激活状态管理
 * - 显示工具名称、目标、时间等信息
 * - 支持工具点击交互
 * - 提供加载状态显示
 * - 支持错误状态处理
 */
export const ToolUseBar: React.FC<ToolUseBarProps> = ({
  tools,
  onActiveKeysChange,
  onExpandedKeysChange,
  ...props
}) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('tool-use-bar');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const [activeKeys, setActiveKeys] = useMergedState(
    props.defaultActiveKeys || [],
    {
      value: props.activeKeys,
      defaultValue: props.defaultActiveKeys,
      onChange: onActiveKeysChange,
    },
  );

  const [expandedKeys, setExpandedKeys] = useMergedState(
    props.defaultExpandedKeys || [],
    {
      value: props.expandedKeys,
      onChange: onExpandedKeysChange,
    },
  );

  const handleActiveChange = useRefFunction((id: string, active: boolean) => {
    if (onActiveKeysChange) {
      const newActiveKeys = active
        ? [...activeKeys, id]
        : activeKeys.filter((key) => key !== id);
      setActiveKeys(newActiveKeys);
    }
  });

  const handleExpandedChange = useRefFunction(
    (id: string, expanded: boolean) => {
      const newExpandedKeys = expanded
        ? [...expandedKeys, id]
        : expandedKeys.filter((key) => key !== id);

      // 计算被移除的键
      const removedKeys = expandedKeys.filter(
        (key) => !newExpandedKeys.includes(key),
      );

      setExpandedKeys(newExpandedKeys);

      // 调用回调函数，传递新的展开键列表和被移除的键列表
      if (onExpandedKeysChange) {
        onExpandedKeysChange(newExpandedKeys, removedKeys);
      }
    },
  );

  if (!tools?.length)
    return (
      <div
        className={classNames(prefixCls, hashId, props.className)}
        data-testid="ToolUse"
      />
    );

  return wrapSSR(
    <div
      className={classNames(prefixCls, hashId, props.className)}
      data-testid="ToolUse"
    >
      {tools.map((tool) => (
        <ToolUseBarItem
          key={tool.id}
          tool={tool}
          onClick={props.onToolClick}
          isActive={activeKeys.includes(tool.id)}
          onActiveChange={handleActiveChange}
          isExpanded={
            onExpandedKeysChange ? expandedKeys.includes(tool.id) : undefined
          }
          onExpandedChange={
            onExpandedKeysChange ? handleExpandedChange : undefined
          }
          defaultExpanded={props.defaultExpandedKeys?.includes(tool.id)}
          prefixCls={prefixCls}
          hashId={hashId}
        />
      ))}
    </div>,
  );
};
