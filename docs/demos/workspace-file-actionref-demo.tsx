import { Workspace, type FileActionRef } from '@ant-design/md-editor';
import { Button, Card, Space, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const WorkspaceFileActionRefDemo: React.FC = () => {
  const actionRef = useRef<FileActionRef | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    setNodes([
      {
        name: '项目文档',
        type: 'markdown',
        children: [
          {
            name: 'README.md',
            type: 'markdown',
            size: '2.5KB',
            lastModified: '2024-01-15 10:00:00',
            content: '# 项目说明\n\n这是一个示例项目...',
          },
          {
            name: 'CHANGELOG.md',
            type: 'markdown',
            size: '1.8KB',
            lastModified: '2024-01-14 15:30:00',
            content: '# 更新日志\n\n## v1.0.0\n- 初始版本发布',
          },
        ],
      },
      {
        name: '源代码',
        type: 'react',
        children: [
          {
            name: 'index.tsx',
            type: 'react',
            size: '3.2KB',
            lastModified: '2024-01-15 09:45:00',
            content:
              'import React from "react";\n\nconst App = () => {\n  return <div>Hello World</div>;\n};\n\nexport default App;',
          },
        ],
      },
    ]);
  }, []);

  const handleOpenReadme = () => {
    const readme = nodes?.[0]?.children?.[0];
    if (!readme) {
      message.warning('未找到 README.md');
      return;
    }
    actionRef.current?.openPreview(readme);
  };

  const handleBack = () => {
    actionRef.current?.backToList();
  };

  return (
    <div style={{ height: 520, width: '100%' }}>
      <Card size="small" style={{ marginBottom: 12 }}>
        <Space>
          <Button size="small" type="primary" onClick={handleOpenReadme}>
            打开 README 预览（actionRef外部打开）
          </Button>
          <Button size="small" onClick={handleBack}>
            返回文件列表
          </Button>
        </Space>
      </Card>

      <Workspace title="文件工作台">
        <Workspace.File
          tab={{ key: 'files', title: '文件管理', count: nodes.length }}
          nodes={nodes}
          actionRef={actionRef}
          onPreview={(file) => {
            message.info(`准备预览: ${file.name}`);
            return file; // 返回 file 走内置预览逻辑
          }}
        />
      </Workspace>
    </div>
  );
};

export default WorkspaceFileActionRefDemo; 
