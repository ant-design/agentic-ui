import { afterEach, describe, expect, it } from 'vitest';
import { patchRangeCloneContents } from '../patchRangeCloneContents';

const originalCloneContents = Range.prototype.cloneContents;

afterEach(() => {
  Range.prototype.cloneContents = originalCloneContents;
});

function selectContents(element: Element): Range {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range;
}

describe('patchRangeCloneContents', () => {
  it.each([
    ['ul', '<li>one</li><li>two</li>'],
    ['ol', '<li>one</li><li>two</li>'],
  ])('preserves the %s root when copying list items', (tagName, items) => {
    const list = document.createElement(tagName);
    list.innerHTML = items;
    const range = selectContents(list);

    patchRangeCloneContents();

    expect(range.cloneContents().firstElementChild?.outerHTML).toBe(
      `<${tagName}>${items}</${tagName}>`,
    );
  });

  it('reconstructs the parent list when copying list item contents', () => {
    const list = document.createElement('ol');
    list.innerHTML = '<li><span>one</span><strong>two</strong></li>';
    const range = selectContents(list.firstElementChild!);

    patchRangeCloneContents();

    expect(range.cloneContents().firstElementChild?.outerHTML).toBe(
      '<ol><li><span>one</span><strong>two</strong></li></ol>',
    );
  });

  it('leaves non-list contents unchanged and restores the native method', () => {
    const container = document.createElement('div');
    container.innerHTML = '<span>one</span><strong>two</strong>';
    const range = selectContents(container);
    const undo = patchRangeCloneContents();

    expect(Range.prototype.cloneContents).not.toBe(originalCloneContents);
    expect(range.cloneContents().textContent).toBe('onetwo');

    undo();

    expect(Range.prototype.cloneContents).toBe(originalCloneContents);
  });
});
