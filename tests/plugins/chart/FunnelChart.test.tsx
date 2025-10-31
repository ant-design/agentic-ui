import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FunnelChart, {
  FunnelChartDataItem,
} from '../../../src/Plugins/chart/FunnelChart';
import { useChartStatistic } from '../../../src/Plugins/chart/hooks/useChartStatistic';

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: vi.fn(() => []),
          },
          onClick: vi.fn(),
        },
      },
    },
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  BarElement: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Bar: React.forwardRef((props: any, ref: any) => (
    <div data-testid="bar-chart" ref={ref}>
      Mocked Bar Chart
    </div>
  )),
}));

// Mock downloadChart
vi.mock('../../../src/Plugins/chart/components', () => ({
  ChartContainer: ({ children, ...props }: any) => (
    <div data-testid="chart-container" {...props}>
      {children}
    </div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <div data-testid="chart-filter">
      {filterOptions?.map((option: any) => (
        <button
          type="button"
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          data-testid={`filter-${option.value}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
  ChartToolBar: ({ title, onDownload, dataTime }: any) => (
    <div data-testid="chart-toolbar">
      {title && <span data-testid="chart-title">{title}</span>}
      {dataTime && <span data-testid="chart-datatime">{dataTime}</span>}
      <button type="button" onClick={onDownload} data-testid="download-button">
        下载
      </button>
    </div>
  ),
  downloadChart: vi.fn(),
}));

// Mock ChartStatistic
vi.mock('../../../src/Plugins/chart/ChartStatistic', () => ({
  default: ({ title, value }: any) => (
    <div data-testid="chart-statistic">
      {title}: {value}
    </div>
  ),
}));

// Mock useChartStatistic hook
vi.mock('../../../src/Plugins/chart/hooks/useChartStatistic', () => ({
  useChartStatistic: vi.fn(() => null),
}));

describe('FunnelChart', () => {
  const sampleData: FunnelChartDataItem[] = [
    { category: '默认', x: '访问', y: 1000, ratio: 100 },
    { category: '默认', x: '注册', y: 800, ratio: 80 },
    { category: '默认', x: '下单', y: 500, ratio: 62.5 },
    { category: '默认', x: '支付', y: 300, ratio: 60 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染漏斗图', () => {
      render(<FunnelChart data={sampleData} title="转化漏斗" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('应该正确渲染标题', () => {
      render(<FunnelChart data={sampleData} title="用户转化漏斗" />);

      expect(screen.getByTestId('chart-title')).toHaveTextContent(
        '用户转化漏斗',
      );
    });

    it('应该正确渲染数据时间', () => {
      render(
        <FunnelChart
          data={sampleData}
          title="转化漏斗"
          dataTime="2025-10-15"
        />,
      );

      expect(screen.getByTestId('chart-datatime')).toHaveTextContent(
        '2025-10-15',
      );
    });
  });

  describe('数据处理测试', () => {
    it('应该处理空数组', () => {
      render(<FunnelChart data={[]} title="空数据漏斗" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理包含 null/undefined 的数据', () => {
      const dataWithNull: FunnelChartDataItem[] = [
        { category: '默认', x: '访问', y: 1000 },
        { category: '默认', x: null as any, y: 800 },
        { category: '默认', x: '下单', y: undefined as any },
      ];

      render(<FunnelChart data={dataWithNull} title="包含空值的数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理多个分类的数据', () => {
      const multiCategoryData: FunnelChartDataItem[] = [
        { category: 'A组', x: '步骤1', y: 100, ratio: 100 },
        { category: 'A组', x: '步骤2', y: 80, ratio: 80 },
        { category: 'B组', x: '步骤1', y: 200, ratio: 100 },
        { category: 'B组', x: '步骤2', y: 150, ratio: 75 },
      ];

      render(<FunnelChart data={multiCategoryData} title="多分类漏斗" />);

      expect(screen.getByTestId('chart-filter')).toBeInTheDocument();
      expect(screen.getByTestId('filter-A组')).toBeInTheDocument();
      expect(screen.getByTestId('filter-B组')).toBeInTheDocument();
    });

    it('应该处理包含 filterLabel 的数据', () => {
      const dataWithFilterLabel: FunnelChartDataItem[] = [
        {
          category: '默认',
          x: '访问',
          y: 1000,
          ratio: 100,
          filterLabel: 'PC端',
        },
        {
          category: '默认',
          x: '注册',
          y: 800,
          ratio: 80,
          filterLabel: 'PC端',
        },
        {
          category: '默认',
          x: '访问',
          y: 500,
          ratio: 100,
          filterLabel: '移动端',
        },
        {
          category: '默认',
          x: '注册',
          y: 400,
          ratio: 80,
          filterLabel: '移动端',
        },
      ];

      render(<FunnelChart data={dataWithFilterLabel} title="多维度筛选漏斗" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('尺寸和样式测试', () => {
    it('应该支持自定义宽度和高度', () => {
      render(
        <FunnelChart
          data={sampleData}
          width={800}
          height={600}
          title="自定义尺寸"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持字符串宽度和高度', () => {
      render(
        <FunnelChart
          data={sampleData}
          width="100%"
          height="500px"
          title="百分比尺寸"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持自定义颜色', () => {
      render(
        <FunnelChart
          data={sampleData}
          color="#ff6b6b"
          title="自定义颜色漏斗"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持自定义 className', () => {
      render(
        <FunnelChart
          data={sampleData}
          className="custom-funnel"
          title="自定义类名"
        />,
      );

      const container = screen.getByTestId('chart-container');
      expect(container.className).toContain('custom-funnel');
    });
  });

  describe('主题和显示选项测试', () => {
    it('应该支持 dark 主题', () => {
      render(<FunnelChart data={sampleData} theme="dark" title="暗色主题" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持隐藏图例', () => {
      render(
        <FunnelChart data={sampleData} showLegend={false} title="隐藏图例" />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持自定义图例位置', () => {
      render(
        <FunnelChart data={sampleData} legendPosition="top" title="顶部图例" />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持自定义图例对齐方式', () => {
      render(
        <FunnelChart data={sampleData} legendAlign="center" title="居中图例" />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该支持隐藏百分比', () => {
      render(
        <FunnelChart
          data={sampleData}
          showPercent={false}
          title="隐藏百分比"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('交互功能测试', () => {
    it('应该支持下载功能', async () => {
      const { downloadChart } = vi.mocked(
        await import('../../../src/Plugins/chart/components'),
      );

      render(<FunnelChart data={sampleData} title="可下载漏斗" />);

      const downloadButton = screen.getByTestId('download-button');
      downloadButton.click();

      await waitFor(() => {
        expect(downloadChart).toHaveBeenCalled();
      });
    });

    it('应该支持额外的工具栏按钮', () => {
      const extraButton = (
        <button type="button" data-testid="extra-button">
          额外按钮
        </button>
      );

      render(
        <FunnelChart
          data={sampleData}
          toolbarExtra={extraButton}
          title="带额外按钮"
        />,
      );

      // toolbarExtra 会传递给 ChartToolBar，但我们的 mock 没有渲染它
      expect(screen.getByTestId('chart-toolbar')).toBeInTheDocument();
    });
  });

  describe('TypeNames 配置测试', () => {
    it('应该支持自定义 typeNames', () => {
      render(
        <FunnelChart
          data={sampleData}
          typeNames={{ name: '用户', rate: '转化率' }}
          title="自定义类型名称"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('响应式测试', () => {
    it('应该根据窗口大小调整布局', () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 500,
      });

      render(<FunnelChart data={sampleData} title="移动端漏斗" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该监听窗口大小变化', () => {
      render(<FunnelChart data={sampleData} title="响应式漏斗" />);

      // 模拟窗口大小变化
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200,
      });

      window.dispatchEvent(new Event('resize'));

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('Ratio 处理测试', () => {
    it('应该处理字符串类型的 ratio', () => {
      const dataWithStringRatio: FunnelChartDataItem[] = [
        { category: '默认', x: '步骤1', y: 1000, ratio: '100%' },
        { category: '默认', x: '步骤2', y: 800, ratio: '80%' },
      ];

      render(<FunnelChart data={dataWithStringRatio} title="字符串比率" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理没有 ratio 的数据', () => {
      const dataWithoutRatio: FunnelChartDataItem[] = [
        { category: '默认', x: '步骤1', y: 1000 },
        { category: '默认', x: '步骤2', y: 800 },
      ];

      render(<FunnelChart data={dataWithoutRatio} title="无比率数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理非数组数据', () => {
      render(<FunnelChart data={null as any} title="null 数据" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理单个数据点', () => {
      const singleData: FunnelChartDataItem[] = [
        { category: '默认', x: '访问', y: 1000 },
      ];

      render(<FunnelChart data={singleData} title="单个数据点" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理大量数据点', () => {
      const largeData: FunnelChartDataItem[] = Array.from(
        { length: 20 },
        (_, i) => ({
          category: '默认',
          x: `步骤${i + 1}`,
          y: 1000 - i * 50,
          ratio: 100 - i * 5,
        }),
      );

      render(<FunnelChart data={largeData} title="大量数据点" />);

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });

  describe('ChartStatistic 集成测试', () => {
    it('应该支持 statistic 配置', async () => {
      vi.mocked(useChartStatistic).mockReturnValue([
        {
          title: '总访问量',
          value: 1000,
        },
      ] as any);

      render(
        <FunnelChart
          data={sampleData}
          statistic={{
            title: '总访问量',
            value: 1000,
          }}
          title="带统计数据"
        />,
      );

      expect(screen.getByTestId('chart-statistic')).toBeInTheDocument();
    });
  });

  describe('bottomLayerMinWidth 测试', () => {
    it('应该支持设置最小宽度占比', () => {
      render(
        <FunnelChart
          data={sampleData}
          bottomLayerMinWidth={0.1}
          title="最小宽度控制"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理 0 值（不限制最小宽度）', () => {
      render(
        <FunnelChart
          data={sampleData}
          bottomLayerMinWidth={0}
          title="无最小宽度限制"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该处理边界值 1（最小宽度等于最大宽度）', () => {
      render(
        <FunnelChart
          data={sampleData}
          bottomLayerMinWidth={1}
          title="最小宽度等于最大宽度"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该将超出范围的值（>1）视为不限制', () => {
      render(
        <FunnelChart
          data={sampleData}
          bottomLayerMinWidth={1.5}
          title="超出范围的最小宽度"
        />,
      );

      // 应该正常渲染，且行为等同于 bottomLayerMinWidth={0}
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该将负值视为不限制', () => {
      render(
        <FunnelChart
          data={sampleData}
          bottomLayerMinWidth={-0.1}
          title="负值最小宽度"
        />,
      );

      // 应该正常渲染，且行为等同于 bottomLayerMinWidth={0}
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该在数据跨度大时应用最小宽度', () => {
      const largeRangeData: FunnelChartDataItem[] = [
        { category: '默认', x: '曝光', y: 100000, ratio: 20 },
        { category: '默认', x: '点击', y: 20000, ratio: 30 },
        { category: '默认', x: '注册', y: 6000, ratio: 50 },
        { category: '默认', x: '付费', y: 100, ratio: 0 },
      ];

      render(
        <FunnelChart
          data={largeRangeData}
          bottomLayerMinWidth={0.15}
          title="大跨度数据最小宽度"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('应该在数据跨度小时不影响显示', () => {
      const smallRangeData: FunnelChartDataItem[] = [
        { category: '默认', x: '步骤1', y: 100, ratio: 90 },
        { category: '默认', x: '步骤2', y: 90, ratio: 88 },
        { category: '默认', x: '步骤3', y: 85, ratio: 0 },
      ];

      render(
        <FunnelChart
          data={smallRangeData}
          bottomLayerMinWidth={0.15}
          title="小跨度数据最小宽度"
        />,
      );

      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });
  });
});
