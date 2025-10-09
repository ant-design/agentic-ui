import type { CSSInterpolation } from '@ant-design/cssinjs';
import {
  ComponentToken,
  createStyleRegister,
  globalThemeToken,
} from '@ant-design/theme-token';
import { ConfigProvider as AntdConfigProvider, theme as antdTheme } from 'antd';
import { useContext } from 'react';

export { CSSInterpolation };

export type GenerateStyle<T = ComponentToken> = (
  token: T,
) => Record<string, CSSInterpolation>;

export type ChatTokenType = ComponentToken & {
  themeId?: number;
  /**
   * prochat 的 className
   * @type {string}
   * @example .ant-pro
   */
  chatCls?: string;
  /**
   * antd 的 className
   * @type {string}
   * @example .ant
   */
  antCls?: string;
  /**
   * 组件的 className
   */
  componentCls: string;

  placeholderContent?: string;
};

export const resetComponent: GenerateStyle<ChatTokenType> = (
  token: ChatTokenType,
) => ({
  [`${token.componentCls}`]: {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
    color: token.colorText,
    fontSize: '1em',
    lineHeight: token.lineHeight,
    listStyle: 'none',
  },
});
/**
 * 封装了一下 antd 的 useStyle，支持了一下antd@4
 * @param componentName {string} 组件的名字
 * @param styleFn {GenerateStyle} 生成样式的函数
 * @returns UseStyleResult
 */
export function useEditorStyleRegister(
  componentName: string,
  styleFn: (token: ComponentToken) => CSSInterpolation,
) {
  const { token, hashId, theme } = antdTheme?.useToken?.() || {};
  const chatToken = {
    ...token,
    chatCls: '',
    antCls: '',
  };
  const { getPrefixCls } = useContext(AntdConfigProvider.ConfigContext);

  chatToken.chatCls = `.${getPrefixCls('@ant-design/md-editor')}`;
  chatToken.antCls = `.${getPrefixCls()}`;

  const genStyles = createStyleRegister({
    hashId: hashId || '',
    token: chatToken,
    theme: theme,
    cssVariables: globalThemeToken,
  });

  const result = genStyles(componentName, styleFn);

  // 确保总是返回一个有效的对象
  return result || { wrapSSR: (node: any) => node, hashId: '' };
}
