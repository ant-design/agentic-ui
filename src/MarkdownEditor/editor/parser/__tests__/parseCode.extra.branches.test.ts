import { describe, expect, it } from 'vitest';
import { handleCode } from '../../parser/parse/parseCode';

describe('parseCode 额外分支', () => {
  it('agentic-ui-toolusebar 合法 JSON', () => {
    const result = handleCode({
      value: '{"id":"t1"}',
      lang: 'agentic-ui-toolusebar',
    });
    expect(result.type).toBe('agentic-ui-toolusebar');
    expect(result.value).toEqual({ id: 't1' });
  });

  it('mermaid 未完成时 finished=false', () => {
    const result = handleCode({
      value: 'graph TD\nA',
      lang: 'mermaid',
      otherProps: { finished: false },
    });
    expect(result.otherProps?.finished).toBe(false);
  });

  it('handler 无 otherProps 时从 base 合并 config', () => {
    const result = handleCode(
      { value: 'x^2', lang: 'katex' },
      { 'data-extra': 1 },
    );
    expect(result.type).toBe('katex');
    expect(result.otherProps).toMatchObject({ 'data-extra': 1 });
  });

  it('configLanguage 为空串时回退 lang', () => {
    const result = handleCode(
      { value: 'x\n', lang: 'js' },
      { 'data-language': '' },
    );
    expect(result.language).toBe('js');
  });

  it('lang 仅空格时 langString 为空', () => {
    const result = handleCode({ value: 'x\n', lang: '   ' });
    expect(result.type).toBe('code');
  });

  it('围栏不完整 mermaid 保持 loading', () => {
    const result = handleCode({
      value: 'graph',
      lang: 'mermaid',
    });
    expect(result.type).toBe('mermaid');
  });
});
