'use client';

import { QRCodeSVG } from 'qrcode.react';
import { memo, useMemo } from 'react';
import type { QRTemplate } from '@/lib/templates/qr-templates';

interface QRPreviewProps {
  template: QRTemplate;
  size?: number;
  value?: string;
}

/**
 * QRPreview Component
 * 
 * Generates a styled QR code preview based on template configuration.
 * Uses qrcode.react for QR generation with custom styling.
 * Memoized for performance optimization.
 * 
 * Features:
 * - Real-time QR generation
 * - Template styling applied (colors, shapes, frames)
 * - Gradient support with overlay
 * - Custom frames with text
 * - Performance optimized with memo and useMemo
 */
const QRPreview = memo(({ template, size = 200, value = 'https://qreatestudios.com' }: QRPreviewProps) => {
  const { style, frame } = template;

  // Memoize computed values for performance
  const borderRadius = useMemo(() => {
    switch (style.cornerSquareStyle) {
      case 'extra-rounded': return '16px';
      case 'rounded': return '8px';
      default: return '0px';
    }
  }, [style.cornerSquareStyle]);

  const frameBorderRadius = useMemo(() => {
    if (!frame) return '0px';
    switch (frame.type) {
      case 'rounded': return '8px';
      case 'badge': return '12px';
      default: return '0px';
    }
  }, [frame]);

  const gradientStyle = useMemo(() => {
    if (!style.gradientType || !style.gradientColors) return undefined;
    
    return style.gradientType === 'linear' 
      ? `linear-gradient(135deg, ${style.gradientColors[0]}, ${style.gradientColors[1]})`
      : `radial-gradient(circle, ${style.gradientColors[0]}, ${style.gradientColors[1]})`;
  }, [style.gradientType, style.gradientColors]);

  // Calculate QR size with margin
  const qrSize = useMemo(() => size - (style.margin * 8), [size, style.margin]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* QR Code Container with styling */}
      <div 
        className="relative flex items-center justify-center transition-transform duration-300 hover:scale-105"
        style={{
          width: size,
          height: size,
          backgroundColor: style.backgroundColor,
          borderRadius,
          boxShadow: frame?.type === 'shadow' ? '0 8px 16px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        {/* Actual QR Code */}
        <div className="relative z-10">
          <QRCodeSVG
            value={value}
            size={qrSize}
            bgColor="transparent"
            fgColor={style.foregroundColor}
            level={style.errorCorrectionLevel}
            includeMargin={false}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Gradient Overlay (if applicable) */}
        {gradientStyle && (
          <div 
            className="absolute inset-0 mix-blend-multiply opacity-20 pointer-events-none z-0"
            style={{
              background: gradientStyle,
              borderRadius,
            }}
          />
        )}

        {/* Frame Text Overlay */}
        {frame && frame.type !== 'none' && frame.text && (
          <div 
            className={`absolute ${frame.textPosition === 'top' ? 'top-0' : 'bottom-0'} inset-x-0 flex items-center justify-center text-center font-bold text-white z-20`}
            style={{ 
              backgroundColor: frame.color,
              padding: `${Math.max(6, frame.padding / 3)}px 8px`,
              borderRadius: frameBorderRadius,
              fontSize: '10px',
              lineHeight: '1.2',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              boxShadow: frame.type === 'shadow' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            {frame.text}
          </div>
        )}

        {/* Premium Badge Indicator */}
        {template.isPremium && (
          <div 
            className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5 text-[8px] font-bold z-20 shadow-sm"
            aria-label="Premium template"
          >
            ⭐ PRO
          </div>
        )}
      </div>

      {/* Loading state overlay (optional) */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 pointer-events-none rounded-lg" />
    </div>
  );
});

QRPreview.displayName = 'QRPreview';

export default QRPreview;
