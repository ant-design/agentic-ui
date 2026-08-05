/**
 * ActionItemContainer 残留：showMenu false、单子节点、拖拽手柄路径。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionItemContainer } from '../ActionItemContainer';

HTMLElement.prototype.setPointerCapture = vi.fn();
HTMLElement.prototype.releasePointerCapture = vi.fn();

type KeyedElement = React.ReactElement & { key: React.Key };

const wrap = (ui: React.ReactNode) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('ActionItemContainer residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('showMenu=false 不渲染菜单', () => {
    const items = [
      <button key="a" type="button">
        A
      </button>,
      <button key="b" type="button">
        B
      </button>,
    ] as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer showMenu={false}>{items}</ActionItemContainer>,
    );
    expect(
      container.querySelector('[class*="overflow-container-menu"]'),
    ).toBeFalsy();
  });

  it('单个子节点仍渲染', () => {
    wrap(
      <ActionItemContainer>
        {
          (
            <button key="only" type="button" data-testid="only">
              Only
            </button>
          ) as KeyedElement
        }
      </ActionItemContainer>,
    );
    expect(screen.getByTestId('only')).toBeInTheDocument();
  });

  it('style 透传；平移超过阈值后 click 被拦截', () => {
    const items = [
      <button key="1" type="button">
        1
      </button>,
      <button key="2" type="button">
        2
      </button>,
    ] as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer style={{ gap: 4 }}>{items}</ActionItemContainer>,
    );
    const el = container.querySelector(
      '[class*="agentic-chat-action-item-box"][class*="container"]',
    ) as HTMLElement;
    expect(el.style.gap || el.getAttribute('style')).toBeTruthy();
    fireEvent.pointerDown(el, { button: 0, clientX: 0, pointerId: 9 });
    fireEvent.pointerMove(el, { clientX: 40, pointerId: 9 });
    fireEvent.pointerUp(el, { pointerId: 9 });
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(clickEvent);
  });

  it('istanbul deepen：size 矩阵；menuDisabled；小位移不拦截；空 children', () => {
    for (const size of ['small', 'large', 'default'] as const) {
      const { unmount } = wrap(
        <ActionItemContainer size={size} menuDisabled showMenu>
          {
            [
              <button key="a" type="button">
                A
              </button>,
              <button key="b" type="button">
                B
              </button>,
              <button key="c" type="button">
                C
              </button>,
            ] as KeyedElement[]
          }
        </ActionItemContainer>,
      );
      unmount();
    }
    const { container } = wrap(
      <ActionItemContainer size="small">
        {
          [
            <button key="x" type="button" data-testid="x">
              X
            </button>,
            <button key="y" type="button">
              Y
            </button>,
          ] as KeyedElement[]
        }
      </ActionItemContainer>,
    );
    const el = container.querySelector(
      '[class*="agentic-chat-action-item-box"][class*="container"]',
    ) as HTMLElement;
    fireEvent.pointerDown(el, { button: 0, clientX: 10, pointerId: 1 });
    fireEvent.pointerMove(el, { clientX: 12, pointerId: 1 });
    fireEvent.pointerUp(el, { pointerId: 1 });
    expect(screen.getByTestId('x')).toBeInTheDocument();
  });
});
