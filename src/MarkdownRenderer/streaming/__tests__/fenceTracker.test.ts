import { describe, expect, it } from 'vitest';
import {
  endsInsideUnclosedFence,
  INITIAL_FENCE_STATE,
  updateFenceStateForLine,
} from '../fenceTracker';

describe('fenceTracker', () => {
  it('tracks opening and closing backtick fences', () => {
    const opened = updateFenceStateForLine(INITIAL_FENCE_STATE, '```js');
    expect(opened).toEqual({
      inFenced: true,
      fenceChar: '`',
      fenceLen: 3,
    });

    const closed = updateFenceStateForLine(opened, '```   ');
    expect(closed).toEqual(INITIAL_FENCE_STATE);
  });

  it('does not close a fence when trailing info text is present', () => {
    const opened = updateFenceStateForLine(INITIAL_FENCE_STATE, '```json');
    const stillOpen = updateFenceStateForLine(opened, '```not-a-close');

    expect(stillOpen).toEqual(opened);
  });

  it('keeps tilde and backtick fences independent', () => {
    const opened = updateFenceStateForLine(INITIAL_FENCE_STATE, '~~~mermaid');
    const stillOpen = updateFenceStateForLine(opened, '```');
    const closed = updateFenceStateForLine(stillOpen, '~~~~');

    expect(stillOpen).toEqual(opened);
    expect(closed).toEqual(INITIAL_FENCE_STATE);
  });

  it('detects whether content ends inside an unclosed fence', () => {
    expect(endsInsideUnclosedFence('```json\n{"value":1')).toBe(true);
    expect(endsInsideUnclosedFence('```json\n{"value":1}\n```')).toBe(false);
  });

  it('does not close a longer open fence with a shorter marker', () => {
    const opened = updateFenceStateForLine(INITIAL_FENCE_STATE, '````ts');
    expect(opened).toEqual({
      inFenced: true,
      fenceChar: '`',
      fenceLen: 4,
    });

    // CommonMark: closing fence must be at least as long as the opener.
    const stillOpen = updateFenceStateForLine(opened, '```');
    expect(stillOpen).toEqual(opened);

    const closed = updateFenceStateForLine(stillOpen, '````');
    expect(closed).toEqual(INITIAL_FENCE_STATE);

    expect(endsInsideUnclosedFence('````\ncode\n```')).toBe(true);
    expect(endsInsideUnclosedFence('````\ncode\n````')).toBe(false);
  });

  it('ignores indented fence-like lines that are not fence markers', () => {
    const opened = updateFenceStateForLine(INITIAL_FENCE_STATE, '```');
    // Leading spaces after trimStart still match; ensure non-fence content stays unchanged.
    expect(updateFenceStateForLine(opened, 'const x = 1;')).toEqual(opened);
    expect(updateFenceStateForLine(INITIAL_FENCE_STATE, 'not a fence')).toEqual(
      INITIAL_FENCE_STATE,
    );
  });
});
