import { describe, expect, it } from 'vitest';
import { shouldResetRevisionProgress } from '../revisionPolicy';

describe('shouldResetRevisionProgress', () => {
  it.each([
    {
      name: 'first streamed revision',
      previous: undefined,
      next: 'answer',
      expected: false,
    },
    {
      name: 'first revision after empty content',
      previous: '',
      next: 'answer',
      expected: false,
    },
    {
      name: 'unchanged revision',
      previous: 'answer',
      next: 'answer',
      expected: false,
    },
    {
      name: 'prefix append',
      previous: 'answer',
      next: 'answer continued',
      expected: false,
    },
    {
      name: 'prefix rollback',
      previous: 'answer continued',
      next: 'answer',
      expected: false,
    },
    {
      name: 'non-prefix replacement',
      previous: 'first answer',
      next: 'regenerated answer',
      expected: true,
    },
  ])('returns $expected for $name', ({ previous, next, expected }) => {
    expect(shouldResetRevisionProgress(previous, next)).toBe(expected);
  });
});
