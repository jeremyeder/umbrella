/**
 * Configuration loader with precedence:
 * 1. Environment variables (highest priority)
 * 2. Config file (.mcp.json, .mcp.yaml, etc.)
 * 3. Package.json mcp field
 * 4. Defaults (lowest priority)
 */
import { cosmiconfig } from 'cosmiconfig';
import deepmerge from 'deepmerge';
import { fromZodError } from 'zod-validation-error';
import { configSchema } from './schema.js';
import type { ACPConfig, ResolvedACPConfig } from './types.js';

const MODULE_NAME = 'mcp';

/**
 * Load configuration from environment variables
 */
function loadFromEnv(): Partial<ACPConfig> {
  const envConfig: Partial<ACPConfig> = {};

  if (process.env.MCP_API_KEY) {
    envConfig.apiKey = process.env.MCP_API_KEY;
  }

  if (process.env.MCP_BASE_URL) {
    envConfig.baseUrl = process.env.MCP_BASE_URL;
  }

  if (process.env.MCP_TIMEOUT) {
    envConfig.timeout = parseInt(process.env.MCP_TIMEOUT, 10);
  }

  if (process.env.MCP_RETRIES) {
    envConfig.retries = parseInt(process.env.MCP_RETRIES, 10);
  }

  if (process.env.MCP_CACHE_TTL) {
    envConfig.cacheTTL = parseInt(process.env.MCP_CACHE_TTL, 10);
  }

  if (process.env.MCP_RATE_LIMIT_PER_MINUTE) {
    envConfig.rateLimitPerMinute = parseInt(process.env.MCP_RATE_LIMIT_PER_MINUTE, 10);
  }

  if (process.env.MCP_DEBUG) {
    envConfig.debug = process.env.MCP_DEBUG === 'true';
  }

  return envConfig;
}

/**
 * Load configuration from file using cosmiconfig
 */
async function loadFromFile(searchFrom?: string): Promise<Partial<ACPConfig>> {
  const explorer = cosmiconfig(MODULE_NAME);

  try {
    const result = searchFrom
      ? await explorer.search(searchFrom)
      : await explorer.search();

    return result?.config ?? {};
  } catch (error) {
    // If config file exists but is invalid, throw error
    if (error instanceof Error) {
      throw new Error(`Failed to load configuration file: ${error.message}`);
    }
    return {};
  }
}

/**
 * Load and validate configuration with precedence
 */
export async function loadConfig(searchFrom?: string): Promise<ResolvedACPConfig> {
  // Load from different sources
  const fileConfig = await loadFromFile(searchFrom);
  const envConfig = loadFromEnv();

  // Merge with precedence: env > file > defaults
  const mergedConfig = deepmerge.all([
    fileConfig,
    envConfig,
  ]) as ACPConfig;

  // Validate merged configuration
  const parseResult = configSchema.safeParse(mergedConfig);

  if (!parseResult.success) {
    const validationError = fromZodError(parseResult.error as any);
    throw new Error(`Configuration validation failed:\n${validationError.message}`);
  }

  return parseResult.data as ResolvedACPConfig;
}

/**
 * Synchronous version for testing
 */
export function loadConfigSync(config: ACPConfig): ResolvedACPConfig {
  const parseResult = configSchema.safeParse(config);

  if (!parseResult.success) {
    const validationError = fromZodError(parseResult.error as any);
    throw new Error(`Configuration validation failed:\n${validationError.message}`);
  }

  return parseResult.data as ResolvedACPConfig;
}
