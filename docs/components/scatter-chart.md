---
title: ScatterChart 散点图
atomId: ScatterChart
group:
  title: 图文输出
  order: 4
---

# ScatterChart 散点图

用于展示二维坐标的离散点分布，支持分类与二级筛选，含响应式优化。

## 代码演示

<code src="../demos/charts/scatter.tsx" background="var(--main-bg-color)" iframe=540></code>

## API

### ScatterChartProps

| 属性            | 类型                     | 默认值 | 说明                                          |
| --------------- | ------------------------ | ------ | --------------------------------------------- |
| data            | `ScatterChartDataItem[]` | -      | 扁平化数据数组                                |
| title           | `string`                 | -      | 图表标题                                      |
| width           | `number \| string`       | `800`  | 宽度（px），移动端自适应为 100%               |
| height          | `number \| string`       | `600`  | 高度（px），移动端最大约 80% 屏宽（上限 400） |
| className       | `string`                 | -      | 自定义类名                                    |
| toolbarExtra    | `React.ReactNode`        | -      | 头部工具条额外按钮                            |
| dataTime        | `string`                 | -      | 数据时间                                      |
| xUnit           | `string`                 | `'月'` | X轴单位                                       |
| yUnit           | `string`                 | -      | Y轴单位                                       |
| xLabel          | `string`                 | -      | X轴标签                                       |
| yLabel          | `string`                 | -      | Y轴标签                                       |
| hiddenX         | `boolean`                | `false`| 是否隐藏 X 轴                                 |
| hiddenY         | `boolean`                | `false`| 是否隐藏 Y 轴                                 |
| borderColor     | `string`                 | -      | 边框颜色                                      |
| backgroundColor | `string`                 | -      | 背景颜色                                      |
| statistic       | `StatisticConfigType`    | -      | 统计数据组件配置                              |

### ScatterChartDataItem

| 字段        | 类型               | 必填 | 说明                             |
| ----------- | ------------------ | ---- | -------------------------------- |
| category    | `string`           | 否   | 分类（用于外层筛选）             |
| type        | `string`           | 否   | 数据序列名称（映射为 dataset）   |
| x           | `number \| string` | 是   | 横坐标                           |
| y           | `number \| string` | 是   | 纵坐标                           |
| filterLabel | `string`           | 否   | 二级筛选标签（可选，支持"全部"） |

### ChartStatisticConfig

`ChartStatisticConfig` 继承自 [ChartStatistic](/components/chart-statistic#chartstatisticprops) 组件的所有属性，详细 API 请参考 [ChartStatistic 文档](/components/chart-statistic)。

| 字段           | 类型                                                                | 默认值      | 说明                                                   |
| -------------- | ------------------------------------------------------------------- | ----------- | ------------------------------------------------------ |
| title          | `string`                                                            | -           | 指标标题                                               |
| tooltip        | `string`                                                            | -           | 鼠标悬停时显示的提示信息                               |
| value          | `number \| string \| null \| undefined`                             | -           | 显示的数值                                             |
| precision      | `number`                                                            | -           | 数值精度（小数点后位数）                               |
| groupSeparator | `string`                                                            | `','`       | 千分位分隔符                                           |
| prefix         | `string`                                                            | `''`        | 数值前缀（如货币符号）                                 |
| suffix         | `string`                                                            | `''`        | 数值后缀（如单位）                                     |
| formatter      | `(value: number \| string \| null \| undefined) => React.ReactNode` | -           | 自定义格式化函数，优先级高于其他格式化选项             |
| className      | `string`                                                            | `''`        | 自定义类名                                             |
| size           | `'small' \| 'default' \| 'large'`                                   | `'default'` | 组件尺寸                                               |
| block          | `boolean`                                                           | `false`     | 是否使用块级布局（弹性占用空间，多个时平分父容器宽度） |
| extra          | `React.ReactNode`                                                   | -           | 右上角自定义内容（图标、按钮等）                       |

## 说明

- 移动端会减小点的半径与 hover 半径以提升观感。
- `hiddenX` 和 `hiddenY` 可以控制坐标轴的显示/隐藏，适用于只展示图表本身而不需要坐标轴的场景。
