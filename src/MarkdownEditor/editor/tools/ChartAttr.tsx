import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import { DeleteOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { observer } from 'mobx-react-lite';
import React, { useRef, useContext } from 'react';
import { NodeEntry, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { ChartNode } from '../../el';
import { useEditorStore } from '../store';
import { EditorUtils } from '../utils/editorUtils';
import { useStyle } from './chartAttrStyle';

/**
 * 图表设置器
 */
export const ChartAttr: React.FC<{
  options?: {
    icon: React.ReactNode;
    title?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
  }[];
  node: NodeEntry<ChartNode>;
}> = observer((props) => {
  const store = useEditorStore();
  const editor = store.editor;

  const chartNodeRef = useRef<NodeEntry<ChartNode>>();

  const remove = React.useCallback(() => {
    const chart = props.node || store?.chartNode?.at(0);
    if (!chart) return;

    Transforms.delete(editor, { at: EditorUtils.findPath(editor, chart!) });
    chartNodeRef.current = undefined;
    ReactEditor.focus(editor);
  }, [editor]);

  const context = useContext(ConfigProvider.ConfigContext);
  const baseClassName = context.getPrefixCls(`chart-attr-toolbar`)

  const { wrapSSR, hashId } = useStyle(baseClassName);
  return wrapSSR(
    <div
    className={classNames(baseClassName, hashId)}
      style={{
        width: 'auto',
      }}
      contentEditable={false}
    >
      {props?.options?.map((item, index) => {
        if (!item.title) {
          return (
            <div
              key={index}
              className={classNames(`${baseClassName}-item`, hashId)}
              onClick={item.onClick}
              style={item.style}
            >
              {item.icon}
            </div>
          );
        }
        return (
          <Tooltip key={index} title={item.title}>
            <div className={classNames(`${baseClassName}-item`, hashId)} onClick={item.onClick}>
              {item.icon}
            </div>
          </Tooltip>
        );
      })}
      {store.readonly ? null : (
        <Tooltip title="删除">
          <div className={classNames(`${baseClassName}-item`, hashId)}>
            <DeleteOutlined onClick={remove} />
          </div>
        </Tooltip>
      )}
    </div>
  );
});
