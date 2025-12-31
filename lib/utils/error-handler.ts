/**
 * Centralized error handling utilities
 */

/**
 * Safely log errors only in development
 */
export function logError(message: string, error?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error);
  }
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Standard API error response builder
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: Record<string, any>
) {
  return {
    error: message,
    status,
    timestamp: new Date().toISOString(),
    ...details,
  };
}

/**
 * Wrap async functions with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    logError(errorMessage, error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    logError('JSON parse error', error);
    return fallback;
  }
}

/**
 * Validate required environment variables
 */
export function validateEnv(vars: string[]): void {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
