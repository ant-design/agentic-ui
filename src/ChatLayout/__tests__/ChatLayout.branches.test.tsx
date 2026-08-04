/**
 * ChatLayout 分支：无 header/footer、footer spacer、showFooterBackground、ref API。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChatLayout, type ChatLayoutRef } from '../index';

vi.mock('../../Hooks/useAutoScroll', () => ({
  default: () => ({
    containerRef: { current: document.createElement('div') },
    scrollToBottom: vi.fn(),
    isAtBottom: true,
  }),
  useAutoScroll: () => ({
    containerRef: { current: document.createElement('div') },
    scrollToBottom: vi.fn(),
    isAtBottom: true,
  }),
}));

vi.mock('../../Hooks/useElementSize', () => ({
  useElementSize: () => ({
    ref: { current: null },
    height: 0,
  }),
}));

vi.mock('../../Components/LayoutHeader', () => ({
  LayoutHeader: (props: any) => (
    <div data-testid="layout-header">{props.title}</div>
  ),
}));

vi.mock('../components/FooterBackground', () => ({
  default: ({ className }: any) => (
    <div data-testid="footer-bg" className={className} />
  ),
}));

describe('ChatLayout 分支覆盖', () => {
  it('无 header/footer 时不渲染对应区域', () => {
    render(
      <ConfigProvider>
        <ChatLayout>
          <div>body</div>
        </ChatLayout>
      </ConfigProvider>,
    );
    expect(screen.queryByTestId('layout-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('footer-bg')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('showFooterBackground=false 隐藏背景', () => {
    render(
      <ConfigProvider>
        <ChatLayout showFooterBackground={false} footer={<div>f</div>}>
          <div>body</div>
        </ChatLayout>
      </ConfigProvider>,
    );
    expect(screen.queryByTestId('footer-bg')).not.toBeInTheDocument();
    expect(screen.getByText('f')).toBeInTheDocument();
  });

  it('有 footer 时插入 spacer（height 回退 footerHeight）', () => {
    const { container } = render(
      <ConfigProvider>
        <ChatLayout footer={<div>input</div>} footerHeight={64}>
          <div>msgs</div>
        </ChatLayout>
      </ConfigProvider>,
    );
    const spacer = container.querySelector('[aria-hidden="true"]');
    expect(spacer).toHaveStyle({ height: '64px' });
  });

  it('classNames/styles 透传', () => {
    render(
      <ConfigProvider>
        <ChatLayout
          header={{ title: 'H' }}
          className="root-extra"
          classNames={{
            root: 'r',
            content: 'c',
            scrollable: 's',
            footer: 'f',
            footerBackground: 'fb',
          }}
          styles={{ root: { padding: 1 }, content: { margin: 2 } }}
          style={{ background: 'red' }}
        >
          <span>x</span>
        </ChatLayout>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('layout-header')).toHaveTextContent('H');
    expect(screen.getByTestId('ant-chat-layout')).toHaveClass('r');
    expect(screen.getByTestId('ant-chat-layout')).toHaveClass('root-extra');
  });

  it('ref 暴露 scrollContainer / scrollToBottom / isAtBottom', () => {
    const ref = createRef<ChatLayoutRef>();
    render(
      <ConfigProvider>
        <ChatLayout ref={ref}>
          <div>x</div>
        </ChatLayout>
      </ConfigProvider>,
    );
    expect(ref.current?.isAtBottom).toBe(true);
    expect(typeof ref.current?.scrollToBottom).toBe('function');
    expect(ref.current?.scrollContainer).toBeTruthy();
  });
});
