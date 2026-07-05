import { describe, expect, it } from 'vitest';
import {
  normalizeFileMapPropsFromJson,
  normalizeTaskListPropsFromJson,
  normalizeToolUseBarPropsFromJson,
} from '../agenticUiEmbedUtils';

describe('normalizeTaskListPropsFromJson', () => {
  it('handles null', () => {
    const result = normalizeTaskListPropsFromJson(null);
    expect(result.items).toEqual([]);
  });

  it('handles array input', () => {
    const result = normalizeTaskListPropsFromJson([
      { key: '1', title: 'Task 1', status: 'success' },
    ]);
    expect(result.items.length).toBe(1);
    expect(result.items[0].status).toBe('success');
  });

  it('handles object with items array', () => {
    const result = normalizeTaskListPropsFromJson({
      items: [{ key: '1', title: 'Task', status: 'loading' }],
      variant: 'default',
      className: 'custom',
    });
    expect(result.items.length).toBe(1);
    expect(result.variant).toBe('default');
    expect(result.className).toBe('custom');
  });

  it('filters items without key', () => {
    const result = normalizeTaskListPropsFromJson([
      { key: '', title: 'Empty key' },
    ]);
    expect(result.items.length).toBe(0);
  });

  it('defaults to pending status for invalid status', () => {
    const result = normalizeTaskListPropsFromJson([
      { key: '1', status: 'invalid' },
    ]);
    expect(result.items[0].status).toBe('pending');
  });

  it('handles content as array', () => {
    const result = normalizeTaskListPropsFromJson([
      { key: '1', content: ['line1', 'line2'] },
    ]);
    expect(result.items[0].content).toBe('line1\nline2');
  });

  it('defaults variant to simple', () => {
    const result = normalizeTaskListPropsFromJson({ items: [] });
    expect(result.variant).toBe('simple');
  });

  it('coerces numeric key to string', () => {
    const result = normalizeTaskListPropsFromJson([
      { key: 42, title: 'Num key' },
    ]);
    expect(result.items[0].key).toBe('42');
  });

  it('ignores non-object entries in items array', () => {
    const result = normalizeTaskListPropsFromJson({
      items: [null, 1, { key: 'ok', title: 'T' }],
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].key).toBe('ok');
  });
});

describe('normalizeToolUseBarPropsFromJson', () => {
  it('handles null', () => {
    const result = normalizeToolUseBarPropsFromJson(null);
    expect(result.tools).toEqual([]);
  });

  it('handles object with tools array', () => {
    const result = normalizeToolUseBarPropsFromJson({
      tools: [{ id: '1', toolName: 'api', status: 'success' }],
    });
    expect(result.tools.length).toBe(1);
    expect(result.tools[0].status).toBe('success');
  });

  it('handles object with items array (text field)', () => {
    const result = normalizeToolUseBarPropsFromJson({
      items: [{ key: '1', text: 'search' }],
    });
    expect(result.tools.length).toBe(1);
  });

  it('handles tools with content and errorMessage', () => {
    const result = normalizeToolUseBarPropsFromJson({
      tools: [
        {
          id: '1',
          toolName: 'api',
          content: 'result data',
          errorMessage: 'err',
          time: '2s',
          type: 'summary',
        },
      ],
    });
    expect(result.tools[0].content).toBe('result data');
    expect(result.tools[0].errorMessage).toBe('err');
    expect(result.tools[0].time).toBe('2s');
  });

  it('filters out tools without id or key', () => {
    const result = normalizeToolUseBarPropsFromJson({
      tools: [{ toolName: 'orphan' }],
    });
    expect(result.tools.length).toBe(0);
  });

  it('handles className and light options', () => {
    const result = normalizeToolUseBarPropsFromJson({
      tools: [],
      className: 'custom',
      light: true,
      disableAnimation: true,
    });
    expect(result.className).toBe('custom');
    expect(result.light).toBe(true);
    expect(result.disableAnimation).toBe(true);
  });

  it('falls back to key when id is missing', () => {
    const result = normalizeToolUseBarPropsFromJson({
      tools: [{ key: 'tool-key', toolName: 'search' }],
    });
    expect(result.tools[0].id).toBe('tool-key');
  });

  it('defaults invalid tool status to idle', () => {
    const result = normalizeToolUseBarPropsFromJson({
      tools: [{ id: '1', toolName: 'x', status: 'unknown' }],
    });
    expect(result.tools[0].status).toBe('idle');
  });

  it('maps items without key to index id', () => {
    const result = normalizeToolUseBarPropsFromJson({
      items: [{ text: 'query' }],
    });
    expect(result.tools[0].id).toBe('0');
    expect(result.tools[0].toolName).toBe('query');
  });

  it('skips items entries without text', () => {
    const result = normalizeToolUseBarPropsFromJson({
      items: [{ key: '1' }, { text: 'ok' }],
    });
    expect(result.tools).toHaveLength(1);
    expect(result.tools[0].toolName).toBe('ok');
  });
});

describe('normalizeFileMapPropsFromJson', () => {
  it('handles null', () => {
    const result = normalizeFileMapPropsFromJson(null);
    expect(result.fileList).toEqual([]);
  });

  it('handles array of files', () => {
    const result = normalizeFileMapPropsFromJson([{ name: 'file.ts' }]);
    expect(result.fileList.length).toBe(1);
  });

  it('handles object with files array', () => {
    const result = normalizeFileMapPropsFromJson({
      files: [{ name: 'file.ts' }],
    });
    expect(result.fileList.length).toBe(1);
  });

  it('handles object with fileList array', () => {
    const result = normalizeFileMapPropsFromJson({
      fileList: [{ name: 'file.ts' }],
    });
    expect(result.fileList.length).toBe(1);
  });

  it('filters invalid file entries', () => {
    const result = normalizeFileMapPropsFromJson([
      null,
      42,
      { name: 'valid.ts' },
    ]);
    expect(result.fileList.length).toBe(1);
  });

  it('handles file with various properties', () => {
    const result = normalizeFileMapPropsFromJson([
      {
        name: 'test.pdf',
        url: 'http://x.com/f',
        size: 1024,
        status: 'done',
        uuid: 'abc',
      },
    ]);
    expect(result.fileList[0].name).toBe('test.pdf');
    expect(result.fileList[0].url).toBe('http://x.com/f');
  });

  it('uses id as uuid fallback and default name when missing', () => {
    const result = normalizeFileMapPropsFromJson([{ id: 'file-id' }]);
    expect(result.fileList[0].uuid).toBe('file-id');
    expect(result.fileList[0].name).toBe('file-0');
  });

  it('preserves upload error status and message', () => {
    const result = normalizeFileMapPropsFromJson([
      {
        name: 'bad.zip',
        status: 'error',
        errorMessage: 'upload failed',
      },
    ]);
    expect(result.fileList[0].status).toBe('error');
    expect(result.fileList[0].errorMessage).toBe('upload failed');
  });

  it('filters entries when normalizeFile returns null', () => {
    const result = normalizeFileMapPropsFromJson(
      [{ name: 'skip.ts' }, { name: 'keep.ts' }],
      (_raw, file) => (file.name === 'skip.ts' ? null : file),
    );
    expect(result.fileList).toHaveLength(1);
    expect(result.fileList[0].name).toBe('keep.ts');
  });

  it('applies className from root object', () => {
    const result = normalizeFileMapPropsFromJson({
      files: [{ name: 'a.ts' }],
      className: 'file-map-custom',
    });
    expect(result.className).toBe('file-map-custom');
  });
});
