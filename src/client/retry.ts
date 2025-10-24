/**
 * Exponential backoff retry logic
 */
import { RateLimitError, TimeoutError, ServiceUnavailableError } from '../errors/types.js';
import type { Logger } from '../utils/logger.js';

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  logger?: Logger;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Retry on rate limits, timeouts, and service unavailable
  return (
    error instanceof RateLimitError ||
    error instanceof TimeoutError ||
    error instanceof ServiceUnavailableError
  );
}

/**
 * Calculate delay for retry attempt with exponential backoff
 * @param attempt - The attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds
 * @param maxDelay - Maximum delay in milliseconds
 * @returns Delay in milliseconds
 */
export function calculateBackoff(attempt: number, baseDelay: number, maxDelay: number): number {
  // Exponential backoff: baseDelay * 2^attempt
  const delay = baseDelay * Math.pow(2, attempt);

  // Add jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);

  // Cap at maxDelay
  return Math.min(delay + jitter, maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param fn - The async function to retry
 * @param options - Retry options
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, logger } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry if we've exhausted attempts
      if (attempt >= maxRetries) {
        logger?.warn(`Max retries (${maxRetries}) exhausted`, { error });
        throw error;
      }

      // Calculate delay for next attempt
      const delay = calculateBackoff(attempt, baseDelay, maxDelay);

      logger?.debug(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
        error: error instanceof Error ? error.message : String(error),
      });

      // Wait before retrying
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError;
}
