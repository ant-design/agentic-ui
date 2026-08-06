/**
 * bubblePropsAreEqual deepen residual：meta metadata 假值臂、config/styles 边界。
 */
import { describe, expect, it } from 'vitest';
import {
  bubblePropsAreEqual,
  shallowEqualRecord,
  shallowEqualStyles,
} from '../bubblePropsAreEqual';
import type { BubbleProps, MessageBubbleData } from '../type';

const origin = (o?: Partial<MessageBubbleData>): MessageBubbleData => ({
  id: 'm1',
  role: 'assistant',
  content: 'hi',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isLast: false,
  ...o,
});

const props = (o?: Partial<BubbleProps> & { deps?: unknown[] }) =>
  ({
    id: 'm1',
    originData: origin(),
    ...o,
  }) as BubbleProps & { deps?: unknown[] };

describe('bubblePropsAreEqual deepen residual branches', () => {
  it('metaEqualForMemo：metadata 一侧缺失另一侧存在', () => {
    expect(
      bubblePropsAreEqual(
        props({
          originData: origin({
            meta: { title: 't', metadata: { k: 1 } },
          }),
        }),
        props({
          originData: origin({ meta: { title: 't' } }),
        }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ meta: { title: 't' } }) }),
        props({
          originData: origin({
            meta: { title: 't', metadata: { k: 1 } },
          }),
        }),
      ),
    ).toBe(false);
  });

  it('metaEqualForMemo：metadata 两侧均为 undefined 时相等', () => {
    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ meta: { title: 'same' } }) }),
        props({ originData: origin({ meta: { title: 'same' } }) }),
      ),
    ).toBe(true);
  });

  it('shallowEqualStyles：va===vb 走 continue；一侧假值走 else', () => {
    expect(
      shallowEqualStyles(
        { root: { padding: 1 } },
        { root: { padding: 1 }, extra: undefined as any },
      ),
    ).toBe(true);
    expect(
      shallowEqualStyles(
        { root: { padding: 1 } },
        { root: null as any },
      ),
    ).toBe(false);
    expect(
      shallowEqualStyles(
        { root: 0 as any },
        { root: false as any },
      ),
    ).toBe(false);
  });

  it('shallowEqualConfigObject：va/vb 一侧为 null 走 else', () => {
    expect(
      bubblePropsAreEqual(
        props({ customConfig: { a: null } as any }),
        props({ customConfig: { a: { x: 1 } } as any }),
      ),
    ).toBe(false);
    expect(
      bubblePropsAreEqual(
        props({ docListProps: { mode: 'a', nested: { x: 1 } } as any }),
        props({ docListProps: { mode: 'a', nested: null } as any }),
      ),
    ).toBe(false);
  });

  it('shallowEqualConfigObject：!(k in rb) 与 !(k in ra) 分别触发', () => {
    expect(
      bubblePropsAreEqual(
        props({ userBubbleProps: { onlyA: 1 } as any }),
        props({ userBubbleProps: { onlyB: 1 } as any }),
      ),
    ).toBe(false);
  });

  it('shallowEqualRecord：一侧 undefined 一侧 null 视为相等', () => {
    expect(shallowEqualRecord(undefined, null)).toBe(true);
    expect(shallowEqualRecord(null, undefined)).toBe(true);
  });

  it('preMessage 两侧 undefined 视为相等', () => {
    expect(
      bubblePropsAreEqual(
        props({ preMessage: undefined }),
        props({ preMessage: undefined }),
      ),
    ).toBe(true);
  });

  it('originData 两侧 undefined 视为相等', () => {
    expect(
      bubblePropsAreEqual(
        props({ originData: undefined }),
        props({ originData: undefined }),
      ),
    ).toBe(true);
  });

  it('meta 一侧 undefined 一侧空对象且不影响渲染', () => {
    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ meta: undefined }) }),
        props({ originData: origin({ meta: {} }) }),
      ),
    ).toBe(true);
  });

  it('meta metadata 空对象 length=0 不计入 affect', () => {
    expect(
      bubblePropsAreEqual(
        props({
          originData: origin({ meta: { metadata: {} } }),
        }),
        props({
          originData: origin({ meta: { metadata: undefined } }),
        }),
      ),
    ).toBe(true);
  });

  it('deps 同引用跳过逐项比较', () => {
    const deps = [1, 'a'];
    expect(
      bubblePropsAreEqual(props({ deps }), props({ deps })),
    ).toBe(true);
  });

  it('classNames 并集键一侧缺失', () => {
    expect(
      bubblePropsAreEqual(
        props({ classNames: { root: 'a' } }),
        props({ classNames: { content: 'b' } as any }),
      ),
    ).toBe(false);
  });

  it('avatar 引用相同跳过 shallowEqualRecord', () => {
    const avatar = { title: 'A' };
    expect(
      bubblePropsAreEqual(props({ avatar }), props({ avatar })),
    ).toBe(true);
  });
});
