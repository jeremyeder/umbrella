/**
 * Configuration type definitions for ACP MCP Server
 */

export interface ACPConfig {
  /** ACP API authentication key */
  apiKey: string;

  /** ACP backend base URL */
  baseUrl: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Maximum retry attempts (default: 3) */
  retries?: number;

  /** Cache TTL in milliseconds (default: 60000) */
  cacheTTL?: number;

  /** Maximum requests per minute (default: 60) */
  rateLimitPerMinute?: number;

  /** Enable debug logging (default: false) */
  debug?: boolean;
}

export interface ResolvedACPConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retries: number;
  cacheTTL: number;
  rateLimitPerMinute: number;
  debug: boolean;
}
