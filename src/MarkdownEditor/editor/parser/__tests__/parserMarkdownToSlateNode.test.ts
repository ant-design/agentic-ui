import { describe, expect, it } from 'vitest';
import { parserMarkdownToSlateNode } from '../parserMarkdownToSlateNode';

describe('parserMarkdownToSlateNode', () => {
  describe('handleParagraph', () => {
    it('should handle simple paragraph', () => {
      const markdown = 'This is a simple paragraph';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: 'This is a simple paragraph' }],
      });
    });

    it('should handle paragraph with bold text', () => {
      const markdown = 'Normal text **bold text** and more';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: 'Normal text ' },
          { text: 'bold text', bold: true },
          { text: ' and more' },
        ],
      });
    });

    it('should handle paragraph with italic text', () => {
      const markdown = 'Normal text *italic* text';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: 'Normal text ' },
          { text: 'italic', italic: true },
          { text: ' text' },
        ],
      });
    });

    it('should handle paragraph with combined formatting', () => {
      const markdown = 'Normal ***bold and italic*** text';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: 'Normal ' },
          { text: 'bold and italic', bold: true, italic: true },
          { text: '', italic: true },
          { text: ' text' },
        ],
      });
    });

    it('should handle paragraph with strikethrough', () => {
      const markdown = 'Normal ~~strikethrough~~ text';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: 'Normal ' },
          { text: 'strikethrough', strikethrough: true },
          { text: ' text' },
        ],
      });
    });

    it('should handle paragraph with inline code', () => {
      const markdown = 'Some `inline code` here';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: 'Some ' },
          {
            text: 'inline code',
            code: true,
            initialValue: undefined,
            placeholder: undefined,
            tag: false,
          },
          { text: ' here' },
        ],
      });
    });
  });

  describe('handleHeading', () => {
    it('should handle different heading levels', () => {
      const markdown = '# Heading 1\n## Heading 2\n### Heading 3';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(3);
      expect(result.schema[0]).toEqual({
        type: 'head',
        level: 1,
        children: [{ text: 'Heading 1' }],
      });
      expect(result.schema[1]).toEqual({
        type: 'head',
        level: 2,
        children: [{ text: 'Heading 2' }],
      });
      expect(result.schema[2]).toEqual({
        type: 'head',
        level: 3,
        children: [{ text: 'Heading 3' }],
      });
    });

    it('should handle heading with formatting', () => {
      const markdown = '## Heading with **bold** text';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'head',
        level: 2,
        children: [
          { text: 'Heading with ' },
          { text: 'bold', bold: true },
          { text: ' text' },
        ],
      });
    });
  });

  describe('handleCode', () => {
    it('should handle code block with language', () => {
      const markdown = '```javascript\nconsole.log("hello");\n```';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'code',
        language: 'javascript',
        render: false,
        isConfig: false,
        value: 'console.log("hello");',
        children: [{ text: 'console.log("hello");' }],
      });
    });

    it('should handle code block without language', () => {
      const markdown = '```\nsome code\n```';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'code',
        language: null,
        render: false,
        isConfig: false,
        value: 'some code',
        children: [{ text: 'some code' }],
      });
    });

    it('should handle multi-line code block', () => {
      const markdown =
        '```python\ndef hello():\n    print("Hello World")\n    return True\n```';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'code',
        language: 'python',
        render: false,
        isConfig: false,
        value: 'def hello():\n    print("Hello World")\n    return True',
        children: [
          { text: 'def hello():\n    print("Hello World")\n    return True' },
        ],
      });
    });
  });

  describe('handleBlockquote', () => {
    it('should handle simple blockquote', () => {
      const markdown = '> This is a quote';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'This is a quote' }],
          },
        ],
      });
    });

    it('should handle multi-line blockquote', () => {
      const markdown = '> First line\n> Second line\n> Third line';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'First line\nSecond line\nThird line' }],
          },
        ],
      });
    });

    it('should handle nested blockquotes', () => {
      const markdown = '> First level\n> > Second level\n> > > Third level';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('blockquote');
      expect(result.schema[0].children).toHaveLength(2);
    });
  });

  describe('handleList', () => {
    it('should handle unordered list', () => {
      const markdown = '- First item\n- Second item\n- Third item';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'list',
        order: false,
        start: null,
        task: false,
        children: [
          {
            type: 'list-item',
            checked: null,
            mentions: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'First item' }],
              },
            ],
          },
          {
            type: 'list-item',
            checked: null,
            mentions: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Second item' }],
              },
            ],
          },
          {
            type: 'list-item',
            checked: null,
            mentions: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Third item' }],
              },
            ],
          },
        ],
      });
    });

    it('should handle ordered list', () => {
      const markdown = '1. First item\n2. Second item\n3. Third item';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'list',
        order: true,
        start: 1,
        task: false,
        children: [
          {
            type: 'list-item',
            checked: null,
            mentions: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'First item' }],
              },
            ],
          },
          {
            type: 'list-item',
            checked: null,
            mentions: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Second item' }],
              },
            ],
          },
          {
            type: 'list-item',
            checked: null,
            mentions: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Third item' }],
              },
            ],
          },
        ],
      });
    });

    it('should handle nested lists', () => {
      const markdown =
        '- Item 1\n  - Nested item 1\n  - Nested item 2\n- Item 2';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('list');
      expect(result.schema[0].children).toHaveLength(2);
    });
  });

  describe('handleImage', () => {
    it('should handle simple image', () => {
      const markdown = '![Alt text](http://example.com/image.jpg)';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'card',
        block: false,
        children: [
          {
            type: 'card-before',
            children: [{ text: '' }],
          },
          {
            type: 'image',
            url: 'http://example.com/image.jpg',
            alt: 'Alt text',
            block: false,
            height: undefined,
            width: undefined,
            mediaType: 'image',
            children: [{ text: '' }],
          },
          {
            type: 'card-after',
            children: [{ text: '' }],
          },
        ],
      });
    });

    it('should handle image with title', () => {
      const markdown =
        '![Alt text](http://example.com/image.jpg "Image Title")';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'card',
        block: false,
        children: [
          {
            type: 'card-before',
            children: [{ text: '' }],
          },
          {
            type: 'image',
            url: 'http://example.com/image.jpg',
            alt: 'Alt text',
            block: false,
            height: undefined,
            width: undefined,
            mediaType: 'image',
            children: [{ text: '' }],
          },
          {
            type: 'card-after',
            children: [{ text: '' }],
          },
        ],
      });
    });
  });

  describe('handleLink', () => {
    it('should handle simple link', () => {
      const markdown = '[Link text](http://example.com)';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          {
            text: 'Link text',
            url: 'http://example.com',
          },
        ],
      });
    });

    it('should handle link with title', () => {
      const markdown = '[Link text](http://example.com "Link Title")';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          {
            text: 'Link text',
            url: 'http://example.com',
          },
        ],
      });
    });

    it('should handle autolink', () => {
      const markdown = '<http://example.com>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          {
            text: 'http://example.com',
            url: 'http://example.com',
          },
        ],
      });
    });
  });

  describe('handleTable', () => {
    it('should handle simple table', () => {
      const markdown =
        '| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('card');
      expect(result.schema[0].children[1].type).toBe('table');
      expect(result.schema[0].children[1].children).toHaveLength(2);
    });

    it('should handle table with alignment', () => {
      const markdown =
        '| Left | Center | Right |\n| :--- | :----: | ----: |\n| L1   | C1     | R1    |';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('card');
      expect(result.schema[0].children[1].type).toBe('table');
      expect(result.schema[0].children[1].children[0].children[0].align).toBe(
        'left',
      );
      expect(result.schema[0].children[1].children[0].children[1].align).toBe(
        'center',
      );
      expect(result.schema[0].children[1].children[0].children[2].align).toBe(
        'right',
      );
    });
  });

  describe('handleThematicBreak', () => {
    it('should handle horizontal rule', () => {
      const markdown = '---';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'hr',
        children: [{ text: '' }],
      });
    });

    it('should handle different horizontal rule styles', () => {
      const markdown = '***\n\n___';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(2);
      expect(result.schema[0].type).toBe('hr');
      expect(result.schema[1].type).toBe('hr');
    });
  });

  describe('handleHTML', () => {
    it('should handle HTML blocks', () => {
      const markdown = '<div>HTML content</div>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        text: 'HTML content',
      });
    });

    it('should handle inline HTML', () => {
      const markdown = 'Text with <em>inline HTML</em> content';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('paragraph');
    });
  });

  describe('handleFrontmatter', () => {
    it('should handle YAML frontmatter', () => {
      const markdown = '---\ntitle: Test\nauthor: John\n---\n\n# Content';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(2);
      expect(result.schema[0]).toEqual({
        type: 'code',
        language: 'yaml',
        frontmatter: true,
        value: 'title: Test\nauthor: John',
        children: [{ text: 'title: Test\nauthor: John' }],
      });
      expect(result.schema[1]).toEqual({
        type: 'head',
        level: 1,
        children: [{ text: 'Content' }],
      });
    });
  });

  describe('mixed content parsing', () => {
    it('should handle complex markdown with multiple elements', () => {
      const markdown = `# Main Title

This is a paragraph with **bold** and *italic* text.

## Subsection

Here's a list:
- Item 1
- Item 2
- Item 3

And a code block:

\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`

> This is a blockquote
> with multiple lines

[Link to example](http://example.com)`;

      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema.length).toBeGreaterThan(5);
      expect(result.schema[0].type).toBe('head');
      expect(result.schema[1].type).toBe('paragraph');
      expect(result.schema[2].type).toBe('head');

      // 查找列表
      const listIndex = result.schema.findIndex((node) => node.type === 'list');
      expect(listIndex).toBeGreaterThan(-1);

      // 查找代码块
      const codeIndex = result.schema.findIndex((node) => node.type === 'code');
      expect(codeIndex).toBeGreaterThan(-1);

      // 查找引用
      const blockquoteIndex = result.schema.findIndex(
        (node) => node.type === 'blockquote',
      );
      expect(blockquoteIndex).toBeGreaterThan(-1);
    });

    it('should preserve whitespace and formatting', () => {
      const markdown = 'Text with   multiple   spaces and\n\nnew paragraphs';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(2);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: 'Text with   multiple   spaces and' }],
      });
      expect(result.schema[1]).toEqual({
        type: 'paragraph',
        children: [{ text: 'new paragraphs' }],
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty markdown', () => {
      const markdown = '';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: '' }],
      });
    });

    it('should handle only whitespace', () => {
      const markdown = '   \n  \n   ';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: '' }],
      });
    });

    it('should handle malformed markdown gracefully', () => {
      const markdown =
        '# Heading without content\n\n**Bold without closing\n\n```\nCode without closing';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema.length).toBeGreaterThan(0);
      expect(result.schema[0].type).toBe('head');
    });
  });

  describe('alignment parsing', () => {
    it('should handle alignment comments for paragraphs', () => {
      const markdown =
        '<!--{"align":"center"}-->\nThis is a centered paragraph';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(2);
      expect(result.schema[1]).toEqual({
        type: 'paragraph',
        contextProps: { align: 'center' },
        otherProps: { align: 'center' },
        children: [{ text: 'This is a centered paragraph' }],
      });
    });

    it('should handle alignment comments for headings', () => {
      const markdown = '<!--{"align":"right"}-->\n## Right Aligned Heading';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(2);
      expect(result.schema[1]).toEqual({
        type: 'head',
        level: 2,
        contextProps: { align: 'right' },
        otherProps: { align: 'right' },
        children: [{ text: 'Right Aligned Heading' }],
      });
    });
  });

  describe('handleMedia', () => {
    it('should handle video tags as media elements', () => {
      const markdown = '<video src="video.mp4" alt="" height="400"/>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('card');
      expect(result.schema[0].children[1].type).toBe('media');
    });

    it('should handle img tags as image elements', () => {
      const markdown = '<img src="image.jpg" alt="" data-align="center"/>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('card');
      expect(result.schema[0].children[1].type).toBe('image');
    });
  });

  describe('handleAttachment', () => {
    it('should handle download links as attachments', () => {
      const markdown =
        '<a href="http://example.com/file.pdf" download data-size="1.2MB">Sample PDF</a>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('attach');
      expect((result.schema[0] as any).url).toBe('http://example.com/file.pdf');
      expect((result.schema[0] as any).name).toBe('Sample PDF');
    });
  });

  describe('handleSchema', () => {
    it('should handle schema code blocks', () => {
      const markdown =
        '```schema\n{\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" }\n  }\n}\n```';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('apaasify');
      expect((result.schema[0] as any).language).toBe('schema');
    });
  });

  describe('handleLinkCard', () => {
    it('should handle link cards as regular links', () => {
      const markdown = '[Example Link](http://example.com "Example Link")';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          {
            text: 'Example Link',
            url: 'http://example.com',
          },
        ],
      });
    });
  });

  describe('handleFootnoteDefinition', () => {
    it('should handle footnote definitions', () => {
      const markdown = '[^1]: [Footnote content](http://example.com)';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('footnoteDefinition');
      expect((result.schema[0] as any).identifier).toBe('1');
      expect((result.schema[0] as any).value).toBe('Footnote content');
      expect((result.schema[0] as any).url).toBe('http://example.com');
    });

    it('should handle footnote references', () => {
      const markdown = 'This has a footnote[^1]';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: 'This has a footnote[^1]' }],
      });
    });
  });

  describe('handleDefinitionList', () => {
    it('should handle definition lists as regular content', () => {
      const markdown = 'Term 1\n: Definition 1\n\nTerm 2\n: Definition 2';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(2);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: 'Term 1\n: Definition 1' }],
      });
      expect(result.schema[1]).toEqual({
        type: 'paragraph',
        children: [{ text: 'Term 2\n: Definition 2' }],
      });
    });
  });

  describe('special characters and escaping', () => {
    it('should handle escaped characters', () => {
      const markdown = 'Text with \\*escaped\\* asterisks and \\[brackets\\]';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: 'Text with *escaped* asterisks and [brackets]' }],
      });
    });

    it('should handle unicode characters', () => {
      const markdown = 'Unicode: 你好 🌟 ∑∞≠';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: 'Unicode: 你好 🌟 ∑∞≠' }],
      });
    });
  });

  describe('handleThinkTag', () => {
    it('should parse <think> tag to think code block', () => {
      const markdown = '<think>深度思考内容</think>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toMatchObject({
        type: 'code',
        language: 'think',
        value: '深度思考内容',
        children: [{ text: '深度思考内容' }],
      });
    });

    it('should parse <think> tag with multiline content', () => {
      const markdown = '<think>第一行思考\n第二行思考\n第三行思考</think>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toMatchObject({
        type: 'code',
        language: 'think',
        value: '第一行思考\n第二行思考\n第三行思考',
      });
    });

    it('should handle <think> tag with nested code block', () => {
      const markdown = `<think>
分析问题：

\`\`\`javascript
console.log('测试代码');
\`\`\`

这是嵌套的代码块
</think>`;
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toMatchObject({
        type: 'code',
        language: 'think',
      });

      // 验证内容包含特殊标记
      const value = result.schema[0].value as string;
      expect(value).toContain('【CODE_BLOCK:javascript】');
      expect(value).toContain('【/CODE_BLOCK】');
      expect(value).toContain("console.log('测试代码');");
    });

    it('should handle <think> tag with nested think code block', () => {
      const markdown = `<think>
第一步：理解需求

\`\`\`think
这是嵌套的 think 代码块
\`\`\`

第二步：实现方案
</think>`;
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toMatchObject({
        type: 'code',
        language: 'think',
      });

      // 验证嵌套的 think 代码块被正确转换
      const value = result.schema[0].value as string;
      expect(value).toContain('【CODE_BLOCK:think】');
      expect(value).toContain('这是嵌套的 think 代码块');
    });
  });

  describe('handleCustomHtmlTags', () => {
    it('should treat non-standard HTML tags as text', () => {
      const markdown = '<custom>自定义内容</custom>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: '<custom>' },
          { text: '自定义内容' },
          { text: '</custom>' },
        ],
      });
    });

    it('should treat multiple custom tags as text', () => {
      const markdown = '<foo>内容1</foo> 和 <bar>内容2</bar>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('paragraph');
      // 验证自定义标签被当作文本
      const text = result.schema[0].children
        .map((child: any) => child.text)
        .join('');
      expect(text).toContain('<foo>');
      expect(text).toContain('</foo>');
      expect(text).toContain('<bar>');
      expect(text).toContain('</bar>');
    });

    it('should handle standard HTML tags normally', () => {
      const markdown = '<div>标准 HTML</div>';
      const result = parserMarkdownToSlateNode(markdown);

      // 标准 HTML 标签应该被解析为 HTML 代码块或片段
      expect(result.schema).toHaveLength(1);
      // div 标签会被 htmlToFragmentList 处理
      expect(result.schema[0].type).not.toBe('paragraph');
    });
  });

  describe('handleAnswerTag', () => {
    it('should treat <answer> tag as text (non-standard element)', () => {
      const markdown = '<answer>这是答案内容</answer>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: '<answer>' },
          { text: '这是答案内容' },
          { text: '</answer>' },
        ],
      });
    });

    it('should treat <answer> tag with multiline as text', () => {
      const markdown = '<answer>第一行答案</answer>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('paragraph');
      // 验证 answer 标签被当作文本
      const text = result.schema[0].children
        .map((child: any) => child.text)
        .join('');
      expect(text).toContain('<answer>');
      expect(text).toContain('</answer>');
    });

    it('should handle both <think> and <answer> tags - think converted, answer as text', () => {
      const markdown = `<think>思考过程</think>

<answer>答案内容</answer>`;
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(2);
      // think 被转换为代码块
      expect(result.schema[0]).toMatchObject({
        type: 'code',
        language: 'think',
        value: '思考过程',
      });
      // answer 被当作普通文本
      expect(result.schema[1].type).toBe('paragraph');
      const text = result.schema[1].children
        .map((child: any) => child.text)
        .join('');
      expect(text).toContain('<answer>');
      expect(text).toContain('</answer>');
    });
  });
});
