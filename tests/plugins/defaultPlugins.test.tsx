import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { standardPlugins } from '../../src/Plugins/defaultPlugins';

// Mock plugins
vi.mock('../../src/Plugins/code', () => ({
  CodeElement: vi.fn(() => <div>Code Element</div>),
}));

vi.mock('../../src/Plugins/chart', () => ({
  ChartElement: vi.fn(() => <div>Chart Element</div>),
}));

vi.mock('../../src/Plugins/katex', () => ({
  KatexElement: vi.fn(() => <div>Katex Element</div>),
  InlineKatex: vi.fn(() => <span>Inline Katex</span>),
}));

describe('defaultPlugins', () => {
  it('should export standardPlugins array', () => {
    expect(Array.isArray(standardPlugins)).toBe(true);
    expect(standardPlugins).toHaveLength(1);
  });

  it('should have correct plugin structure', () => {
    const plugin = standardPlugins[0];
    expect(plugin).toHaveProperty('elements');
    expect(typeof plugin.elements).toBe('object');
  });

  it('should include all required elements', () => {
    const { elements } = standardPlugins[0];

    expect(elements).toHaveProperty('code');
    expect(elements).toHaveProperty('chart');
    expect(elements).toHaveProperty('katex');
    expect(elements).toHaveProperty('inline-katex');
  });

  it('should have function components as elements', () => {
    const { elements } = standardPlugins[0];

    expect(typeof elements.code).toBe('function');
    expect(typeof elements.chart).toBe('function');
    expect(typeof elements.katex).toBe('function');
    expect(typeof elements['inline-katex']).toBe('function');
  });

  it('should maintain plugin structure consistency', () => {
    const plugin = standardPlugins[0];

    // 检查插件结构是否一致
    expect(plugin).toEqual({
      elements: {
        code: expect.any(Function),
        chart: expect.any(Function),
        katex: expect.any(Function),
        'inline-katex': expect.any(Function),
      },
    });
  });
});
