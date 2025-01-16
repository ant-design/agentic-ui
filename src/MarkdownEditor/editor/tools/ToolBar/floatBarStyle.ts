﻿import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../utils/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      position: 'absolute',
      zIndex: 20,
      border: '1px solid rgb(229 231 235 / 0.8)',
      overflow: 'hidden',
      height: '28px',
      borderRadius: '18px',
      backgroundColor: 'rgb(255 255 255)',
      fontSize: '1.05em',
      color: 'rgb(107 114 128 / 80%)',
      backdropFilter: 'blur(8px)',
      padding: '4px 0',
      '&-item': {
        display: 'flex',
        height: '48px',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '4px',
        lineHeight: '32px',
        fontSize: '1.05em',
        justifyContent: 'center',
        padding: '0 8px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgb(229 231 235 / 0.65)',
        },
      },
      '&&-item-min-plus-icon': {
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

    return [
      resetComponent(editorToken),
      genStyle(editorToken),
      resetComponent(editorToken),
    ];
  });
}
