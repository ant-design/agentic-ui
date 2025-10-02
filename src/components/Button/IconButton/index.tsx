import { Button, ConfigProvider, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { useStyle } from './style';

export interface IconButtonProps {
  key?: React.Key;
  icon?: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
  active?: boolean;
  loading?: boolean;
  onClick?: () => void | Promise<void>;
  className?: string;
  style?: React.CSSProperties;
}

export const IconButton: React.FC<IconButtonProps> = ({
  className,
  style,
  icon,
  tooltip,
  disabled,
  active,
  loading,
  onClick,
}) => {
  const context = useContext(ConfigProvider.ConfigContext);
  const prefixCls = context?.getPrefixCls('icon-button');

  const { wrapSSR, hashId } = useStyle(prefixCls);

  const rootCls = classNames(prefixCls, className, hashId);

  return wrapSSR(
    <div className={rootCls} style={style}>
      <Tooltip title={tooltip}>
        <Button
          icon={icon}
          disabled={disabled}
          loading={loading}
          onClick={onClick}
          className={classNames(`${prefixCls}-button`, hashId, {
            [`${prefixCls}-button-active`]: active,
            [`${prefixCls}-button-loading`]: loading,
            [`${prefixCls}-button-disabled`]: disabled,
          })}
        />
      </Tooltip>
    </div>,
  );
};

export default IconButton;
