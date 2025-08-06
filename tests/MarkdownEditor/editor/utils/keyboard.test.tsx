import '@testing-library/jest-dom';
import isHotkey from 'is-hotkey';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('keyboard utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 创建一个更完整的 KeyboardEvent 对象
  const createKeyboardEvent = (
    options: Partial<KeyboardEvent>,
  ): KeyboardEvent => {
    return {
      key: '',
      code: '',
      type: 'keydown',
      keyCode: 0,
      which: 0,
      charCode: 0,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      ctrlKey: false,
      repeat: false,
      bubbles: true,
      cancelable: true,
      composed: false,
      defaultPrevented: false,
      eventPhase: 2,
      isTrusted: true,
      timeStamp: Date.now(),
      AT_TARGET: 2,
      BUBBLING_PHASE: 3,
      CAPTURING_PHASE: 1,
      ...options,
    } as KeyboardEvent;
  };

  describe('isHotkey 函数测试', () => {
    it('应该检测 Ctrl+A 快捷键', () => {
      const event = createKeyboardEvent({
        key: 'a',
        ctrlKey: true,
        code: 'KeyA',
        keyCode: 65,
        which: 65,
      });

      expect(isHotkey('mod+a', event)).toBe(true);
    });

    it('应该检测 Cmd+A 快捷键 (Mac)', () => {
      const event = createKeyboardEvent({
        key: 'a',
        metaKey: true,
        code: 'KeyA',
        keyCode: 65,
        which: 65,
      });

      expect(isHotkey('cmd+a', event)).toBe(true);
    });

    it('应该检测 Enter 键', () => {
      const event = createKeyboardEvent({
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
      });

      expect(isHotkey('enter', event)).toBe(true);
    });

    it('应该检测 Tab 键', () => {
      const event = createKeyboardEvent({
        key: 'Tab',
        code: 'Tab',
        keyCode: 9,
        which: 9,
      });

      expect(isHotkey('tab', event)).toBe(true);
    });

    it('应该检测 Shift+Tab 键', () => {
      const event = createKeyboardEvent({
        key: 'Tab',
        shiftKey: true,
        code: 'Tab',
        keyCode: 9,
        which: 9,
      });

      expect(isHotkey('shift+tab', event)).toBe(true);
    });

    it('应该检测 Escape 键', () => {
      const event = createKeyboardEvent({
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
      });

      expect(isHotkey('escape', event)).toBe(true);
    });

    it('应该检测 Backspace 键', () => {
      const event = createKeyboardEvent({
        key: 'Backspace',
        code: 'Backspace',
        keyCode: 8,
        which: 8,
      });

      expect(isHotkey('backspace', event)).toBe(true);
    });

    it('应该检测 Delete 键', () => {
      const event = createKeyboardEvent({
        key: 'Delete',
        code: 'Delete',
        keyCode: 46,
        which: 46,
      });

      expect(isHotkey('delete', event)).toBe(true);
    });

    it('应该检测方向键', () => {
      const arrowKeys = [
        { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, which: 38 },
        { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40 },
        { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37, which: 37 },
        { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, which: 39 },
      ];

      arrowKeys.forEach(({ key, code, keyCode, which }) => {
        const event = createKeyboardEvent({
          key,
          code,
          keyCode,
          which,
        });

        expect(isHotkey(key.toLowerCase(), event)).toBe(true);
      });
    });

    it('应该检测 Ctrl+Enter 快捷键', () => {
      const event = createKeyboardEvent({
        key: 'Enter',
        ctrlKey: true,
        code: 'Enter',
        keyCode: 13,
        which: 13,
      });

      expect(isHotkey('mod+enter', event)).toBe(true);
    });

    it('应该检测 Cmd+Enter 快捷键 (Mac)', () => {
      const event = createKeyboardEvent({
        key: 'Enter',
        metaKey: true,
        code: 'Enter',
        keyCode: 13,
        which: 13,
      });

      expect(isHotkey('cmd+enter', event)).toBe(true);
    });

    it('应该检测 Ctrl+Shift+A 快捷键', () => {
      const event = createKeyboardEvent({
        key: 'a',
        ctrlKey: true,
        shiftKey: true,
        code: 'KeyA',
        keyCode: 65,
        which: 65,
      });

      expect(isHotkey('mod+shift+a', event)).toBe(true);
    });

    it('应该检测 Cmd+Shift+A 快捷键 (Mac)', () => {
      const event = createKeyboardEvent({
        key: 'a',
        metaKey: true,
        shiftKey: true,
        code: 'KeyA',
        keyCode: 65,
        which: 65,
      });

      expect(isHotkey('cmd+shift+a', event)).toBe(true);
    });
  });

  describe('快捷键组合测试', () => {
    it('应该检测 Ctrl+B (加粗)', () => {
      const event = createKeyboardEvent({
        key: 'b',
        ctrlKey: true,
        code: 'KeyB',
        keyCode: 66,
        which: 66,
      });

      expect(isHotkey('mod+b', event)).toBe(true);
    });

    it('应该检测 Ctrl+I (斜体)', () => {
      const event = createKeyboardEvent({
        key: 'i',
        ctrlKey: true,
        code: 'KeyI',
        keyCode: 73,
        which: 73,
      });

      expect(isHotkey('mod+i', event)).toBe(true);
    });

    it('应该检测 Ctrl+U (下划线)', () => {
      const event = createKeyboardEvent({
        key: 'u',
        ctrlKey: true,
        code: 'KeyU',
        keyCode: 85,
        which: 85,
      });

      expect(isHotkey('mod+u', event)).toBe(true);
    });

    it('应该检测 Ctrl+K (插入链接)', () => {
      const event = createKeyboardEvent({
        key: 'k',
        ctrlKey: true,
        code: 'KeyK',
        keyCode: 75,
        which: 75,
      });

      expect(isHotkey('mod+k', event)).toBe(true);
    });

    it('应该检测 Ctrl+Z (撤销)', () => {
      const event = createKeyboardEvent({
        key: 'z',
        ctrlKey: true,
        code: 'KeyZ',
        keyCode: 90,
        which: 90,
      });

      expect(isHotkey('mod+z', event)).toBe(true);
    });

    it('应该检测 Ctrl+Y (重做)', () => {
      const event = createKeyboardEvent({
        key: 'y',
        ctrlKey: true,
        code: 'KeyY',
        keyCode: 89,
        which: 89,
      });

      expect(isHotkey('mod+y', event)).toBe(true);
    });

    it('应该检测 Ctrl+Shift+Z (重做)', () => {
      const event = createKeyboardEvent({
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        code: 'KeyZ',
        keyCode: 90,
        which: 90,
      });

      expect(isHotkey('mod+shift+z', event)).toBe(true);
    });
  });

  describe('数字键测试', () => {
    it('应该检测数字键 1-9', () => {
      for (let i = 1; i <= 9; i++) {
        const event = createKeyboardEvent({
          key: i.toString(),
          code: `Digit${i}`,
          keyCode: 48 + i,
          which: 48 + i,
        });

        expect(isHotkey(i.toString(), event)).toBe(true);
      }
    });

    it('应该检测 Ctrl+1-6 (标题级别)', () => {
      for (let i = 1; i <= 6; i++) {
        const event = createKeyboardEvent({
          key: i.toString(),
          ctrlKey: true,
          code: `Digit${i}`,
          keyCode: 48 + i,
          which: 48 + i,
        });

        expect(isHotkey(`mod+${i}`, event)).toBe(true);
      }
    });
  });

  describe('特殊键测试', () => {
    it('应该检测 Home 键', () => {
      const event = createKeyboardEvent({
        key: 'Home',
        code: 'Home',
        keyCode: 36,
        which: 36,
      });

      expect(isHotkey('home', event)).toBe(true);
    });

    it('应该检测 End 键', () => {
      const event = createKeyboardEvent({
        key: 'End',
        code: 'End',
        keyCode: 35,
        which: 35,
      });

      expect(isHotkey('end', event)).toBe(true);
    });

    it('应该检测 PageUp 键', () => {
      const event = createKeyboardEvent({
        key: 'PageUp',
        code: 'PageUp',
        keyCode: 33,
        which: 33,
      });

      expect(isHotkey('pageup', event)).toBe(true);
    });

    it('应该检测 PageDown 键', () => {
      const event = createKeyboardEvent({
        key: 'PageDown',
        code: 'PageDown',
        keyCode: 34,
        which: 34,
      });

      expect(isHotkey('pagedown', event)).toBe(true);
    });
  });

  describe('功能键测试', () => {
    it('应该检测 F1-F12 键', () => {
      for (let i = 1; i <= 12; i++) {
        const event = createKeyboardEvent({
          key: `F${i}`,
          code: `F${i}`,
          keyCode: 111 + i,
          which: 111 + i,
        });

        expect(isHotkey(`f${i}`, event)).toBe(true);
      }
    });
  });

  describe('边界情况测试', () => {
    it('应该处理无效的快捷键格式', () => {
      const event = createKeyboardEvent({
        key: 'a',
        code: 'KeyA',
        keyCode: 65,
        which: 65,
      });

      expect(() => {
        isHotkey('invalid+key', event);
      }).toThrow('Unknown modifier: "invalid"');
    });

    it('应该处理 null 事件', () => {
      const result = isHotkey('a', null as any);
      expect(typeof result).toBe('function');
    });

    it('应该处理 undefined 事件', () => {
      const result = isHotkey('a', undefined as any);
      expect(typeof result).toBe('function');
    });
  });

  describe('平台差异测试', () => {
    it('应该在 Windows/Linux 上检测 Ctrl 键', () => {
      const event = createKeyboardEvent({
        key: 'a',
        ctrlKey: true,
        code: 'KeyA',
        keyCode: 65,
        which: 65,
      });

      expect(isHotkey('mod+a', event)).toBe(true);
    });

    it('应该在 Mac 上检测 Cmd 键', () => {
      const event = createKeyboardEvent({
        key: 'a',
        metaKey: true,
        code: 'KeyA',
        keyCode: 65,
        which: 65,
      });

      expect(isHotkey('cmd+a', event)).toBe(true);
    });
  });

  describe('组合键测试', () => {
    it('应该检测 Ctrl+Alt+A', () => {
      const event = createKeyboardEvent({
        key: 'a',
        ctrlKey: true,
        altKey: true,
        code: 'KeyA',
        keyCode: 65,
        which: 65,
      });

      expect(isHotkey('ctrl+alt+a', event)).toBe(true);
    });

    it('应该检测 Ctrl+Shift+Alt+A', () => {
      const event = createKeyboardEvent({
        key: 'a',
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
        code: 'KeyA',
        keyCode: 65,
        which: 65,
      });

      expect(isHotkey('ctrl+shift+alt+a', event)).toBe(true);
    });
  });
});
