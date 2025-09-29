---
title: Segmented 分段控制器
group:
  title: 基础组件
  order: 3
---

# Segmented 分段控制器

分段控制器用于在多个选项之间进行选择。

## 代码演示

```tsx
import { SmileOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import React from 'react';

export default () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1>Segmented</h1>
      
      <div style={{ marginBottom: '24px' }}>
        <h3>基础用法</h3>
        <Segmented
          options={[
            {
              label: '公开',
              value: 'day',
            },
            {
              label: '公开',
              value: 'week',
            },
            {
              label: '公开',
              value: 'month',
            },
            {
              label: '公开',
              value: 'year',
            },
          ]}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3>带标签</h3>
        <Segmented
          options={[
            {
              label: (
                <div className="ant-segmented-item-title">
                  公开 <span className="ant-segmented-item-tag">123</span>
                </div>
              ),
              value: 'day',
            },
            {
              label: (
                <div className="ant-segmented-item-title">
                  公开 <span className="ant-segmented-item-tag">123</span>
                </div>
              ),
              value: 'week',
            },
            {
              label: (
                <div className="ant-segmented-item-title">
                  公开 <span className="ant-segmented-item-tag">123</span>
                </div>
              ),
              value: 'month',
            },
            {
              label: (
                <div className="ant-segmented-item-title">
                  公开 <span className="ant-segmented-item-tag">123</span>
                </div>
              ),
              value: 'year',
            },
          ]}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3>带图标</h3>
        <Segmented
          options={[
            {
              label: (
                <div className="ant-segmented-item-title">
                  公开 <span className="ant-segmented-item-tag">123</span>
                </div>
              ),
              icon: <SmileOutlined />,
              value: 'day',
            },
            {
              label: (
                <div className="ant-segmented-item-title">
                  公开 <span className="ant-segmented-item-tag">123</span>
                </div>
              ),
              icon: <SmileOutlined />,
              value: 'week',
            },
            {
              label: (
                <div className="ant-segmented-item-title">
                  公开 <span className="ant-segmented-item-tag">123</span>
                </div>
              ),
              icon: <SmileOutlined />,
              value: 'month',
            },
            {
              label: (
                <div className="ant-segmented-item-title">
                  公开 <span className="ant-segmented-item-tag">123</span>
                </div>
              ),
              icon: <SmileOutlined />,
              value: 'year',
            },
          ]}
        />
      </div>
    </div>
  );
};
```
