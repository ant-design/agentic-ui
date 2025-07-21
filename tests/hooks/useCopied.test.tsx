import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCopied } from '../../src/hooks/useCopied';

describe('useCopied', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with copied as false', () => {
    const { result } = renderHook(() => useCopied());

    expect(result.current.copied).toBe(false);
    expect(typeof result.current.setCopied).toBe('function');
  });

  it('should set copied to true when setCopied is called', () => {
    const { result } = renderHook(() => useCopied());

    act(() => {
      result.current.setCopied();
    });

    expect(result.current.copied).toBe(true);
  });

  it('should reset copied to false after 1000ms', () => {
    const { result } = renderHook(() => useCopied());

    act(() => {
      result.current.setCopied();
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('should clear timeout when component unmounts', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { result, unmount } = renderHook(() => useCopied());

    // 先设置copied为true，这样才会设置定时器
    act(() => {
      result.current.setCopied();
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should clear previous timeout when setCopied is called multiple times', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { result } = renderHook(() => useCopied());

    act(() => {
      result.current.setCopied();
    });

    // 清除之前的spy调用记录
    clearTimeoutSpy.mockClear();

    act(() => {
      result.current.setCopied();
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should maintain copied state during timeout period', () => {
    const { result } = renderHook(() => useCopied());

    act(() => {
      result.current.setCopied();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.copied).toBe(true);
  });
});
