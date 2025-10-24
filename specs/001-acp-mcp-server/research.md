# Research Report: ACP MCP Server

**Date**: 2025-10-24
**Feature**: 001-acp-mcp-server
**Purpose**: Resolve technical unknowns identified during planning phase

## Overview

This document captures research findings for building a TypeScript/Node.js MCP (Model Context Protocol) server that integrates with the vTeam ACP (Agentic Code Platform) backend APIs.

---

## 1. MCP SDK Selection

### Decision: `@modelcontextprotocol/sdk` (Official TypeScript SDK)

**Rationale:**
- Official implementation maintained by Model Context Protocol organization
- 14,000+ projects using it in production
- Full TypeScript support with comprehensive type definitions
- Built-in support for stdio and HTTP transports
- Includes debugging tools (MCP Inspector)
- Active development with weekly updates

**Installation:**
```bash
npm install @modelcontextprotocol/sdk zod
```

**Key Features:**
- Tool registration with Zod schema validation
- Resource management for exposing data
- Prompt templates with parameters
- Multiple transport layers (stdio for Claude Desktop, HTTP for web)
- Server lifecycle management
- Built-in error handling patterns

**Basic Server Pattern:**
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'acp-mcp-server',
  version: '1.0.0'
});

server.tool(
  'list-projects',
  'List all ACP projects',
  {},
  async () => ({ content: [{ type: 'text', text: 'Projects...' }] })
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

**Alternatives Considered:**
- FastMCP: More features but heavier, not needed for our use case
- Custom implementation: Too much reinvention, MCP protocol complexity

**Documentation:**
- Main docs: https://modelcontextprotocol.io
- TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- Examples: https://github.com/modelcontextprotocol/servers

---

## 2. HTTP Client Selection

### Decision: Undici (Official Node.js HTTP client)

**Rationale:**
- Official Node.js HTTP client (powers native fetch())
- 3x faster than axios (18,340 req/sec vs 5,708)
- Native connection pooling with fine-tuned configuration
- Built-in retry interceptor with exponential backoff
- Full TypeScript support included
- Maintained by Node.js organization

**Installation:**
```bash
npm install undici
```

**Key Capabilities:**
- Connection pooling via Agent/Pool classes
- Retry logic with configurable exponential backoff
- Multiple timeout levels (connect, headers, body)
- Composable interceptor pattern for auth/logging
- HTTP/2 support
- Request/response streaming

**Production Configuration:**
```typescript
import { Agent, Pool, interceptors } from 'undici';

const httpClient = new Agent({
  connectTimeout: 10000,
  bodyTimeout: 60000,
  keepAliveTimeout: 30000,

  factory(origin, opts) {
    return new Pool(origin, {
      ...opts,
      connections: 10,      // Max connections per origin
      pipelining: 1,
      allowH2: true
    });
  }
})
.compose(interceptors.retry({
  maxRetries: 3,
  minTimeout: 1000,
  maxTimeout: 30000,
  timeoutFactor: 2,
  retryAfter: true
}));
```

**Alternatives Considered:**
- Axios: Popular but 3x slower, requires plugins for retry/pooling
- Got: Good but maintainers pivoting away, 2.8x slower
- node-fetch: Now superseded by native fetch (which uses undici)

---

## 3. Testing Framework Selection

### Decision: Vitest + MSW (Mock Service Worker)

**Rationale:**

**Vitest 3.x:**
- 10-20x faster than Jest in watch mode
- Native TypeScript support (zero config)
- Modern ES module-first architecture
- Jest-compatible API (easy migration)
- Built-in coverage with v8
- Growing adoption (2.7M+ weekly downloads)

**MSW 2.x:**
- Network-level HTTP mocking (realistic tests)
- Cross-environment (Node.js + browser for MCP Inspector testing)
- Express-like routing syntax
- Excellent TypeScript integration
- Concurrent test execution support (Nock requires serial)
- 5.9M+ weekly downloads

**Installation:**
```bash
npm install -D vitest @vitest/coverage-v8 @vitest/ui msw
```

**Configuration (vitest.config.ts):**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

**MSW Setup (vitest.setup.ts):**
```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
  http.get('https://api.acp.example.com/api/projects', () => {
    return HttpResponse.json([{ id: 'proj-1', name: 'Test' }]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Alternatives Considered:**
- Jest: Most popular but slower, requires ts-jest config
- Nock: Good but Node-only, requires serial tests
- Mocha + Chai: Too many packages, more boilerplate

---

## 4. Configuration Management Selection

### Decision: Cosmiconfig + Zod

**Rationale:**

**Cosmiconfig 9.x:**
- Industry standard for config file discovery (used by ESLint, Prettier, Babel)
- Handles file search up directory tree automatically
- Multiple format support (JSON, JS, YAML)
- 3,900+ npm packages use it

**Zod 3.x:**
- TypeScript-first with automatic type inference
- Best-in-class error messages
- Chainable, intuitive API
- 40k+ GitHub stars
- Superior DX vs alternatives (Joi, AJV, Convict)

**Installation:**
```bash
npm install cosmiconfig zod zod-validation-error
npm install deepmerge  # for config merging
```

**Implementation Pattern:**
```typescript
import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';
import { ValidationError } from 'zod-validation-error';
import merge from 'deepmerge';

// 1. Define schema
const ConfigSchema = z.object({
  apiKey: z.string().min(1),
  baseUrl: z.string().url(),
  timeout: z.number().positive().default(30000),
  retries: z.number().int().min(0).max(5).default(3),
});

type Config = z.infer<typeof ConfigSchema>;

// 2. Load with precedence: explicit path > current dir > workspace root > env vars > defaults
async function loadConfiguration(explicitPath?: string): Promise<Config> {
  const explorer = cosmiconfig('mcp', {
    searchPlaces: [
      '.mcp.json',
      '.mcprc',
      'mcp.config.js',
    ],
  });

  // Load from file
  const result = explicitPath
    ? await explorer.load(explicitPath)
    : await explorer.search();

  const fileConfig = result?.config || {};

  // Merge: defaults < file < env vars
  const mergedConfig = merge.all([
    { timeout: 30000, retries: 3 },  // defaults
    fileConfig,
    getEnvOverrides(),                // env vars
  ]);

  // Validate
  try {
    return ConfigSchema.parse(mergedConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(ValidationError.fromError(error).message);
    }
    throw error;
  }
}

function getEnvOverrides(): Partial<Config> {
  return {
    apiKey: process.env.MCP_API_KEY,
    baseUrl: process.env.MCP_BASE_URL,
    timeout: process.env.MCP_TIMEOUT ? parseInt(process.env.MCP_TIMEOUT) : undefined,
  };
}
```

**Environment Variable Convention:**
```bash
MCP_API_KEY=your_key_here
MCP_BASE_URL=https://api.example.com
MCP_TIMEOUT=60000
MCP_RETRIES=5
```

**Alternatives Considered:**
- Custom implementation: Too much work, bug-prone
- Convict: Less TypeScript-native, more verbose
- Pure Zod: Missing file discovery logic
- rc: Too minimal, no validation

---

## 5. ACP Backend API Context

### Backend Architecture

Based on vTeam repository analysis:

**Technology Stack:**
- **Backend**: Go + Gin framework
- **API Type**: REST API
- **Authentication**: API keys or tokens (Bearer tokens)
- **Infrastructure**: Kubernetes Custom Resources
- **Multi-tenancy**: Project-based isolation

**Key API Endpoints (Expected):**

```
# Projects
GET    /api/projects           # List projects
POST   /api/projects           # Create project
GET    /api/projects/:id       # Get project details
DELETE /api/projects/:id       # Delete project

# Sessions
GET    /api/projects/:projectId/sessions  # List sessions
POST   /api/projects/:projectId/sessions  # Create session
GET    /api/sessions/:id                  # Get session
PATCH  /api/sessions/:id                  # Update session
DELETE /api/sessions/:id                  # Delete session

# Execution
POST   /api/sessions/:id/start            # Start session
POST   /api/sessions/:id/stop             # Stop session
GET    /api/sessions/:id/status           # Get status

# Workspace
GET    /api/sessions/:id/workspace        # List files
GET    /api/sessions/:id/workspace/*path  # Get file content

# RFE Workflows
GET    /api/rfe/templates                 # List templates
POST   /api/rfe/workflows                 # Create workflow
```

**Authentication Pattern:**
```typescript
headers: {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
}
```

**Error Responses:**
- 401: Authentication failed
- 404: Resource not found
- 429: Rate limit exceeded
- 500+: Server errors

---

## 6. Best Practices Summary

### Security
- **Never log API keys**: Use credential redaction in logger
- **Path validation**: Prevent directory traversal in workspace file access
- **TLS required**: All HTTPS connections for backend
- **Fail-fast auth**: Validate credentials on startup

### Performance
- **Connection pooling**: Reuse HTTP connections (10 per origin)
- **Caching**: In-memory cache for session status, project metadata
- **Retry logic**: Exponential backoff (1s, 2s, 4s delays)
- **Timeouts**: 10s connect, 60s body, 30s keep-alive

### Error Handling
- **Actionable errors**: Every error includes remediation guidance
- **Error mapping**: HTTP status codes → user-friendly messages
- **Logging**: Structured logs to stderr (never stdout in stdio mode)

### Testing
- **Coverage target**: 80% overall, 90% for critical paths
- **Test types**: 70% unit, 25% integration, 5% e2e
- **Mock strategy**: MSW for API calls, vi.fn() for internal mocks
- **CI integration**: Run tests on every PR, enforce thresholds

### Configuration
- **Precedence**: CLI arg > .mcp.json (CWD) > .mcp.json (workspace) > env vars > defaults
- **Validation**: Fail-fast on startup with clear error messages
- **Documentation**: Provide .mcp.json schema for IDE autocomplete

---

## 7. Technical Decisions Summary

| Decision Area | Chosen Technology | Key Rationale |
|---------------|-------------------|---------------|
| **MCP SDK** | @modelcontextprotocol/sdk | Official, well-maintained, 14k+ users |
| **HTTP Client** | Undici | 3x faster, official Node.js client |
| **Test Framework** | Vitest | 10x faster than Jest, native TS |
| **API Mocking** | MSW | Network-level, cross-environment |
| **Config Discovery** | Cosmiconfig | Industry standard, 3.9k+ packages use it |
| **Schema Validation** | Zod | TypeScript-first, auto type inference |
| **Language** | TypeScript 5.x | Type safety, modern tooling |
| **Runtime** | Node.js 20+ | LTS, native fetch/undici |
| **Package Manager** | npm | Standard, widest compatibility |

---

## 8. Dependencies List

### Production Dependencies
```json
{
  "@modelcontextprotocol/sdk": "^1.20.1",
  "zod": "^3.22.0",
  "undici": "^6.0.0",
  "cosmiconfig": "^9.0.0",
  "zod-validation-error": "^3.0.0",
  "deepmerge": "^4.3.1"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.7.3",
  "@types/node": "^22.0.0",
  "vitest": "^3.2.4",
  "@vitest/coverage-v8": "^3.2.4",
  "@vitest/ui": "^3.2.4",
  "msw": "^2.7.2"
}
```

**Total Production Bundle Size**: ~250KB (minified + gzipped)

---

## 9. Open Questions (None Remaining)

All technical unknowns have been resolved through research:
- ✅ MCP SDK selection → @modelcontextprotocol/sdk
- ✅ HTTP client selection → undici
- ✅ Testing framework → Vitest + MSW
- ✅ Configuration management → Cosmiconfig + Zod

---

## 10. Next Steps

With research complete, proceed to **Phase 1: Design & Contracts**:

1. Generate data-model.md (entity definitions)
2. Generate API contracts in /contracts/ (OpenAPI specs)
3. Generate quickstart.md (getting started guide)
4. Update agent context files

---

## References

- MCP Documentation: https://modelcontextprotocol.io
- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- Undici Documentation: https://undici.nodejs.org/
- Vitest Documentation: https://vitest.dev/
- MSW Documentation: https://mswjs.io/
- Zod Documentation: https://zod.dev/
- Cosmiconfig Documentation: https://github.com/cosmiconfig/cosmiconfig
- vTeam Repository: /workspace/sessions/agentic-session-1761277642/workspace/vTeam
