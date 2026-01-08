/**
 * URL Helper Utilities for Qreate Studios
 * Handles proper subdomain and URL generation for production and development
 */

export function getBaseUrl(): string {
  // In production
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://qreatestudios.com';
  }
  
  // In development
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function getLandingPageUrl(slug: string): string {
  const baseUrl = getBaseUrl();
  
  // In production: use subdomain
  if (process.env.NODE_ENV === 'production') {
    return `https://${slug}.qreatestudios.com`;
  }
  
  // In development: use path
  return `${baseUrl}/l/${slug}`;
}

export function getShortUrl(shortCode: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/s/${shortCode}`;
}

export function getPagePreviewUrl(slug: string): string {
  return getLandingPageUrl(slug);
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
