import { describe, expect, it } from 'vitest';
import {
  bubblePropsAreEqual,
  shallowEqualRecord,
  shallowEqualStyles,
} from '../bubblePropsAreEqual';
import type { BubbleProps, MessageBubbleData } from '../type';

const baseOrigin = (): MessageBubbleData => ({
  id: 'm1',
  role: 'assistant',
  content: 'hello',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isLast: false,
});

describe('bubblePropsAreEqual', () => {
  it('treats fresh style object references as equal when keys match', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      style: { padding: 8, margin: 0 },
    };
    const b: BubbleProps = {
      ...a,
      style: { padding: 8, margin: 0 },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when origin content changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
    };
    const b: BubbleProps = {
      ...a,
      originData: { ...baseOrigin(), content: 'world' },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('treats markdownRenderConfig as equal when top-level keys match with new object references', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      markdownRenderConfig: {
        renderMode: 'markdown',
      },
    };
    const b: BubbleProps = {
      ...a,
      markdownRenderConfig: {
        renderMode: 'markdown',
      },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when markdownRenderConfig top-level value changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      markdownRenderConfig: { renderMode: 'markdown' },
    };
    const b: BubbleProps = {
      ...a,
      markdownRenderConfig: { renderMode: 'slate' },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('detects originData.meta.metadata shallow changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: {
        ...baseOrigin(),
        meta: { title: 't', metadata: { k: 1 } },
      },
    };
    const b: BubbleProps = {
      ...a,
      originData: {
        ...baseOrigin(),
        meta: { title: 't', metadata: { k: 2 } },
      },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('returns true when meta is absent on both sides', () => {
    const a: BubbleProps = { id: 'm1', originData: baseOrigin() };
    const b: BubbleProps = { id: 'm1', originData: { ...baseOrigin() } };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when preMessage id changes', () => {
    const pre = { id: 'p1', role: 'user' as const, content: 'hi' };
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      preMessage: pre,
    };
    const b: BubbleProps = {
      ...a,
      preMessage: { ...pre, id: 'p2' },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('treats nested styles objects as equal when keys match', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      styles: { bubble: { padding: 4 } },
    };
    const b: BubbleProps = {
      ...a,
      styles: { bubble: { padding: 4 } },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when deps array length differs', () => {
    const a: BubbleProps & { deps?: unknown[] } = {
      id: 'm1',
      originData: baseOrigin(),
      deps: [1],
    };
    const b: BubbleProps & { deps?: unknown[] } = {
      ...a,
      deps: [1, 2],
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('returns false when callback reference changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      onLike: () => {},
    };
    const b: BubbleProps = {
      ...a,
      onLike: () => {},
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('treats userBubbleProps and aiBubbleProps as shallow config objects', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      userBubbleProps: { showAvatar: true },
      aiBubbleProps: { pure: false },
      aIBubbleProps: { readonly: true },
    };
    const b: BubbleProps = {
      ...a,
      userBubbleProps: { showAvatar: true },
      aiBubbleProps: { pure: false },
      aIBubbleProps: { readonly: true },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when aiBubbleProps nested value changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      aiBubbleProps: { nested: { k: 1 } },
    };
    const b: BubbleProps = {
      ...a,
      aiBubbleProps: { nested: { k: 2 } },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('compares avatar records shallowly', () => {
    const avatar = { src: 'a.png', alt: 'A' };
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      avatar,
    };
    const b: BubbleProps = {
      ...a,
      avatar: { src: 'a.png', alt: 'A' },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });

  it('returns false when classNames slot changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: baseOrigin(),
      classNames: { bubble: 'a' },
    };
    const b: BubbleProps = {
      ...a,
      classNames: { bubble: 'b' },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('returns false when originData.extra reference changes', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: { ...baseOrigin(), extra: { k: 1 } },
    };
    const b: BubbleProps = {
      id: 'm1',
      originData: { ...baseOrigin(), extra: { k: 1 } },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(false);
  });

  it('compares meta when avatar is present', () => {
    const a: BubbleProps = {
      id: 'm1',
      originData: {
        ...baseOrigin(),
        meta: { avatar: 'x.png', title: 'T' },
      },
    };
    const b: BubbleProps = {
      id: 'm1',
      originData: {
        ...baseOrigin(),
        meta: { avatar: 'x.png', title: 'T' },
      },
    };
    expect(bubblePropsAreEqual(a, b)).toBe(true);
  });
});

describe('shallowEqualRecord', () => {
  it('compares key sets and values', () => {
    expect(shallowEqualRecord({ a: 1 }, { a: 1 })).toBe(true);
    expect(shallowEqualRecord({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallowEqualRecord(null, undefined)).toBe(true);
    expect(shallowEqualRecord({ a: 1 }, null)).toBe(false);
  });
});

describe('shallowEqualStyles', () => {
  it('compares nested style objects shallowly', () => {
    expect(
      shallowEqualStyles(
        { bubble: { color: 'red' } },
        { bubble: { color: 'red' } },
      ),
    ).toBe(true);
    expect(
      shallowEqualStyles(
        { bubble: { color: 'red' } },
        { bubble: { color: 'blue' } },
      ),
    ).toBe(false);
  });
});
