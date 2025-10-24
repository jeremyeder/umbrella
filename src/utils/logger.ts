/**
 * Logger with credential redaction
 */

const REDACTED = '[REDACTED]';

// Patterns that should be redacted
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /auth[_-]?token/i,
  /bearer\s+\S+/i,
  /password/i,
  /secret/i,
  /credential/i,
];

/**
 * Redact sensitive information from strings
 */
export function redactSensitiveData(data: unknown): unknown {
  if (typeof data === 'string') {
    let redacted = data;

    // Redact authorization headers
    redacted = redacted.replace(/authorization:\s*bearer\s+\S+/gi, `authorization: bearer ${REDACTED}`);
    redacted = redacted.replace(/api[_-]?key:\s*\S+/gi, `api_key: ${REDACTED}`);

    // Redact long alphanumeric strings that look like keys (32+ chars)
    redacted = redacted.replace(/[a-zA-Z0-9_-]{32,}/g, (match) => {
      // Don't redact URLs or paths
      if (match.includes('/') || match.includes('.')) {
        return match;
      }
      return REDACTED;
    });

    return redacted;
  }

  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(redactSensitiveData);
    }

    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Check if key name contains sensitive patterns
      const isSensitiveKey = SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));

      if (isSensitiveKey) {
        redacted[key] = REDACTED;
      } else {
        redacted[key] = redactSensitiveData(value);
      }
    }
    return redacted;
  }

  return data;
}

/**
 * Logger interface
 */
export interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

/**
 * Console logger with credential redaction
 */
export class ConsoleLogger implements Logger {
  constructor(private readonly debugEnabled: boolean = false) {}

  debug(message: string, meta?: unknown): void {
    if (this.debugEnabled) {
      console.debug(`[DEBUG] ${message}`, meta ? redactSensitiveData(meta) : '');
    }
  }

  info(message: string, meta?: unknown): void {
    console.info(`[INFO] ${message}`, meta ? redactSensitiveData(meta) : '');
  }

  warn(message: string, meta?: unknown): void {
    console.warn(`[WARN] ${message}`, meta ? redactSensitiveData(meta) : '');
  }

  error(message: string, meta?: unknown): void {
    console.error(`[ERROR] ${message}`, meta ? redactSensitiveData(meta) : '');
  }
}

/**
 * Create a logger instance
 */
export function createLogger(debugEnabled: boolean = false): Logger {
  return new ConsoleLogger(debugEnabled);
}
