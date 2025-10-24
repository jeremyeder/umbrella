/**
 * Credential validator
 */
import { AuthError } from '../errors/types.js';

/**
 * Validate API key format
 * @param apiKey - The API key to validate
 * @throws AuthError if invalid
 */
export function validateApiKey(apiKey: string): void {
  if (!apiKey || apiKey.trim() === '') {
    throw new AuthError('API key is required');
  }

  if (apiKey.length < 32) {
    throw new AuthError('API key must be at least 32 characters');
  }

  // Check for placeholder values
  const placeholderPatterns = [
    /^your[_-]api[_-]key/i,
    /^replace[_-]me/i,
    /^example/i,
    /^test[_-]key/i,
    /^placeholder/i,
  ];

  for (const pattern of placeholderPatterns) {
    if (pattern.test(apiKey)) {
      throw new AuthError(
        'API key appears to be a placeholder. Please provide a valid ACP API key.'
      );
    }
  }
}

/**
 * Validate URL format
 * @param baseUrl - The base URL to validate
 * @throws AuthError if invalid
 */
export function validateBaseUrl(baseUrl: string): void {
  if (!baseUrl || baseUrl.trim() === '') {
    throw new AuthError('Base URL is required');
  }

  try {
    const url = new URL(baseUrl);

    // Must be HTTPS in production
    if (url.protocol !== 'https:') {
      throw new AuthError('Base URL must use HTTPS protocol');
    }

    // Must have a valid hostname
    if (!url.hostname) {
      throw new AuthError('Base URL must have a valid hostname');
    }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Base URL is not a valid URL');
  }
}
