/**
 * Color contrast utilities for WCAG AA compliance
 */

/**
 * Calculate relative luminance of a color
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getLuminance(hexColor: string): number {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard
 * Normal text: 4.5:1 minimum
 * Large text (18pt+ or 14pt+ bold): 3:1 minimum
 */
export function meetsWCAGAA(color1: string, color2: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standard
 * Normal text: 7:1 minimum
 * Large text: 4.5:1 minimum
 */
export function meetsWCAGAAA(color1: string, color2: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Get contrast level rating
 */
export function getContrastLevel(color1: string, color2: string): {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  rating: 'fail' | 'aa' | 'aaa';
} {
  const ratio = getContrastRatio(color1, color2);
  const meetsAA = ratio >= 4.5;
  const meetsAAA = ratio >= 7;

  let rating: 'fail' | 'aa' | 'aaa' = 'fail';
  if (meetsAAA) rating = 'aaa';
  else if (meetsAA) rating = 'aa';

  return {
    ratio: Math.round(ratio * 100) / 100,
    meetsAA,
    meetsAAA,
    rating,
  };
}

/**
 * Suggest a contrasting color (black or white) based on background
 */
export function suggestContrastColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);
  // If background is light, use dark text. If dark, use light text.
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Validate QR code color combination for readability
 * QR codes need high contrast to scan properly
 */
export function validateQRCodeColors(foreground: string, background: string): {
  isValid: boolean;
  ratio: number;
  message: string;
} {
  const ratio = getContrastRatio(foreground, background);
  
  // QR codes should have at least 3:1 contrast for reliable scanning
  const isValid = ratio >= 3;
  
  let message = '';
  if (ratio >= 7) {
    message = 'Excellent contrast - highly scannable';
  } else if (ratio >= 4.5) {
    message = 'Good contrast - easily scannable';
  } else if (ratio >= 3) {
    message = 'Acceptable contrast - may have scanning issues in poor lighting';
  } else {
    message = 'Poor contrast - QR code may not scan reliably';
  }

  return { isValid, ratio: Math.round(ratio * 100) / 100, message };
}

/**
 * Check if a hex color is valid
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Convert RGB to Hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');
}

/**
 * Convert Hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
