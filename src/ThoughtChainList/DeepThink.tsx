﻿import { CloseCircleFilled } from '@ant-design/icons';
import { Typography } from 'antd';
import React, { useContext, useMemo } from 'react';
import { LoadingSpinnerIcon } from '../components/icons/LoadingSpinnerIcon';
import { I18nContext } from '../i18n';
import { MarkdownEditorProps } from '../MarkdownEditor/types';
import { DotLoading } from './DotAni';
import { MarkdownEditorUpdate } from './MarkdownEditor';
import { WhiteBoxProcessInterface } from './types';

/**
 * DeepThink 组件 - 深度思考组件
 *
 * 该组件用于显示AI的深度思考过程，包括思考状态、思考内容、错误信息等。
 * 提供打字机效果、加载动画、错误处理等功能，展示AI的思考过程。
 *
 * @component
 * @description 深度思考组件，显示AI思考过程
 * @param {Object} props - 组件属性
 * @param {string} [props['data-testid']] - 测试ID
 * @param {boolean} [props.isFinished] - 是否已完成
 * @param {MarkdownEditorProps} [props.markdownRenderProps] - Markdown渲染配置
 * @param {Function} [props.onChangeItem] - 项目变更回调
 * @param {Object} [props.output] - 输出结果
 * @param {Object} [props.output.response] - 响应数据
 * @param {string} [props.output.errorMsg] - 错误消息
 * @param {string} props.info - 思考信息
 * @param {string} props.category - 思考类别
 *
 * @example
 * ```tsx
 * <DeepThink
 *   info="分析用户需求"
 *   category="thinking"
 *   output={{ response: { content: "思考结果..." } }}
 *   isFinished={true}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的深度思考组件
 *
 * @remarks
 * - 显示AI思考过程
 * - 提供打字机效果
 * - 支持加载动画
 * - 处理错误信息
 * - 支持Markdown渲染
 * - 提供状态指示
 * - 支持国际化
 * - 提供自定义配置
 */
export const DeepThink = (
  props: {
    'data-testid'?: string;
    isFinished?: boolean;
    markdownRenderProps?: MarkdownEditorProps;
    onChangeItem?: (
      item: WhiteBoxProcessInterface,
      changeProps: {
        feedbackContent: string;
        feedbackType: 'sql' | 'toolArg';
        feedbackRunId: string;
      },
    ) => void;
  } & WhiteBoxProcessInterface,
) => {
  const errorMsg =
    props.output?.errorMsg ||
    props.output?.response?.error ||
    props.output?.response?.errorMsg;
  const i18n = useContext(I18nContext);

  return useMemo(() => {
    return (
      <>
        <div
          data-testid={props['data-testid']}
          style={{
            display: 'flex',
            gap: '10px',
            flexDirection: 'column',
          }}
        >
          {!props.output && !props?.isFinished ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '38px',
                borderRadius: '12px',
                opacity: 1,
                wordBreak: 'break-all',
                wordWrap: 'break-word',
                flexDirection: 'row',
                padding: '8px',
                gap: '10px',
                alignSelf: 'stretch',
                background: '#FBFCFD',
                zIndex: 2,
              }}
            >
              <LoadingSpinnerIcon size={24} />
              {i18n?.locale?.deepThinkingInProgress || '正在深度思考中'}
              <DotLoading />
            </div>
          ) : null}
          {!errorMsg && props.output ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                wordBreak: 'break-all',
                wordWrap: 'break-word',
                padding: '8px 12px',
                gap: '10px',
                alignSelf: 'stretch',
                background: '#FBFCFD',
                zIndex: 1,
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  borderRadius: '12px',
                  opacity: 1,
                  wordBreak: 'break-all',
                  wordWrap: 'break-word',
                  flexDirection: 'column',
                  alignSelf: 'stretch',
                }}
                className="code-view"
              >
                <MarkdownEditorUpdate
                  {...props.markdownRenderProps}
                  typewriter={
                    !props.output?.response?.error &&
                    !props.isFinished &&
                    props.output?.type === 'TOKEN'
                  }
                  isFinished={
                    props.isFinished || props.output?.type !== 'TOKEN'
                  }
                  initValue={props.output?.data || ''}
                />
              </div>
            </div>
          ) : null}
          {errorMsg ? (
            <div
              style={{
                borderRadius: '12px',
                opacity: 1,
                display: 'flex',
                padding: '12px 12px',
                alignSelf: 'stretch',
                background: '#FFEDEC',
                wordBreak: 'break-all',
                minHeight: 18,
                wordWrap: 'break-word',
                zIndex: 2,
                backgroundColor: '#FFEDEC',
                border: '1px solid rgba(244, 244, 247, 0.7473)',
                gap: 8,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div>
                  <CloseCircleFilled
                    style={{
                      color: '#FF4141',
                      marginRight: 8,
                    }}
                  />
                  <Typography.Text>
                    {i18n?.locale?.taskExecutionFailed ||
                      '任务执行失败，需要修改'}
                  </Typography.Text>
                </div>
                <Typography
                  style={{
                    color: '#FF4141',
                    wordBreak: 'break-all',
                    wordWrap: 'break-word',
                  }}
                >
                  {JSON.stringify(errorMsg)}
                </Typography>
              </div>
            </div>
          ) : null}
        </div>
      </>
    );
  }, [props.category, JSON.stringify(props.output), props.costMillis]);
};
