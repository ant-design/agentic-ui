import { describe, expect, it } from 'vitest';
import {
  convertParagraphToImage,
  createMarkdownParser,
  fixStrongWithSpecialChars,
  getMarkdownParser,
  protectJinjaDollarInText,
} from '../remarkParse';
import { JINJA_DOLLAR_PLACEHOLDER } from '../constants';

const runTransform = (transformer: () => (tree: any) => void, tree: any) => {
  transformer()(tree);
  return tree;
};

describe('remarkParse 额外分支', () => {
  it('getMarkdownParser 单例缓存', () => {
    expect(getMarkdownParser()).toBe(getMarkdownParser());
  });

  it('createMarkdownParser 可解析 GFM', () => {
    const parser = createMarkdownParser();
    const tree = parser.parse('| a | b |\n| - | - |\n| 1 | 2 |\n');
    expect(tree.type).toBe('root');
  });

  it('protectJinjaDollarInText 替换 $', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '{{ x }}$' }],
        },
      ],
    };
    runTransform(protectJinjaDollarInText, tree);
    expect(tree.children[0].children[0].value).toContain(
      JINJA_DOLLAR_PLACEHOLDER,
    );
  });

  it('fixStrongWithSpecialChars 处理 ** 边界', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '**a_b**' }],
        },
      ],
    };
    expect(() => runTransform(fixStrongWithSpecialChars, tree)).not.toThrow();
  });

  it('convertParagraphToImage：非 ! 开头保持段落', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'lead' }] },
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'https://x.com/a.png' }],
        },
      ],
    };
    runTransform(convertParagraphToImage, tree);
    expect(tree.children[1].type).toBe('paragraph');
  });
});
