// Simple HTML sanitizer - strips dangerous elements
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handler attributes
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, '');

  // Remove data: URLs in href/src (potential XSS)
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']data:[^"']*["']/gi, '');

  return sanitized;
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 10000); // Max length
}

export function validateUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
