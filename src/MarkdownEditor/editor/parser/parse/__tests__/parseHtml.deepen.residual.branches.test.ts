/**
 * parseHtml deepen residual：attachment/think/special/media 边角。
 */
import { describe, expect, it, vi } from 'vitest';
import {
  createMediaNodeFromElement,
  decodeURIComponentUrl,
  findAttachment,
  findImageElement,
  handleHtml,
  isStandardHtmlElement,
  normalizeThinkTagAliases,
  preprocessNonStandardHtmlTags,
  preprocessSpecialTags,
  preprocessThinkTags,
} from '../parseHtml';

describe('parseHtml deepen residual branches', () => {
  it('normalizeThinkTagAliases：混合别名与孤立 open 不误换', () => {
    expect(normalizeThinkTagAliases('')).toBe('');
    const mixed =
      '<' +
      'redacted_thinking' +
      '>a</' +
      'redacted_thinking' +
      '> mid <' +
      'thinking' +
      '>b</' +
      'thinking' +
      '>';
    const out = normalizeThinkTagAliases(mixed);
    expect(out).toContain('<think>');
    expect(out).toContain('a');
    expect(out).toContain('b');
    // 孤立 open 不构成 pair
    const lone = '<' + 'thinking' + '>only-open';
    expect(normalizeThinkTagAliases(lone)).toContain('only-open');
  });

  it('findAttachment：download 属性与缺省；非法输入', () => {
    expect(
      findAttachment(
        '<a href="https://f.bin" download="f.bin" data-attachment>f</a>',
      ),
    ).toMatchObject({ url: 'https://f.bin' });
    expect(findAttachment('<a href="x">no</a>')).toBeNull();
    expect(findAttachment('')).toBeNull();
    expect(findAttachment(undefined as any)).toBeNull();
  });

  it('findImageElement / createMediaNode：video 尺寸缺省；null 早退', () => {
    const video = findImageElement('<video src="v.mp4"></video>');
    expect(video?.tagName).toBe('video');
    expect(createMediaNodeFromElement(video)).toBeTruthy();

    const img = findImageElement('<img src="a.png" />');
    expect(createMediaNodeFromElement(img)).toBeTruthy();

    expect(createMediaNodeFromElement(null)).toBeNull();
    expect(findImageElement('')).toBeNull();
  });

  it('isStandardHtmlElement：大小写闭合标签；非标签', () => {
    expect(isStandardHtmlElement('<SPAN>')).toBe(true);
    expect(isStandardHtmlElement('</Table>')).toBe(true);
    expect(isStandardHtmlElement('<my-widget>')).toBe(false);
    expect(isStandardHtmlElement('plain')).toBe(false);
  });

  it('preprocessSpecialTags / Think / NonStandard', () => {
    expect(preprocessThinkTags('<think>x</think>')).toContain('```think');
    expect(preprocessSpecialTags('<answer>y</answer>', 'answer')).toContain(
      '```answer',
    );
    expect(preprocessSpecialTags('no-tags', 'think')).toBe('no-tags');
    expect(preprocessNonStandardHtmlTags('<foo><p>z</p></foo>')).toContain(
      '<p>z</p>',
    );
    expect(preprocessNonStandardHtmlTags('<div>ok</div>')).toContain('div');
  });

  it('decodeURIComponentUrl：空串与合法；handleHtml br/hr', () => {
    expect(decodeURIComponentUrl('')).toBe('');
    expect(decodeURIComponentUrl('a%20b')).toBe('a b');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(decodeURIComponentUrl('%E0%A4%A')).toBe('%E0%A4%A');
    spy.mockRestore();

    const br = handleHtml({ value: '<br>' }, null, [], undefined);
    expect(br).toBeTruthy();

    const hr = handleHtml({ value: '<hr/>' }, null, [], undefined);
    expect(hr).toBeTruthy();
  });

  it('handleHtml：span 内联；注释 chartType 对象', () => {
    const span = handleHtml(
      { value: '<span style="color:red">t</span>' },
      { type: 'paragraph' },
      [],
      undefined,
    );
    expect(span).toBeTruthy();

    const chart = handleHtml(
      { value: '<!--{"chartType":"pie","data":[]}-->' },
      null,
      [],
      undefined,
    );
    expect(chart).toBeTruthy();
  });
});
