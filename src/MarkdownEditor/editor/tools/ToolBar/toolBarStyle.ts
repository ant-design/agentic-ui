﻿import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../utils/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      borderBottom: '1px solid rgb(229 231 235 / 0.8)',
      overflow: 'hidden',
      height: '42px',
      fontSize: '16px',
      color: 'rgb(107 114 128 / 80%)',
      backdropFilter: 'blur(8px)',
      boxSizing: 'border-box',
      padding: '6px 4px',
      '&-item': {
        display: 'flex',
        height: '32px',
        fontSize: '16px',
        borderRadius: '4px',
        lineHeight: '32px',
        padding: '0 6px',
        boxSizing: 'border-box',
        alignItems: 'center',
        gap: '2px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgb(229 231 235 / 0.65)',
        },
      },
      '&-item-min-plus-icon': {
        color: '#1677ff',
      },
    },
  };
};

/**
 * AgentChat
 * @param prefixCls
 * @returns
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('ToolBar-' + prefixCls, (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(editorToken), resetComponent(editorToken)];
  });
}
