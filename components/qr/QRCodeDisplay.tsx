'use client';

import { useEffect, useState, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  dotStyle?: string;
  cornerStyle?: string;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
  frame?: {
    style: string;
    color: string;
    text: string;
    textColor: string;
  } | null;
  className?: string;
}

export default function QRCodeDisplay({
  value,
  size = 256,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  level = 'M',
  includeMargin = true,
  dotStyle = 'square',
  cornerStyle = 'square',
  imageSettings,
  frame,
  className = '',
}: QRCodeDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Validate value
    if (!value || value.trim() === '') {
      setError('QR code value is required');
      return;
    } else if (value.length > 2953) {
      setError('QR code data is too long (max 2953 characters)');
      return;
    } else {
      setError(null);
    }

    if (!mounted || !qrRef.current) return;

    try {
      // Map our style names to qr-code-styling format
      const mapDotStyle = (style: string) => {
        const styleMap: { [key: string]: any } = {
          'square': 'square',
          'dots': 'dots',
          'rounded': 'rounded',
          'classy': 'classy',
          'extra-rounded': 'extra-rounded',
        };
        return styleMap[style] || 'square';
      };

      const mapCornerStyle = (style: string) => {
        const styleMap: { [key: string]: any } = {
          'square': 'square',
          'dot': 'dot',
          'extra-rounded': 'extra-rounded',
        };
        return styleMap[style] || 'square';
      };

      const qrOptions: any = {
        width: size,
        height: size,
        type: 'svg' as const,
        data: value,
        margin: includeMargin ? 10 : 0,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte' as const,
          errorCorrectionLevel: level,
        },
        dotsOptions: {
          color: fgColor,
          type: mapDotStyle(dotStyle),
        },
        backgroundOptions: {
          color: bgColor,
        },
        cornersSquareOptions: {
          color: fgColor,
          type: mapCornerStyle(cornerStyle),
        },
        cornersDotOptions: {
          color: fgColor,
          type: mapCornerStyle(cornerStyle),
        },
      };

      // Add image if provided
      if (imageSettings && imageSettings.src) {
        qrOptions.image = imageSettings.src;
        qrOptions.imageOptions = {
          hideBackgroundDots: imageSettings.excavate,
          imageSize: 0.4,
          margin: 0,
        };
      }

      // Create or update QR code
      if (!qrCodeRef.current) {
        qrCodeRef.current = new QRCodeStyling(qrOptions);
        qrCodeRef.current.append(qrRef.current);
      } else {
        qrCodeRef.current.update(qrOptions);
      }
    } catch (err) {
      console.error('QR Generation Error:', err);
      setError('Failed to generate QR code');
    }
  }, [mounted, value, size, fgColor, bgColor, level, includeMargin, dotStyle, cornerStyle, imageSettings]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (qrCodeRef.current && qrRef.current) {
        qrRef.current.innerHTML = '';
      }
    };
  }, []);

  if (!mounted) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg animate-pulse ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Generating QR...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-300 ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-center px-4">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!value) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-center px-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <p className="text-gray-400 text-sm">Enter URL to generate QR code</p>
        </div>
      </div>
    );
  }

  try {
    // Get frame styles
    const getFrameStyles = () => {
      if (!frame || frame.style === 'none') return null;

      const baseStyles = {
        border: `4px solid ${frame.color}`,
        padding: '16px',
        position: 'relative' as const,
      };

      switch (frame.style) {
        case 'simple':
          return {
            ...baseStyles,
            borderRadius: '8px',
          };
        case 'box':
          return {
            ...baseStyles,
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          };
        case 'circular':
          return {
            ...baseStyles,
            borderRadius: '50%',
            border: `6px solid ${frame.color}`,
          };
        case 'banner':
          return {
            ...baseStyles,
            borderRadius: '8px',
            borderTop: `8px solid ${frame.color}`,
            borderBottom: `8px solid ${frame.color}`,
          };
        case 'tooltip':
          return {
            ...baseStyles,
            borderRadius: '16px',
            border: `3px solid ${frame.color}`,
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          };
        default:
          return baseStyles;
      }
    };

    const frameStyles = getFrameStyles();

    return (
      <div className={`qr-code-container ${className}`}>
        <div 
          className="bg-white rounded-lg shadow-sm"
          style={frameStyles || undefined}
        >
          <div ref={qrRef} className="flex items-center justify-center" />
          
          {frame && frame.style !== 'none' && frame.text && (
            <div 
              className="mt-3 text-center font-bold text-sm"
              style={{ 
                color: frame.textColor,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {frame.text}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('QR Generation Error:', error);
    return (
      <div
        className={`flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-300 ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-center px-4">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p className="text-red-600 text-sm font-medium">Failed to generate QR code</p>
          <p className="text-red-500 text-xs mt-1">Please check your input</p>
        </div>
      </div>
    );
  }
}
