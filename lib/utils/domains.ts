/**
 * Domain and URL utilities for Qreate Studios
 * Handles development (CodeSpaces) and production domains
 */

export function getAppDomain(): string {
  // In production
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // In development - check if running in Codespaces
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If in Codespaces, use the forwarded URL
    if (hostname.includes('github.dev') || hostname.includes('githubpreview.dev') || hostname.includes('app.github.dev')) {
      return window.location.origin;
    }
  }
  
  // Fallback to localhost
  return 'http://localhost:3000';
}

export function getShortUrl(shortCode: string): string {
  const domain = getAppDomain();
  return `${domain}/s/${shortCode}`;
}

export function getLandingPageUrl(slug: string): string {
  // In production: subdomain
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_APP_URL) {
    return `https://${slug}.qreatestudios.com`;
  }
  
  // In development: path-based
  const domain = getAppDomain();
  return `${domain}/l/${slug}`;
}

export function maskLongUrl(url: string, maxLength: number = 40): string {
  if (url.length <= maxLength) return url;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    // Show domain + truncated path
    if (path.length > 20) {
      return `${domain}${path.substring(0, 17)}...`;
    }
    
    return `${domain}${path}`;
  } catch {
    // If URL parsing fails, just truncate
    return url.substring(0, maxLength - 3) + '...';
  }
}

export function getDisplayUrl(url: string): { display: string; full: string } {
  return {
    display: maskLongUrl(url, 45),
    full: url,
  };
}

/**
 * Extract domain from a URL (without protocol)
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

/**
 * Check if URL is a CodeSpaces URL
 */
export function isCodeSpacesUrl(url: string): boolean {
  return url.includes('github.dev') || 
         url.includes('githubpreview.dev') || 
         url.includes('app.github.dev');
}
