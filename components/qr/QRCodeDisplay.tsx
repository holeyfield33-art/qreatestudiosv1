'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
  className?: string;
}

export default function QRCodeDisplay({
  value,
  size = 256,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  level = 'M',
  includeMargin = true,
  imageSettings,
  className = '',
}: QRCodeDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Validate value
    if (!value || value.trim() === '') {
      setError('QR code value is required');
    } else if (value.length > 2953) {
      setError('QR code data is too long (max 2953 characters)');
    } else {
      setError(null);
    }
  }, [value]);

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
    return (
      <div className={`qr-code-container bg-white p-4 rounded-lg shadow-sm ${className}`}>
        <QRCodeSVG
          value={value}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level={level}
          includeMargin={includeMargin}
          imageSettings={imageSettings}
        />
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
