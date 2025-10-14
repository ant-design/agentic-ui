import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      position: 'relative',
      cursor: 'pointer',
      borderRadius: '24px',
      boxSizing: 'border-box',
      border: 'var(--color-gray-border-light)',
      boxShadow: 'var(--shadow-border-base)',
      minHeight: '20px',
      width: 'max-content',
      transition: 'padding 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 1,
      maxWidth: 'min(800px,100%)',
      padding: '2px',
      paddingRight: '4px',

      '*': {
        boxSizing: 'border-box',
      },
      '&:hover': {
        background: 'var(--color-gray-control-fill-active)',
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-card-base)',
      },
      '&-expanded:not(&-light)': {
        borderRadius: '14px',
        padding: 4,
        gap: 0,
        outline: 'none',
        '&:hover': {
          background: 'var(--color-gray-bg-card-light)',
          boxShadow: 'var(--shadow-border-base)',
        },
      },
      '&-light': {
        boxShadow: 'none',
        border: 'none',
        borderRadius: '14px',
        padding: 4,
        '&:hover': {
          background: 'none',
          boxShadow: 'none',
        },
      },
      '&-loading': {
        background: 'var(--color-gray-bg-card-white)',
        boxSizing: 'border-box',
        boxShadow:
          '0px 0px 1px 0px rgba(0, 19, 41, 0.05),0px 2px 7px 0px rgba(0, 19, 41, 0.05),0px 2px 5px -2px rgba(0, 19, 41, 0.06)',
        '&:hover': {
          background: 'var(--color-gray-bg-card-white)',
          boxSizing: 'border-box',
          boxShadow: 'var(--shadow-card-base)',
        },
      },
      '&-success': {
        borderRadius: 'var(--radius-card-base)',
        background: 'var(--color-gray-bg-card-light)',
        boxShadow: 'inset 0px 0px 1px 0px rgba(0, 19, 41, 0.15)',
      },
      '&-bar': {
        borderRadius: '12px',
        minHeight: '28px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 1,
      },

      '&-header': {
        height: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        justifyContent: 'space-between',
      },

      '&-header-left': {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        '&-icon': {
          font: 'var(--font-text-body-emphasized-base)',
          color: 'var(--color-gray-text-default)',
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-control-sm)',
          '&:hover': {
            backgroundColor: 'var(--color-gray-control-fill-hover)',
          },
        },
      },

      '&-expand': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        color: 'var(--color-gray-text-disabled)',
        fontSize: 'var(--font-size-base)',
        cursor: 'pointer',
        borderRadius: '12px',
        transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
        '&:hover': {
          background: 'rgba(20, 22, 28, 0.06)',
          color: '#959DA8',
        },
      },

      '&-name': {
        fontWeight: 500,
        lineHeight: '20px',
        font: 'var(--font-text-body-emphasized-sm)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
        color: 'var(--color-gray-text-secondary)',
        '&-light': {
          color: 'var(--color-gray-text-default)',
        },
      },

      '&-image-wrapper': {
        width: '24px',
        height: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4px',
        gap: '0px 8px',
        flexWrap: 'wrap',
        alignContent: 'center',
        borderRadius: '200px',
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-border-base)',
        background: 'var(--color-gray-bg-card-white)',
        zIndex: 0,
        '&-loading': {
          borderRadius: '50%',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '0',
            borderRadius: '50%',
            background:
              'conic-gradient(from var(--rotate, 0deg),transparent 0deg 0deg, #5EF050 35deg 55deg, #37ABFF 105deg 115deg,  #D7B9FF 135deg 135deg, transparent 165deg 360deg)',
            WebkitMask:
              'radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0) 65%, #FF0000 100%)',
            mask: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0) 80%, #FF0000 80%, #FF0000 100%)',
          },
        },
      },

      '&-image': {
        color: '#767E8B',
        fontSize: 'var(--font-size-lg)',
        position: 'absolute',
        zIndex: 999,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },

      '&-target': {
        lineHeight: '20px',
        flex: 1,
        marginRight: 30,
        font: 'var(--font-text-body-emphasized-sm)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
        color: 'var(--color-gray-text-secondary)',
      },
      '&-time': {
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'normal',
        lineHeight: '12px',
        letterSpacing: '0.04em',
        color: 'var(--color-gray-text-disabled)',
      },
      '&-container': {
        width: '100%',
        padding: 8,
        display: 'flex',
        maxHeight: 700,
        position: 'relative',
        '&-light': {
          borderLeft: '1px solid var(--color-gray-border-light)',
          paddingLeft: 12,
          marginLeft: 16,
          marginTop: -10,
        },
      },
      '&-container-loading': {
        display: 'flex',
        width: '100%',
        flexDirection: 'column-reverse',
        maxHeight: 158,
        overflow: 'hidden',
        position: 'relative',
        '&:hover': {
          [`&-floating-expand`]: {
            opacity: 1,
            visibility: 'visible',
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          height: 48,
          right: 0,
          borderRadius: '12px',
          background:
            'linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 48,
          right: 0,
          borderRadius: '12px',
          background:
            'linear-gradient(to top, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        },
      },
      '&-header-right': {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 1,
      },
      '&-content': {
        font: 'var(--font-text-paragraph-sm)',
        letterSpacing: 'var(--letter-spacing-paragraph-sm, normal)',
        color: 'var(--color-gray-text-secondary)',
        '&-light': {
          color: 'var(--color-gray-text-light)',
        },
      },
      '&-floating-expand': {
        position: 'absolute',
        bottom: '8px',
        right: 'calc(50% - 35px)',
        width: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '32px',
        color: '#767E8B',
        fontSize: 'var(--font-size-base)',
        cursor: 'pointer',
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0, 19, 41, 0.1)',
        boxShadow: '0px 2px 8px rgba(0, 19, 41, 0.15)',
        transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
        padding: '16px 5px',
        zIndex: 10,
        '&:active': {
          transform: 'translateY(0px)',
        },
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('tool-use-bar-think', (token) => {
    const toolBarToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(toolBarToken)];
  });
}
