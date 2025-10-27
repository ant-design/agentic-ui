import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    //jsxInject: "import React from 'react'",
  },
  resolve: {},
  server: {
    host: '127.0.0.1',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setupTests.ts',
    testTimeout: 500000,
    alias: {
      '@ant-design/agentic-ui': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      all: true,
      exclude: [
        'tests/**',
        '**/MarkdownEditor/editor/slate-react/**',
        '**/slate-table/**',
        '**/icons/**',
        'test/**',
      ],
    },
  },
});
