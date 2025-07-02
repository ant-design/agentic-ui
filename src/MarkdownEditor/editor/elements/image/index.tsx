﻿import {
  BlockOutlined,
  DeleteFilled,
  LoadingOutlined,
} from '@ant-design/icons';
import { Image, ImageProps, Modal, Popover, Space } from 'antd';
import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import { useDebounceFn } from '@ant-design/pro-components';
import { Rnd } from 'react-rnd';
import { Path, Transforms } from 'slate';
import { I18nContext } from '../../../../i18n';
import { ElementProps, MediaNode } from '../../../el';
import { useSelStatus } from '../../../hooks/editor';
import { ActionIconBox } from '../../components/ActionIconBox';
import { useEditorStore } from '../../store';
import { useGetSetState } from '../../utils';
import { getMediaType } from '../../utils/dom';

/**
 * 图片组件，带有错误处理功能
 * 如果图片加载失败，将显示可点击的链接
 *
 * @component
 * @param props - 图片属性，继承自 ImageProps 接口
 * @param props.src - 图片的源地址
 * @returns 返回一个图片组件，如果加载失败则返回一个链接
 *
 * @example
 * ```tsx
 * <ImageAndError src="https://example.com/image.jpg" alt="示例图片" />
 * ```
 */
export const ImageAndError: React.FC<ImageProps> = (props) => {
  const { editorProps } = useEditorStore();
  const [error, setError] = React.useState(false);
  if (error) {
    return (
      <a href={props.src} target="_blank" rel="noopener noreferrer">
        {props.alt || props.src}
      </a>
    );
  }
  if (editorProps?.image?.render) {
    return editorProps.image.render?.(
      {
        ...props,
        onError: () => {
          setError(true);
        },
      },
      <Image
        {...props}
        crossOrigin={'anonymous'}
        width={Number(props.width) || props.width || 400}
        onError={() => {
          setError(true);
        }}
      />,
    );
  }
  return (
    <Image
      {...props}
      crossOrigin={'anonymous'}
      width={Number(props.width) || props.width || 400}
      onError={() => {
        setError(true);
      }}
    />
  );
};

/**
 * 修复图片大小的问题
 * @param props
 * @returns
 */
export const ResizeImage = ({
  onResizeStart,
  onResizeStop,
  selected,
  defaultSize,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  onResizeStart?: () => void;
  onResizeStop?: (size: {
    width: number | string;
    height: number | string;
  }) => void;
  defaultSize?: {
    width?: number;
    height?: number;
  };
  selected?: boolean;
}) => {
  const [loading, setLoading] = React.useState(true);
  const radio = useRef<number>(1);
  const [size, setSize] = React.useState({
    width: defaultSize?.width || 400,
    height: defaultSize?.height || 0,
  } as {
    width: number | string;
    height: number | string;
  });
  const imgRef = useRef<HTMLImageElement>(null);

  //@ts-expect-error
  const resize = useDebounceFn((size) => {
    setSize({
      width: size.width,
      height: size.width / radio.current,
    });
    imgRef.current?.style.setProperty('width', `${size.width}px`);
    imgRef.current?.style.setProperty(
      'height',
      `${(size.width || 0) / radio.current}px`,
    );
  }, 160);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        overflow: 'hidden',
        width: size.width as number,
        height: size.height as number,
      }}
    >
      {loading ? (
        <div
          style={{
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 12,
          }}
        >
          <LoadingOutlined
            style={{
              fontSize: 24,
              color: '#1890ff',
            }}
          />
        </div>
      ) : null}
      <Rnd
        onResizeStart={onResizeStart}
        onResizeStop={() => {
          onResizeStop?.(size);
        }}
        default={{
          x: 0,
          y: 0,
          width: defaultSize?.width || '100%',
          height: defaultSize?.height || '100%',
        }}
        size={size}
        disableDragging
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
        onResize={(_, dir, ele) => {
          imgRef.current?.style.setProperty('width', `${ele.clientWidth}px`);
          imgRef.current?.style.setProperty(
            'height',
            `${(ele.clientWidth || 0) / radio.current}px`,
          );

          resize.cancel();
          resize.run({
            width: ele.clientWidth,
            height: (ele.clientWidth || 0) / radio.current,
          });
        }}
      >
        <img
          draggable={false}
          onLoad={(e) => {
            setLoading(false);
            let width = (e.target as HTMLImageElement).naturalWidth;
            const height = (e.target as HTMLImageElement).naturalHeight;
            radio.current = width / height;
            width = Math.min(
              defaultSize?.width || 400,
              600,
              document.documentElement.clientWidth * 0.8 || 600,
            );
            setSize({
              width: width,
              height: width / radio.current,
            });
          }}
          alt={'image'}
          referrerPolicy={'no-referrer'}
          crossOrigin={'anonymous'}
          width={`min(${size.width}px, 100%)`}
          ref={imgRef}
          style={{
            width: '100%',
            height: 'auto',
            position: 'relative',
            zIndex: 99,
            outline: selected ? '2px solid #1890ff' : 'none',
            boxShadow: selected ? '0 0 0 2px #1890ff' : 'none',
            minHeight: 20,
            display: loading ? 'none' : 'block',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'none',
          }}
          {...props}
        />
      </Rnd>
    </div>
  );
};

export function EditorImage({
  element,
  attributes,
  children,
}: ElementProps<MediaNode>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, path] = useSelStatus(element);
  const { markdownEditorRef, readonly } = useEditorStore();
  const htmlRef = React.useRef<HTMLDivElement>(null);
  const [state, setState] = useGetSetState({
    height: element.height,
    dragging: false,
    loadSuccess: true,
    url: '',
    selected: false,
    type: getMediaType(element?.url, element.alt),
  });
  const updateElement = useCallback(
    (attr: Record<string, any>) => {
      if (!markdownEditorRef.current) return;
      Transforms.setNodes(markdownEditorRef.current, attr, { at: path });
    },
    [path],
  );
  const { locale } = useContext(I18nContext);

  const initial = useCallback(async () => {
    let type = getMediaType(element?.url, element.alt);
    type = !type ? 'image' : type;
    setState({
      type: ['image', 'video', 'autio', 'attachment'].includes(type!)
        ? type!
        : 'other',
    });
    let realUrl = element?.url;

    setState({ url: realUrl });
    if (state().type === 'image' || state().type === 'other') {
      const img = document.createElement('img');
      img.referrerPolicy = 'no-referrer';
      img.crossOrigin = 'anonymous';
      img.src = realUrl!;
      img.onerror = () => {
        setState({ loadSuccess: false });
      };
      img.onload = () => setState({ loadSuccess: true });
    }
    if (!element.mediaType) {
      updateElement({
        mediaType: state().type,
      });
    }
  }, [element]);

  useLayoutEffect(() => {
    initial();
  }, [element?.url]);

  const imageDom = useMemo(() => {
    return !readonly ? (
      <ResizeImage
        defaultSize={{
          width: Number(element.width) || element.width || 400,
          height: Number(element.height) || 400,
        }}
        selected={state().selected}
        src={state()?.url}
        onResizeStart={() => {
          setState({ selected: true });
        }}
        onResizeStop={(size) => {
          Transforms.setNodes(markdownEditorRef.current, size, { at: path });
          setState({ selected: false });
        }}
      />
    ) : (
      <ImageAndError
        src={state()?.url || element?.url}
        alt={'image'}
        preview={{
          getContainer: () => document.body,
        }}
        referrerPolicy={'no-referrer'}
        crossOrigin={'anonymous'}
        draggable={false}
        style={{
          maxWidth: 800,
        }}
        width={element.width}
        height={element.height}
      />
    );
  }, [state().type, state()?.url, readonly, state().selected]);

  return (
    <div
      {...attributes}
      className={'ant-md-editor-drag-el'}
      data-be="image"
      style={{
        cursor: 'pointer',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      draggable={false}
      onContextMenu={(e) => {
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Popover
        arrow={false}
        styles={{
          body: {
            padding: 8,
          },
        }}
        trigger="hover"
        open={state().selected && !readonly ? undefined : false}
        content={
          <Space>
            <ActionIconBox
              title={locale?.delete || '删除'}
              type="danger"
              onClick={(e) => {
                e.stopPropagation();
                Modal.confirm({
                  title: locale?.deleteMedia || '删除媒体',
                  content: locale?.confirmDelete || '确定删除该媒体吗？',
                  onOk: () => {
                    Transforms.removeNodes(markdownEditorRef.current, {
                      at: path,
                    });
                  },
                });
              }}
            >
              <DeleteFilled />
            </ActionIconBox>
            <ActionIconBox
              title={element?.block ? locale?.blockImage : locale?.inlineImage}
              onClick={(e) => {
                e.stopPropagation();
                Transforms.setNodes(
                  markdownEditorRef.current,
                  {
                    block: !element.block,
                  },
                  {
                    at: path,
                  },
                );
                Transforms.setNodes(
                  markdownEditorRef.current,
                  {
                    block: !element.block,
                  },
                  {
                    at: Path.parent(path),
                  },
                );
              }}
            >
              <BlockOutlined />
            </ActionIconBox>
          </Space>
        }
      >
        <div
          onClick={() => {
            setTimeout(() => {
              setState({ selected: true });
            }, 16);
          }}
          tabIndex={-1}
          style={{
            padding: 4,
            display: 'flex',
          }}
          ref={htmlRef}
          draggable={false}
          contentEditable={false}
          className="md-editor-media"
        >
          {imageDom}
          <div
            style={{
              display: 'none',
            }}
          >
            {children}
          </div>
        </div>
      </Popover>
    </div>
  );
}
