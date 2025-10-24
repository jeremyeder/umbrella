/**
 * Custom error classes for ACP MCP Server
 */

export class ACPError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ACPError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthError extends ACPError {
  constructor(message: string = 'Invalid API key', details?: unknown) {
    super(message, 'AUTH_INVALID', 401, details);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends ACPError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ACPError {
  constructor(
    message: string = 'Rate limit exceeded',
    public readonly retryAfter?: number,
    details?: unknown
  ) {
    super(message, 'RATE_LIMIT', 429, details);
    this.name = 'RateLimitError';
  }
}

export class InvalidInputError extends ACPError {
  constructor(message: string = 'Invalid parameters', details?: unknown) {
    super(message, 'INVALID_INPUT', 400, details);
    this.name = 'InvalidInputError';
  }
}

export class ServerError extends ACPError {
  constructor(message: string = 'Internal server error', details?: unknown) {
    super(message, 'SERVER_ERROR', 500, details);
    this.name = 'ServerError';
  }
}

export class ServiceUnavailableError extends ACPError {
  constructor(message: string = 'Backend unavailable', details?: unknown) {
    super(message, 'SERVICE_UNAVAILABLE', 503, details);
    this.name = 'ServiceUnavailableError';
  }
}

export class TimeoutError extends ACPError {
  constructor(message: string = 'Request timeout', details?: unknown) {
    super(message, 'TIMEOUT', 504, details);
    this.name = 'TimeoutError';
  }
}

export class NetworkError extends ACPError {
  constructor(message: string = 'Network error', details?: unknown) {
    super(message, 'NETWORK_ERROR', 0, details);
    this.name = 'NetworkError';
  }
}

export class PathTraversalError extends ACPError {
  constructor(message: string = 'Path traversal attempt detected', details?: unknown) {
    super(message, 'PATH_TRAVERSAL', 403, details);
    this.name = 'PathTraversalError';
  }
}

export class ConfigurationError extends ACPError {
  constructor(message: string = 'Configuration error', details?: unknown) {
    super(message, 'CONFIG_ERROR', 0, details);
    this.name = 'ConfigurationError';
  }
}
