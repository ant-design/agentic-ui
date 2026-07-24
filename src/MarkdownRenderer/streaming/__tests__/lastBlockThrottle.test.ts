import { describe, expect, it } from 'vitest';
import { shouldReparseLastBlock } from '../lastBlockThrottle';

describe('shouldReparseLastBlock', () => {
  it('流式末块在未闭合围栏内应每帧重 parse', () => {
    const prev = '```json\n{"value":1';
    const next = '```json\n{"value":12';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('流式末块围栏外仍可按字符节流', () => {
    const prev = 'hello';
    const next = 'hello world';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('围栏闭合后恢复节流', () => {
    const prev = '```js\nx\n```\n';
    const next = '```js\nx\n```\nmore';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('流式末块在 GFM 表格内不因 | 或 - 立即重 parse', () => {
    const prev = '| a | b |\n| - | - |\n| 1';
    const next = '| a | b |\n| - | - |\n| 1 |';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('流式末块在 GFM 表格内换行仍立即重 parse', () => {
    const prev = '| a | b |';
    const next = '| a | b |\n| - | - |';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('流式末块在 GFM 表格内新增行内语法起点时立即重 parse', () => {
    const prev = '| a | b |\n| - | - |\n| 1 |';
    const next = '| a | b |\n| - | - |\n| 1 | [link';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('未闭合 think 内换行应立即重 parse', () => {
    const prev = '<think>\nreasoning';
    const next = '<think>\nreasoning\nmore';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('未闭合 think 闭合标签出现时应立即重 parse', () => {
    const prev = '<think>\nreasoning';
    const next = '<think>\nreasoning</think>';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });

  it('未闭合 think 内小增量字母仍按字符节流', () => {
    const prev = '<think>\nreasoning';
    const next = '<think>\nreasoningx';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(false);
  });

  it('thinking 别名闭合时也应立即重 parse', () => {
    const prev = '<thinking>\nstep';
    const next = '<thinking>\nstep</thinking>';
    expect(shouldReparseLastBlock(prev, next, true)).toBe(true);
  });
});
