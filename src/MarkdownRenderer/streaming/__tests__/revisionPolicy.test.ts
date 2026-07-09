import { describe, expect, it } from 'vitest';
import { shouldResetRevisionProgress } from '../revisionPolicy';

describe('shouldResetRevisionProgress', () => {
  it('does not reset for first revision or monotonic prefix growth', () => {
    expect(shouldResetRevisionProgress(undefined, 'hello')).toBe(false);
    expect(shouldResetRevisionProgress('', 'hello')).toBe(false);
    expect(shouldResetRevisionProgress('hello', 'hello world')).toBe(false);
  });

  it('does not reset when content shrinks along the same prefix', () => {
    expect(shouldResetRevisionProgress('hello world', 'hello')).toBe(false);
  });

  it('resets for unrelated replacement content', () => {
    expect(shouldResetRevisionProgress('hello', 'goodbye')).toBe(true);
    expect(shouldResetRevisionProgress('chunk-a', 'chunk-b')).toBe(true);
  });

  it('does not reset when the revision is unchanged', () => {
    expect(shouldResetRevisionProgress('same', 'same')).toBe(false);
  });
});
