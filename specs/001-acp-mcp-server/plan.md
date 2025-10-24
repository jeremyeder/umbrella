# Implementation Plan: ACP MCP Server

**Branch**: `001-acp-mcp-server` | **Date**: 2025-10-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-acp-mcp-server/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an MCP (Model Context Protocol) server that exposes the vTeam ACP (Agentic Code Platform) APIs to Claude Desktop and Claude Code, enabling developers to create and manage ACP projects, sessions, and workflows through natural language commands without leaving their AI assistant interface. The server will implement authentication, comprehensive error handling, and provide a seamless integration between Claude interfaces and the Kubernetes-native ACP backend.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20+
**Primary Dependencies**: @modelcontextprotocol/sdk (official MCP SDK), undici (HTTP client), cosmiconfig + zod (configuration management)
**Storage**: File-based configuration (.mcp.json), in-memory caching (session status, project metadata)
**Testing**: Vitest (unit/integration tests), MSW (HTTP mocking), v8 coverage provider
**Target Platform**: Cross-platform (macOS, Linux, Windows) as Node.js CLI application
**Project Type**: Single project (CLI/server application)
**Performance Goals**: <100ms P95 for cached operations, <2s P95 for ACP API calls, handle 100 concurrent tool invocations
**Constraints**: <200ms P95 for local operations, connection pooling required, exponential backoff for retries, zero API keys in logs
**Scale/Scope**: 16+ MCP tools (project/session/workspace/RFE management), ~15-20 API endpoints, comprehensive error handling patterns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Design Principles

**✓ MCP Standard Compliance**: Server must follow MCP protocol specification exactly
  - All tools follow standard MCP tool schema
  - Error responses use MCP error format
  - Server lifecycle follows MCP initialization/shutdown patterns

**✓ Fail-Fast Configuration**: Invalid configuration must prevent server startup
  - Schema validation on startup
  - Clear error messages with remediation steps
  - Configuration precedence documented and tested

**✓ Comprehensive Error Handling**: Every failure mode must have clear user guidance
  - HTTP 401/404/429/500+ mapped to actionable errors
  - Network failures include retry guidance
  - Path validation prevents security vulnerabilities

**✓ Zero Secrets in Logs**: API keys and tokens never appear in output
  - Automatic redaction in logging
  - Security audit must pass with 100% effectiveness
  - Test coverage for credential handling

**✓ Testability**: All components independently testable
  - Mock ACP backend for integration tests
  - Unit tests for each tool
  - Contract tests for API mapping

**Status**: ✓ PASS - No violations. All requirements align with standard MCP server patterns.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── index.ts                # MCP server entry point
├── server.ts               # MCP server initialization & lifecycle
├── config/
│   ├── schema.ts           # Configuration schema validation
│   ├── loader.ts           # Configuration loading with precedence
│   └── types.ts            # Configuration type definitions
├── tools/
│   ├── index.ts            # Tool registration
│   ├── projects.ts         # Project management tools (list, create, get, delete)
│   ├── sessions.ts         # Session management tools (list, create, get, update, delete)
│   ├── execution.ts        # Session execution tools (start, stop, status)
│   ├── workspace.ts        # Workspace access tools (list files, get file)
│   └── rfe.ts              # RFE workflow tools (list templates, create workflow)
├── client/
│   ├── acp-client.ts       # HTTP client for ACP backend API
│   ├── retry.ts            # Exponential backoff retry logic
│   ├── cache.ts            # In-memory caching layer
│   └── types.ts            # ACP API request/response types
├── auth/
│   ├── provider.ts         # Authentication credential management
│   └── validator.ts        # Credential validation
├── errors/
│   ├── handler.ts          # Error mapping & formatting
│   └── types.ts            # Custom error classes
└── utils/
    ├── logger.ts           # Logging with credential redaction
    └── path-validator.ts   # Workspace path security validation

tests/
├── unit/
│   ├── config/             # Configuration tests
│   ├── tools/              # Tool logic tests
│   ├── client/             # Client logic tests
│   └── utils/              # Utility tests
├── integration/
│   ├── mock-acp-server.ts  # Mock ACP backend for testing
│   └── tool-workflows.test.ts  # End-to-end tool testing
└── contract/
    └── acp-api.test.ts     # API contract validation
```

**Structure Decision**: Single project structure with TypeScript. Organized by technical concerns (tools, client, config) rather than by feature, which matches MCP server patterns where tools are the primary interface. The separation of concerns enables independent testing and clear responsibilities.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations** - All design decisions align with standard MCP server architecture patterns.

---

## Phase 0: Research (✓ Complete)

All technical unknowns have been resolved. See [research.md](./research.md) for detailed findings.

**Key Decisions:**
- **MCP SDK**: @modelcontextprotocol/sdk (official TypeScript SDK)
- **HTTP Client**: Undici (official Node.js client, 3x faster than alternatives)
- **Testing**: Vitest + MSW (10x faster than Jest, network-level mocking)
- **Configuration**: Cosmiconfig + Zod (industry standard + TypeScript-first validation)

**Documentation Generated:**
- ✅ `research.md` - Complete research findings with rationale

---

## Phase 1: Design & Contracts (✓ Complete)

All design artifacts have been generated based on feature requirements and research findings.

**Data Model:**
- 8 core entities defined with fields, validation, and relationships
- State transition diagrams for Project, Session, RFEWorkflow
- Caching strategy defined (TTLs: 10s-300s based on entity)
- Error code taxonomy (11 codes covering all failure modes)

**API Contracts:**
- 16 MCP tools fully specified with parameters and responses
- ACP backend REST API contract documented (~18 endpoints)
- Retry strategy defined (exponential backoff: 1s, 2s, 4s)
- Rate limiting patterns (60 req/min default)

**Getting Started Guide:**
- Complete quickstart walkthrough (< 10 minute setup)
- Example workflows (code analysis, RFE, team collaboration)
- Troubleshooting guide with common issues
- Configuration reference with all options

**Documentation Generated:**
- ✅ `data-model.md` - Entity definitions with validation rules
- ✅ `contracts/mcp-tools.md` - MCP tool specifications
- ✅ `contracts/acp-backend-api.md` - Backend API contract
- ✅ `quickstart.md` - User onboarding guide

---

## Agent Context Updates (✓ Complete)

Agent context files updated with current technology stack:
- **Language**: TypeScript 5.x / Node.js 20+
- **Frameworks**: @modelcontextprotocol/sdk, undici, cosmiconfig, zod
- **Storage**: File-based config, in-memory caching
- **Testing**: Vitest, MSW, v8 coverage

**Files Updated:**
- ✅ `CLAUDE.md` - Claude Code agent context

---

## Phase 2: Task Generation (Pending)

Task generation will be handled by the `/speckit.tasks` command (separate workflow).

**Expected Output:**
- `tasks.md` - Dependency-ordered implementation tasks

---

## Implementation Readiness Summary

### Documentation Status

| Artifact | Status | Purpose |
|----------|--------|---------|
| spec.md | ✅ Complete | Feature requirements (user stories, acceptance criteria) |
| plan.md | ✅ Complete | This file - implementation plan |
| research.md | ✅ Complete | Technology decisions with rationale |
| data-model.md | ✅ Complete | Entity definitions and validation |
| contracts/mcp-tools.md | ✅ Complete | MCP tool contracts (16 tools) |
| contracts/acp-backend-api.md | ✅ Complete | Backend REST API integration |
| quickstart.md | ✅ Complete | User getting started guide |
| tasks.md | ⏳ Pending | Implementation tasks (use /speckit.tasks) |

### Design Decisions Locked

All major technical decisions finalized:
- ✅ Technology stack selected and justified
- ✅ Architecture patterns defined (single project, tool-based organization)
- ✅ API contracts specified (input/output schemas)
- ✅ Error handling patterns documented
- ✅ Performance targets set (<100ms cached, <2s API calls)
- ✅ Security requirements defined (path validation, credential redaction)
- ✅ Testing strategy established (80% coverage, Vitest + MSW)

### Ready for Implementation

**All prerequisites met:**
1. ✅ Requirements clearly defined in spec.md
2. ✅ Technical unknowns resolved via research
3. ✅ Data model designed and validated
4. ✅ API contracts specified (MCP tools + backend integration)
5. ✅ Agent context updated with tech stack
6. ✅ Quickstart guide written for end users

**Next Steps:**
1. Run `/speckit.tasks` to generate dependency-ordered task list
2. Begin implementation following task order
3. Use quickstart.md to validate user experience
4. Reference contracts/ for API implementation details

---

## Success Criteria Review

Based on spec.md success criteria, the plan supports:

- **SC-001**: First tool invocation < 10 minutes ✓ (quickstart guide)
- **SC-002**: Create project/session < 30 seconds ✓ (performance targets)
- **SC-003**: Cached operations < 100ms P95 ✓ (caching strategy defined)
- **SC-004**: API calls < 2s P95 ✓ (timeout configuration)
- **SC-005**: 95% installation success ✓ (fail-fast config validation)
- **SC-009**: Zero API keys in logs ✓ (redaction in logger design)
- **SC-010**: 100 concurrent requests ✓ (undici connection pooling)
- **SC-011**: Auth errors self-service 90% ✓ (actionable error messages)
- **SC-012**: 100% path traversal blocking ✓ (path validator design)

---

## Risk Assessment

**Low Risk**:
- Technology choices are proven and widely adopted
- MCP SDK is official and well-documented
- Architecture is straightforward (no complex patterns)
- All dependencies have active maintenance

**Mitigation Strategies**:
- Comprehensive testing (80% coverage target)
- Integration tests with mock ACP backend (MSW)
- Configuration validation prevents runtime issues
- Clear error messages reduce support burden

---

## Estimated Effort

**Implementation Phases:**

| Phase | Estimated Effort | Key Deliverables |
|-------|------------------|------------------|
| **Setup** | 0.5 days | Project scaffolding, dependencies, tsconfig |
| **Config Layer** | 1 day | Cosmiconfig + Zod validation, precedence logic |
| **HTTP Client** | 1 day | Undici wrapper, retry logic, caching |
| **MCP Tools** | 3 days | 16 tools implementation (projects, sessions, workspace, RFE) |
| **Error Handling** | 0.5 days | Error mapper, actionable messages |
| **Testing** | 2 days | Unit tests (80% coverage), integration tests, contract tests |
| **Documentation** | 0.5 days | API docs, inline comments, README |
| **Polish** | 0.5 days | Logging, performance tuning, final testing |

**Total Estimated Effort**: 9 days (1 developer)

**Assumptions**:
- ACP backend API stable and documented
- No major scope changes during implementation
- Developer familiar with TypeScript and MCP concepts

---

## Related Documents

- **Feature Specification**: [spec.md](./spec.md) - User stories and requirements
- **Research Findings**: [research.md](./research.md) - Technology decisions
- **Data Model**: [data-model.md](./data-model.md) - Entity definitions
- **MCP Tools Contract**: [contracts/mcp-tools.md](./contracts/mcp-tools.md) - Tool specifications
- **Backend API Contract**: [contracts/acp-backend-api.md](./contracts/acp-backend-api.md) - REST API integration
- **Quickstart Guide**: [quickstart.md](./quickstart.md) - User onboarding

---

**Plan Status**: ✅ **COMPLETE** - Ready for task generation via `/speckit.tasks`
**Branch**: `001-acp-mcp-server`
**Last Updated**: 2025-10-24
