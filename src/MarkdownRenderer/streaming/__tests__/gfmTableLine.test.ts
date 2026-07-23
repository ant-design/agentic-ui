import { describe, expect, it } from 'vitest';
import { endsInsideGfmTable, isGfmTableLine } from '../gfmTableLine';

describe('isGfmTableLine', () => {
  it.each([
    '| name | value |',
    '  | name | value |  ',
    '| --- | --- |',
    '|:---|:---:|---:|',
  ])('识别 GFM 表格行: %s', (line) => {
    expect(isGfmTableLine(line)).toBe(true);
  });

  it.each(['plain text', 'name | value', '| unfinished'])(
    '拒绝非完整 GFM 表格行: %s',
    (line) => {
      expect(isGfmTableLine(line)).toBe(false);
    },
  );
});

describe('endsInsideGfmTable', () => {
  it('忽略末尾空行并识别最后一个表格行', () => {
    const source = '| name | value |\n| --- | --- |\n| foo | bar |\n\n';

    expect(endsInsideGfmTable(source)).toBe(true);
  });

  it('最后一个非空行是正文时返回 false', () => {
    const source = '| name | value |\n| --- | --- |\n\nAnswer\n';

    expect(endsInsideGfmTable(source)).toBe(false);
  });
});
