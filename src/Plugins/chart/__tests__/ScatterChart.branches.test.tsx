/**
 * ScatterChart 分支覆盖补充测试
 *
 * 针对空数据、resize、筛选回退、自定义色、坐标轴边界、
 * 图例截断、tooltip external、ticks callback 等分支。
 */
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScatterChartDataItem } from '../ScatterChart';

let capturedScatterProps: any = null;

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: vi.fn(() => [
              {
                text: 'Short',
                fillStyle: '#1677ff',
                strokeStyle: '#1677ff',
                datasetIndex: 0,
                index: 0,
              },
              {
                text: '这是一个非常非常长的产品名称用于测试图例截断功能',
                fillStyle: '#52c41a',
                strokeStyle: '#52c41a',
                datasetIndex: 1,
                index: 1,
              },
            ]),
          },
        },
      },
    },
  },
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Scatter: React.forwardRef((props: any, ref: any) => {
    capturedScatterProps = props;
    (globalThis as any).__scatterBranchData = props.data;
    (globalThis as any).__scatterBranchOptions = props.options;
    return (
      <div
        data-testid="scatter-chart"
        ref={ref}
        data-datasets={JSON.stringify(
          props.data?.datasets?.map((ds: any) => ({
            label: ds.label,
            data: ds.data,
            pointRadius: ds.pointRadius,
          })),
        )}
      />
    );
  }),
}));

vi.mock('../utils', () => ({
  hexToRgba: vi.fn((color, alpha) => `rgba(${color},${alpha})`),
  resolveCssVariable: vi.fn((color) => color),
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children, ...p }: any) => (
    <div data-testid="chart-container" {...p}>
      {children}
    </div>
  ),
  ChartFilter: ({
    filterOptions,
    onFilterChange,
    customOptions,
    onSelectionChange,
  }: any) => (
    <div data-testid="chart-filter">
      {filterOptions?.map((o: any) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onFilterChange?.(o.value)}
          data-testid={`filter-${o.value}`}
        >
          {o.label}
        </button>
      ))}
      {customOptions?.map((o: any) => (
        <button
          type="button"
          key={o.key}
          onClick={() => onSelectionChange?.(o.key)}
          data-testid={`custom-${o.key}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
  ChartToolBar: ({ title, onDownload, filter, loading }: any) => (
    <div data-testid="chart-toolbar">
      {title && <span data-testid="chart-title">{title}</span>}
      {loading && <span data-testid="chart-loading">loading</span>}
      <button type="button" onClick={onDownload} data-testid="download-button">
        下载
      </button>
      {filter}
    </div>
  ),
  downloadChart: vi.fn(),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="chart-statistic" />,
}));

vi.mock('../ScatterChart/style', () => ({
  useStyle: () => ({ hashId: 'scatter-hash' }),
}));

vi.mock('../const', () => ({
  defaultColorList: ['#111111', '#222222', '#333333'],
}));

import ScatterChart from '../ScatterChart';

const validData: ScatterChartDataItem[] = [
  { category: 'A', type: 'T1', x: 1, y: 10 },
  { category: 'A', type: 'T1', x: 2, y: 20 },
  { category: 'A', type: 'T2', x: 1, y: 15 },
  { category: 'B', type: 'T1', x: 3, y: 30 },
];

describe('ScatterChart 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedScatterProps = null;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      measureText: vi.fn((text: string) => ({ width: text.length * 6 })),
      fillText: vi.fn(),
      font: '',
      canvas: document.createElement('canvas'),
    })) as any;
  });

  describe('空数据与无效数据', () => {
    it('空数组时显示暂无有效数据', () => {
      render(<ScatterChart data={[]} title="空数据" />);
      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
      expect(screen.queryByTestId('scatter-chart')).not.toBeInTheDocument();
    });

    it('null/undefined 数据时显示空状态', () => {
      render(<ScatterChart data={null as any} />);
      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('无 type 字段时 datasetTypes 为空并显示空状态', () => {
      render(<ScatterChart data={[{ category: 'A', x: 1, y: 10 }]} />);
      expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
    });

    it('无 category 时 selectedFilter 为空字符串仍渲染图表', () => {
      render(<ScatterChart data={[{ type: 'T1', x: 1, y: 10 }]} />);
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });
  });

  describe('resize 与卸载清理', () => {
    it('触发 window resize 后仍正常渲染', async () => {
      render(<ScatterChart data={validData} />);
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('卸载时移除 resize 监听并清理 tooltip DOM', () => {
      const tooltipEl = document.createElement('div');
      tooltipEl.id = 'custom-scatter-tooltip';
      document.body.appendChild(tooltipEl);
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(<ScatterChart data={validData} />);
      unmount();
      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeSpy.mockRestore();
      if (tooltipEl.parentNode) document.body.removeChild(tooltipEl);
    });
  });

  describe('selectedFilter 与 filterLabel 分支', () => {
    it('无 category 时 !selectedFilter 分支展示全部数据', () => {
      const data = [
        { type: 'T1', x: 1, y: 10 },
        { type: 'T2', x: 2, y: 20 },
      ];
      render(<ScatterChart data={data} />);
      const datasets = JSON.parse(
        screen.getByTestId('scatter-chart').getAttribute('data-datasets') ||
          '[]',
      );
      expect(datasets).toHaveLength(2);
    });

    it('切换 category 筛选后数据集更新', () => {
      render(<ScatterChart data={validData} />);
      fireEvent.click(screen.getByTestId('filter-B'));
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });

    it('有 filterLabel 时切换 custom 选项', async () => {
      const data: ScatterChartDataItem[] = [
        { category: 'A', type: 'T1', x: 1, y: 10, filterLabel: 'F1' },
        { category: 'A', type: 'T1', x: 2, y: 20, filterLabel: 'F2' },
        { category: 'B', type: 'T1', x: 3, y: 30, filterLabel: 'F1' },
      ];
      render(<ScatterChart data={data} renderFilterInToolbar />);
      expect(screen.getByTestId('custom-F1')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('custom-F2'));
      await waitFor(() => {
        expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
      });
    });

    it('无 filterLabels 时仅按 category 筛选', () => {
      const data: ScatterChartDataItem[] = [
        { category: 'A', type: 'T1', x: 1, y: 10 },
        { category: 'B', type: 'T1', x: 2, y: 20 },
      ];
      render(<ScatterChart data={data} />);
      fireEvent.click(screen.getByTestId('filter-A'));
      const datasets = JSON.parse(
        screen.getByTestId('scatter-chart').getAttribute('data-datasets') ||
          '[]',
      );
      expect(datasets[0]?.data?.length).toBeGreaterThan(0);
    });
  });

  describe('自定义颜色与坐标解析', () => {
    it('color 数组按序对应各数据集', () => {
      render(
        <ScatterChart
          data={validData}
          color={['#aa0000', '#00aa00', '#0000aa']}
        />,
      );
      expect(capturedScatterProps.data.datasets).toHaveLength(2);
    });

    it('字符串坐标 null/undefined/空串解析为 0', () => {
      const data: ScatterChartDataItem[] = [
        { category: 'A', type: 'T1', x: 'null', y: 'undefined' },
        { category: 'A', type: 'T1', x: '', y: '  ' },
        { category: 'A', type: 'T1', x: 5, y: 10 },
      ];
      render(<ScatterChart data={data} />);
      const coords = capturedScatterProps.data.datasets[0].data;
      expect(coords[0]).toEqual({ x: 0, y: 0 });
      expect(coords[2]).toEqual({ x: 5, y: 10 });
    });

    it('非有限数字坐标回退为 0', () => {
      const data: ScatterChartDataItem[] = [
        { category: 'A', type: 'T1', x: NaN, y: Infinity },
        { category: 'A', type: 'T1', x: 1, y: 10 },
      ];
      render(<ScatterChart data={data} />);
      expect(capturedScatterProps.data.datasets[0].data[0]).toEqual({
        x: 0,
        y: 0,
      });
    });
  });

  describe('坐标轴边界与 stepSize', () => {
    it('传入 xMin/xMax/yMin/yMax 时使用 override 边界', () => {
      render(
        <ScatterChart
          data={validData}
          xMin={0}
          xMax={100}
          yMin={0}
          yMax={50}
        />,
      );
      expect(capturedScatterProps.options.scales.x.min).toBe(0);
      expect(capturedScatterProps.options.scales.x.max).toBe(100);
      expect(capturedScatterProps.options.scales.y.min).toBe(0);
      expect(capturedScatterProps.options.scales.y.max).toBe(50);
    });

    it('ticks callback 有/无单位分支', () => {
      render(<ScatterChart data={validData} xUnit="月" yUnit="元" />);
      const xCb = capturedScatterProps.options.scales.x.ticks.callback;
      const yCb = capturedScatterProps.options.scales.y.ticks.callback;
      expect(xCb(3)).toBe('3月');
      expect(yCb(10)).toBe('10元');

      render(<ScatterChart data={validData} xUnit="" yUnit={undefined} />);
      const xCb2 = capturedScatterProps.options.scales.x.ticks.callback;
      expect(xCb2(5)).toBe('5');
    });
  });

  describe('generateLabels 图例分支', () => {
    it('短文本不截断，长文本加省略号', () => {
      render(<ScatterChart data={validData} textMaxWidth={80} />);
      const generateLabels =
        capturedScatterProps.options.plugins.legend.labels.generateLabels;
      const result = generateLabels({
        data: {
          datasets: [
            { borderColor: '#1677ff' },
            { borderColor: '#52c41a' },
          ],
        },
      });
      expect(result[0].text).toBe('Short');
      expect(result[1].text).toContain('...');
    });

    it('getContext 返回 null 时返回原始标签', () => {
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any;
      render(<ScatterChart data={validData} />);
      const generateLabels =
        capturedScatterProps.options.plugins.legend.labels.generateLabels;
      const result = generateLabels({ data: { datasets: [{}] } });
      expect(result[0].text).toBe('Short');
    });

    it('dark 主题图例 strokeStyle 与 lineWidth 分支', () => {
      render(<ScatterChart data={validData} theme="dark" />);
      const generateLabels =
        capturedScatterProps.options.plugins.legend.labels.generateLabels;
      const result = generateLabels({
        data: { datasets: [{ borderColor: '#1677ff' }] },
      });
      expect(result[0].lineWidth).toBe(0);
    });
  });

  describe('tooltip external 回调分支', () => {
    const getExternal = () =>
      capturedScatterProps.options.plugins.tooltip.external;

    it('opacity 为 0 时隐藏已有 tooltip', () => {
      render(<ScatterChart data={validData} />);
      const el = document.createElement('div');
      el.id = 'custom-scatter-tooltip';
      el.style.opacity = '1';
      document.body.appendChild(el);
      getExternal()({
        chart: {
          canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        },
        tooltip: { opacity: 0 },
      });
      expect(el.style.opacity).toBe('0');
      document.body.removeChild(el);
    });

    it('dataPoints 为空时 early return', () => {
      render(<ScatterChart data={validData} />);
      expect(() =>
        getExternal()({
          chart: {
            canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
          },
          tooltip: { opacity: 1, dataPoints: [] },
        }),
      ).not.toThrow();
    });

    it('dataPoints[0] 缺失时 early return', () => {
      render(<ScatterChart data={validData} />);
      expect(() =>
        getExternal()({
          chart: {
            canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
          },
          tooltip: { opacity: 1, dataPoints: [undefined] },
        }),
      ).not.toThrow();
    });

    it('有 dataPoints 时创建 tooltip 并格式化内容', () => {
      render(
        <ScatterChart data={validData} xUnit="月" yUnit="元" theme="dark" />,
      );
      getExternal()({
        chart: {
          canvas: { getBoundingClientRect: () => ({ left: 10, top: 20 }) },
        },
        tooltip: {
          opacity: 1,
          caretX: 50,
          caretY: 80,
          dataPoints: [
            {
              parsed: { x: 2, y: 25 },
              dataset: { label: 'T1', borderColor: '#1677ff' },
            },
          ],
        },
      });
      const tooltipEl = document.getElementById('custom-scatter-tooltip');
      expect(tooltipEl).toBeTruthy();
      expect(tooltipEl!.innerHTML).toContain('2月');
      expect(tooltipEl!.innerHTML).toContain('25元');
      tooltipEl?.remove();
    });

    it('parsed 解析异常时回退为 0', () => {
      render(<ScatterChart data={validData} />);
      const badPoint = {
        dataset: { label: 'T1', borderColor: '#333' },
        get parsed(): any {
          throw new Error('parse fail');
        },
      };
      getExternal()({
        chart: {
          canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        },
        tooltip: {
          opacity: 1,
          caretX: 0,
          caretY: 0,
          dataPoints: [badPoint],
        },
      });
      const tooltipEl = document.getElementById('custom-scatter-tooltip');
      expect(tooltipEl?.innerHTML).toContain('0');
      tooltipEl?.remove();
    });
  });

  describe('下载与 statistic 分支', () => {
    it('downloadChart 抛错时 console.warn', async () => {
      const { downloadChart } =
        await import('../../../../src/Plugins/chart/components');
      (downloadChart as any).mockImplementation(() => {
        throw new Error('download fail');
      });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<ScatterChart data={validData} />);
      fireEvent.click(screen.getByTestId('download-button'));
      expect(warnSpy).toHaveBeenCalledWith('图表下载失败:', expect.any(Error));
      warnSpy.mockRestore();
    });

    it('statistic 空数组时不渲染统计区块', () => {
      render(<ScatterChart data={validData} statistic={[]} />);
      expect(screen.queryByTestId('chart-statistic')).not.toBeInTheDocument();
    });

    it('第二次渲染跳过 Chart 重复注册', () => {
      const { rerender } = render(<ScatterChart data={validData} />);
      rerender(<ScatterChart data={validData} />);
      expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    });
  });
});
