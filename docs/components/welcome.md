---
title: Welcome 欢迎语
atomId: Welcome
group:
  title: 入口
  order: 1
---

# Welcome 欢迎语

通过简短友好的欢迎语引入使用场景。

## 代码演示

<code src="../demos/welcome/index.tsx" background="var(--main-bg-color)" iframe=600></code>

## API

### WelcomeProps

| 参数          | 说明                           | 类型                                 | 默认值 |
| ------------- | ------------------------------ | ------------------------------------ | ------ |
| title         | 标题内容                       | `React.ReactNode`                    | -      |
| description   | 描述内容                       | `React.ReactNode`                    | -      |
| classNames    | 自定义样式类名                 | `Record<'title' \| 'description', string>` | -      |
| style         | 自定义样式                     | `React.CSSProperties`                | -      |
| rootClassName | 自定义根节点样式类名           | `string`                             | -      |

## 使用示例

### 基础用法

```tsx | pure
import { Welcome } from '@ant-design/md-editor';

export default () => {
  return (
    <Welcome
      title="欢迎使用 LUI Chat"
      description="开始你的智能对话之旅"
    />
  );
};
```

### 自定义类名

```tsx | pure
import { Welcome } from '@ant-design/md-editor';

export default () => {
  return (
    <Welcome
      title="带自定义类名的欢迎组件"
      description="通过 classNames 属性自定义各个部分的样式"
      classNames={{
        title: 'custom-title',
        description: 'custom-description',
      }}
      rootClassName="custom-welcome"
    />
  );
};
```

### 仅标题

```tsx | pure
import { Welcome } from '@ant-design/md-editor';

export default () => {
  return <Welcome title="简洁的欢迎标题" />;
};
```
