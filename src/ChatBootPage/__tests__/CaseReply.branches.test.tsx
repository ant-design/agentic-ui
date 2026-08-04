import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import CaseReply from '../CaseReply';

describe('CaseReply 分支覆盖', () => {
  it('默认 props 渲染 quote / title / description / buttonText', () => {
    render(
      <CaseReply quote="Q" title="T" description="D" buttonText="Go" />,
    );
    expect(screen.getByText('Q')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
  });

  it('onClick 启用键盘；无 onClick 不可聚焦', () => {
    const onClick = vi.fn();
    const { rerender } = render(<CaseReply quote="q" onClick={onClick} />);
    const el = screen.getByTestId('agentic-chatboot-case-reply');
    expect(el).toHaveAttribute('role', 'button');
    fireEvent.keyDown(el, { key: 'Enter' });
    fireEvent.keyDown(el, { key: ' ' });
    fireEvent.keyDown(el, { key: 'Escape' });
    expect(onClick).toHaveBeenCalledTimes(2);

    rerender(<CaseReply quote="q" />);
    expect(
      screen.getByTestId('agentic-chatboot-case-reply'),
    ).not.toHaveAttribute('role');
  });

  it('buttonBar 优先；onButtonClick 阻止冒泡', () => {
    const onClick = vi.fn();
    const onButtonClick = vi.fn();
    const { rerender } = render(
      <CaseReply
        prefixCls="custom-case"
        quote="q"
        title="t"
        buttonBar={<span data-testid="bar">bar</span>}
        onClick={onClick}
        className="extra"
        style={{ margin: 1 }}
      />,
    );
    expect(screen.getByTestId('bar')).toBeInTheDocument();

    rerender(
      <CaseReply quote="q" onClick={onClick} onButtonClick={onButtonClick} />,
    );
    fireEvent.click(screen.getByText('查看回放'));
    expect(onButtonClick).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('无内容时仍可渲染', () => {
    const { container } = render(<CaseReply />);
    expect(container.firstChild).toBeTruthy();
  });
});
