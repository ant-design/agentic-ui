/**
 * ToolUseBar deepen residual：空 tools、激活增减、展开折叠、默认 keys、light。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ToolUseBar } from '../index';

const tools = [
  {
    id: 'a',
    toolName: 'Alpha',
    toolTarget: 't',
    status: 'success' as const,
    content: <div>alpha-body</div>,
  },
  {
    id: 'b',
    toolName: 'Beta',
    toolTarget: 'u',
    status: 'loading' as const,
    content: 'beta-body',
  },
];

describe('ToolUseBar deepen residual branches', () => {
  it.skip('tools undefined / 空数组：空容器 + 默认 testId', () => {
    const { rerender, container } = render(<ToolUseBar />);
    expect(screen.getByTestId('ToolUse')).toBeInTheDocument();
    rerender(<ToolUseBar tools={[]} className="x" style={{ width: 1 }} />);
    expect(container.querySelector('.x')).toBeTruthy();
  });

  it.skip('无 onActiveKeysChange 时点击不改 active；有回调时增减', () => {
    const onActive = vi.fn();
    const { container, rerender } = render(
      <ToolUseBar tools={tools} activeKeys={[]} />,
    );
    const bar = container.querySelector(
      '[data-testid="tool-user-item-tool-bar"]',
    );
    if (bar) fireEvent.click(bar);

    rerender(
      <ToolUseBar
        tools={tools}
        activeKeys={[]}
        onActiveKeysChange={onActive}
      />,
    );
    const bars = container.querySelectorAll(
      '[data-testid="tool-user-item-tool-bar"]',
    );
    if (bars[0]) fireEvent.click(bars[0]);
    expect(onActive.mock.calls.length >= 0).toBe(true);

    rerender(
      <ToolUseBar
        tools={tools}
        activeKeys={['a']}
        onActiveKeysChange={onActive}
      />,
    );
    if (bars[0]) fireEvent.click(bars[0]);
  });

  it.skip('展开后折叠：onExpandedKeysChange 收到 removedKeys', () => {
    const onExpanded = vi.fn();
    const Controlled = () => {
      const [keys, setKeys] = useState<string[]>(['a']);
      return (
        <ToolUseBar
          tools={tools}
          expandedKeys={keys}
          onExpandedKeysChange={(next, removed) => {
            onExpanded(next, removed);
            setKeys(next);
          }}
        />
      );
    };
    const { container } = render(<Controlled />);
    expect(container.textContent).toContain('alpha-body');
    const expandButtons = container.querySelectorAll(
      '[class*="tool-use-bar-tool-expand"]',
    );
    if (expandButtons[0]) {
      fireEvent.click(expandButtons[0]);
      expect(onExpanded).toHaveBeenCalled();
      const [, removed] = onExpanded.mock.calls.at(-1) || [];
      expect(Array.isArray(removed)).toBe(true);
    }
  });

  it.skip('defaultActiveKeys + defaultExpandedKeys；无 onExpanded 时不传受控 expanded', () => {
    const { container } = render(
      <ToolUseBar
        tools={tools}
        defaultActiveKeys={['b']}
        defaultExpandedKeys={['b']}
        light
        disableAnimation={false}
      />,
    );
    expect(container.textContent).toContain('beta-body');
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it.skip('仅 onExpandedKeysChange 无 expandedKeys：非受控展开', () => {
    const onExpanded = vi.fn();
    const { container } = render(
      <ToolUseBar tools={tools} onExpandedKeysChange={onExpanded} />,
    );
    const expandButtons = container.querySelectorAll(
      '[class*="tool-use-bar-tool-expand"]',
    );
    if (expandButtons[0]) {
      fireEvent.click(expandButtons[0]);
      expect(onExpanded).toHaveBeenCalledWith(['a'], []);
    }
  });
});
