import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeInput, validateUrl } from '@/lib/sanitize';

describe('sanitizeHtml', () => {
  it('removes script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeHtml(input)).toBe('<p>Hello</p>');
  });

  it('removes event handlers', () => {
    const input = '<img src="img.jpg" onerror="alert(1)" />';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onerror');
  });

  it('removes javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('javascript:');
  });

  it('preserves safe HTML', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it('handles empty input', () => {
    expect(sanitizeHtml('')).toBe('');
  });
});

describe('sanitizeInput', () => {
  it('removes angle brackets', () => {
    expect(sanitizeInput('<script>')).toBe('script');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('handles empty input', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

describe('validateUrl', () => {
  it('accepts valid HTTP URLs', () => {
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://example.com/path')).toBe(true);
  });

  it('rejects javascript URLs', () => {
    expect(validateUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejects invalid URLs', () => {
    expect(validateUrl('not-a-url')).toBe(false);
    expect(validateUrl('')).toBe(false);
  });
});
