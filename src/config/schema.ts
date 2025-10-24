/**
 * Configuration schema validation using Zod
 */
import { z } from 'zod';

export const configSchema = z.object({
  apiKey: z
    .string()
    .min(32, 'API key must be at least 32 characters')
    .describe('ACP API authentication key'),

  baseUrl: z
    .string()
    .url('Base URL must be a valid URL')
    .refine((url) => url.startsWith('https://'), {
      message: 'Base URL must use HTTPS protocol',
    })
    .describe('ACP backend base URL'),

  timeout: z
    .number()
    .int()
    .min(1000, 'Timeout must be at least 1000ms (1 second)')
    .max(120000, 'Timeout must not exceed 120000ms (2 minutes)')
    .default(30000)
    .optional()
    .describe('Request timeout in milliseconds'),

  retries: z
    .number()
    .int()
    .min(0, 'Retries must be non-negative')
    .max(5, 'Retries must not exceed 5')
    .default(3)
    .optional()
    .describe('Maximum retry attempts'),

  cacheTTL: z
    .number()
    .int()
    .min(0, 'Cache TTL must be non-negative')
    .max(600000, 'Cache TTL must not exceed 600000ms (10 minutes)')
    .default(60000)
    .optional()
    .describe('Cache TTL in milliseconds (0 to disable)'),

  rateLimitPerMinute: z
    .number()
    .int()
    .min(1, 'Rate limit must be at least 1 request per minute')
    .max(1000, 'Rate limit must not exceed 1000 requests per minute')
    .default(60)
    .optional()
    .describe('Maximum requests per minute'),

  debug: z
    .boolean()
    .default(false)
    .optional()
    .describe('Enable debug logging'),
});

export type ConfigSchema = z.infer<typeof configSchema>;
