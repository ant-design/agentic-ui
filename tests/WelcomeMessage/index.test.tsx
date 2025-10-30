import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { WelcomeMessage } from '../../src/WelcomeMessage';

describe('WelcomeMessage 组件', () => {
  it('应该渲染基本的欢迎组件', () => {
    render(<WelcomeMessage title="欢迎使用" />);

    expect(screen.getByText('欢迎使用')).toBeInTheDocument();
  });

  it('应该渲染标题和描述', () => {
    render(<WelcomeMessage title="欢迎使用" description="这是一个测试描述" />);

    expect(screen.getByText('欢迎使用')).toBeInTheDocument();
    expect(screen.getByText('这是一个测试描述')).toBeInTheDocument();
  });

  it('应该只渲染标题当没有描述时', () => {
    const { container } = render(<WelcomeMessage title="只有标题" />);

    expect(screen.getByText('只有标题')).toBeInTheDocument();
    const description = container.querySelector('.ant-welcome-description');
    expect(description).not.toBeInTheDocument();
  });

  it('应该只渲染描述当没有标题时', () => {
    const { container } = render(<WelcomeMessage description="只有描述" />);

    expect(screen.getByText('只有描述')).toBeInTheDocument();
    const title = container.querySelector('.ant-welcome-title');
    expect(title).not.toBeInTheDocument();
  });

  it('应该支持自定义样式类名', () => {
    const { container } = render(
      <WelcomeMessage
        title="自定义类名"
        classNames={{
          title: 'custom-title-class',
          description: 'custom-description-class',
        }}
      />,
    );

    const titleElement = container.querySelector('.custom-title-class');
    expect(titleElement).toBeInTheDocument();
  });

  it('应该支持自定义根节点样式类名', () => {
    const { container } = render(
      <WelcomeMessage title="根节点类名" rootClassName="custom-root-class" />,
    );

    const rootElement = container.querySelector('.custom-root-class');
    expect(rootElement).toBeInTheDocument();
  });

  it('应该支持自定义样式', () => {
    const customStyle = { backgroundColor: 'red', color: 'white' };
    const { container } = render(
      <WelcomeMessage title="自定义样式" style={customStyle} />,
    );

    const rootElement = container.querySelector('.ant-welcome');
    expect(rootElement).toHaveStyle('background-color: rgb(255, 0, 0)');
    expect(rootElement).toHaveStyle('color: rgb(255, 255, 255)');
  });

  it('应该支持 React 节点作为标题', () => {
    const titleNode = (
      <div>
        <span>React</span> <strong>节点</strong>
      </div>
    );

    render(<WelcomeMessage title={titleNode} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('节点')).toBeInTheDocument();
  });

  it('应该支持 React 节点作为描述', () => {
    const descriptionNode = (
      <div>
        <em>斜体</em> 和 <code>代码</code>
      </div>
    );

    render(<WelcomeMessage title="标题" description={descriptionNode} />);

    expect(screen.getByText('斜体')).toBeInTheDocument();
    expect(screen.getByText('代码')).toBeInTheDocument();
  });

  it('应该支持数字作为标题', () => {
    render(<WelcomeMessage title={123} />);

    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('应该支持数字作为描述', () => {
    render(<WelcomeMessage title="标题" description={456} />);

    expect(screen.getByText('456')).toBeInTheDocument();
  });

  it('应该支持布尔值作为标题', () => {
    const { container } = render(<WelcomeMessage title={true} />);

    // 布尔值 true 不会被渲染为文本
    const titleElement = container.querySelector('.ant-welcome-title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toBeEmptyDOMElement();
  });

  it('应该支持布尔值作为描述', () => {
    const { container } = render(
      <WelcomeMessage title="标题" description={false} />,
    );

    // 布尔值 false 不会被渲染为文本
    const descriptionElement = container.querySelector(
      '.ant-welcome-description',
    );
    expect(descriptionElement).not.toBeInTheDocument();
  });

  it('应该支持数组作为标题', () => {
    render(<WelcomeMessage title={['数组', '标题']} />);

    expect(screen.getByText('数组标题')).toBeInTheDocument();
  });

  it('应该支持数组作为描述', () => {
    render(<WelcomeMessage title="标题" description={['数组', '描述']} />);

    expect(screen.getByText('数组描述')).toBeInTheDocument();
  });

  it('应该正确处理空的 classNames 对象', () => {
    const { container } = render(
      <WelcomeMessage title="空 classNames" classNames={{}} />,
    );

    const titleElement = container.querySelector('.ant-welcome-title');
    expect(titleElement).toBeInTheDocument();
  });

  it('应该正确处理部分 classNames 对象', () => {
    const { container } = render(
      <WelcomeMessage
        title="部分 classNames"
        description="描述"
        classNames={{ title: 'only-title-class' }}
      />,
    );

    const titleElement = container.querySelector('.only-title-class');
    expect(titleElement).toBeInTheDocument();

    const descriptionElement = container.querySelector(
      '.ant-welcome-description',
    );
    expect(descriptionElement).toBeInTheDocument();
  });

  it('应该正确处理 null 和 undefined 值', () => {
    const { container } = render(
      <WelcomeMessage
        title={null}
        description={undefined}
        classNames={undefined}
        style={undefined}
        rootClassName={undefined}
      />,
    );

    // 当 title 为 null 时，不应该渲染标题
    const titleElement = container.querySelector('.ant-welcome-title');
    expect(titleElement).not.toBeInTheDocument();

    // 当 description 为 undefined 时，不应该渲染描述
    const descriptionElement = container.querySelector(
      '.ant-welcome-description',
    );
    expect(descriptionElement).not.toBeInTheDocument();
  });

  it('应该正确处理空字符串', () => {
    const { container } = render(<WelcomeMessage title="" description="" />);

    // 空字符串时，由于条件渲染，元素不会被渲染
    const titleElement = container.querySelector('.ant-welcome-title');
    expect(titleElement).not.toBeInTheDocument();

    const descriptionElement = container.querySelector(
      '.ant-welcome-description',
    );
    expect(descriptionElement).not.toBeInTheDocument();
  });

  it('应该支持复杂的嵌套内容', () => {
    const complexTitle = (
      <div>
        <h1>主标题</h1>
        <p>副标题</p>
      </div>
    );

    const complexDescription = (
      <div>
        <p>第一段描述</p>
        <ul>
          <li>列表项 1</li>
          <li>列表项 2</li>
        </ul>
      </div>
    );

    render(
      <WelcomeMessage title={complexTitle} description={complexDescription} />,
    );

    expect(screen.getByText('主标题')).toBeInTheDocument();
    expect(screen.getByText('副标题')).toBeInTheDocument();
    expect(screen.getByText('第一段描述')).toBeInTheDocument();
    expect(screen.getByText('列表项 1')).toBeInTheDocument();
    expect(screen.getByText('列表项 2')).toBeInTheDocument();
  });

  it('应该正确处理所有属性组合', () => {
    const customStyle = { padding: '20px' };
    const customClassNames = {
      title: 'custom-title',
      description: 'custom-description',
    };

    const { container } = render(
      <WelcomeMessage
        title="完整属性"
        description="完整描述"
        classNames={customClassNames}
        style={customStyle}
        rootClassName="custom-root"
      />,
    );

    const rootElement = container.querySelector('.custom-root');
    expect(rootElement).toBeInTheDocument();
    expect(rootElement).toHaveStyle('padding: 20px');

    const titleElement = container.querySelector('.custom-title');
    expect(titleElement).toBeInTheDocument();

    const descriptionElement = container.querySelector('.custom-description');
    expect(descriptionElement).toBeInTheDocument();
  });

  it('应该在 ConfigProvider 中正确工作', () => {
    const { container } = render(
      <ConfigProvider prefixCls="custom">
        <WelcomeMessage title="配置提供者" />
      </ConfigProvider>,
    );

    const rootElement = container.querySelector('.custom-welcome');
    expect(rootElement).toBeInTheDocument();
  });

  it('应该正确处理事件处理', () => {
    const handleClick = () => {
      console.log('点击了');
    };

    const { container } = render(
      <WelcomeMessage
        title={
          <button onClick={handleClick} data-testid="clickable-title">
            可点击标题
          </button>
        }
      />,
    );

    const clickableTitle = screen.getByTestId('clickable-title');
    expect(clickableTitle).toBeInTheDocument();

    fireEvent.click(clickableTitle);
    // 这里只是测试渲染，实际的事件处理由 React 处理
  });

  it('应该支持条件渲染', () => {
    const shouldShowTitle = true;
    const shouldShowDescription = false;

    const { container } = render(
      <WelcomeMessage
        title={shouldShowTitle ? '条件标题' : null}
        description={shouldShowDescription ? '条件描述' : null}
      />,
    );

    expect(screen.getByText('条件标题')).toBeInTheDocument();
    const descriptionElement = container.querySelector(
      '.ant-welcome-description',
    );
    expect(descriptionElement).not.toBeInTheDocument();
  });

  it('应该正确处理样式优先级', () => {
    const inlineStyle = { color: 'red' };
    const { container } = render(
      <WelcomeMessage
        title="样式优先级"
        style={inlineStyle}
        rootClassName="style-priority"
      />,
    );

    const rootElement = container.querySelector('.style-priority');
    expect(rootElement).toHaveStyle('color: rgb(255, 0, 0)');
  });
});
