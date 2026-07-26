import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MermaidBlockRenderer } from '../../renderers/MermaidRenderer';

vi.mock('../../../Plugins/mermaid/env', () => ({
  isBrowser: vi.fn(() => true),
}));

vi.mock('../../../Plugins/mermaid/utils', () => ({
  loadMermaid: vi.fn(() => new Promise(() => {})),
}));

vi.mock('../../../Plugins/mermaid/MermaidFallback', () => ({
  MermaidCodePreview: ({ code }: { code: string }) => (
    <div data-testid="mermaid-preview">{code}</div>
  ),
}));

describe('MermaidBlockRenderer', () => {
  it('returns null for empty code', () => {
    const { container } = render(
      <MermaidBlockRenderer language="mermaid">{''}</MermaidBlockRenderer>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows suspense fallback while mermaid loads', () => {
    render(
      <MermaidBlockRenderer language="mermaid">
        {'graph TD; A-->B;'}
      </MermaidBlockRenderer>,
    );

    expect(screen.getByTestId('mermaid-preview')).toHaveTextContent(
      'graph TD; A-->B;',
    );
    expect(document.querySelector('[data-be="mermaid"]')).toBeTruthy();
  });
});
