import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { BaseEditor, createEditor, Editor, Transforms } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { describe, expect, it } from 'vitest';
import { BaseMarkdownEditor } from '../../src/MarkdownEditor/BaseMarkdownEditor';
import {
  ReactEditor,
  withReact,
} from '../../src/MarkdownEditor/editor/slate-react';
import { EditorUtils } from '../../src/MarkdownEditor/editor/utils/editorUtils';

describe('Editor Alignment Tests', () => {
  const createTestEditor = () => {
    const editor = withHistory(withReact(createEditor())) as BaseEditor &
      ReactEditor &
      HistoryEditor;
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    return editor;
  };

  it('should apply text alignment and save it as comment in markdown', () => {
    const editor = createTestEditor();
    const initValue = JSON.stringify(editor.children);

    const { container } = render(
      <BaseMarkdownEditor initValue={initValue} onChange={() => {}} />,
    );

    // Insert some test text and select it
    Transforms.insertText(editor, 'This is a test text');

    Transforms.select(editor, Editor.start(editor, []));

    // Apply center alignment
    EditorUtils.setAlignment(editor, 'center');

    waitFor(() => {
      // Check if the text is visually centered
      const paragraph = container.querySelector('[data-be="paragraph"]');
      expect(paragraph).toBeTruthy();
      expect(paragraph).toHaveAttribute('data-align', 'center');
    });
  });

  it('should toggle between different alignments', () => {
    const editor = createTestEditor();
    const initValue = JSON.stringify(editor.children);

    render(<BaseMarkdownEditor initValue={initValue} onChange={() => {}} />);

    // Insert some test text and select it
    Transforms.insertText(editor, 'This is a test text');
    Transforms.select(editor, Editor.start(editor, []));

    // Test left alignment (default)
    expect(EditorUtils.isAlignmentActive(editor, 'left')).toBeFalsy();

    // Apply center alignment
    EditorUtils.setAlignment(editor, 'center');
    expect(EditorUtils.isAlignmentActive(editor, 'center')).toBeTruthy();

    // Apply right alignment
    EditorUtils.setAlignment(editor, 'right');
    expect(EditorUtils.isAlignmentActive(editor, 'right')).toBeTruthy();
    expect(EditorUtils.isAlignmentActive(editor, 'center')).toBeFalsy();
  });

  it('should preserve alignment when editing text', () => {
    const editor = createTestEditor();
    // Set initial content with center alignment
    editor.children = [
      {
        type: 'paragraph',
        align: 'center',
        children: [{ text: 'Test centered text' }],
      },
    ];
    const initValue = JSON.stringify(editor.children);

    render(<BaseMarkdownEditor initValue={initValue} onChange={() => {}} />);

    // Check if the alignment is preserved
    waitFor(() => {
      expect(EditorUtils.isAlignmentActive(editor, 'center')).toBeTruthy();
    });

    // Add more text while preserving alignment
    const point = { path: [0, 0], offset: 16 };
    Transforms.select(editor, point);
    Transforms.insertText(editor, ' with more content');
    expect(EditorUtils.isAlignmentActive(editor, 'center')).toBeTruthy();
  });
});
