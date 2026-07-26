import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getDeviceBrand,
  isBrowser,
  isMobileDevice,
  isOppoDevice,
  isTest,
  isVivoDevice,
  isVivoOrOppoDevice,
  isWeChat,
} from '../env';

describe('env', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isBrowser', () => {
    it('returns true in browser test environment', () => {
      expect(isBrowser()).toBe(true);
    });

    it('returns false when window is undefined', () => {
      vi.stubGlobal('window', undefined);
      expect(isBrowser()).toBe(false);
    });
  });

  describe('isTest', () => {
    it('returns true under vitest', () => {
      expect(isTest()).toBe(true);
    });
  });

  describe('getDeviceBrand', () => {
    it('returns false when navigator is undefined and ua is omitted', () => {
      vi.stubGlobal('navigator', undefined);
      expect(getDeviceBrand()).toBe(false);
    });

    it('matches known brands from ua string', () => {
      expect(getDeviceBrand('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)')).toBe(
        'iphone',
      );
      expect(getDeviceBrand('Mozilla/5.0 HUAWEI GLK-AL00')).toBe('华为');
      expect(getDeviceBrand('Mozilla/5.0 OPPO PCAM10')).toBe('oppo');
      expect(getDeviceBrand('Mozilla/5.0 vivo V1981A')).toBe('vivo');
      expect(getDeviceBrand('Mozilla/5.0 Redmi Note')).toBe('小米');
      expect(getDeviceBrand('Mozilla/5.0 SAMSUNG SM-G991B')).toBe('三星');
    });

    it('falls back to Build segment when no brand table matches', () => {
      expect(getDeviceBrand('Mozilla/5.0; CustomBrand Build/123')).toBe(
        'CustomBrand',
      );
    });

    it('returns false for unknown ua', () => {
      expect(getDeviceBrand('UnknownBrowser/1.0')).toBe(false);
    });
  });

  describe('isVivoDevice / isOppoDevice / isVivoOrOppoDevice', () => {
    it('detects vivo and oppo from ua', () => {
      expect(isVivoDevice('Mozilla/5.0 vivo V1981A')).toBe(true);
      expect(isOppoDevice('Mozilla/5.0 OPPO PCAM10')).toBe(true);
      expect(isVivoOrOppoDevice('Mozilla/5.0 vivo V1981A')).toBe(true);
      expect(isVivoOrOppoDevice('Mozilla/5.0 OPPO PCAM10')).toBe(true);
      expect(isVivoOrOppoDevice('Mozilla/5.0 iPhone')).toBe(false);
    });
  });

  describe('isMobileDevice', () => {
    it('returns false when navigator is undefined', () => {
      vi.stubGlobal('navigator', undefined);
      expect(isMobileDevice()).toBe(false);
    });

    it('returns true for mobile ua', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Linux; Android 13)',
        maxTouchPoints: 0,
      });
      vi.stubGlobal('window', { innerWidth: 1024 });
      expect(isMobileDevice()).toBe(true);
    });

    it('returns true for touch capability on small screens', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
        maxTouchPoints: 5,
      });
      vi.stubGlobal('window', {
        innerWidth: 500,
        ontouchstart: true,
      });
      expect(isMobileDevice()).toBe(true);
    });

    it('returns false for desktop without mobile signals', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        maxTouchPoints: 0,
      });
      vi.stubGlobal('window', { innerWidth: 1920 });
      expect(isMobileDevice()).toBe(false);
    });
  });

  describe('isWeChat', () => {
    it('returns false when navigator is undefined and ua is omitted', () => {
      vi.stubGlobal('navigator', undefined);
      expect(isWeChat()).toBe(false);
    });

    it('detects WeChat from ua', () => {
      expect(isWeChat('Mozilla/5.0 MicroMessenger/8.0')).toBe(true);
      expect(isWeChat('Mozilla/5.0 Chrome/91')).toBe(false);
    });
  });
});
