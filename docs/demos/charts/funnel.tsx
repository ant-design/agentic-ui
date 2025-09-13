import { Button } from 'antd';
import React, { useState } from 'react';
import FunnelChart, {
  FunnelChartDataItem,
} from '../../../src/plugins/chart/FunnelChart';

const FunnelDemo: React.FC = () => {
  const [data, setData] = useState<FunnelChartDataItem[]>([
    {
      category: '网站转化',
      type: '转化',
      x: '访问',
      y: 12000,
      filterLabel: '全球',
    },
    {
      category: '网站转化',
      type: '转化',
      x: '浏览商品',
      y: 8200,
      filterLabel: '全球',
    },
    {
      category: '网站转化',
      type: '转化',
      x: '加购',
      y: 5400,
      filterLabel: '全球',
    },
    {
      category: '网站转化',
      type: '转化',
      x: '提交订单',
      y: 2600,
      filterLabel: '全球',
    },
    {
      category: '网站转化',
      type: '转化',
      x: '支付成功',
      y: 1800,
      filterLabel: '全球',
    },

    {
      category: '网站转化',
      type: '转化',
      x: '访问',
      y: 8000,
      filterLabel: '美国',
    },
    {
      category: '网站转化',
      type: '转化',
      x: '浏览商品',
      y: 5100,
      filterLabel: '美国',
    },
    {
      category: '网站转化',
      type: '转化',
      x: '加购',
      y: 3300,
      filterLabel: '美国',
    },
    {
      category: '网站转化',
      type: '转化',
      x: '提交订单',
      y: 1700,
      filterLabel: '美国',
    },
    {
      category: '网站转化',
      type: '转化',
      x: '支付成功',
      y: 1200,
      filterLabel: '美国',
    },

    {
      category: '流量转化',
      type: '转化',
      x: '访问',
      y: 8000,
      filterLabel: '全球',
    },
    {
      category: '流量转化',
      type: '转化',
      x: '浏览商品',
      y: 5100,
      filterLabel: '全球',
    },
    {
      category: '流量转化',
      type: '转化',
      x: '加购',
      y: 3300,
      filterLabel: '全球',
    },
    {
      category: '流量转化',
      type: '转化',
      x: '提交订单',
      y: 1700,
      filterLabel: '全球',
    },
    {
      category: '流量转化',
      type: '转化',
      x: '支付成功',
      y: 1200,
      filterLabel: '全球',
    },

    {
      category: '流量转化',
      type: '转化',
      x: '访问',
      y: 8000,
      filterLabel: '美国',
    },
    {
      category: '流量转化',
      type: '转化',
      x: '浏览商品',
      y: 5100,
      filterLabel: '美国',
    },
    {
      category: '流量转化',
      type: '转化',
      x: '加购',
      y: 3300,
      filterLabel: '美国',
    },
    {
      category: '流量转化',
      type: '转化',
      x: '提交订单',
      y: 1700,
      filterLabel: '美国',
    },
    {
      category: '流量转化',
      type: '转化',
      x: '支付成功',
      y: 1200,
      filterLabel: '美国',
    },
  ]);

  const handleShuffle = () => {
    setData((prev) =>
      prev.map((item) => ({
        ...item,
        y: Math.max(
          200,
          Math.floor((Number(item.y) || 1000) * (0.7 + Math.random() * 0.6)),
        ),
      })),
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 16 }}>漏斗图使用示例</h2>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleShuffle}>
          随机更新数据
        </Button>
      </div>
      <FunnelChart title="网站转化漏斗" data={data} height={480} />
    </div>
  );
};

export default FunnelDemo;
