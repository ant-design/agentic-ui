﻿import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../utils/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      borderRadius: '16px',
      fontFeatureSettings: 'normal',
      fontVariationSettings: 'normal',
      textSizeAdjust: '100%',
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
      whiteSpace: 'pre-wrap',
      overflowWrap: 'break-word',
      direction: 'ltr',
      position: 'relative',
      marginBottom: '0px',
      tabSize: 2,
      background: 'rgb(250, 250, 250)',
      padding: '12px',
      '&-num': {
        code: {
          paddingLeft: 5,
        },
      },
      '&-header': {
        direction: 'ltr',
        tabSize: 2,
        WebkitUserModify: 'read-only',
        boxSizing: 'border-box',
        color: '#666f8d',
        zIndex: 10,
        display: 'flex',
        userSelect: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 12px',
        paddingTop: '0px',
        borderBottom: '1px solid rgba(186, 192, 204, 0.25)',
        '&-actions': {
          display: 'flex',
          gap: '8px',
          '&-item': {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
          },
        },
        '&-lang': {
          fontSize: '12px',
        },
      },
      '&-content': {
        position: 'relative',
        borderRadius: 4,
        fontFeatureSettings: 'normal',
        fontVariationSettings: 'normal',
        WebkitTextSizeAdjust: '100%',
        WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        direction: 'ltr',
        marginBottom: '0',
        tabSize: 2,
        caretColor: 'rgba(0, 0, 0, 0.9)',
        color: 'rgba(0, 0, 0, 0.8)',
        paddingLeft: '32px',
        background: 'rgb(250, 250, 250)',
        '&-tab-2': {
          tabSize: 2,
        },
        '&-tab-4': {
          tabSize: 4,
        },
        '& pre': {
          whiteSpace: 'pre',
          padding: '10px 0',
          position: 'relative',
        },
        '& code': {
          width: 'fit-content',
          display: 'inline-block',
          wordWrap: 'normal',
          wordSpacing: 'normal',
          wordBreak: 'normal',
          hyphens: 'none',
          paddingLeft: '16px',
          paddingRight: '16px',
        },
        '& &-code-line': {
          color: 'rgb(0 0 0 / 0.5)',
          position: 'relative',
          height: '23px',
          lineHeight: '23px',
        },
        '& &-line-list': {
          counterReset: 'step',
          counterIncrement: 'step 0',
          zIndex: 10,
          paddingTop: '10px',
          width: '32px',
          position: 'absolute',
          top: '0px',
          left: '0px',
          height: '100%',
          overflow: 'hidden',
          '& > div': {
            fontSize: '0.93em',
            left: '0',
            top: '0',
            height: '23px',
            lineHeight: '23px',
            width: '32px',
            textAlign: 'center',
            '&:before': {
              content: 'counter(step)',
              counterIncrement: 'step',
            },
          },
        },
        '&-code-content': {
          borderRadius: '18px',
          fontSize: '0.85em',
          lineHeight: '1.62em',
          overflowWrap: 'break-word',
          direction: 'ltr',
          tabSize: 2,
          boxSizing: 'border-box',
          fontFeatureSettings: 'normal',
          fontVariationSettings: 'normal',
          caretColor: 'rgba(0, 0, 0, 0.9)',
          color: 'rgba(0, 0, 0, 0.8)',
          overflow: 'auto',
          margin: '0',
          overflowX: 'auto',
          whiteSpace: 'pre',
          padding: '10px 0',
          position: 'relative',
        },
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
  return useEditorStyleRegister('editor-content-code-', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(editorToken)];
  });
}
