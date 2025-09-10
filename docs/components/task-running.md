---
title: TaskRunning 任务运行状态
atomId: TaskRunning
group:
  title: 数据展示
  order: 3
---

# TaskRunning 任务运行状态

用于展示任务的运行状态，包括运行时长、当前状态和操作按钮。支持多种状态切换和交互操作。

## 代码演示

<code src="../demos/task-running.tsx">基础用法</code>

## API

### TaskRunning

| 参数              | 说明                   | 类型                  | 默认值 |
| ----------------- | ---------------------- | --------------------- | ------ |
| minutes           | 任务运行时长           | `string`              | -      |
| taskStatus        | 任务状态               | `TASK_STATUS`         | -      |
| taskRunningStatus | 任务运行状态           | `TASK_RUNNING_STATUS` | -      |
| actions           | 自定义操作按钮           | `React.ReactNode` | -      |
| variant           | 主题样式变体           | `'simple' \| 'default'` | -      |
| onCreateNewTask   | 创建新任务的回调函数   | `() => void`          | -      |
| onPause           | 暂停任务的回调函数     | `() => void`          | -      |
| onReplay          | 重新回放任务的回调函数 | `() => void`          | -      |
| onViewResult      | 查看任务结果的回调函数 | `() => void`          | -      |
| className         | 自定义类名             | `string`              | -      |

### TASK_STATUS

任务状态枚举：

```typescript
enum TASK_STATUS {
  /** 任务正在运行中 */
  RUNNING = 'running',
  /** 任务已成功完成 */
  SUCCESS = 'success',
  /** 任务执行出错 */
  ERROR = 'error',
  /** 任务已暂停 */
  PAUSE = 'pause',
  /** 任务已取消 */
  CANCELLED = 'cancelled',
}
```

### TASK_RUNNING_STATUS

任务运行状态枚举：

```typescript
enum TASK_RUNNING_STATUS {
  /** 正在运行中 */
  RUNNING = 'running',
  /** 已完成 */
  COMPLETE = 'complete',
  /** 已暂停 */
  PAUSE = 'pause',
}
```
