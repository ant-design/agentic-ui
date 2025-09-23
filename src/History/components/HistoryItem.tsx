import { Checkbox, Divider, Tooltip } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import React from 'react';
import { I18nContext } from '../../i18n';
import { HistoryDataType } from '../types/HistoryData';
import { formatTime } from '../utils';
import { HistoryActionsBox } from './HistoryActionsBox';
import { HistoryRunningIcon } from './HistoryRunningIcon';

/**
 * 历史记录项组件的属性接口
 */
interface HistoryItemProps {
  /** 历史记录数据项 */
  item: HistoryDataType;
  /** 当前选中的历史记录ID列表 */
  selectedIds: string[];
  /** 选择状态变化回调函数 */
  onSelectionChange: (sessionId: string, checked: boolean) => void;
  /** 点击历史记录项的回调函数 */
  onClick: (sessionId: string, item: HistoryDataType) => void;
  /** 删除历史记录项的回调函数 */
  onDeleteItem?: (sessionId: string) => Promise<void>;
  /** 收藏/取消收藏的回调函数 */
  onFavorite?: (sessionId: string, isFavorite: boolean) => void;
  /** 智能代理相关配置和回调 */
  agent?: {
    /** 是否启用智能代理功能 */
    enabled?: boolean;
    /** 搜索关键词回调 */
    onSearch?: (keyword: string) => void;
    /** 智能代理收藏回调 */
    onFavorite?: (sessionId: string, isFavorite: boolean) => void;
    /** 智能代理选择变化回调 */
    onSelectionChange?: (selectedIds: string[]) => void;
    /** 加载更多数据回调 */
    onLoadMore?: () => void;
    /** 是否正在加载更多数据 */
    loadingMore?: boolean;
  };
  /** 额外的渲染内容，接收历史记录项作为参数 */
  extra?: (item: HistoryDataType) => React.ReactElement;
  /** 历史记录类型：聊天记录或任务记录 */
  type?: 'chat' | 'task';
  /** 正在运行的记录ID列表，这些记录将显示运行图标 */
  runningId?: string[];

  /**
   * 渲染历史记录项的额外内容
   * @param item - 历史记录数据项
   * @returns 额外的渲染内容
   */
  renderExtraContent?: (item: HistoryDataType) => React.ReactNode;
}

/**
 * 单行模式历史记录项组件
 *
 * 用于显示简单的历史记录项，只显示标题和时间，适用于聊天记录等简单内容
 *
 * @param props - 组件属性
 * @param props.item - 历史记录数据项
 * @param props.selectedIds - 当前选中的历史记录ID列表
 * @param props.onSelectionChange - 选择状态变化回调函数
 * @param props.onClick - 点击历史记录项的回调函数
 * @param props.onFavorite - 收藏/取消收藏的回调函数
 * @param props.onDeleteItem - 删除历史记录项的回调函数
 * @param props.agent - 智能代理相关配置和回调
 * @param props.extra - 额外的渲染内容
 *
 * @returns 单行模式的历史记录项组件
 */
const HistoryItemSingle: React.FC<HistoryItemProps> = React.memo(
  ({
    item,
    selectedIds,
    onSelectionChange,
    onClick,
    onFavorite,
    onDeleteItem,
    agent,
    extra,
    runningId,
  }) => {
    // 使用 useMemo 优化计算属性
    const isRunning = React.useMemo(
      () => runningId?.includes(String(item.id || '')),
      [runningId, item.id],
    );
    const isSelected = React.useMemo(
      () => selectedIds.includes(item.sessionId!),
      [selectedIds, item.sessionId],
    );

    /**
     * 处理点击事件
     * @param e - 鼠标点击事件对象
     */
    const handleClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onClick(item.sessionId!, item);
      },
      [onClick, item],
    );

    /**
     * 处理复选框状态变化事件
     * @param e - 复选框变化事件对象
     */
    const handleCheckboxChange = React.useCallback(
      (e: CheckboxChangeEvent) => {
        e.stopPropagation();
        onSelectionChange(item.sessionId!, e.target.checked);
      },
      [onSelectionChange, item.sessionId],
    );

    /**
     * 处理删除事件
     */
    const handleDelete = React.useCallback(async () => {
      if (onDeleteItem) {
        await onDeleteItem(item.sessionId!);
      }
    }, [onDeleteItem, item.sessionId]);

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          minWidth: 140,
          alignItems: 'center',
          width: '100%',
        }}
        onClick={handleClick}
      >
        {agent?.onSelectionChange && (
          <Checkbox checked={isSelected} onChange={handleCheckboxChange} />
        )}

        {/* 图标区域 */}
        {isRunning && (
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HistoryRunningIcon
              width={16}
              height={16}
              animated={true}
              duration={2}
            />
          </div>
        )}

        {/* 内容区域 */}
        <div
          style={{
            color: 'var(--color-gray-text-default)',
            overflow: 'hidden',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 标题 */}
          <Tooltip
            open={
              typeof item.sessionTitle === 'string' &&
              item.sessionTitle.length > 10
                ? undefined
                : false
            }
            title={item.sessionTitle}
          >
            <div
              style={{
                width: 'max-content',
                overflow: 'hidden',
                maxWidth: 'min(860px,100%)',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                fontSize: 'var(--font-text-body-base)',
                letterSpacing: 'var(--letter-spacing-body-base, normal)',
                color: 'var(--color-gray-text-default)',
              }}
            >
              {item.sessionTitle}
            </div>
          </Tooltip>
        </div>

        {/* 右侧操作区域 */}
        <div>
          <HistoryActionsBox
            onDeleteItem={onDeleteItem ? handleDelete : undefined}
            agent={agent}
            item={item}
            onFavorite={onFavorite}
          >
            {formatTime(item.gmtCreate)}
          </HistoryActionsBox>
        </div>
        {extra?.(item)}
      </div>
    );
  },
);

HistoryItemSingle.displayName = 'HistoryItemSingle';

/**
 * 多行模式历史记录项组件
 *
 * 用于显示复杂的历史记录项，包含图标、标题、描述和时间，适用于任务记录等复杂内容
 *
 * @param props - 组件属性
 * @param props.item - 历史记录数据项
 * @param props.selectedIds - 当前选中的历史记录ID列表
 * @param props.onSelectionChange - 选择状态变化回调函数
 * @param props.onClick - 点击历史记录项的回调函数
 * @param props.onFavorite - 收藏/取消收藏的回调函数
 * @param props.onDeleteItem - 删除历史记录项的回调函数
 * @param props.agent - 智能代理相关配置和回调
 * @param props.extra - 额外的渲染内容
 * @param props.type - 历史记录类型，影响图标和描述的显示逻辑
 *
 * @returns 多行模式的历史记录项组件
 */
const HistoryItemMulti: React.FC<HistoryItemProps> = React.memo(
  ({
    item,
    selectedIds,
    onSelectionChange,
    onClick,
    onFavorite,
    onDeleteItem,
    agent,
    extra,
    type,
    runningId,
  }) => {
    // 使用 useMemo 优化计算属性
    const isTask = React.useMemo(() => type === 'task', [type]);

    const { locale } = React.useContext(I18nContext);
    const shouldShowIcon = React.useMemo(
      () => isTask && !!item.icon,
      [isTask, item.icon],
    );
    const shouldShowDescription = React.useMemo(
      () => isTask && !!item.description,
      [isTask, item.description],
    );
    const isRunning = React.useMemo(
      () => runningId?.includes(String(item.id || '')),
      [runningId, item.id],
    );
    const isSelected = React.useMemo(
      () => selectedIds.includes(item.sessionId!),
      [selectedIds, item.sessionId],
    );

    /**
     * 处理点击事件
     * @param e - 鼠标点击事件对象
     */
    const handleClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onClick(item.sessionId!, item);
      },
      [onClick, item],
    );

    /**
     * 处理复选框状态变化事件
     * @param e - 复选框变化事件对象
     */
    const handleCheckboxChange = React.useCallback(
      (e: CheckboxChangeEvent) => {
        e.stopPropagation();
        onSelectionChange(item.sessionId!, e.target.checked);
      },
      [onSelectionChange, item.sessionId],
    );

    /**
     * 处理删除事件
     */
    const handleDelete = React.useCallback(async () => {
      if (onDeleteItem) {
        await onDeleteItem(item.sessionId!);
      }
    }, [onDeleteItem, item.sessionId]);

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          minWidth: 140,
          alignItems: 'center',
          width: '100%',
        }}
        onClick={handleClick}
      >
        {agent?.onSelectionChange && (
          <Checkbox
            checked={isSelected}
            onChange={handleCheckboxChange}
            style={{ marginTop: 4 }}
          />
        )}

        {/* 图标区域 */}
        {(shouldShowIcon || isRunning) && (
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isRunning ? (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '8px',
                  gap: '10px',
                  fontSize: isSelected
                    ? 'var(--font-text-h6-base)'
                    : 'var(--font-text-body-base)',
                  borderRadius: '200px',
                  background: 'var(--color-gray-bg-page-dark)',
                  color: 'var(--color-primary-text-secondary)',
                }}
              >
                <HistoryRunningIcon
                  width={16}
                  height={16}
                  animated={true}
                  duration={2}
                  color="var(--color-primary-text-secondary)"
                />
              </div>
            ) : React.isValidElement(item.icon) ? (
              item.icon
            ) : (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '8px',
                  gap: '10px',
                  fontSize: isSelected
                    ? 'var(--font-text-h6-base)'
                    : 'var(--font-text-body-base)',
                  borderRadius: '200px',
                  background: 'var(--color-gray-bg-page-dark)',
                }}
              >
                {item.icon || (isTask ? '📋' : '📄')}
              </div>
            )}
          </div>
        )}

        {/* 内容区域 */}
        <div
          style={{
            color: 'var(--color-gray-text-default)',
            overflow: 'hidden',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            paddingRight: 10,
          }}
        >
          {/* 标题 */}
          <Tooltip
            open={
              typeof item.sessionTitle === 'string' &&
              item.sessionTitle.length > 10
                ? undefined
                : false
            }
            title={item.sessionTitle}
          >
            <div
              style={{
                width: 'max-content',
                display: '-webkit-box',
                maxWidth: 'min(860px,100%)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                lineHeight: '20px',
                fontSize: isSelected
                  ? 'var(--font-text-h6-base)'
                  : 'var(--font-text-body-base)',
                letterSpacing: 'var(--letter-spacing-h6-base, normal)',
                color: 'var(--color-gray-text-default)',
              }}
            >
              {item.sessionTitle}
            </div>
          </Tooltip>

          {/* 描述 */}
          {shouldShowDescription && (item.description || isTask) && (
            <Tooltip
              open={
                typeof item.description === 'string' &&
                item.description.length > 20
                  ? undefined
                  : false
              }
              title={
                item.description ||
                (isTask ? locale?.['task.default'] || '任务' : '')
              }
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 'var(--font-text-body-xs)',
                  color: 'var(--color-gray-text-secondary)',

                  letterSpacing: 'var(--letter-spacing-body-xs, normal)',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.description ||
                    (isTask ? locale?.['task.default'] || '任务' : '')}
                </div>
                <Divider type="vertical" />
                <span style={{ minWidth: 26 }}>
                  {formatTime(item.gmtCreate)}
                </span>
              </div>
            </Tooltip>
          )}
        </div>

        {/* 右侧操作区域 */}
        <div style={{ marginTop: 4 }}>
          <HistoryActionsBox
            onDeleteItem={onDeleteItem ? handleDelete : undefined}
            agent={agent}
            item={item}
            onFavorite={onFavorite}
          >
            {formatTime(item.gmtCreate)}
          </HistoryActionsBox>
        </div>
        {extra?.(item)}
      </div>
    );
  },
);

HistoryItemMulti.displayName = 'HistoryItemMulti';

/**
 * 历史记录项组件 - 根据条件选择单行或多行模式
 *
 * 这是一个智能组件，会根据传入的属性自动选择合适的显示模式：
 * - 单行模式：适用于简单的聊天记录，只显示标题和时间
 * - 多行模式：适用于复杂的任务记录，显示图标、标题、描述和时间
 *
 * 自动选择逻辑：
 * - 当 type 为 'task' 时，自动使用多行模式
 * - 当同时存在 icon 和 description 时，自动使用多行模式
 * - 其他情况使用单行模式
 *
 * @param props - 组件属性
 * @param props.item - 历史记录数据项
 * @param props.selectedIds - 当前选中的历史记录ID列表
 * @param props.onSelectionChange - 选择状态变化回调函数
 * @param props.onClick - 点击历史记录项的回调函数
 * @param props.onFavorite - 收藏/取消收藏的回调函数
 * @param props.onDeleteItem - 删除历史记录项的回调函数
 * @param props.agent - 智能代理相关配置和回调
 * @param props.extra - 额外的渲染内容
 * @param props.type - 历史记录类型，影响显示模式的选择
 *
 * @returns 根据条件渲染的单行或多行历史记录项组件
 *
 * @example
 * ```tsx
 * // 单行模式示例
 * <HistoryItem
 *   item={chatItem}
 *   selectedIds={selectedIds}
 *   onSelectionChange={handleSelectionChange}
 *   onClick={handleClick}
 *   type="chat"
 * />
 *
 * // 多行模式示例
 * <HistoryItem
 *   item={taskItem}
 *   selectedIds={selectedIds}
 *   onSelectionChange={handleSelectionChange}
 *   onClick={handleClick}
 *   type="task"
 * />
 * ```
 */
export const HistoryItem: React.FC<HistoryItemProps> = React.memo(
  ({
    item,
    selectedIds,
    onSelectionChange,
    onClick,
    onFavorite,
    onDeleteItem,
    agent,
    extra,
    type,
    runningId,
  }) => {
    // 自动显示配置
    const isTask = type === 'task';
    const shouldShowIcon = isTask && !!item.icon;
    const shouldShowDescription = isTask && !!item.description;
    // 如果是任务类型或包含 description 和 icon 就自动打开多行模式
    const isMultiMode = isTask || (shouldShowIcon && shouldShowDescription);

    const commonProps = {
      item,
      selectedIds,
      onSelectionChange,
      onClick,
      onFavorite,
      onDeleteItem,
      agent,
      extra,
      type,
      runningId,
    };

    return isMultiMode ? (
      <HistoryItemMulti {...commonProps} />
    ) : (
      <HistoryItemSingle {...commonProps} />
    );
  },
);

HistoryItem.displayName = 'HistoryItem';
