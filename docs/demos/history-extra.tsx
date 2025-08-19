import { History, HistoryDataType } from '@ant-design/md-editor';
import React, { useState } from 'react';

const ExtraHistoryDemo = () => {
  const [currentSessionId, setCurrentSessionId] = useState('session-1');

  // 模拟请求函数
  const mockRequest = async ({ agentId }: { agentId: string }) => {
    // 模拟 API 请求
    return [
      {
        id: '1',
        sessionId: 'session-1',
        sessionTitle: '重要会议记录',
        agentId: agentId,
        gmtCreate: 1703123456789, // 2023-12-21 10:30:56
        gmtLastConverse: 1703123456789,
      },
      {
        id: '2',
        sessionId: 'session-2',
        sessionTitle: '紧急任务讨论',
        agentId: agentId,
        gmtCreate: 1703037056789, // 2023-12-20 10:30:56
        gmtLastConverse: 1703037056789,
      },
      {
        id: '3',
        sessionId: 'session-3',
        sessionTitle: '普通对话记录',
        agentId: agentId,
        gmtCreate: 1702950656789, // 2023-12-19 10:30:56
        gmtLastConverse: 1702950656789,
      },
    ] as HistoryDataType[];
  };

  const handleSelected = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    console.log('选择会话:', sessionId);
  };

  const handleDeleteItem = async (sessionId: string) => {
    console.log('删除会话:', sessionId);
    // 这里可以调用删除 API
  };

  // 自定义额外内容渲染函数
  const extraContent = (item: HistoryDataType) => {
    const isImportant =
      item.sessionTitle?.toString().includes('重要') ||
      item.sessionTitle?.toString().includes('紧急');
    const isToday =
      new Date(item.gmtCreate as number).toDateString() ===
      new Date().toDateString();

    return (
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {isImportant && (
          <span
            style={{
              backgroundColor: '#ff4d4f',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
            }}
          >
            重要
          </span>
        )}
        {isToday && (
          <span
            style={{
              backgroundColor: '#52c41a',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
            }}
          >
            今日
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>History 额外内容</h3>
      <p>当前会话ID: {currentSessionId}</p>

      <h4>Props 说明：</h4>
      <ul>
        <li>
          <strong>extra</strong>:
          自定义额外内容渲染函数，可以为每个历史记录项添加自定义内容
        </li>
        <li>
          <strong>agentId</strong>: 代理ID，用于获取历史记录
        </li>
        <li>
          <strong>sessionId</strong>: 当前会话ID，变更时会触发数据重新获取
        </li>
        <li>
          <strong>request</strong>: 请求函数，用于获取历史数据
        </li>
        <li>
          <strong>onSelected</strong>: 选择历史记录项时的回调函数
        </li>
        <li>
          <strong>onDeleteItem</strong>: 删除历史记录项时的回调函数
        </li>
        <li>
          <strong>standalone</strong>: 设置为 true 时，直接显示菜单列表
        </li>
      </ul>

      <div
        style={{
          padding: '20px',
          width: 348,
          margin: '0 auto',
          border: '1px solid #d9d9d9',
        }}
      >
        <History
          agentId="test-agent"
          sessionId={currentSessionId}
          request={mockRequest}
          onClick={handleSelected}
          onDeleteItem={handleDeleteItem}
          extra={extraContent}
          standalone
        />
      </div>
    </div>
  );
};

export default ExtraHistoryDemo;
