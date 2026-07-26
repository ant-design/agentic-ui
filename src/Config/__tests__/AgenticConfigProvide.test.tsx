import { render, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  AgenticConfigProvide,
  useAgenticConfig,
  useFormulaConfig,
} from '../AgenticConfigProvide';
import {
  DEFAULT_FORMULA_CONFIG,
  resetGlobalFormulaConfig,
  resolveFormulaConfig,
  setGlobalFormulaConfig,
} from '../formulaConfig';

describe('AgenticConfigProvide', () => {
  afterEach(() => {
    resetGlobalFormulaConfig();
  });

  it('useAgenticConfig 在无 Provider 时返回空对象', () => {
    const { result } = renderHook(() => useAgenticConfig());
    expect(result.current).toEqual({});
  });

  it('向 context 注入 formula 配置', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AgenticConfigProvide formula={{ enable: false }}>
        {children}
      </AgenticConfigProvide>
    );

    const { result } = renderHook(() => useAgenticConfig(), { wrapper });
    expect(result.current.formula).toEqual({ enable: false });
  });

  it('挂载时写入全局 formula 配置', () => {
    render(
      <AgenticConfigProvide
        formula={{ enable: false, singleDollarTextMath: true }}
      >
        <div>child</div>
      </AgenticConfigProvide>,
    );

    expect(resolveFormulaConfig()).toEqual({
      enable: false,
      singleDollarTextMath: true,
    });
  });

  it('卸载时重置全局 formula 配置', () => {
    const { unmount } = render(
      <AgenticConfigProvide formula={{ enable: false }}>
        <div>child</div>
      </AgenticConfigProvide>,
    );

    unmount();
    expect(resolveFormulaConfig()).toEqual(DEFAULT_FORMULA_CONFIG);
  });

  it('未传 formula 时重置已有全局配置', () => {
    setGlobalFormulaConfig({ enable: false });

    render(
      <AgenticConfigProvide>
        <div>child</div>
      </AgenticConfigProvide>,
    );

    expect(resolveFormulaConfig()).toEqual(DEFAULT_FORMULA_CONFIG);
  });

  it('useFormulaConfig 合并 context 与 override', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AgenticConfigProvide formula={{ singleDollarTextMath: true }}>
        {children}
      </AgenticConfigProvide>
    );

    const { result } = renderHook(() => useFormulaConfig({ enable: false }), {
      wrapper,
    });

    expect(result.current).toEqual({
      enable: false,
      singleDollarTextMath: true,
    });
  });
});
