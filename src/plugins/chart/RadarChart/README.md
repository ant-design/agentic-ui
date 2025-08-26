# 雷达图组件 (RadarChart)

基于 Chart.js 和 react-chartjs-2 实现的雷达图组件，支持多组数据对比展示，数据完全可配置。

## 特性

- 🎯 支持多组数据对比
- 🎨 可自定义颜色和样式
- 📱 响应式设计
- 🔧 灵活的配置选项
- 🌙 支持深色和浅色主题
- 📊 数据完全外部配置
- 🎛️ 可自定义图例位置和显示

## 安装依赖

项目已安装必要的依赖：
- `chart.js`: ^4.5.0
- `react-chartjs-2`: ^5.3.0

## 使用方法

### 基础用法

```tsx
import RadarChart, { RadarChartConfig } from './PolarAreaChart';

const config: RadarChartConfig = {
  labels: ['维度1', '维度2', '维度3', '维度4'],
  datasets: [
    {
      label: '数据集1',
      data: [80, 70, 90, 85],
      borderColor: '#1677ff',
    },
    {
      label: '数据集2',
      data: [70, 85, 75, 90],
      borderColor: '#8954FC',
    },
  ],
  theme: 'dark',
};

function App() {
  return (
    <RadarChart 
      config={config}
      width={600} 
      height={400} 
    />
  );
}
```

### 完整配置示例

```tsx
const fullConfig: RadarChartConfig = {
  labels: ['专业', '自驱', '推动', '执行', '沟通', '思考'],
  datasets: [
    {
      label: 'Group A',
      data: [79.2, 79.2, 79.2, 79.2, 79.2, 79.2],
      borderColor: '#1677ff',
      backgroundColor: 'rgba(22, 119, 255, 0.1)',
      pointBackgroundColor: '#1677ff',
      pointBorderColor: '#fff',
    },
    {
      label: 'Group B',
      data: [99, 79.2, 59.4, 59.4, 59.4, 59.4],
      borderColor: '#8954FC',
      backgroundColor: 'rgba(137, 84, 252, 0.1)',
    },
  ],
  maxValue: 100,
  minValue: 0,
  stepSize: 19.8,
  theme: 'dark',
  showLegend: true,
  legendPosition: 'right',
};
```

## 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `config` | `RadarChartConfig` | - | **必需** 雷达图配置对象 |
| `width` | `number` | `600` | 图表宽度 |
| `height` | `number` | `400` | 图表高度 |
| `className` | `string` | `undefined` | 自定义 CSS 类名 |

## 配置接口

### RadarChartConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `labels` | `string[]` | - | **必需** 雷达图各维度的标签 |
| `datasets` | `RadarChartDataItem[]` | - | **必需** 数据集数组 |
| `maxValue` | `number` | `100` | 雷达图最大值 |
| `minValue` | `number` | `0` | 雷达图最小值 |
| `stepSize` | `number` | `20` | 刻度步长 |
| `theme` | `'dark' \| 'light'` | `'dark'` | 主题样式 |
| `showLegend` | `boolean` | `true` | 是否显示图例 |
| `legendPosition` | `'top' \| 'left' \| 'bottom' \| 'right'` | `'right'` | 图例位置 |

### RadarChartDataItem

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `string` | - | **必需** 数据集标签 |
| `data` | `number[]` | - | **必需** 数据值数组 |
| `borderColor` | `string` | 自动分配 | 边框颜色 |
| `backgroundColor` | `string` | 自动生成 | 填充区域颜色 |
| `pointBackgroundColor` | `string` | 自动分配 | 数据点背景色 |
| `pointBorderColor` | `string` | `#fff` | 数据点边框色 |

## 主题支持

### 深色主题 (默认)
- 背景色: `#1a1a1a`
- 文字颜色: `#fff`
- 网格线: `rgba(255, 255, 255, 0.2)`

### 浅色主题
- 背景色: `#fff`
- 文字颜色: `#333`
- 网格线: `rgba(0, 0, 0, 0.1)`
- 边框: `1px solid #e8e8e8`

## 颜色系统

组件提供 10 种默认颜色，如果未指定 `borderColor`，将自动分配：

```tsx
const defaultColors = [
  '#1677ff', // 蓝色
  '#8954FC', // 紫色
  '#15e7e4', // 青色
  '#F45BB5', // 粉色
  '#00A6FF', // 天蓝色
  '#33E59B', // 绿色
  '#D666E4', // 紫红色
  '#6151FF', // 靛蓝色
  '#BF3C93', // 玫红色
  '#005EE0', // 深蓝色
];
```

## 实际应用场景

### 1. 技能评估
- 员工能力评估
- 团队技能对比
- 个人发展追踪

### 2. 产品分析
- 产品性能对比
- 竞品分析
- 功能评估

### 3. 项目评估
- 项目进度监控
- 风险评估
- 质量评估

## 技术实现

- 使用 Chart.js 的 Radar 图表类型
- 支持填充区域和边框样式
- 响应式设计，支持不同屏幕尺寸
- 自定义工具提示和图例样式
- TypeScript 类型安全

## 示例

查看 `demo.tsx` 文件获取更多使用示例，包括：
- 技能评估雷达图
- 产品性能对比
- 员工能力评估
- 自定义配置示例 
