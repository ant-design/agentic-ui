/**
 * useEnlargeAndContainerHandler Hook 单元测试
 * 由原 useMarkdownInputFieldHandlers.test.ts 中 activeInput 段拆分而来。
 * handleEnlargeClick / handleContainerClick 在原测试中未覆盖，本文件保持等价。
 */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEnlargeAndContainerHandler } from '../useEnlargeAndContainerHandler';

vi.mock('../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

const focusMock = vi.fn();
const isFocusedMock = vi.fn(() => false);
const selectMock = vi.fn();
const endMock = vi.fn(() => ({ path: [0, 0], offset: 0 }));

vi.mock('slate-react', () => ({
  ReactEditor: {
    isFocused: (...args: unknown[]) => isFocusedMock(...args),
  },
}));

vi.mock('../../../MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: {
    focus: (...args: unknown[]) => focusMock(...args),
  },
}));

vi.mock('slate', () => ({
  Editor: {
    end: (...args: unknown[]) => endMock(...args),
  },
  Transforms: {
    select: (...args: unknown[]) => selectMock(...args),
  },
}));

function createDefaultParams(overrides: Record<string, any> = {}) {
  const inputRef = { current: document.createElement('div') };
  const markdownEditorRef = {
    current: {
      store: {} as any,
      markdownEditorRef: { current: null },
    },
  } as any;
  return {
    props: {
      disabled: false,
      typing: false,
    },
    markdownEditorRef,
    inputRef,
    isEnlarged: false,
    setIsEnlarged: vi.fn(),
    ...overrides,
  };
}

describe('useEnlargeAndContainerHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isFocusedMock.mockReturnValue(false);
  });

  describe('handleEnlargeClick', () => {
    it('调用时翻转 isEnlarged 状态', () => {
      const params = createDefaultParams({ isEnlarged: false });
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      result.current.handleEnlargeClick();
      expect(params.setIsEnlarged).toHaveBeenCalledWith(true);
    });

    it('当前已放大时切回非放大', () => {
      const params = createDefaultParams({ isEnlarged: true });
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      result.current.handleEnlargeClick();
      expect(params.setIsEnlarged).toHaveBeenCalledWith(false);
    });
  });

  describe('activeInput', () => {
    it('active 为 true 时设置 tabIndex=1 并加 active 类', () => {
      const params = createDefaultParams();
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      result.current.activeInput(true);
      expect(params.inputRef.current?.tabIndex).toBe(1);
      expect(params.inputRef.current?.classList.contains('active')).toBe(true);
    });

    it('active 为 false 时设置 tabIndex=-1 并移除 active 类', () => {
      const params = createDefaultParams();
      params.inputRef.current?.classList.add('active');
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      result.current.activeInput(false);
      expect(params.inputRef.current?.tabIndex).toBe(-1);
      expect(params.inputRef.current?.classList.contains('active')).toBe(false);
    });
  });

  describe('handleContainerClick', () => {
    it('disabled 时直接 return，不影响 inputRef', () => {
      const params = createDefaultParams({
        props: { disabled: true, typing: false },
      });
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      const e = { target: document.createElement('div') } as any;
      // 不应抛错
      expect(() => result.current.handleContainerClick(e)).not.toThrow();
    });

    it('typing 时直接 return', () => {
      const params = createDefaultParams({
        props: { disabled: false, typing: true },
      });
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      const e = { target: document.createElement('div') } as any;
      expect(() => result.current.handleContainerClick(e)).not.toThrow();
    });

    it('无 editor 时不聚焦', () => {
      const params = createDefaultParams();
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      result.current.handleContainerClick({
        target: document.createElement('div'),
      } as any);
      expect(focusMock).not.toHaveBeenCalled();
    });

    it('点击交互元素时不聚焦', () => {
      const editor = {} as any;
      const params = createDefaultParams();
      params.markdownEditorRef.current.markdownEditorRef.current = editor;
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );
      const button = document.createElement('button');
      const wrapper = document.createElement('div');
      wrapper.appendChild(button);

      result.current.handleContainerClick({ target: button } as any);
      expect(focusMock).not.toHaveBeenCalled();
    });

    it('编辑器已聚焦时不重复聚焦', () => {
      isFocusedMock.mockReturnValue(true);
      const editor = {} as any;
      const params = createDefaultParams();
      params.markdownEditorRef.current.markdownEditorRef.current = editor;
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );

      result.current.handleContainerClick({
        target: document.createElement('div'),
      } as any);
      expect(focusMock).not.toHaveBeenCalled();
    });

    it('点击空白区域时聚焦并选中末尾', () => {
      const editor = {} as any;
      const params = createDefaultParams();
      params.markdownEditorRef.current.markdownEditorRef.current = editor;
      const { result } = renderHook(() =>
        useEnlargeAndContainerHandler(params),
      );

      result.current.handleContainerClick({
        target: document.createElement('div'),
      } as any);

      expect(focusMock).toHaveBeenCalledWith(editor);
      expect(endMock).toHaveBeenCalledWith(editor, []);
      expect(selectMock).toHaveBeenCalled();
    });
  });
});
