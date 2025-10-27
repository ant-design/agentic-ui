import { MarkdownInputField, Welcome } from '@ant-design/agentic-ui';
import { Space } from 'antd';
import React from 'react';
import { ChatContainer } from '../components/chat-container';
import { ComponentContainer } from '../components/componentContainer';
import { AgentarIcon } from './agentarIcon';

export default () => {
  return (
    <Space
      direction="vertical"
      size={24}
      style={{ width: '100%', paddingBlock: 40 }}
    >
      <ComponentContainer
        description="个性化问候信息+「品牌」+一句话说明 AI 能做什么，减轻陌生感"
        style={{ paddingInline: 40 }}
      >
        <ChatContainer>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 50,
              paddingTop: 60,
              paddingBottom: 70,
              paddingInline: 40,
            }}
          >
            <Welcome
              title={
                <>
                  欢迎使用
                  <AgentarIcon />
                </>
              }
              description="从简单提示开始，瞬间创建精美卡片设计，随时切换到高级编辑模式，精确调整每一个细节。"
            />
            <MarkdownInputField />
          </div>
        </ChatContainer>
      </ComponentContainer>

      <ComponentContainer
        description="提示用户系统的核心价值，通过问题引导用户在输入框中输入回答"
        style={{ paddingInline: 40 }}
      >
        <ChatContainer>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 50,
              paddingTop: 60,
              paddingBottom: 70,
              paddingInline: 40,
            }}
          >
            <Welcome
              title={
                <>
                  你想
                  <div
                    style={{
                      background:
                        'linear-gradient(128deg, #101413 64%, #8154F1 74%, #7290F7 83%, #44BCF7 93%), linear-gradient(122deg, #101413 66%, #672BFF 77%, #898BFF 84%, #71D2FF 96%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textDecorationColor: 'transparent',
                    }}
                  >
                    LUI Designer
                  </div>
                  为你设计什么卡片？
                </>
              }
              description="从简单提示开始，瞬间创建精美卡片设计，随时切换到高级编辑模式，精确调整每一个细节。"
            />
            <MarkdownInputField />
          </div>
        </ChatContainer>
      </ComponentContainer>
    </Space>
  );
};
