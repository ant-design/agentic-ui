import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext, useMemo } from 'react';
import { ReactEditor, RenderElementProps, useSlate } from 'slate-react';
import { TableNode } from '../../types/Table';
import { useTableStyle } from './style';
import { SlateTable } from './Table';
import { TablePropsProvider } from './TableContext';

/**
 * 简单表格组件 - 仅支持只读显示
 * 用于替代复杂的 Handsontable 实现，提供基础的表格功能
 */
export const SimpleTable = (props: RenderElementProps) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const baseCls = getPrefixCls('agentic-md-editor-content-table');
  const editor = useSlate();
  const { wrapSSR, hashId } = useTableStyle(baseCls, {});

  const tablePath = useMemo(
    () => ReactEditor.findPath(editor, props.element),
    [props.element],
  );

  return wrapSSR(
    <TablePropsProvider
      tablePath={tablePath}
      tableNode={props.element as TableNode}
    >
      <div
        {...props.attributes}
        data-be={'table'}
        draggable={false}
        className={classNames(`${baseCls}-container`, hashId)}
      >
        <SlateTable {...props} hashId={hashId}>
          {props.children}
        </SlateTable>
      </div>
    </TablePropsProvider>,
  );
};
