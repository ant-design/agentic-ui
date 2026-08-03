/**
 * BoxPlotChart 分支覆盖补充测试
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
import BoxPlotChart, { type BoxPlotChartDataItem } from '../BoxPlotChart';

const mockDownloadChart = vi.fn();

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('@sgratzl/chartjs-chart-boxplot', () => ({
  BoxPlotController: vi.fn(),
  BoxAndWiskers: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Chart: React.forwardRef(({ data, options }: any, ref: any) => {
    (globalThis as any).__boxplotBranchOptions = options;
    (globalThis as any).__boxplotBranchData = data;
    return (
      <div
        data-testid="boxplot-chart"
        ref={ref}
        data-labels={JSON.stringify(data?.labels)}
      />
    );
  }),
}));

vi.mock('../ChartStatistic', () => ({
  default: () => <div data-testid="chart-statistic" />,
}));

vi.mock('../components', () => ({
  ChartContainer: ({ children }: any) => (
    <div data-testid="chart-container">{children}</div>
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
          data-testid={`filter-${o.value}`}
          onClick={() => onFilterChange?.(o.value)}
        >
          {o.label}
        </button>
      ))}
      {customOptions?.map((o: any) => (
        <button
          type="button"
          key={o.key}
          data-testid={`custom-${o.key}`}
          onClick={() => onSelectionChange?.(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
  ChartStatistic: () => <div data-testid="chart-statistic-unused" />,
  ChartToolBar: ({ onDownload, filter, title }: any) => (
    <div data-testid="chart-toolbar">
      <span>{title}</span>
      <button type="button" data-testid="download-btn" onClick={onDownload}>
        download
      </button>
      {filter}
    </div>
  ),
  downloadChart: (...args: any[]) => mockDownloadChart(...args),
}));

vi.mock('../BoxPlotChart/style', () => ({
  useStyle: () => ({ hashId: 'hash' }),
}));

vi.mock('../const', () => ({
  defaultColorList: ['#111', '#222'],
}));

vi.mock('../utils', () => ({
  hexToRgba: vi.fn((color, alpha) => `rgba(${color},${alpha})`),
  resolveCssVariable: vi.fn((color) => color),
}));

describe('BoxPlotChart 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('空数组渲染暂无有效数据', () => {
    render(<BoxPlotChart data={[]} />);
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('非数组 data 按空数据处理', () => {
    render(<BoxPlotChart data={null as unknown as BoxPlotChartDataItem[]} />);
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('label 为空字符串时被过滤导致空态', () => {
    render(
      <BoxPlotChart
        data={[{ label: '', values: [1, 2, 3] }]}
      />,
    );
    expect(screen.getByText('暂无有效数据')).toBeInTheDocument();
  });

  it('无 type 分组时创建默认数据集', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [1, 2, 3, 4, 5] },
          { label: 'B', values: [2, 3, 4, 5, 6] },
        ]}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets).toHaveLength(1);
    expect(data.datasets[0].label).toBe('默认');
  });

  it('有 type 分组时为每个 type 创建 dataset', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'Jan', values: [1, 2, 3], type: 'A' },
          { label: 'Jan', values: [4, 5, 6], type: 'B' },
        ]}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets).toHaveLength(2);
  });

  it('showOutliers=true 且存在异常值时 dataset 含 outliers', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'X', values: [1, 2, 3, 4, 5, 100] }]}
        showOutliers
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets[0].data[0]?.outliers?.length).toBeGreaterThan(0);
  });

  it('showOutliers=false 时不附加 outliers 字段', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'X', values: [1, 2, 3, 4, 5, 100] }]}
        showOutliers={false}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets[0].data[0]?.outliers).toBeUndefined();
    expect(data.datasets[0].itemRadius).toBe(0);
  });

  it('values 为空数组时对应 dataPoint 为 null', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [] },
          { label: 'B', values: [1, 2, 3] },
        ]}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets[0].data[0]).toBeNull();
    expect(data.datasets[0].data[1]).not.toBeNull();
  });

  it('values 含非有限数时被过滤后仍能计算', () => {
    render(
      <BoxPlotChart
        data={[
          {
            label: 'X',
            values: [1, 2, Number.NaN, Number.POSITIVE_INFINITY, 3],
          },
        ]}
      />,
    );
    expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
  });

  it('values 全无效时 calculateBoxPlotStats 返回零值', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'X', values: [Number.NaN, Number.POSITIVE_INFINITY] }]}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets[0].data[0]).toMatchObject({
      min: 0,
      median: 0,
    });
  });

  it('tooltip label 回调格式化统计行', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'X', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }]}
      />,
    );
    const options = (globalThis as any).__boxplotBranchOptions;
    const lines = options.plugins.tooltip.callbacks.label({
      raw: {
        min: 1,
        q1: 3,
        median: 5,
        q3: 7,
        max: 10,
        mean: 5.5,
      },
    });
    expect(lines).toContain('均值: 5.50');
  });

  it('tooltip label 在 raw 缺失时返回空字符串', () => {
    render(
      <BoxPlotChart data={[{ label: 'X', values: [1, 2, 3] }]} />,
    );
    const options = (globalThis as any).__boxplotBranchOptions;
    expect(options.plugins.tooltip.callbacks.label({ raw: null })).toBe('');
  });

  it('color 数组按 index 取色', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [1, 2, 3], type: 'T1' },
          { label: 'A', values: [4, 5, 6], type: 'T2' },
        ]}
        color={['#aaa', '#bbb']}
      />,
    );
    const data = (globalThis as any).__boxplotBranchData;
    expect(data.datasets).toHaveLength(2);
  });

  it('多分类 renderFilterInToolbar=false 渲染 ChartFilter', () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [1, 2, 3], category: 'C1' },
          { label: 'B', values: [2, 3, 4], category: 'C2' },
        ]}
        renderFilterInToolbar={false}
      />,
    );
    expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
  });

  it('filterLabel 筛选切换', async () => {
    render(
      <BoxPlotChart
        data={[
          { label: 'A', values: [1, 2, 3], category: 'C1', filterLabel: 'F1' },
          { label: 'B', values: [4, 5, 6], category: 'C1', filterLabel: 'F2' },
          { label: 'C', values: [7, 8, 9], category: 'C2', filterLabel: 'F1' },
        ]}
        renderFilterInToolbar={false}
      />,
    );
    fireEvent.click(screen.getByTestId('custom-F2'));
    await waitFor(() => {
      expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
    });
  });

  it('分类失效时回退 selectedFilter', async () => {
    const initial = [
      { label: 'A', values: [1, 2], category: 'X' },
      { label: 'B', values: [3, 4], category: 'Y' },
    ];
    const { rerender } = render(<BoxPlotChart data={initial} />);
    rerender(
      <BoxPlotChart
        data={[{ label: 'Z', values: [5, 6], category: 'Z' }]}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
    });
  });

  it('window resize 触发 isMobile 分支', async () => {
    render(
      <BoxPlotChart data={[{ label: 'A', values: [1, 2, 3] }]} />,
    );
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    });
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
  });

  it('dark 主题与轴标签', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3] }]}
        theme="dark"
        yAxisLabel="Y"
      />,
    );
    const options = (globalThis as any).__boxplotBranchOptions;
    expect(options.scales.y.title.display).toBe(true);
  });

  it('statistic 传单对象时渲染统计区块', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3] }]}
        statistic={{ type: 'sum', target: 'y', label: '合计' } as any}
      />,
    );
    expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
  });

  it('statistic 空数组不渲染统计', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3] }]}
        statistic={[]}
      />,
    );
    expect(screen.queryByTestId('chart-statistic')).not.toBeInTheDocument();
  });

  it('点击下载调用 downloadChart', () => {
    render(
      <BoxPlotChart
        data={[{ label: 'A', values: [1, 2, 3] }]}
        title="下载"
      />,
    );
    fireEvent.click(screen.getByTestId('download-btn'));
    expect(mockDownloadChart).toHaveBeenCalledTimes(1);
  });

  it('第二次渲染 boxPlotChartComponentsRegistered 已注册', () => {
    const data = [{ label: 'A', values: [1, 2, 3] }];
    const { rerender } = render(<BoxPlotChart data={data} />);
    rerender(<BoxPlotChart data={data} />);
    expect(screen.getByTestId('boxplot-chart')).toBeInTheDocument();
  });

  it('卸载时移除 resize 监听', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(
      <BoxPlotChart data={[{ label: 'A', values: [1, 2] }]} />,
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });
});
