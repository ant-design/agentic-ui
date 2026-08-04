/**
 * scrollTo 分支覆盖：SSR 早退与 callback。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import scrollTo from '../scrollTo';

describe('scrollTo branches', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('window 未定义时立即 callback 并返回', () => {
    const originalWindow = global.window;
    // @ts-expect-error SSR
    delete global.window;
    const callback = vi.fn();
    scrollTo(100, { callback });
    expect(callback).toHaveBeenCalledTimes(1);
    global.window = originalWindow;
  });

  it('无 DOM 环境下传入 callback 仍调用', () => {
    const originalWindow = global.window;
    // @ts-expect-error SSR
    global.window = undefined;
    const callback = vi.fn();
    scrollTo(50, { callback, duration: 0 });
    expect(callback).toHaveBeenCalled();
    global.window = originalWindow;
  });
});
