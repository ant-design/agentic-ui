/**
 * usePreviewContent deepen safe：previewUrl fetch、非 Error 失败、locale 回退。
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../FileTypeProcessor', () => ({
  fileTypeProcessor: {
    processFile: vi.fn(),
    cleanupResult: vi.fn(),
  },
}));

vi.mock('../preview/utils', () => ({
  buildMarkdownContent: (raw: string) => raw,
}));

import { fileTypeProcessor } from '../FileTypeProcessor';
import { usePreviewContent } from '../preview/usePreviewContent';

const fileA = { id: '1', name: 'a.txt' } as any;
const fileB = { id: '2', name: 'b.txt' } as any;
const localeLoad = { 'common.loadTextFailed': '加载失败' } as const;

describe('usePreviewContent deepen safe residual branches', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('previewUrl fetch 成功（previewUrl 分支）', async () => {
    vi.mocked(fileTypeProcessor.processFile).mockReturnValue({
      typeInference: { fileType: 'plainText', category: 'text' },
      dataSource: {
        source: 'url',
        previewUrl: 'https://example.com/x.txt',
      },
    } as any);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => 'remote-body',
    } as Response);

    const { result } = renderHook(() => usePreviewContent(fileA, undefined));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.contentState.status).toBe('ready');
    expect(result.current.contentState.rawContent).toBe('remote-body');
  });

  it('fetch 非 Error + locale 回退', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fileTypeProcessor.processFile).mockReturnValue({
      typeInference: { fileType: 'plainText', category: 'text' },
      dataSource: {
        source: 'url',
        previewUrl: 'https://example.com/y.txt',
      },
    } as any);
    vi.spyOn(globalThis, 'fetch').mockRejectedValue('network-plain');

    const { result } = renderHook(() =>
      usePreviewContent(fileB, undefined, localeLoad),
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.contentState.status).toBe('error');
    expect(result.current.contentState.error).toBe('加载失败');
  });

  it('processFile 抛非 Error：稳定 props + 单次 mock', async () => {
    vi.mocked(fileTypeProcessor.processFile).mockImplementationOnce(() => {
      throw 'plain-fail';
    });
    const localeProcess = { 'workspace.file.processFailed': '处理失败' } as const;
    const { result, unmount } = renderHook(
      ({ file, locale }) => usePreviewContent(file, undefined, locale),
      { initialProps: { file: fileA, locale: localeProcess } },
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.contentState.status).toBe('error');
    expect(result.current.contentState.error).toBe('处理失败');
    unmount();
  });
});
