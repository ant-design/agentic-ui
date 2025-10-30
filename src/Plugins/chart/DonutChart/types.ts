import React from 'react';
import { ChartContainerProps } from '../components';
import { StatisticConfigType } from '../hooks/useChartStatistic';

export interface DonutChartData {
  category?: string; // 分类
  label: string;
  value: number | string;
  filterLabel?: string;
}

export interface DonutChartConfig {
  lastModified?: string;
  theme?: 'light' | 'dark';
  cutout?: string | number;
  showLegend?: boolean;
  showTooltip?: boolean;
  legendPosition?: 'top' | 'left' | 'bottom' | 'right';
  backgroundColor?: string[];
  borderColor?: string;
  /** 图表样式：'donut' 为环形图（默认），'pie' 为饼图 */
  chartStyle?: 'donut' | 'pie';
}

export interface DonutChartProps extends ChartContainerProps {
  data: DonutChartData[];
  configs?: DonutChartConfig[];
  width?: number | string;
  height?: number | string;
  className?: string;
  title?: string;
  showToolbar?: boolean;
  onDownload?: () => void;
  /** 数据时间 */
  dataTime?: string;
  /** 筛选项列表，不传时不显示筛选器 */
  filterList?: string[];
  /** 当前选中的筛选值 */
  selectedFilter?: string;
  /** 筛选变化回调函数 */
  onFilterChange?: (value: string) => void;
  /** 是否启用自动分类功能 */
  enableAutoCategory?: boolean;
  /** 是否启用单值模式：每条数据渲染一个独立环形图并自动着色 */
  singleMode?: boolean;
  /** 头部工具条额外按钮 */
  toolbarExtra?: React.ReactNode;
  /** ChartStatistic组件配置：object表示单个配置，array表示多个配置 */
  statistic?: StatisticConfigType;
}
