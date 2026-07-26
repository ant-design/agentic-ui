import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TextSwap } from '..';

describe('TextSwap', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应渲染子节点并注册样式', () => {
    render(
      <ConfigProvider>
        <TextSwap swapKey="a">Hello</TextSwap>
      </ConfigProvider>,
    );

    expect(screen.getByTestId('text-swap')).toHaveTextContent('Hello');
  });

  it('应支持自定义 data-testid', () => {
    render(
      <ConfigProvider>
        <TextSwap swapKey="x" data-testid="custom-swap">
          X
        </TextSwap>
      </ConfigProvider>,
    );

    expect(screen.getByTestId('custom-swap')).toBeInTheDocument();
  });

  it('应在 swapKey 不变时同步更新同 key 下的 children', () => {
    const { rerender } = render(
      <ConfigProvider>
        <TextSwap swapKey="same">First</TextSwap>
      </ConfigProvider>,
    );

    expect(screen.getByText('First')).toBeInTheDocument();

    rerender(
      <ConfigProvider>
        <TextSwap swapKey="same">Second</TextSwap>
      </ConfigProvider>,
    );

    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('swapKey 变化时应进入 exit 阶段并在 duration 后更新内容', () => {
    vi.useFakeTimers();
    try {
      const { container, rerender } = render(
        <ConfigProvider>
          <TextSwap swapKey="a" durationMs={200}>
            Alpha
          </TextSwap>
        </ConfigProvider>,
      );

      expect(screen.getByText('Alpha')).toBeInTheDocument();

      rerender(
        <ConfigProvider>
          <TextSwap swapKey="b" durationMs={200}>
            Beta
          </TextSwap>
        </ConfigProvider>,
      );

      expect(container.querySelector('[class*="-exit"]')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByText('Beta')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('prefers-reduced-motion 时应立即切换内容', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList);

    const { rerender } = render(
      <ConfigProvider>
        <TextSwap swapKey="a">First</TextSwap>
      </ConfigProvider>,
    );

    rerender(
      <ConfigProvider>
        <TextSwap swapKey="b">Second</TextSwap>
      </ConfigProvider>,
    );

    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('应支持自定义 durationMs CSS 变量', () => {
    render(
      <ConfigProvider>
        <TextSwap swapKey="x" durationMs={350} data-testid="dur-swap">
          Content
        </TextSwap>
      </ConfigProvider>,
    );

    expect(screen.getByTestId('dur-swap')).toHaveStyle({
      '--text-swap-dur': '350ms',
    });
  });
});
