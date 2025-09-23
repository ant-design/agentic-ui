import { UnorderedListOutlined } from '@ant-design/icons';
import {
  AttachmentFile,
  Bubble,
  FileMapView,
  MessageBubbleData,
} from '@ant-design/md-editor';
import { message } from 'antd';
import React, { useRef } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';

// 创建模拟文件的辅助函数
const createMockFile = (
  name: string,
  type: string,
  size: number,
  url: string,
): AttachmentFile => ({
  name,
  type,
  size,
  url,
  lastModified: Date.now(),
  webkitRelativePath: '',
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  bytes: () => Promise.resolve(new Uint8Array(0)),
  text: () => Promise.resolve(''),
  stream: () => new ReadableStream(),
  slice: () => new Blob(),
});

// Mock data for the demo
const mockMessage: MessageBubbleData = {
  id: '1',
  role: 'assistant',
  content: `# 欢迎使用 Ant Design MD Editor！

我是 Ant Design 聊天助手，可以帮你：

- **回答问题** - 解答技术相关疑问
- **代码示例** - 提供组件使用示例  
- **设计建议** - 给出设计方案建议
- **文档说明** - 解释 API 和功能

你想了解什么呢？`,
  createAt: Date.now() - 60000, // 1分钟前
  updateAt: Date.now() - 60000,
  isFinished: true,
  extra: {
    duration: 1200, // 生成耗时
    model: 'gpt-4',
    tokens: 150,
  },
  meta: {
    avatar:
      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
    title: 'Ant Design Assistant',
    description: 'AI 助手',
  },
};

const mockUserMessage: MessageBubbleData = {
  id: '2',
  role: 'user',
  content:
    '你好！我想了解 Bubble 组件的基本用法和特性。[https://ant.design/components/bubble-cn](https://ant.design/components/bubble-cn)',
  createAt: Date.now() - 30000, // 30秒前
  updateAt: Date.now() - 30000,
  isFinished: true,
  meta: {
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    title: '开发者',
    description: '前端工程师',
  },
};

// 用于在回答内容中内联展示的文件列表（不挂载到 originData.fileMap）
const mockInlineFileMap = new Map<string, AttachmentFile>([
  [
    'bubble-design-spec.pdf',
    createMockFile(
      'bubble-design-spec.pdf',
      'application/pdf',
      2048576,
      'https://example.com/bubble-design-spec.pdf',
    ),
  ],
  [
    'component-preview.png',
    createMockFile(
      'component-preview.png',
      'image/png',
      1048576,
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    ),
  ],
  [
    'api-reference.json',
    createMockFile(
      'api-reference.json',
      'application/json',
      512000,
      'https://example.com/api-reference.json',
    ),
  ],
  [
    'more-example.docx',
    createMockFile(
      'more-example.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      8847360,
      'https://example.com/more-example.docx',
    ),
  ],
]);

const mockFileMessage: MessageBubbleData = {
  id: '3',
  role: 'assistant',
  content: `## Bubble 组件功能文档

Bubble 组件是一个功能丰富的聊天气泡组件，支持：

- 多种消息类型（文本、文件、图片等）
- 自定义渲染配置
- 左右布局切换
- 文件附件展示

以下是相关的设计文档和示例图片：`,
  createAt: Date.now() - 10000, // 10秒前
  updateAt: Date.now() - 10000,
  isFinished: true,
  extra: {
    duration: 800,
    model: 'gpt-4',
    tokens: 88,
  },
  meta: {
    avatar:
      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
    title: 'Ant Design Assistant',
    description: 'AI 助手',
  },
};

export default () => {
  const bubbleRef = useRef<any>();

  // 处理点赞/点踩事件
  const handleLike = async (bubble: MessageBubbleData) => {
    message.success(`已点赞消息: ${bubble.id}`);
    console.log('点赞消息:', bubble);
  };

  const handleDisLike = async (bubble: MessageBubbleData) => {
    message.info(`已点踩消息: ${bubble.id}`);
    console.log('点踩消息:', bubble);
  };

  // 处理回复事件
  const handleReply = (content: string) => {
    message.info(`回复内容: ${content}`);
    console.log('回复内容:', content);
  };

  // 处理头像点击事件
  const handleAvatarClick = () => {
    message.success('👤 点击了头像！可以查看用户资料或切换用户');
    console.log('头像被点击了');
  };

  return (
    <BubbleDemoCard
      title="🎯 Bubble 基础用法演示"
      description="💡 点击消息下方的操作按钮可以体验交互功能"
    >
      {/* 消息列表 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 24,
        }}
      >
        {/* Assistant message */}
        <Bubble
          avatar={mockMessage.meta!}
          placement="left"
          bubbleRef={bubbleRef}
          originData={mockMessage}
          onLike={handleLike}
          onDisLike={handleDisLike}
          onReply={handleReply}
          onAvatarClick={handleAvatarClick}
        />

        {/* User message */}
        <Bubble
          avatar={mockUserMessage.meta!}
          placement="right"
          bubbleRef={bubbleRef}
          originData={mockUserMessage}
          onReply={handleReply}
          onAvatarClick={handleAvatarClick}
        />

        {/* Message with files */}
        <Bubble
          avatar={mockFileMessage.meta!}
          placement="left"
          bubbleRef={bubbleRef}
          originData={mockFileMessage}
          bubbleRenderConfig={{
            afterMessageRender: () => {
              const allFiles = Array.from(mockInlineFileMap.values());
              const top3 = allFiles.slice(0, 3);
              if (top3.length === 0) return null;

              const top3Map = new Map<string, AttachmentFile>();
              top3.forEach((f, idx) => top3Map.set(String(idx), f));
              const hasMore = allFiles.length > 3;

              return (
                <>
                  <FileMapView
                    fileMap={top3Map}
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  />
                  {hasMore ? (
                    <div
                      style={{
                        width: '100%',
                        height: 56,
                        borderRadius: 12,
                        background: '#FFFFFF',
                        border: '1px solid #E6ECF4',
                        padding: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        margin: '0 8px 8px 8px',
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          background: '#F7F8FA',
                          border: '0.5px solid #E6ECF4',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#8A8F98',
                        }}
                      >
                        <UnorderedListOutlined />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        <div style={{ display: 'flex' }}>
                          <span
                            style={{
                              maxWidth: 150,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            查看此任务中的所有文件
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              );
            },
          }}
          onLike={handleLike}
          onDisLike={handleDisLike}
          onReply={handleReply}
          onAvatarClick={handleAvatarClick}
        />
      </div>

      {/* 功能说明 */}
      <div
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: '#e6f7ff',
          borderRadius: 8,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <h4 style={{ margin: '0 0 12px 0' }}>🚀 基础功能演示</h4>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>消息布局：</strong>支持左右两种布局，适配不同角色
          </li>
          <li>
            <strong>丰富内容：</strong>支持 Markdown 格式、文件附件展示
          </li>
          <li>
            <strong>交互操作：</strong>点赞、点踩、回复等操作反馈
          </li>
          <li>
            <strong>头像点击：</strong>点击头像可以查看用户资料或切换用户
          </li>
          <li>
            <strong>文件支持：</strong>自动识别并展示不同类型的文件
          </li>
          <li>
            <strong>元数据：</strong>头像、标题、描述等信息展示
          </li>
        </ul>
      </div>
    </BubbleDemoCard>
  );
};
