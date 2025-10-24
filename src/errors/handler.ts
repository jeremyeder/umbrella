/**
 * Error handler with HTTP status mapping and actionable messages
 */
import {
  ACPError,
  AuthError,
  NotFoundError,
  RateLimitError,
  InvalidInputError,
  ServerError,
  ServiceUnavailableError,
  TimeoutError,
  NetworkError,
} from './types.js';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    userAction?: string;
    details?: unknown;
  };
}

/**
 * Map HTTP status code to appropriate error class
 */
export function mapHttpError(statusCode: number, message: string, details?: unknown): ACPError {
  switch (statusCode) {
    case 401:
    case 403:
      return new AuthError(
        message || 'Authentication failed. Please check your API key in configuration.',
        details
      );

    case 404:
      return new NotFoundError(
        message || 'Resource not found. Please verify the resource ID.',
        details
      );

    case 429:
      return new RateLimitError(
        message || 'Rate limit exceeded. Please wait before retrying.',
        undefined,
        details
      );

    case 400:
      return new InvalidInputError(
        message || 'Invalid parameters. Please check your input.',
        details
      );

    case 503:
      return new ServiceUnavailableError(
        message || 'ACP backend is temporarily unavailable. Please try again later.',
        details
      );

    case 504:
      return new TimeoutError(
        message || 'Request timed out. Consider increasing the timeout configuration.',
        details
      );

    case 500:
    case 502:
    default:
      return new ServerError(
        message || 'An unexpected error occurred. Please contact support.',
        details
      );
  }
}

/**
 * Get user-actionable guidance for an error
 */
export function getUserAction(error: ACPError): string | undefined {
  switch (error.code) {
    case 'AUTH_INVALID':
      return 'Check that MCP_API_KEY environment variable or apiKey in .mcp.json is set correctly';

    case 'NOT_FOUND':
      return 'Verify the resource ID exists by listing available resources first';

    case 'RATE_LIMIT':
      if (error instanceof RateLimitError && error.retryAfter) {
        return `Wait ${error.retryAfter} seconds before retrying`;
      }
      return 'Reduce request frequency or increase rateLimitPerMinute configuration';

    case 'INVALID_INPUT':
      return 'Review the tool parameters and ensure they meet the validation requirements';

    case 'SERVICE_UNAVAILABLE':
      return 'The ACP backend is temporarily down. Try again in a few moments';

    case 'TIMEOUT':
      return 'Increase the timeout configuration value in .mcp.json or MCP_TIMEOUT environment variable';

    case 'SERVER_ERROR':
      return 'Contact support with the error details if the problem persists';

    case 'NETWORK_ERROR':
      return 'Check your internet connection and that the baseUrl is accessible';

    case 'PATH_TRAVERSAL':
      return 'Use relative paths without .. or / prefixes when accessing workspace files';

    case 'CONFIG_ERROR':
      return 'Fix the configuration errors and restart the MCP server';

    default:
      return undefined;
  }
}

/**
 * Format error for MCP response
 */
export function formatErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof ACPError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        userAction: getUserAction(error),
        details: error.details,
      },
    };
  }

  // Unknown error
  return {
    error: {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      userAction: 'Please report this error with the details provided',
      details: error,
    },
  };
}

/**
 * Handle fetch errors and convert to ACPError
 */
export function handleFetchError(error: unknown): ACPError {
  if (error instanceof ACPError) {
    return error;
  }

  // Network/fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Network request failed. Check connectivity and baseUrl.', error);
  }

  // Timeout errors
  if (error instanceof Error && error.message.includes('timeout')) {
    return new TimeoutError('Request timed out', error);
  }

  // Generic error
  return new ServerError(
    error instanceof Error ? error.message : 'Unknown error occurred',
    error
  );
}
