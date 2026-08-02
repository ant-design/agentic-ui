/**
 * ChartRender 分支覆盖补充测试
 *
 * 聚焦 runtime 映射、descriptions 回退、boxplot/histogram/funnel 等
 * 未在主测试中稳定覆盖的分支。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import message from 'antd/es/message';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { ChartRender } from '../ChartRender';

const runtimeCalls = vi.hoisted(() => ({
  boxplot: [] as any[][],
  histogram: [] as any[][],
  funnel: [] as any[][],
  scatter: [] as any[][],
  pie: [] as any[][],
}));

vi.mock('../../../Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

const createRuntimeChart =
  (testId: string, bucket: any[][]) =>
  (props: { data?: any[]; width?: number; height?: number }) => {
    bucket.push(props.data ?? []);
    return (
      <div
        data-testid={testId}
        data-width={props.width}
        data-height={props.height}
      />
    );
  };

vi.mock('../loadChartRuntime', () => ({
  loadChartRuntime: vi.fn(async () => ({
    AreaChart: () => <div data-testid="area-chart" />,
    BarChart: () => <div data-testid="bar-chart" />,
    BoxPlotChart: createRuntimeChart('boxplot-chart', runtimeCalls.boxplot),
    DonutChart: createRuntimeChart('donut-chart', runtimeCalls.pie),
    FunnelChart: createRuntimeChart('funnel-chart', runtimeCalls.funnel),
    HistogramChart: createRuntimeChart(
      'histogram-chart',
      runtimeCalls.histogram,
    ),
    LineChart: () => <div data-testid="line-chart" />,
    RadarChart: () => <div data-testid="radar-chart" />,
    ScatterChart: createRuntimeChart('scatter-chart', runtimeCalls.scatter),
  })),
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

const i18nValue = {
  locale: {
    copySuccess: '复制成功',
    copyMarkdown: '复制表格',
    pieChart: '饼图',
    funnelChart: '漏斗图',
    boxplotChart: '箱线图',
    histogramChart: '直方图',
    scatterChart: '散点图',
    table: '表格',
    'common.conversionRate': '转化率',
    'common.conversion': '转化',
  },
};

const runtimeConfig = {
  columns: [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Value', dataIndex: 'value' },
  ],
  height: 320,
  rest: {},
  x: 'name',
  y: 'value',
};

const wideConfig = {
  columns: [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Value', dataIndex: 'value' },
    { title: 'C1', dataIndex: 'c1' },
    { title: 'C2', dataIndex: 'c2' },
    { title: 'C3', dataIndex: 'c3' },
    { title: 'C4', dataIndex: 'c4' },
    { title: 'C5', dataIndex: 'c5' },
    { title: 'C6', dataIndex: 'c6' },
    { title: 'C7', dataIndex: 'c7' },
  ],
  height: 320,
  rest: {},
  x: 'name',
  y: 'value',
};

describe('ChartRender 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runtimeCalls.boxplot.length = 0;
    runtimeCalls.histogram.length = 0;
    runtimeCalls.funnel.length = 0;
    runtimeCalls.scatter.length = 0;
    runtimeCalls.pie.length = 0;
    process.env.NODE_ENV = 'development';
    Object.defineProperty(window, 'notRenderChart', {
      configurable: true,
      value: false,
      writable: true,
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = 'test';
    vi.restoreAllMocks();
  });

  const renderChart = (props: React.ComponentProps<typeof ChartRender>) =>
    render(
      <I18nContext.Provider value={i18nValue as any}>
        <ChartRender {...props} />
      </I18nContext.Provider>,
    );

  it('renderDescriptionsFallback：单行多列时渲染 descriptions', async () => {
    renderChart({
      chartType: 'bar',
      chartData: [{ name: 'Only', value: 1, c1: 1, c2: 2, c3: 3, c4: 4, c5: 5, c6: 6, c7: 7 }],
      config: wideConfig,
      title: 'Fallback',
    });

    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-chart__descriptions'),
      ).toBeInTheDocument();
    });
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('pie 类型传递 config.height 作为宽高', async () => {
    renderChart({
      chartType: 'pie',
      chartData: [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
      ],
      config: { ...runtimeConfig, height: 480 },
      title: 'Pie',
    });

    await screen.findByTestId('donut-chart');
    await waitFor(() => {
      const el = screen.getByTestId('donut-chart');
      expect(el.getAttribute('data-width')).toBe('480');
      expect(el.getAttribute('data-height')).toBe('480');
    });
  });

  it('boxplot runtime 按 label 分组并过滤非有限值', async () => {
    renderChart({
      chartType: 'boxplot',
      chartData: [
        { name: 'G1', value: 10, series: 'S1' },
        { name: 'G1', value: 'bad', series: 'S1' },
        { name: 'G1', value: 20, series: 'S1' },
      ],
      colorLegend: 'series',
      config: runtimeConfig,
      title: 'Box',
    });

    await screen.findByTestId('boxplot-chart');
    await waitFor(() => {
      expect(runtimeCalls.boxplot.at(-1)).toEqual([
        expect.objectContaining({
          label: 'G1',
          values: [10, 20],
          type: 'S1',
        }),
      ]);
    });
  });

  it('histogram 预分箱数据映射', async () => {
    renderChart({
      chartType: 'histogram',
      chartData: [
        {
          groupKey: { DIM_LEFT: 0, DIM_RIGHT: 10 },
          MEASURE_PROB: [{ actualValue: 5 }],
        },
      ],
      config: runtimeConfig,
      title: 'Hist',
    });

    await screen.findByTestId('histogram-chart');
    await waitFor(() => {
      expect(runtimeCalls.histogram.at(-1)).toEqual([
        expect.objectContaining({
          value: 5,
          left: 0,
          right: 10,
        }),
      ]);
    });
  });

  it('funnel runtime 映射 ratio 与 groupBy/filterBy', async () => {
    renderChart({
      chartType: 'funnel',
      chartData: [
        {
          name: 'Step1',
          value: 100,
          ratio: 1,
          category: 'C1',
          filter: 'F1',
          series: 'S1',
        },
      ],
      groupBy: 'category',
      filterBy: 'filter',
      colorLegend: 'series',
      config: runtimeConfig,
      title: 'Funnel',
    });

    await screen.findByTestId('funnel-chart');
    await waitFor(() => {
      expect(runtimeCalls.funnel.at(-1)).toEqual([
        expect.objectContaining({
          x: 'Step1',
          y: 100,
          ratio: 1,
          category: 'C1',
          filterLabel: 'F1',
          type: 'S1',
        }),
      ]);
    });
  });

  it('scatter 映射 x/y 缺省为 0', async () => {
    renderChart({
      chartType: 'scatter',
      chartData: [
        { name: 'A', value: 1 },
        { name: '', value: '' },
      ],
      config: runtimeConfig,
      title: 'Scatter',
    });

    await screen.findByTestId('scatter-chart');
    await waitFor(() => {
      expect(runtimeCalls.scatter.at(-1)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ x: 0, y: 0 }),
        ]),
      );
    });
  });

  it('复制 Markdown 空表格时不弹出成功提示', async () => {
    const successSpy = vi.spyOn(message, 'success').mockImplementation(vi.fn());
    renderChart({
      chartType: 'table',
      chartData: [],
      config: { ...runtimeConfig, columns: [] },
      title: 'Table',
    });

    await waitFor(() => {
      expect(document.querySelector('.ant-agentic-plugin-chart__table')).toBeInTheDocument();
    });

    const copyIcon = document.querySelector('.anticon-copy');
    if (copyIcon) fireEvent.click(copyIcon);
    expect(successSpy).not.toHaveBeenCalled();
    successSpy.mockRestore();
  });
});
