import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      // 图表容器基础样式
      position: 'relative',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      // 响应式边框样式
      borderRadius: '6px',
      padding: '12px',

      // 浅色主题边框
      '&&-light-theme': {
        border: '1px solid #e8e8e8',
        backgroundColor: '#fff',
      },

      // 深色主题无边框
      '&&-dark-theme': {
        border: 'none',
        backgroundColor: '#1a1a1a',
      },

      // 移动端适配
      '&&-mobile': {
        borderRadius: '6px',
        padding: '12px',
        margin: '0 auto',
        maxWidth: '100%',
      },

      // 桌面端适配
      '&&-desktop': {
        borderRadius: '8px',
        padding: '16px',
        margin: 'initial',
        maxWidth: 'none',
      },

      '&&-borderless': {
        border: 'none!important',
        padding: 0,
      },

      // 错误边界容器样式（简化版，使用 antd Result 组件）
      '&&-error-boundary': {
        // antd Result 组件已经有完善的样式，这里只需要基础容器样式
        minHeight: '200px',
      },
    },
  };
};

/**
 * 样式钩子
 * @param baseClassName 基础类名
 * @returns 样式相关对象
 */
export const useStyle = (baseClassName: string) => {
  return useEditorStyleRegister('ChartContainer', (token) => {
    const containerToken = {
      ...token,
      componentCls: `.${baseClassName}`,
    };

    return [genStyle(containerToken)];
  });
};
