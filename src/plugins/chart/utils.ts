/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * @fileoverview 图表插件工具函数文件
 *
 * 该文件提供了图表数据处理、格式化、转换等工具函数。
 * 包括数字格式化、数据验证、排序、查找等功能。
 *
 * @author md-editor
 * @version 1.0.0
 * @since 2024
 */

/**
 * 创建一个新的 `Intl.NumberFormat` 实例，用于将数字格式化为美国英语的十进制格式。
 *
 * @constant
 * @type {Intl.NumberFormat}
 * @default
 * @example
 * const formattedNumber = intl.format(1234567.89);
 * console.log(formattedNumber); // 输出: "1,234,567.89"
 */
const intl = new Intl.NumberFormat('en-US', {
  style: 'decimal',
});

/**
 * 将数字或字符串格式化为字符串。
 *
 * @param value - 要格式化的值，可以是字符串或数字。
 * @returns 格式化后的字符串。如果输入值为字符串，则直接返回该字符串；
 *          如果输入值为数字，则使用 `intl.format` 方法格式化后返回；
 *          如果输入值为空或格式化过程中发生错误，则返回原始值。
 */
export const stringFormatNumber = (value: string | number) => {
  if (!value) return value;
  try {
    if (typeof value === 'string') return value;

    if (typeof value === 'number') {
      return intl.format(Number(value));
    }
    return value;
  } catch (error) {
    return value;
  }
};

/**
 * 防抖函数
 *
 * 创建一个防抖函数，该函数会在调用后等待指定的延迟时间，
 * 如果在延迟时间内再次调用，则重新开始计时。
 * 常用于限制函数调用频率，如搜索输入、窗口调整等场景。
 *
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数，包含以下方法：
 *   - `flush()`: 立即执行函数并清除定时器
 *   - `cancel()`: 取消延迟执行
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('搜索:', query);
 * }, 300);
 *
 * // 调用防抖函数
 * debouncedSearch('hello');
 * debouncedSearch('world'); // 只有这个会执行
 *
 * // 立即执行
 * debouncedSearch.flush();
 *
 * // 取消执行
 * debouncedSearch.cancel();
 * ```
 *
 * @since 1.0.0
 */
export function debounce(
  func: { (): void; apply?: any },
  delay: number | undefined,
) {
  let timer: any = null;
  const fn = function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      //@ts-ignore
      func.apply(this, arguments);
    }, delay);
  };
  fn.flush = function () {
    clearTimeout(timer);
    //@ts-ignore
    func.apply(this, arguments);
  };
  fn.cancel = function () {
    clearTimeout(timer);
  };
  return fn;
}

/**
 * 图表数据项接口
 *
 * 定义了图表中单个数据项的结构，用于统一各种图表类型的数据格式。
 * 支持多种图表类型的数据表示，包括分类、类型、坐标等信息。
 *
 * @interface ChartDataItem
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * const dataItem: ChartDataItem = {
 *   x: '2024-01',
 *   y: 100,
 *   category: '销售',
 *   type: '产品A',
 *   xtitle: '月份',
 *   ytitle: '销售额',
 *   filterLabel: 'Q1'
 * };
 * ```
 */
export interface ChartDataItem {
  /** 数据类别，用于数据分组和筛选 */
  category?: string;
  /** 数据类型，用于区分不同的数据系列 */
  type?: string;
  /** X轴值，可以是数字或字符串 */
  x: number | string;
  /** Y轴值，可以是数字或字符串 */
  y: number | string;
  /** X轴标题，用于显示轴标签 */
  xtitle?: string;
  /** Y轴标题，用于显示轴标签 */
  ytitle?: string;
  /** 筛选标签，用于数据筛选和过滤 */
  filterLabel?: string;
}

/**
 * 归一化 X 轴值
 *
 * 将字符串数字转换为数字类型，避免重复标签问题。
 * 如果输入已经是数字，直接返回；如果是字符串，尝试转换为数字。
 * 转换失败时返回原始值。
 *
 * @param {number | string} value - 原始 X 轴值
 * @returns {number | string} 归一化后的值
 *
 * @example
 * ```typescript
 * normalizeXValue(123); // 123
 * normalizeXValue('456'); // 456
 * normalizeXValue('abc'); // 'abc'
 * normalizeXValue(''); // ''
 * ```
 *
 * @since 1.0.0
 */
export const normalizeXValue = (value: number | string): number | string => {
  if (typeof value === 'number') return value;
  const s = String(value).trim();
  if (s === '') return value;
  const n = Number(s);
  return Number.isFinite(n) ? n : value;
};

/**
 * 比较两个 X 轴值的大小
 *
 * 用于对 X 轴值进行排序，支持数字和字符串的混合比较。
 * 比较规则：
 * 1. 数字优先于字符串
 * 2. 数字按数值大小比较
 * 3. 字符串按字典序比较
 *
 * @param {number | string} a - 第一个值
 * @param {number | string} b - 第二个值
 * @returns {number} 比较结果：负数表示 a < b，0 表示 a = b，正数表示 a > b
 *
 * @example
 * ```typescript
 * compareXValues(1, 2); // -1
 * compareXValues('a', 'b'); // -1
 * compareXValues(1, 'a'); // -1 (数字优先)
 * compareXValues('a', 1); // 1 (数字优先)
 * ```
 *
 * @since 1.0.0
 */
export const compareXValues = (
  a: number | string,
  b: number | string,
): number => {
  const normalizedA = normalizeXValue(a);
  const normalizedB = normalizeXValue(b);

  // 如果都是数字，按数值比较
  if (typeof normalizedA === 'number' && typeof normalizedB === 'number') {
    return normalizedA - normalizedB;
  }

  // 如果一个是数字，一个是字符串，数字优先
  if (typeof normalizedA === 'number' && typeof normalizedB === 'string') {
    return -1;
  }
  if (typeof normalizedA === 'string' && typeof normalizedB === 'number') {
    return 1;
  }

  // 如果都是字符串，按字符串比较
  return String(normalizedA).localeCompare(String(normalizedB));
};

/**
 * 检查两个 X 轴值是否相等
 *
 * 比较两个 X 轴值是否相等，支持数字和字符串的混合比较。
 * 先对值进行归一化处理，然后进行比较。
 *
 * @param {number | string} a - 第一个值
 * @param {number | string} b - 第二个值
 * @returns {boolean} 是否相等
 *
 * @example
 * ```typescript
 * isXValueEqual(1, 1); // true
 * isXValueEqual('1', 1); // true
 * isXValueEqual('a', 'a'); // true
 * isXValueEqual(1, 2); // false
 * ```
 *
 * @since 1.0.0
 */
export const isXValueEqual = (
  a: number | string,
  b: number | string,
): boolean => {
  const normalizedA = normalizeXValue(a);
  const normalizedB = normalizeXValue(b);

  // 如果都是数字，按数值比较
  if (typeof normalizedA === 'number' && typeof normalizedB === 'number') {
    return normalizedA === normalizedB;
  }

  // 否则按字符串比较
  return String(normalizedA) === String(normalizedB);
};

/**
 * 从数据中提取并排序 X 轴值
 *
 * 从图表数据数组中提取所有唯一的 X 轴值，并进行排序。
 * 先对值进行归一化处理，然后去重并排序。
 *
 * @param {ChartDataItem[]} data - 图表数据数组
 * @returns {Array<number | string>} 排序后的唯一 X 轴值数组
 *
 * @example
 * ```typescript
 * const data = [
 *   { x: '2024-01', y: 100 },
 *   { x: '2024-02', y: 200 },
 *   { x: '2024-01', y: 150 }, // 重复值
 *   { x: 3, y: 300 }
 * ];
 * const sortedValues = extractAndSortXValues(data);
 * // ['2024-01', '2024-02', 3]
 * ```
 *
 * @since 1.0.0
 */
export const extractAndSortXValues = (
  data: ChartDataItem[],
): Array<number | string> => {
  // 提取所有 x 值并归一化
  const normalizedValues = data.map((item) => normalizeXValue(item.x));

  // 去重并排序
  const uniqueValues = [...new Set(normalizedValues)];

  return uniqueValues.sort(compareXValues);
};

/**
 * 根据 X 轴值查找对应的数据点
 *
 * 在数据数组中查找指定 X 轴值对应的数据点。
 * 可以指定数据类型进行精确匹配。
 *
 * @param {ChartDataItem[]} data - 数据数组
 * @param {number | string} xValue - X 轴值
 * @param {string} [type] - 数据类型，可选
 * @returns {ChartDataItem | undefined} 匹配的数据点，如果未找到返回 undefined
 *
 * @example
 * ```typescript
 * const data = [
 *   { x: '2024-01', y: 100, type: 'A' },
 *   { x: '2024-01', y: 200, type: 'B' },
 *   { x: '2024-02', y: 300, type: 'A' }
 * ];
 *
 * // 查找所有类型
 * findDataPointByXValue(data, '2024-01'); // 第一个匹配项
 *
 * // 查找指定类型
 * findDataPointByXValue(data, '2024-01', 'B'); // { x: '2024-01', y: 200, type: 'B' }
 * ```
 *
 * @since 1.0.0
 */
export const findDataPointByXValue = (
  data: ChartDataItem[],
  xValue: number | string,
  type?: string,
): ChartDataItem | undefined => {
  if (!type) return data.find((item) => isXValueEqual(item.x, xValue));
  return data.find(
    (item) => item.type === type && isXValueEqual(item.x, xValue),
  );
};

/**
 * 将值转换为数字
 *
 * 安全地将任意值转换为数字类型，转换失败时返回默认值。
 * 如果输入已经是有效的数字，直接返回；否则尝试转换。
 *
 * @param {any} val - 要转换的值
 * @param {number} fallback - 转换失败时的默认值
 * @returns {number} 转换后的数字
 *
 * @example
 * ```typescript
 * toNumber('123', 0); // 123
 * toNumber(456, 0); // 456
 * toNumber('abc', 0); // 0
 * toNumber(null, 100); // 100
 * ```
 *
 * @since 1.0.0
 */
export const toNumber = (val: any, fallback: number): number => {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * 检查值是否不为空
 *
 * 检查值是否不为 null 和 undefined。
 * 用于数据验证和条件判断。
 *
 * @param {any} val - 要检查的值
 * @returns {boolean} 是否不为空
 *
 * @example
 * ```typescript
 * isNotEmpty('hello'); // true
 * isNotEmpty(0); // true
 * isNotEmpty(''); // true
 * isNotEmpty(null); // false
 * isNotEmpty(undefined); // false
 * ```
 *
 * @since 1.0.0
 */
export const isNotEmpty = (val: any) => {
  return val !== null && val !== undefined;
};
