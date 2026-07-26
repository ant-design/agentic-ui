import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { I18nContext } from '../../../I18n';
import { HistoryEmpty } from '../../components/HistoryEmpty';

describe('HistoryEmpty', () => {
  it('应渲染默认标题和描述', () => {
    render(
      <I18nContext.Provider value={{ locale: undefined } as any}>
        <HistoryEmpty />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('找不到相关结果')).toBeInTheDocument();
    expect(screen.getByText('换个关键词试试吧')).toBeInTheDocument();
  });

  it('应使用 locale 中的标题和描述', () => {
    render(
      <I18nContext.Provider
        value={
          {
            locale: {
              'chat.history.empty.chat.title': '空状态标题',
              'chat.history.empty.chat.description': '空状态描述',
            },
          } as any
        }
      >
        <HistoryEmpty />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('空状态标题')).toBeInTheDocument();
    expect(screen.getByText('空状态描述')).toBeInTheDocument();
  });

  it('task 类型应使用任务语义默认文案', () => {
    render(
      <I18nContext.Provider value={{ locale: undefined } as any}>
        <HistoryEmpty type="task" />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('暂无历史任务')).toBeInTheDocument();
    expect(screen.getByText('完成的任务会出现在这里')).toBeInTheDocument();
  });

  it('task 类型应读取 task 专用 locale key，不被 chat key 覆盖', () => {
    render(
      <I18nContext.Provider
        value={
          {
            locale: {
              'chat.history.empty.chat.title': '对话空标题',
              'chat.history.empty.chat.description': '对话空描述',
              'chat.history.empty.task.title': '任务空标题',
              'chat.history.empty.task.description': '任务空描述',
            },
          } as any
        }
      >
        <HistoryEmpty type="task" />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('任务空标题')).toBeInTheDocument();
    expect(screen.getByText('任务空描述')).toBeInTheDocument();
    expect(screen.queryByText('对话空标题')).not.toBeInTheDocument();
  });
});
