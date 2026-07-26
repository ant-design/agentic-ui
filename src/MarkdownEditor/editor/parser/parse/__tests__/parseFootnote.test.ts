import { describe, expect, it } from 'vitest';

import {
  footnoteReferenceToTextLeaf,
  handleFootnoteReference,
  legacyFootnoteReferenceElementToTextLeaf,
} from '../parseFootnote';

describe('parseFootnote', () => {
  it('footnoteReferenceToTextLeaf produces fnc text leaf', () => {
    expect(footnoteReferenceToTextLeaf({ identifier: '1' })).toEqual({
      text: '[^1]',
      identifier: '1',
      fnc: true,
    });
  });

  it('footnoteReferenceToTextLeaf falls back to label and empty text', () => {
    expect(footnoteReferenceToTextLeaf({ label: 'note' })).toEqual({
      text: '[^note]',
      identifier: 'note',
      fnc: true,
    });
    expect(footnoteReferenceToTextLeaf({})).toEqual({
      text: '',
      identifier: undefined,
      fnc: true,
    });
  });

  it('legacyFootnoteReferenceElementToTextLeaf reads identifier', () => {
    expect(
      legacyFootnoteReferenceElementToTextLeaf({
        identifier: '2',
        children: [{ text: '2' }],
      } as any),
    ).toEqual({
      text: '[^2]',
      identifier: '2',
      fnc: true,
    });
  });

  it('legacyFootnoteReferenceElementToTextLeaf parses text and children', () => {
    expect(
      legacyFootnoteReferenceElementToTextLeaf({
        text: '[^from-text]',
      }),
    ).toEqual({
      text: '[^from-text]',
      identifier: 'from-text',
      fnc: true,
    });
    expect(
      legacyFootnoteReferenceElementToTextLeaf({
        children: [{ text: '[^child]' }],
      } as any),
    ).toEqual({
      text: '[^child]',
      identifier: 'child',
      fnc: true,
    });
  });

  it('legacyFootnoteReferenceElementToTextLeaf prefers identifier over parsed text', () => {
    expect(
      legacyFootnoteReferenceElementToTextLeaf({
        identifier: 'id-first',
        text: '[^from-text]',
      }),
    ).toEqual({
      text: '[^id-first]',
      identifier: 'id-first',
      fnc: true,
    });
  });

  it('handleFootnoteReference matches footnoteReferenceToTextLeaf', () => {
    expect(handleFootnoteReference({ identifier: 'a' })).toEqual(
      footnoteReferenceToTextLeaf({ identifier: 'a' }),
    );
  });
});
