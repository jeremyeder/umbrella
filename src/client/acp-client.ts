/**
 * HTTP client wrapper with connection pooling for ACP backend
 */
import { request, Pool } from 'undici';
import type { Dispatcher } from 'undici';
import { AuthProvider } from '../auth/provider.js';
import { Cache, createCacheKey } from './cache.js';
import { withRetry } from './retry.js';
import { mapHttpError, handleFetchError } from '../errors/handler.js';
import { createLogger, type Logger } from '../utils/logger.js';
import type { HTTPClientOptions, RequestOptions } from './types.js';

export class ACPClient {
  private authProvider: AuthProvider;
  private cache: Cache<unknown>;
  private pool: Pool;
  private logger: Logger;
  private options: HTTPClientOptions;

  constructor(options: HTTPClientOptions) {
    this.options = options;
    this.logger = createLogger(options.debug);

    // Initialize auth provider
    this.authProvider = new AuthProvider({
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
    });

    // Initialize cache
    this.cache = new Cache(options.cacheTTL);

    // Initialize connection pool
    this.pool = new Pool(options.baseUrl, {
      connections: 10, // 10 connections per origin
      keepAliveTimeout: 30000, // 30 seconds
      keepAliveMaxTimeout: 60000, // 60 seconds
    });

    this.logger.info('ACP Client initialized', {
      baseUrl: options.baseUrl,
      timeout: options.timeout,
      maxRetries: options.maxRetries,
      cacheTTL: options.cacheTTL,
    });
  }

  /**
   * Make an HTTP request to the ACP backend
   */
  async request<T>(requestOptions: RequestOptions): Promise<T> {
    const { method, path, body, skipCache = false } = requestOptions;
    const url = `${this.options.baseUrl}${path}`;

    // Check cache for GET requests
    if (method === 'GET' && !skipCache) {
      const cacheKey = createCacheKey('request', method, path);
      const cached = this.cache.get(cacheKey);

      if (cached !== undefined) {
        this.logger.debug(`Cache hit for ${method} ${path}`);
        return cached as T;
      }
    }

    // Make request with retry logic
    const response = await withRetry(
      () => this.makeRequest(url, method, body),
      {
        maxRetries: this.options.maxRetries,
        baseDelay: 1000, // 1 second
        maxDelay: 4000, // 4 seconds max
        logger: this.logger,
      }
    );

    // Cache GET responses
    if (method === 'GET' && !skipCache) {
      const cacheKey = createCacheKey('request', method, path);
      this.cache.set(cacheKey, response);
      this.logger.debug(`Cached response for ${method} ${path}`);
    }

    return response as T;
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest(
    url: string,
    method: string,
    body?: unknown
  ): Promise<unknown> {
    try {
      this.logger.debug(`Making ${method} request to ${url}`, { body });

      const requestOptions: Dispatcher.RequestOptions = {
        method,
        path: new URL(url).pathname,
        headers: {
          'Authorization': this.authProvider.getAuthHeader(),
          'Content-Type': 'application/json',
          'User-Agent': 'acp-mcp-server/0.1.0',
        },
        bodyTimeout: this.options.timeout,
        headersTimeout: this.options.timeout,
      };

      if (body) {
        requestOptions.body = JSON.stringify(body);
      }

      const { statusCode, body: responseBody } = await request(url, requestOptions);

      // Read response body
      const responseText = await responseBody.text();

      this.logger.debug(`Response ${statusCode} from ${url}`);

      // Handle error status codes
      if (statusCode >= 400) {
        let errorMessage = responseText;
        let errorDetails: unknown;

        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || responseText;
          errorDetails = errorJson;
        } catch {
          // Response is not JSON, use as-is
        }

        throw mapHttpError(statusCode, errorMessage, errorDetails);
      }

      // Parse successful response
      if (!responseText) {
        return {};
      }

      try {
        return JSON.parse(responseText);
      } catch {
        // Response is not JSON, return as text
        return { data: responseText };
      }
    } catch (error) {
      throw handleFetchError(error);
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidateCache(pattern: RegExp): void {
    this.cache.deletePattern(pattern);
    this.logger.debug('Cache invalidated', { pattern: pattern.source });
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return this.cache.stats();
  }

  /**
   * Close the client and cleanup resources
   */
  async close(): Promise<void> {
    await this.pool.close();
    this.cache.clear();
    this.logger.info('ACP Client closed');
  }
}
