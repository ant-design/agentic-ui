import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { withAgenticListsReact } from '../withAgenticListsReact';

vi.mock('../util/withRangeCloneContentsPatched', () => ({
  withRangeCloneContentsPatched: (callback: () => void) => callback(),
}));

describe('withAgenticListsReact', () => {
  it('wraps setFragmentData with range clone patch', () => {
    const base = createEditor();
    const setFragmentData = vi.fn();
    base.setFragmentData = setFragmentData;
    const editor = withAgenticListsReact(base);

    const data = { setData: vi.fn() } as unknown as DataTransfer;
    editor.setFragmentData(data);

    expect(setFragmentData).toHaveBeenCalledWith(data);
  });
});
