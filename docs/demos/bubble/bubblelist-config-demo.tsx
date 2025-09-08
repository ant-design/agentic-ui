import {
  BubbleList,
  BubbleMetaData,
  MessageBubbleData,
} from '@ant-design/md-editor';
import { InputNumber, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';

// 创建模拟消息
const createMockMessage = (
  id: string,
  role: 'user' | 'assistant',
  content: string,
): MessageBubbleData => ({
  id,
  role,
  content,
  createAt: Date.now(),
  updateAt: Date.now(),
  isFinished: true,
  meta: {
    avatar:
      role === 'assistant'
        ? 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg'
        : 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    title: role === 'assistant' ? 'AI助手' : '用户',
  } as BubbleMetaData,
});

// 示例消息
const sampleMessages: MessageBubbleData[] = [
  createMockMessage('1', 'assistant', '这是第一条助手消息'),
  createMockMessage('2', 'user', '这是用户消息'),
  createMockMessage('3', 'assistant', '这是第二条助手消息'),
];

export default () => {
  const bubbleListRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<any>();

  // 配置状态
  const [loading, setLoading] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [listHeight, setListHeight] = useState(400);

  // 元数据配置
  const assistantMeta: BubbleMetaData = {
    avatar:
      'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    title: 'AI助手',
  };

  const userMeta: BubbleMetaData = {
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    title: '用户',
  };

  return (
    <BubbleDemoCard
      title="⚙️ BubbleList 配置选项"
      description="展示 BubbleList 组件的各种配置选项和功能"
    >
      {/* 配置控制 */}
      <div style={{ padding: 24, paddingBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>
              加载状态:
            </label>
            <Switch
              checked={loading}
              onChange={setLoading}
              checkedChildren="加载中"
              unCheckedChildren="正常"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>
              只读模式:
            </label>
            <Switch
              checked={readonly}
              onChange={setReadonly}
              checkedChildren="只读"
              unCheckedChildren="交互"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>
              列表高度:
            </label>
            <InputNumber
              value={listHeight}
              onChange={(value) => setListHeight(value || 400)}
              min={200}
              max={600}
              addonAfter="px"
              style={{ width: 120 }}
            />
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div
        style={{
          border: '1px solid #e9ecef',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <BubbleList
          bubbleList={sampleMessages}
          bubbleListRef={bubbleListRef}
          bubbleRef={bubbleRef}
          loading={loading}
          readonly={readonly}
          assistantMeta={assistantMeta}
          userMeta={userMeta}
          style={{ height: listHeight, overflow: 'auto' }}
        />
      </div>

      {/* 说明 */}
      <div
        style={{
          padding: 16,
          background: '#e6f7ff',
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        <strong>📖 配置说明：</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
          <li>
            <strong>loading:</strong> 控制是否显示加载状态
          </li>
          <li>
            <strong>readonly:</strong> 控制是否启用只读模式
          </li>
          <li>
            <strong>style:</strong> 自定义列表容器样式
          </li>
        </ul>
      </div>
    </BubbleDemoCard>
  );
};
