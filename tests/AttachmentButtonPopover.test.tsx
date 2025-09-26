import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import AttachmentButtonPopover, {
  AttachmentSupportedFormatsContent,
  SupportedFileFormats,
} from '../src/MarkdownInputField/AttachmentButton/AttachmentButtonPopover';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('AttachmentButtonPopover', () => {
  describe('SupportedFileFormats', () => {
    it('should have default supported formats as object', () => {
      const formats = Object.values(SupportedFileFormats);
      expect(formats).toHaveLength(4);
      expect(SupportedFileFormats.image.type).toBe('图片');
      expect(SupportedFileFormats.document.type).toBe('文档');
      expect(SupportedFileFormats.audio.type).toBe('音频');
      expect(SupportedFileFormats.video.type).toBe('视频');
    });

    it('should have correct file extensions for images', () => {
      const imageFormat = SupportedFileFormats.image;
      expect(imageFormat?.extensions).toContain('jpg');
      expect(imageFormat?.extensions).toContain('jpeg');
      expect(imageFormat?.extensions).toContain('png');
      expect(imageFormat?.extensions).toContain('gif');
    });

    it('should have correct file extensions for documents', () => {
      const docFormat = SupportedFileFormats.document;
      expect(docFormat?.extensions).toContain('pdf');
      expect(docFormat?.extensions).toContain('docx');
      expect(docFormat?.extensions).toContain('xlsx');
    });

    it('should have appropriate max sizes', () => {
      const imageFormat = SupportedFileFormats.image;
      const videoFormat = SupportedFileFormats.video;

      expect(imageFormat?.maxSize).toBe(10 * 1024);
      expect(videoFormat?.maxSize).toBe(100 * 1024);
    });
  });

  describe('AttachmentSupportedFormatsContent', () => {
    it('should render supported formats content for image format', () => {
      render(
        <AttachmentSupportedFormatsContent
          supportedFormat={SupportedFileFormats.image}
        />,
      );

      expect(screen.getByText(/每个文件不超过/)).toBeInTheDocument();
      expect(screen.getByText(/jpg, jpeg, png, gif/)).toBeInTheDocument();
    });

    it('should render document format content', () => {
      render(
        <AttachmentSupportedFormatsContent
          supportedFormat={SupportedFileFormats.document}
        />,
      );

      expect(screen.getByText(/每个文件不超过/)).toBeInTheDocument();
      expect(screen.getByText(/pdf/)).toBeInTheDocument();
    });

    it('should render file size limits for audio format', () => {
      render(
        <AttachmentSupportedFormatsContent
          supportedFormat={SupportedFileFormats.audio}
        />,
      );

      expect(screen.getByText(/每个文件不超过/)).toBeInTheDocument();
      expect(screen.getByText(/mp3, wav/)).toBeInTheDocument();
    });

    it('should render custom content when provided', () => {
      const customFormat = {
        icon: <span>Custom Icon</span>,
        type: 'Custom',
        maxSize: 1024,
        extensions: ['custom'],
        content: <div>每个文件不超过1024kb，支持custom格式</div>,
      };

      render(
        <AttachmentSupportedFormatsContent supportedFormat={customFormat} />,
      );

      expect(screen.getByText(/每个文件不超过1024kb/)).toBeInTheDocument();
      expect(screen.getByText(/custom/)).toBeInTheDocument();
    });

    it('should use default format when supportedFormat is undefined', () => {
      render(<AttachmentSupportedFormatsContent />);

      // Should show default image format content
      expect(screen.getByText(/每个文件不超过/)).toBeInTheDocument();
      expect(screen.getByText(/jpg, jpeg, png, gif/)).toBeInTheDocument();
    });
  });

  describe('AttachmentButtonPopover Component', () => {
    it('should render popover with children when format provided', () => {
      render(
        <AttachmentButtonPopover supportedFormat={SupportedFileFormats.image}>
          <button type="button">Upload File</button>
        </AttachmentButtonPopover>,
      );

      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    it('should not render when no supported format provided', () => {
      const { container } = render(
        <AttachmentButtonPopover>
          <button type="button">Upload File</button>
        </AttachmentButtonPopover>,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render with custom supported format', () => {
      const customFormat = {
        icon: <span>📄</span>,
        type: 'Custom Document',
        maxSize: 2048,
        extensions: ['custom', 'doc'],
      };

      render(
        <AttachmentButtonPopover supportedFormat={customFormat}>
          <button type="button">Upload Custom</button>
        </AttachmentButtonPopover>,
      );

      expect(screen.getByText('Upload Custom')).toBeInTheDocument();
    });

    it('should have correct popover props', () => {
      const { container } = render(
        <AttachmentButtonPopover supportedFormat={SupportedFileFormats.image}>
          <button type="button">Upload File</button>
        </AttachmentButtonPopover>,
      );

      // The popover should be rendered (we can check for the presence of the trigger)
      expect(container.querySelector('.ant-popover')).toBeFalsy(); // Popover content is not visible by default
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty format extensions array', () => {
      const formatWithEmptyExtensions = {
        icon: <span>📄</span>,
        type: 'Empty Extensions',
        maxSize: 1024,
        extensions: [],
      };

      render(
        <AttachmentSupportedFormatsContent
          supportedFormat={formatWithEmptyExtensions}
        />,
      );

      expect(screen.getByText(/每个文件不超过/)).toBeInTheDocument();
    });

    it('should handle format with zero max size', () => {
      const formatWithZeroSize = {
        icon: <span>📄</span>,
        type: 'Zero Size',
        maxSize: 0,
        extensions: ['test'],
      };

      render(
        <AttachmentSupportedFormatsContent
          supportedFormat={formatWithZeroSize}
        />,
      );

      expect(screen.getByText(/每个文件不超过/)).toBeInTheDocument();
    });

    it('should handle format with very large max size', () => {
      const formatWithLargeSize = {
        icon: <span>📄</span>,
        type: 'Large Size',
        maxSize: 1024 * 1024 * 1024, // 1GB in KB
        extensions: ['large'],
      };

      render(
        <AttachmentSupportedFormatsContent
          supportedFormat={formatWithLargeSize}
        />,
      );

      expect(screen.getByText(/每个文件不超过/)).toBeInTheDocument();
    });

    it('should handle single extension', () => {
      const singleExtensionFormat = {
        icon: <span>📄</span>,
        type: 'Single',
        maxSize: 1024,
        extensions: ['single'],
      };

      render(
        <AttachmentSupportedFormatsContent
          supportedFormat={singleExtensionFormat}
        />,
      );

      expect(screen.getByText(/single/)).toBeInTheDocument();
    });
  });
});
