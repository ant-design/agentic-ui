﻿import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      overflowY: 'auto',
      minHeight: 200,
      padding: 'var(--padding-6x)',
      '&&-compact': {
        gap: 'var(--margin-6x)',
      },
      [`${token.componentCls}-content-list`]: {
        paddingTop: 'var(--padding-3x)',
        paddingBottom: 'var(--padding-3x)',
      },

      '&-loading': {
        padding: '0 var(--padding-6x)',
      },
    },
  };
};

/**
 * BubbleItem
 * @param prefixCls
 * @returns
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('BubbleItem', (token) => {
    const proChatToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(proChatToken), resetComponent(proChatToken)];
  });
}
