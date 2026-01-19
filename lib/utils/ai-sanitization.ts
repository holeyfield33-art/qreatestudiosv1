/**
 * Sanitize user input before embedding in AI prompts
 * Prevents prompt injection attacks and ensures safe AI interactions
 */

const MAX_INPUT_LENGTH = 1000;
const SUSPICIOUS_PATTERNS = [
  /ignore (previous|all|the) (instructions?|prompts?)/i,
  /disregard (everything|all)/i,
  /you are now/i,
  /new instructions?:/i,
  /system:?\s*\n/i,
  /\[system\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
];

export interface SanitizationResult {
  sanitized: string;
  wasModified: boolean;
  warnings: string[];
}

/**
 * Sanitize text input for use in AI prompts
 * @param input - User-provided text
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized text and metadata
 */
export function sanitizeAIInput(
  input: string,
  maxLength: number = MAX_INPUT_LENGTH
): SanitizationResult {
  const warnings: string[] = [];
  let sanitized = input;
  let wasModified = false;

  // 1. Check for null/undefined
  if (!sanitized || typeof sanitized !== 'string') {
    return {
      sanitized: '',
      wasModified: true,
      warnings: ['Invalid input type'],
    };
  }

  // 2. Trim whitespace
  sanitized = sanitized.trim();

  // 3. Check length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
    warnings.push(`Input truncated to ${maxLength} characters`);
    wasModified = true;
  }

  // 4. Remove null bytes and control characters (except newlines and tabs)
  const cleanedText = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  if (cleanedText !== sanitized) {
    sanitized = cleanedText;
    warnings.push('Control characters removed');
    wasModified = true;
  }

  // 5. Check for prompt injection patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      warnings.push('Potential prompt injection detected');
      // Remove the suspicious pattern
      sanitized = sanitized.replace(pattern, '[REDACTED]');
      wasModified = true;
    }
  }

  // 6. Escape special characters that could break prompt structure
  // Keep basic punctuation but escape potential delimiters
  const escaped = sanitized
    .replace(/\${/g, '\\${')  // Prevent template literal injection
    .replace(/`{3,}/g, '```'); // Normalize code fences

  if (escaped !== sanitized) {
    sanitized = escaped;
    wasModified = true;
  }

  return {
    sanitized,
    wasModified,
    warnings,
  };
}

/**
 * Sanitize context object for AI prompts
 * Recursively sanitizes all string values in an object
 */
export function sanitizeAIContext(
  context: Record<string, any>,
  maxLength: number = MAX_INPUT_LENGTH
): {
  sanitized: Record<string, any>;
  warnings: string[];
} {
  const warnings: string[] = [];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string') {
      const result = sanitizeAIInput(value, maxLength);
      sanitized[key] = result.sanitized;
      warnings.push(...result.warnings.map(w => `${key}: ${w}`));
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (typeof item === 'string') {
          const result = sanitizeAIInput(item, maxLength);
          warnings.push(...result.warnings.map(w => `${key}[]: ${w}`));
          return result.sanitized;
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      const result = sanitizeAIContext(value, maxLength);
      sanitized[key] = result.sanitized;
      warnings.push(...result.warnings.map(w => `${key}.${w}`));
    } else {
      sanitized[key] = value;
    }
  }

  return { sanitized, warnings };
}

/**
 * Validate that input doesn't contain executable code patterns
 */
export function containsExecutableCode(input: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
    /eval\s*\(/i,
    /Function\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i,
  ];

  return dangerousPatterns.some(pattern => pattern.test(input));
}
