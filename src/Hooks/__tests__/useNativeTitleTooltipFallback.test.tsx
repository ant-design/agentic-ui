import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useNativeTitleTooltipFallback } from '../useNativeTitleTooltipFallback';

describe('useNativeTitleTooltipFallback', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('桌面无触摸环境返回 false', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1920,
    });

    const { result } = renderHook(() => useNativeTitleTooltipFallback());
    expect(result.current).toBe(false);
  });

  it('移动/触摸环境返回 true', () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      maxTouchPoints: 5,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useNativeTitleTooltipFallback());
    expect(result.current).toBe(true);
  });
});
