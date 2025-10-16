import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ElementProps, InlineKatexNode } from '../../../src/MarkdownEditor/el';
import { InlineKatex } from '../../../src/plugins/katex/InlineKatex';

// Mock katex
vi.mock('katex', () => ({
  default: {
    render: vi.fn(),
  },
}));

// Mock the editor store
vi.mock('../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    markdownEditorRef: { current: null },
    readonly: false,
  }),
}));

// Mock the selection status hook
vi.mock('../../../src/MarkdownEditor/hooks/editor', () => ({
  useSelStatus: () => [false, [0, 0]],
}));
beforeEach(() => {
  process.env.NODE_ENV = 'test-inline-katex';
});

afterEach(() => {
  process.env.NODE_ENV = 'test';
});

describe('InlineKatex', () => {
  const mockElement: InlineKatexNode = {
    type: 'inline-katex',
    children: [{ text: 'x^2' }],
    value: 'x^2',
  };

  const defaultProps: ElementProps<InlineKatexNode> = {
    children: <span>x^2</span>,
    element: mockElement,
    attributes: {
      'data-slate-node': 'element' as const,
      ref: null,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly in test environment', () => {
    render(<InlineKatex {...defaultProps} />);

    // In test environment, it should render spans with contentEditable=false
    const spans = screen.getAllByRole('generic');
    const contentEditableSpan = spans.find(
      (span) => span.getAttribute('contenteditable') === 'false',
    );
    expect(contentEditableSpan).toBeInTheDocument();
  });

  it('should render with correct style attributes', () => {
    render(<InlineKatex {...defaultProps} style={{ fontSize: '0px' }} />);

    const spans = screen.getAllByRole('generic');
    const contentEditableSpan = spans.find(
      (span) => span.getAttribute('contenteditable') === 'false',
    );
    expect(contentEditableSpan).toHaveStyle({ fontSize: '0px' });
  });

  it('should render the component structure correctly', () => {
    const { container } = render(<InlineKatex {...defaultProps} />);

    // Should have a span with contentEditable=false
    const spans = container.querySelectorAll('span[contenteditable="false"]');
    expect(spans.length).toBeGreaterThan(0);
  });

  it('should handle different element types', () => {
    const differentElement: InlineKatexNode = {
      type: 'inline-katex',
      children: [{ text: 'y^3' }],
      value: 'y^3',
    };

    const propsWithDifferentElement = {
      ...defaultProps,
      element: differentElement,
    };

    render(<InlineKatex {...propsWithDifferentElement} />);

    const spans = screen.getAllByRole('generic');
    const contentEditableSpan = spans.find(
      (span) => span.getAttribute('contenteditable') === 'false',
    );
    expect(contentEditableSpan).toBeInTheDocument();
  });

  it('should render with custom attributes', () => {
    const propsWithAttributes = {
      ...defaultProps,
      attributes: { 'data-testid': 'custom-katex' },
    } as any;

    render(<InlineKatex {...propsWithAttributes} />);

    const spanElement = screen.getByTestId('custom-katex');
    expect(spanElement).toBeInTheDocument();
  });
});
