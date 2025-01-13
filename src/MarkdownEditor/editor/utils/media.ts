import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { IEditor } from '../../index';
import { EditorStore } from '../store';
import { getMediaType } from './dom';

export const getRemoteMediaType = async (url: string) => {
  if (!url) return 'other';
  try {
    const type = getMediaType(url);
    if (type !== 'other') return type;
    let contentType = '';
    const controller = new AbortController();
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error();
    }
    setTimeout(() => {
      controller.abort();
    }, 1000);
    contentType = res.headers.get('content-type') || '';
    return contentType.split('/')[0];
  } catch (e) {
    return null;
  }
};

export const convertRemoteImages = async (
  node: IEditor,
  store: EditorStore,
) => {
  const schema = store?.editor?.children || [];
  if (schema) {
    const stack = schema.slice();
    while (stack.length) {
      const item = stack.pop()!;
      if (item.type === 'media') {
        if (item?.url?.startsWith('http')) {
          const ext = item?.url.match(/[\w_-]+\.(png|webp|jpg|jpeg|gif|svg)/i);
          if (ext) {
            try {
              Transforms.setNodes(
                store?.editor,
                {
                  url: item?.url,
                },
                { at: ReactEditor.findPath(store?.editor, item) },
              );
            } catch (e) {
              console.error(e);
            }
          }
        } else if (item?.url?.startsWith('data:')) {
          const m = item?.url.match(/data:image\/(\w+);base64,(.*)/);
          if (m) {
            try {
              Transforms.setNodes(
                store?.editor,
                {
                  url: item?.url,
                },
                { at: ReactEditor.findPath(store?.editor, item) },
              );
            } catch (e) {}
          }
        }
      } else if (item?.children?.length) {
        stack.push(...item?.children);
      }
    }
  }
};
