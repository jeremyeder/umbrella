# ACP MCP Server - Standardized AI Assistant Integration

**Feature Overview:**

The ACP MCP Server transforms how developers interact with AI-powered development workflows by providing a standardized, protocol-based integration between Claude Desktop/Claude Code and the Ambient Code Platform (ACP). Instead of context-switching between tools or manually managing complex workflows, developers get direct, in-editor access to intelligent agentic sessions, multi-agent collaboration, and RFE workflow automation—all through the Model Context Protocol's emerging industry standard.

This feature addresses critical pain points in AI-assisted development: context switching fatigue, manual workflow orchestration, and integration complexity. By embedding ACP's powerful multi-agent capabilities directly into developers' preferred AI interfaces, we reduce the time from "I need AI help with this codebase" to "AI agents are working on my problem" from minutes to seconds.

**Goals:**

**High-Level Objectives:**

1. **Democratize Access to AI Automation**: Make vTeam's enterprise-grade AI orchestration capabilities accessible to individual developers through their preferred AI interface (Claude Desktop/Claude Code), eliminating the need to learn and navigate separate web UIs.

2. **Establish Protocol Leadership**: Position ACP as a leader in adopting the Model Context Protocol (MCP), demonstrating commitment to open standards and future-proofing integrations as the AI ecosystem evolves.

3. **Reduce Time-to-Value**: Decrease the time from initial interest to productive use from minutes (current web UI flow) to seconds (MCP natural language commands).

4. **Enable New Workflow Patterns**: Unlock use cases that weren't feasible with web UI-only access, such as continuous development assistance, team collaboration on AI-generated artifacts, and seamless integration with existing development tools.

**Who Benefits:**

| Persona | Current State Pain | Future State Gain |
|---------|-------------------|-------------------|
| **Individual Developers** | Must learn and navigate vTeam web UI, manage sessions manually across multiple interfaces | Natural language commands in Claude Desktop to spawn agentic sessions, monitor progress, and retrieve results inline |
| **Platform Teams** | Supporting multiple integration points, custom scripts, and proprietary API endpoints | Single standardized protocol, reduced support burden, leveraging industry-standard tooling |
| **Engineering Managers** | Limited visibility into AI tool adoption, usage patterns, and ROI measurement | Standardized metrics across MCP-enabled tools, clear adoption tracking, productivity insights |
| **Open Source Contributors** | High barrier to experimenting with vTeam capabilities, complex setup requirements | `pip install` + `.mcp.json` configuration = immediate access, lower adoption friction |

**Difference Between Current State and Future State:**

- **Current**: Developer → Opens browser → Logs into vTeam → Creates project → Configures session → Monitors in UI → Downloads results → Returns to IDE (8 steps, ~5 minutes)
- **Future**: Developer → Types in Claude Desktop: "@vteam analyze security for PR #423" → Gets real-time progress → Results appear inline (2 steps, ~30 seconds)

**Success Metrics:**
- **Adoption**: 40% of vTeam sessions initiated via MCP within 3 months of launch
- **Time-to-First-Session**: <60 seconds from MCP server installation to first successful agentic session
- **Developer Satisfaction**: NPS score 50+ among MCP users (baseline: 32 for web UI users)
- **Market Differentiation**: Featured in Anthropic's MCP showcase, 3+ community blog posts

**Out of Scope:**

The following items are explicitly out of scope for v1.0 to maintain focused delivery and manageable complexity:

* **Direct Kubernetes API interactions** - The MCP server will interact with ACP through existing REST APIs, not directly with Kubernetes resources
* **Complex authentication mechanisms in v1** - Initial release supports API key/token-based authentication; OAuth2, SSO, and pluggable authentication are deferred to v2.0
* **Performance optimization beyond initial implementation** - Advanced caching, connection pooling, and request batching are post-MVP enhancements
* **Multi-tenant/Multi-project support** - v1 assumes single-project/single-namespace operation; enterprise multi-tenancy deferred to v1.1
* **Webhook/Event subscriptions** - Real-time notifications from ACP to MCP clients require WebSocket support (stretch goal for v2.0)
* **Bulk operations** - Batch creation, mass deletion, and transaction semantics for multiple resources deferred to v1.1
* **Advanced error recovery** - Automatic retry logic, circuit breakers, and sophisticated failure handling deferred until failure modes are understood in production
* **Session migration/export** - Moving sessions between projects or exporting session history in standardized formats deferred to v2.0
* **Resource quota management** - Enforcing limits on projects/sessions per user requires backend API changes (future work)

**Requirements:**

**MVP Requirements (Must-Have for v1.0 Launch):**

1. **Core Tool Implementation** (MVP)
   - Implement 16 MCP tools across 4 categories:
     - **Projects Tools** (4): list_projects, create_project, get_project_details, delete_project
     - **Sessions Tools** (5): list_sessions, create_session, get_session_details, update_session, delete_session
     - **Execution Tools** (5): start_session, stop_session, get_session_status, list_workspace_contents, get_workspace_file
     - **RFE Workflow Tools** (2): list_rfe_workflows, create_rfe_workflow

2. **FastMCP Framework Integration** (MVP)
   - Build on FastMCP v2.12.5 framework
   - Implement async HTTP client using httpx
   - Pydantic models for all request/response types
   - 100% type hints coverage with mypy strict mode

3. **Configuration Management** (MVP)
   - Support `.mcp.json` configuration file discovery
   - Environment variable overrides (MCP_CONFIG_PATH, ACP_API_KEY, ACP_BASE_URL)
   - Secure credential handling (no secrets in logs, API key redaction)
   - Configuration validation on startup

4. **Error Handling & Reliability** (MVP)
   - Layered exception hierarchy (ACPError, ACPAuthenticationError, ACPNetworkError, etc.)
   - HTTP status code to domain exception mapping
   - Comprehensive error messages with actionable guidance
   - Connection management with timeouts and retry logic

5. **Testing Infrastructure** (MVP)
   - >80% test coverage (unit + integration)
   - Mock-based unit tests for all 16 tools
   - Integration tests for 3-5 critical paths (create project → create session → get logs)
   - Type checking with mypy, formatting with Black, import sorting with isort

6. **Docker Deployment** (MVP)
   - Multi-stage Dockerfile for optimized image size
   - Quay.io registry deployment
   - Kubernetes/OpenShift compatible manifests
   - Health check endpoint

7. **Core Documentation** (MVP)
   - README with quick start (<5 minute installation)
   - Complete tool reference (all 16 tools documented)
   - Configuration guide (.mcp.json schema + environment variables)
   - Integration guide for Claude Desktop
   - Troubleshooting guide (top 10 common issues)

**Post-MVP Requirements (v1.1 or Later):**

8. **Claude Code Integration Documentation** (v1.1)
   - Step-by-step integration guide for Claude Code
   - Multi-repo workspace setup patterns
   - Permission model documentation

9. **Advanced Logging & Observability** (v1.1)
   - Structured logging with context propagation
   - OpenTelemetry integration
   - Metrics exporters for Prometheus/Grafana

10. **WebSocket Support** (v2.0)
    - Real-time session status updates
    - Event-driven notifications for session completion
    - Streaming log output

11. **Pluggable Authentication** (v2.0)
    - OAuth2/SSO support
    - API key rotation mechanisms
    - Service account management

12. **Performance Optimizations** (v1.1)
    - Response caching with configurable TTL
    - Connection pooling (max 10 concurrent connections)
    - Request batching for bulk operations

**Done - Acceptance Criteria:**

**Functional Acceptance:**

- [ ] All 16 tools are implemented and respond correctly to valid inputs
- [ ] All tools return consistent response schema (success: true/false, data/error, message)
- [ ] Pydantic models validate all inputs and reject invalid data with clear error messages
- [ ] Configuration can be loaded from `.mcp.json`, environment variables, or combination (with correct precedence)
- [ ] Authentication with ACP backend succeeds using provided API key
- [ ] Session lifecycle works end-to-end: create project → create session → start execution → monitor status → retrieve results
- [ ] Workspace file operations (list_workspace_contents, get_workspace_file) correctly handle paths and prevent directory traversal attacks
- [ ] RFE workflow tools integrate with existing vTeam RFE workflow system

**Technical Acceptance:**

- [ ] All code passes `mypy --strict` type checking with zero errors
- [ ] Test suite passes with >80% coverage (measured by pytest-cov)
- [ ] All code formatted with Black and isort with zero violations
- [ ] Docker image builds successfully and runs without errors
- [ ] Integration tests pass against local vTeam deployment
- [ ] HTTP client implements connection pooling, timeout configuration, and exponential backoff retries
- [ ] Rate limiting implemented (100 calls/minute default, configurable)
- [ ] All API keys redacted in logs (no secrets exposed)
- [ ] Error handling covers all HTTP status codes (401, 404, 429, 500, etc.)

**Performance Acceptance:**

- [ ] Tool response time <100ms for cached status checks (P95)
- [ ] Tool response time <2s for API calls to ACP backend (P95)
- [ ] Connection establishment time <500ms (P95)
- [ ] No memory leaks during continuous operation (24-hour soak test)

**Documentation Acceptance:**

- [ ] README clearly explains what the MCP server is and why users should care
- [ ] Quick start guide verified: 3 independent users install and execute first tool in <10 minutes
- [ ] All 16 tools documented with: purpose, parameters (required/optional), return values, examples, error scenarios
- [ ] Configuration reference includes complete `.mcp.json` schema with annotated examples
- [ ] Troubleshooting guide tested: top 5 reported issues during beta have documented solutions
- [ ] Integration guide for Claude Desktop tested on macOS, Linux, and Windows
- [ ] All documentation examples are runnable and tested (no copy-paste errors)

**Security Acceptance:**

- [ ] API key validation on startup (fail fast if invalid)
- [ ] No API keys or tokens logged (automated scan for secret patterns)
- [ ] Path traversal prevention tested (cannot access files outside workspace)
- [ ] Input validation prevents injection attacks (SQL, command injection, etc.)
- [ ] TLS verification enabled for all HTTPS connections (no warnings)
- [ ] Dependency scan shows no known vulnerabilities (Snyk or equivalent)

**Deployment Acceptance:**

- [ ] Docker image published to Quay.io registry with versioned tags
- [ ] Kubernetes manifests validated (deployment, service, configmap, secret)
- [ ] Deployment runbook tested (smoke tests pass after deployment)
- [ ] Rollback procedure documented and tested
- [ ] Health check endpoint responds correctly (liveness and readiness probes)

**Use Cases - i.e. User Experience & Workflow:**

### Use Case 1: In-Editor Code Analysis

**Actor:** Sarah, Senior Developer
**Goal:** Comprehensive security analysis of a pull request before approval
**Precondition:** Sarah has Claude Desktop with ACP MCP Server configured

**Main Success Scenario:**

1. Sarah opens Claude Desktop while reviewing PR #423
2. Sarah types: "@vteam analyze security for PR #423 in myorg/myrepo"
3. MCP server creates ACP session with security analysis prompt
4. Sarah receives session_id and status: "Analysis in progress (phase: code-scanning)"
5. Sarah polls status every 10 seconds: "@vteam get session status [session_id]"
6. After 2 minutes, status changes to "completed" with findings summary
7. Sarah types: "@vteam get workspace file [session_id] analysis-report.md"
8. Security findings appear inline with severity, location, and remediation guidance
9. Sarah copies findings into PR comments with one-click action

**Alternative Flow: Session Takes Longer Than Expected**

4a. After 5 minutes, Sarah checks status and sees: "Analysis in progress (phase: dependency-check, 60% complete)"
4b. Sarah continues other work, checks back later
4c. When complete, results are still available for retrieval

**Business Impact:** 10x faster security reviews (30 seconds vs 5 minutes), increased PR review compliance due to reduced friction

---

### Use Case 2: Multi-Agent RFE Workflow Automation

**Actor:** Alex, Product Engineer
**Goal:** Create comprehensive requirements document with input from specialized AI agents
**Precondition:** Alex has Claude Code with ACP MCP Server integrated

**Main Success Scenario:**

1. Alex is planning a new feature: real-time notification system
2. In Claude Code, Alex types: "@vteam start RFE workflow for feature: real-time notifications"
3. MCP server creates RFE workflow with 7-agent council (Parker PM, Stella Staff Engineer, Emma Engineering Manager, Terry Technical Writer, etc.)
4. Alex receives workflow_id and initial status
5. Over next 20 minutes, Alex receives progress updates as each agent contributes:
   - "Parker (Product Manager) completed: Market analysis and customer value proposition"
   - "Stella (Staff Engineer) completed: Technical architecture and system design"
   - "Emma (Engineering Manager) completed: Team capacity and delivery timeline"
   - (continues for all agents)
6. Alex types: "@vteam get workflow artifacts [workflow_id]"
7. Receives consolidated RFE document (`rfe.md`) with all agent perspectives integrated
8. Alex reviews document, makes minor edits, and shares with team

**Alternative Flow: Need to Customize Agent Input**

2a. Alex provides detailed context: "@vteam start RFE workflow with context: existing notification system uses Kafka, must integrate with mobile push"
2b. Agents receive additional context and tailor their contributions accordingly

**Business Impact:** 75% reduction in time to create comprehensive RFEs (20 minutes vs 2 hours of manual coordination), higher quality requirements from multi-perspective analysis

---

### Use Case 3: Continuous Development Assistance Throughout Sprint

**Actor:** Jamie, Full-Stack Developer
**Goal:** AI assistance throughout feature development lifecycle
**Precondition:** Jamie has Claude Desktop configured with ACP MCP Server

**Main Success Scenario:**

**Day 1 - Planning:**
1. Jamie types: "@vteam create project feature-user-auth"
2. Receives project_id
3. Jamie types: "@vteam create session in [project_id] for feature planning: OAuth2 user authentication"
4. Receives session with interactive planning mode
5. Jamie iterates on requirements, architecture decisions with AI assistant over several hours

**Day 3 - Implementation & Code Review:**
1. Jamie types: "@vteam create session in [project_id] for code review on branch feature/oauth2-impl"
2. Session analyzes code quality, test coverage, security vulnerabilities
3. Jamie addresses feedback iteratively

**Day 5 - Testing & Finalization:**
1. Jamie types: "@vteam list sessions in [project_id]"
2. Sees all sessions from the week with status summaries
3. Jamie retrieves artifacts from planning session to verify implementation matches design
4. Jamie types: "@vteam get workspace file [planning_session_id] architecture-decisions.md"

**Alternative Flow: Context Preservation Across Sessions**

3a. Jamie wants to reference earlier planning decisions during code review
3b. Jamie lists all sessions: "@vteam list sessions in [project_id]"
3c. Jamie retrieves specific artifact from earlier session
3d. Context is preserved; AI can reference earlier decisions

**Business Impact:** Persistent AI assistance throughout development lifecycle, reduced context switching, improved consistency between planning and implementation

---

### Use Case 4: Team Collaboration on AI-Assisted Codebase Modernization

**Actors:** Development team (4 engineers)
**Goal:** Collaborate on AI-assisted migration of legacy API to modern architecture
**Precondition:** All team members have Claude Desktop/Code with ACP MCP Server

**Main Success Scenario:**

1. **Team Lead creates project:**
   - Types: "@vteam create project modernization-2025 with description: 'Migrate legacy REST API to GraphQL'"
   - Shares project_id with team in Slack

2. **Developer 1 analyzes current state:**
   - "@vteam create session in [project_id] for analyzing legacy API structure"
   - Session generates dependency graph, identifies refactoring opportunities
   - Shares session_id with team

3. **Developer 2 accesses analysis:**
   - "@vteam get session details [session_id]"
   - "@vteam list workspace [session_id]" - sees all generated artifacts
   - "@vteam get workspace file [session_id] dependency-graph.mermaid"
   - Uses analysis to plan migration strategy

4. **Developer 3 creates parallel session:**
   - "@vteam create session in [project_id] for designing GraphQL schema based on legacy API"
   - References artifacts from Developer 1's analysis

5. **Developer 4 monitors progress:**
   - "@vteam list sessions in [project_id]"
   - Sees all team sessions, their status, and purpose
   - Can jump into any session to view artifacts or continue work

**Alternative Flow: Handoff Between Team Members**

3a. Developer 2 picks up where Developer 1 left off
3b. "@vteam get session status [session_id]" shows previous work
3c. Developer 2 can continue session or start new one referencing earlier work

**Business Impact:** Team-level AI workflow collaboration, shared context across developers, reduced duplicate work, improved consistency

---

### Workflow Diagrams

**MCP Tool Discovery & Execution Flow:**
```
┌─────────────────┐
│ Claude Desktop  │
│  or Claude Code │
└────────┬────────┘
         │ (1) Request available tools
         ▼
┌──────────────────┐
│  ACP MCP Server  │
│   (16 tools)     │
└────────┬─────────┘
         │ (2) Authenticate & validate
         ▼
┌─────────────────┐
│  ACP Platform   │
│ (API endpoints) │
└────────┬────────┘
         │ (3) Return permission-scoped tools
         ▼
┌──────────────────┐
│  ACP MCP Server  │ (4) Return tool catalog
└────────┬─────────┘
         ▼
┌─────────────────┐
│ Claude Desktop  │ (5) Display tools to user
└────────┬────────┘
         │ (6) User executes tool X with params
         ▼
┌──────────────────┐
│  ACP MCP Server  │ (7) Invoke tool X, call ACP API
└────────┬─────────┘
         │ (8) Execute action
         ▼
┌─────────────────┐
│  ACP Platform   │ (9) Return result
└────────┬────────┘
         ▼
┌──────────────────┐
│  ACP MCP Server  │ (10) Format response
└────────┬─────────┘
         ▼
┌─────────────────┐
│ Claude Desktop  │ (11) Display result to user
└─────────────────┘
```

**Configuration Precedence Flow:**
```
User starts Claude Desktop/Code
         │
         ▼
Load MCP configuration discovery
         │
         ├─> Check MCP_CONFIG_PATH env var
         │   │
         │   ├─> If set: Load from path
         │   │   └─> Success? Use config
         │   │       Failure? Continue search
         │   │
         │   └─> Not set: Continue search
         │
         ├─> Check current working directory
         │   └─> .mcp.json exists?
         │       └─> Load and merge with env vars
         │
         └─> Check workspace root
             └─> .mcp.json exists?
                 └─> Load and merge with env vars
```

**Documentation Considerations:**

For successful adoption of the ACP MCP Server feature, the following documentation deliverables are required:

**Core Documentation (Ships with v1.0):**

1. **README.md**
   - Clear project description and value proposition (answers "What is this and why should I care?")
   - Quick start guide: installation to first command execution in <5 minutes
   - Links to detailed documentation
   - Version compatibility matrix (Python, Claude Desktop/Code versions)
   - Build status badges

2. **INSTALL.md**
   - System requirements (Python 3.12+, dependencies, API access)
   - Installation methods:
     - pip install from PyPI
     - Docker container deployment
     - Building from source
   - Initial configuration checklist
   - Verification steps ("How do I know it's working?")
   - Common installation errors and fixes
   - Tested on macOS, Linux, and Windows

3. **CONFIGURATION.md**
   - Complete `.mcp.json` schema reference with annotated examples
   - All environment variables documented (ACP_API_KEY, ACP_BASE_URL, MCP_CONFIG_PATH, etc.)
   - Authentication configuration (API keys, token management)
   - Multi-environment setup patterns (dev, staging, production)
   - Configuration precedence rules
   - Security best practices (never commit secrets, use environment variables)

4. **API_REFERENCE.md**
   - Complete catalog of all 16 tools with:
     - Tool name and purpose
     - Input parameters (required vs optional, with types and validation rules)
     - Output format with example responses
     - Use cases and when to use this tool vs alternatives
     - Error codes and meanings
     - Limitations and edge cases
   - Comparison matrix (which tool for which task)
   - Permission requirements per tool

5. **INTEGRATION_GUIDE_CLAUDE_DESKTOP.md**
   - Step-by-step integration walkthrough with screenshots
   - How MCP tools appear in Claude Desktop interface
   - Tool permission configuration
   - Verification steps
   - Troubleshooting common Claude Desktop integration issues
   - Version compatibility notes

6. **TROUBLESHOOTING.md**
   - Top 10 common failure scenarios with solutions:
     - MCP server not discovered ("No .mcp.json file found")
     - Configuration syntax errors
     - Authentication/permission failures
     - Tool execution failures
     - Network/connectivity issues
     - Version compatibility issues
   - For each scenario: symptoms, root cause, step-by-step resolution, prevention tips
   - Log interpretation guide
   - How to get help (GitHub issues, support channels)

7. **Tutorial: "Your First 5 Minutes with ACP MCP Server"**
   - Goal: Zero to executing first MCP tool
   - Step-by-step with screenshots
   - Success criteria: User successfully lists projects
   - Time estimate: 5 minutes

**Extended Documentation (v1.1 or Later):**

8. **INTEGRATION_GUIDE_CLAUDE_CODE.md**
   - Claude Code-specific integration patterns
   - Multi-repo workspace considerations
   - Tool permission model in Claude Code
   - Advanced configuration options

9. **TUTORIAL_PROJECT_MANAGEMENT.md**
   - Real-world scenario: Complete project lifecycle walkthrough
   - Tools used: Project and Session management tools
   - Format: Step-by-step guide with code examples

10. **TUTORIAL_RFE_WORKFLOW.md**
    - Using MCP tools to manage RFE workflows
    - Integration with existing vTeam RFE processes
    - Multi-agent workflow orchestration
    - Format: Video + written guide

11. **ADVANCED_CONFIGURATION.md**
    - Performance tuning (connection pooling, caching, rate limiting)
    - Custom authentication mechanisms
    - Proxy configuration for enterprise networks
    - Multi-tenant deployment patterns

12. **DEVELOPER_GUIDE.md**
    - How to add custom MCP tools
    - Tool development guide with templates
    - Testing custom tools
    - Contributing tools back to the project

**Documentation Success Metrics:**

- **Time to First Success (TTFS)**: ≤10 minutes from reading docs to executing first tool
- **Installation Success Rate**: ≥95% of users complete installation without support tickets
- **Documentation Findability**: Users find relevant doc page within ≤2 clicks
- **Self-Service Rate**: ≥80% of questions answered by documentation (not support)
- **User Satisfaction**: ≥4.0/5.0 rating on "Was this helpful?" doc feedback

**Links to Existing ACP Documentation:**

- Prerequisites: "Before using MCP server, ensure you understand [ACP Sessions](link to vTeam docs)"
- Authentication: Reference existing ACP authentication documentation
- Tool descriptions should link to corresponding ACP API documentation
- Troubleshooting should reference vTeam platform troubleshooting guides

**Questions to answer:**

Before coding begins, the following architectural and implementation questions must be resolved:

**1. Authentication & Authorization:**
- Q: What authentication mechanism will be used for MCP server to ACP backend communication?
  - Options: API keys, OAuth2 tokens, service accounts
  - Decision needed: Which method(s) to support in v1?
- Q: How do we handle token expiration and refresh?
  - Does the MCP server cache tokens? What's the TTL?
  - Do users need to re-authenticate manually or automatic refresh?
- Q: What permissions model applies to MCP tools?
  - Are permissions checked at MCP server level or delegated to ACP backend?
  - Can permissions vary per tool or per user?

**2. Error Handling & Retry Strategy:**
- Q: What's the retry strategy for transient failures?
  - Exponential backoff parameters? (base: 1.5s, max attempts: 3)
  - Which HTTP status codes should trigger retries? (429, 500, 503 but not 401, 404)
- Q: How do we handle long-running sessions that timeout?
  - Should MCP tools poll for completion or return immediately with session_id?
  - What's the timeout policy for different tool categories?
- Q: What error information is safe to return to users vs what should be logged server-side?
  - Redaction policy for sensitive data in errors?

**3. Connection Management:**
- Q: What are the connection pooling parameters?
  - Max concurrent connections to ACP backend? (recommend: 10)
  - Connection timeout, read timeout, write timeout values?
- Q: How do we handle rate limiting from ACP backend?
  - Token bucket algorithm? (100 calls/minute default)
  - Do rate limits apply per user, per MCP server instance, or globally?
- Q: Should the MCP server maintain persistent connections or connect per-request?
  - Trade-offs: latency vs resource usage

**4. State Management:**
- Q: How do we maintain session context across tool calls?
  - MCP tools are stateless, but ACP sessions are stateful
  - Do we cache session metadata locally? TTL?
- Q: What happens if Claude Desktop crashes mid-session?
  - Can users resume sessions later?
  - How do users discover "orphaned" sessions?
- Q: How do we handle concurrent access to the same session from multiple MCP clients?
  - Locking mechanism needed?
  - Conflict resolution strategy?

**5. Workspace File Operations:**
- Q: How do we handle large workspace files?
  - Size limits for `get_workspace_file`? (recommend: 10MB)
  - Should large files be streamed or rejected?
- Q: What's the security model for path traversal prevention?
  - Allow relative paths? Symlinks? Hidden files?
  - How to validate paths without blocking legitimate use cases?
- Q: How do we handle binary files vs text files?
  - Encoding detection?
  - Should binary files be base64-encoded in responses?

**6. Testing Strategy:**
- Q: What's the integration testing approach?
  - Require live ACP backend for CI/CD? Or mock-based only?
  - How to test against different ACP backend versions?
- Q: What test data do we use?
  - Synthetic projects and sessions?
  - Anonymized production data?
- Q: How do we test performance and load?
  - Load testing tools and targets? (e.g., 100 concurrent users, 1000 requests/min)

**7. Configuration Management:**
- Q: What's the precedence order for configuration?
  - Proposal: `MCP_CONFIG_PATH` > `cwd/.mcp.json` > `workspace/.mcp.json` > env vars > defaults
  - Should we support partial overrides or full replacement?
- Q: How do we validate configuration on startup?
  - Fail fast with clear error messages?
  - Warnings for deprecated settings?
- Q: Should configuration be hot-reloadable?
  - Or require restart for changes to take effect?

**8. Versioning & Backward Compatibility:**
- Q: How do we handle ACP backend API version changes?
  - Version pinning in MCP server?
  - Graceful degradation for unsupported API versions?
- Q: What's the support policy for older MCP server versions?
  - How many versions back do we support?
  - Deprecation timeline for breaking changes?
- Q: How do we communicate breaking changes to users?
  - Changelog? Migration guides? Automated warnings?

**9. Performance & Scalability:**
- Q: What are the performance targets?
  - P95 latency for tool execution? (recommend: <2s for API calls, <100ms for cached)
  - Maximum concurrent sessions supported?
- Q: What resources does the MCP server require?
  - Memory footprint? CPU usage under load?
  - Kubernetes resource requests/limits?
- Q: Do we need caching?
  - What data should be cached? (session status, project metadata)
  - Cache TTL and invalidation strategy?

**10. Deployment & Operations:**
- Q: What's the deployment model?
  - Sidecar container with Claude Desktop/Code?
  - Shared cluster service?
  - Per-user deployment?
- Q: What observability hooks are needed?
  - Health check endpoints (liveness, readiness)?
  - Metrics to expose (request count, latency, error rate)?
  - Log format (structured JSON, plain text)?
- Q: How do we handle upgrades?
  - Zero-downtime deployments?
  - Rolling updates?
  - Rollback strategy?

**Background & Strategic Fit:**

**Why ACP MCP Server Is the Right Approach:**

**Strategic Alignment:**

The ACP MCP Server aligns with three key organizational strategies:

1. **Extending ACP Reach Beyond Web UI**: vTeam currently requires web browser access for all interactions. This creates friction for developers who prefer command-line and editor-integrated workflows. By adopting the Model Context Protocol, we enable developers to interact with ACP's powerful multi-agent capabilities without leaving their development environment. This significantly lowers the barrier to entry and increases adoption potential.

2. **Standards-Based Integration**: Rather than building proprietary CLI tools or custom IDE plugins, we're adopting MCP—Anthropic's emerging industry standard for AI tool integration. This positions ACP as forward-thinking and interoperable with the growing MCP ecosystem. As other development tools adopt MCP (VS Code, Cursor, JetBrains IDEs), our investment in MCP will immediately extend our reach to those platforms without additional integration work.

3. **Developer Experience Excellence**: Developers today use AI assistants (particularly Claude) as core parts of their workflow. By making ACP capabilities available through natural language commands in Claude Desktop/Code, we eliminate context switching and reduce cognitive load. This represents a fundamental shift from "developers must come to our platform" to "our platform meets developers where they already are."

**Technical Strategy Fit:**

1. **Microservices Architecture Validation**: The MCP server operates as an independent service that communicates with ACP via REST APIs. This validates our microservices architecture—if our APIs can cleanly support an external MCP server, they're well-designed for future integrations (mobile apps, third-party tools, etc.). Building the MCP server surfaces any API gaps or ergonomic issues early.

2. **API-First Design Reinforcement**: Creating the MCP server forces us to think about API design from an external consumer's perspective. This will reveal inconsistencies, missing endpoints, or overly complex request/response structures. Addressing these issues benefits all API consumers, not just MCP.

3. **Testing Infrastructure Investment**: The 100% type coverage and >80% test coverage requirements set a new quality bar for Python services in our ecosystem. The patterns we establish here (mock-based testing, integration test strategies, CI/CD automation) become reusable templates for future services.

4. **Kubernetes-Native Deployment**: By designing the MCP server for Kubernetes/OpenShift deployment from day one, we reinforce our cloud-native operational model. Container-based deployment, health checks, and observability hooks align with platform team requirements.

**Alternative Approaches Considered:**

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Custom CLI Tool** | Simple, no protocol overhead, full control | Requires users to learn new tool, not integrated with existing workflows | ❌ Doesn't leverage existing tools |
| **Claude Code Plugin** | Tight integration with Claude Code | Proprietary, high maintenance burden, limited to Claude Code | ❌ Non-standard, narrow reach |
| **REST API + SDK (multi-language)** | Language agnostic, maximum flexibility | More code for clients to write, steeper learning curve | ⚠️ Consider for v2 to complement MCP |
| **GraphQL API** | Flexible queries, efficient data fetching | Complexity overhead, team learning curve | ⚠️ Future consideration if API complexity grows |
| **MCP Server (Proposed)** | Standards-based, native AI assistant integration, future-proof | Team must learn MCP protocol, framework maturity risk | ✅ **Best long-term investment** |

**Why FastMCP Framework:**

We chose FastMCP v2.12.5 as our implementation framework for these reasons:

- **Reduces Boilerplate**: FastMCP abstracts low-level protocol details, letting us focus on business logic (tools implementation) rather than protocol handshakes and message serialization
- **Pythonic API**: Decorator-based tool registration (`@mcp_server.tool()`) aligns with team's Python expertise
- **Active Development**: FastMCP has an active community and regular releases, reducing risk of abandonment
- **Type Safety**: Built on Pydantic, ensuring type-safe request/response handling
- **Risk Mitigation**: Version pinning (v2.12.5) protects against breaking changes; we'll monitor releases and upgrade deliberately

**Market Positioning:**

1. **First-Mover Advantage in AI Development Platforms**: MCP is nascent (launched October 2024), with 10,000+ GitHub stars on the SDK in <6 months, signaling strong developer interest. By being early adopters, we position ACP as "AI-native" and developer-friendly compared to competitors still offering only web UIs.

2. **Differentiation Through Multi-Agent Orchestration**: While competitors offer single-agent code assistance, ACP's multi-agent council approach (7 agents collaborating on RFE workflows) is unique. Making this accessible through MCP creates a compelling "only on ACP" value proposition.

3. **Enterprise Credibility**: Kubernetes-native deployment, comprehensive testing, and production-grade error handling signal that we're building for enterprise use cases, not just hobby projects. This differentiates us from open-source MCP servers that lack operational maturity.

**What If We Don't Build This?**

- **Competitive Risk**: Competitors who adopt MCP first will be perceived as more "AI-native" and developer-friendly, potentially winning over developers evaluating AI development platforms
- **Adoption Friction**: Without MCP integration, every new user must overcome the learning curve of the vTeam web UI, limiting viral adoption among individual developers
- **Integration Debt**: As MCP adoption grows industry-wide, we'll face pressure to integrate eventually; delaying means more competitors will have established MCP presence by the time we catch up
- **Missed Feedback**: External MCP server development surfaces API design issues; without it, we miss opportunities to improve API quality based on real-world external usage

**Strategic Recommendation:**

Proceed with ACP MCP Server development as proposed, with phased delivery (MVP in 4 weeks, full feature set in 6 weeks) to balance speed-to-market with quality. Prioritize developer experience, comprehensive testing, and excellent documentation to maximize adoption and establish ACP as a leader in MCP-based AI development tools.

**Customer Considerations**

**Customer Segmentation:**

The ACP MCP Server addresses needs of three distinct customer segments, each with unique requirements and adoption patterns:

**Segment 1: Individual Developers (Early Adopters)**

- **Size**: Largest segment, ~10,000+ potential users based on Claude Desktop/Code adoption rates
- **Characteristics**:
  - Already using Claude Desktop or Claude Code for daily development tasks
  - Comfortable with command-line tools, configuration files, and troubleshooting
  - Value speed and flexibility over enterprise governance features
  - High tolerance for rough edges in exchange for early access to innovative features
- **Key Requirements**:
  - Simple installation: `pip install acp-mcp-server` → edit `.mcp.json` → working in <5 minutes
  - Clear documentation with runnable examples
  - Works with personal Anthropic API keys (not tied to enterprise accounts)
  - Local development mode (doesn't require production ACP cluster)
- **Go-to-Market Strategy**:
  - GitHub README with compelling demo GIFs
  - Developer community posts (Reddit r/ClaudeAI, Hacker News, Dev.to)
  - YouTube tutorial videos
  - Open-source community engagement
- **Pricing Sensitivity**: High - expect free tier or minimal cost; primary monetization through usage-based charges for ACP backend resources
- **Adoption Metrics**: GitHub stars, PyPI downloads, community contributions

**Segment 2: Enterprise Development Teams**

- **Size**: 50-100 teams in current sales pipeline
- **Characteristics**:
  - Already using vTeam in production for AI-powered development workflows
  - Need centralized management, RBAC, audit trails, and compliance features
  - Budget allocated for developer productivity tools with clear ROI
  - Lower tolerance for instability; require SLAs and enterprise support
- **Key Requirements**:
  - Enterprise authentication: OAuth2, SAML/SSO integration (post-MVP)
  - Team project isolation and multi-tenancy
  - Usage tracking and cost allocation by team/project
  - Support for air-gapped and on-premises deployments
  - Security certifications (SOC 2, ISO 27001)
- **Go-to-Market Strategy**:
  - Direct sales team engagement with existing vTeam customers
  - Proof-of-concept programs with pilot teams
  - Enterprise webinars and demos
  - Integration with enterprise license management
- **Pricing Sensitivity**: Low - ROI from developer productivity gains justifies cost; typical enterprise deal: $10K-$50K/year for 50-200 developers
- **Adoption Metrics**: Enterprise customer count, seats deployed, session volume

**Segment 3: Platform/DevOps Teams**

- **Size**: ~200 organizations running Kubernetes-based internal developer platforms
- **Characteristics**:
  - Building internal developer platforms ("paved roads") for engineering teams
  - Standardizing tooling, infrastructure, and development workflows
  - Deep Kubernetes/OpenShift expertise
  - Interested in ACP as one component in broader platform offering
- **Key Requirements**:
  - OpenShift/Kubernetes native deployment with Helm charts or Operators
  - Integration with existing platform RBAC (Kubernetes service accounts, OIDC)
  - Observability: metrics exporters (Prometheus), distributed tracing, structured logging
  - Multi-tenancy support at namespace/cluster level
  - Infrastructure-as-code patterns (Terraform modules, GitOps-friendly)
- **Go-to-Market Strategy**:
  - Platform Engineering conferences (PlatformCon, KubeCon)
  - OpenShift ecosystem partnerships
  - CNCF sandbox project potential
  - Internal developer platform community engagement
- **Pricing Sensitivity**: Medium - budget allocated for platform tooling, but TCO must be justified
- **Adoption Metrics**: Platform integrations, Helm chart installs, operator deployment count

**Technology Stack Considerations:**

| Stack Component | Compatibility | Customer Considerations |
|----------------|---------------|-------------------------|
| **Python 3.12+** | Required by FastMCP | Most customers on 3.9-3.11; consider 3.11 backport for broader adoption (v1.1) |
| **Claude Desktop/Code** | Primary target (80% of user base) | Version compatibility matrix critical; some customers on older Claude versions |
| **OpenShift/Kubernetes** | Backend requirement | Transparent to MCP users but limits deployment options; customers without K8s can't self-host |
| **Other LLM interfaces** | Future consideration | MCP is protocol-standard; enables Cursor, VS Code Copilot, JetBrains AI in future |
| **Docker** | Deployment option | Most customers comfortable with containers; Windows developers may need WSL2 guidance |

**Competitive Landscape & Differentiation:**

**Our Unique Value Proposition:**

1. **Multi-Agent Orchestration**: Competitors (GitHub Copilot, Cursor, Cody) offer single-agent code assistance. ACP's council-based approach (7 specialized agents collaborating on RFE workflows) is unique and demonstrates deeper AI reasoning.

2. **Kubernetes-Native**: Most MCP servers are hobby projects or single-user tools. ACP MCP Server is enterprise-ready from day one with K8s deployment, RBAC, audit logging.

3. **RFE Workflow Automation**: No competitor offers AI-assisted requirements engineering with multi-stakeholder perspective synthesis (PM, Architect, Engineer, Writer, etc.).

4. **Open Protocol Adoption**: By adopting MCP early, we're demonstrating commitment to open standards rather than proprietary lock-in (unlike GitHub Copilot's closed ecosystem).

**Competitive Risks:**

- **GitHub Copilot Enterprise** may adopt MCP, leveraging massive user base
- **Cursor** is already MCP-compatible and gaining traction with developers
- **First-mover advantage window is narrow**: 6-12 months before MCP becomes table stakes

**Market Opportunity:**

- MCP adoption is in early growth phase (launched Oct 2024, 10,000+ GitHub stars in <6 months)
- Developer tools market: $20B+ TAM, AI-assisted development tools growing at 40% CAGR
- Early adopter advantage: Being featured in Anthropic's MCP showcase drives organic discovery

**Customer-Specific Risks & Mitigations:**

**Risk 1: Security & Compliance**

- **Risk**: Enterprise customers need audit trails for AI-generated code and session history for compliance
- **Mitigation**:
  - All MCP operations pass through existing vTeam RBAC (not bypassing security)
  - Session history logged in Kubernetes audit logs
  - Workspace artifacts stored with provenance metadata
  - Future: Export audit logs in standard formats (JSON, CSV) for SIEM integration

**Risk 2: Learning Curve**

- **Risk**: New mental model (protocol-based vs web UI) may confuse users accustomed to traditional interfaces
- **Mitigation**:
  - Progressive disclosure: simple commands first, advanced features in separate documentation
  - Comparison table: "If you used to do X in web UI, now you do Y in MCP"
  - Video tutorials demonstrating side-by-side web UI vs MCP workflows
  - In-app guidance: error messages include links to relevant documentation

**Risk 3: Token Costs**

- **Risk**: Users may underestimate Anthropic API costs for long-running sessions, leading to bill shock
- **Mitigation**:
  - Clear cost estimation tools in documentation (e.g., "Typical session uses 50K tokens = $0.15")
  - Budget alerts in configuration: warn if session exceeds cost threshold
  - Cost visibility: tools return token usage in responses
  - Best practices guide: "How to optimize prompts to reduce token consumption"

**Risk 4: Network Requirements**

- **Risk**: MCP requires connectivity to both Anthropic API (claude.ai) and ACP backend, complicating air-gapped deployments
- **Mitigation**:
  - Document network architecture clearly (firewall rules, proxy configuration)
  - Support for HTTP/HTTPS proxy configuration
  - Future: Self-hosted LLM option for air-gapped environments (v2.0)
  - Enterprise deployment guide includes network diagrams

**Risk 5: Performance & Reliability**

- **Risk**: If MCP server is slow or unreliable, users blame ACP rather than network/infrastructure issues
- **Mitigation**:
  - Clear performance expectations in SLA: P95 latency <2s for API calls
  - Health check tools: `@vteam health check` reports server and backend status
  - Graceful degradation: if backend is slow, MCP returns partial results or status updates
  - Monitoring dashboard for enterprise customers showing uptime, latency metrics

**Localization & Accessibility:**

- **Initial Launch**: English-only documentation and error messages
- **Future Consideration**: MCP protocol is language-agnostic; enables future multilingual support by translating tool descriptions and error messages
- **Accessibility**: Screen reader compatibility in error messages (use descriptive text, not just codes); consider JSON output option for programmatic processing

**Customer Success Criteria:**

| Customer Segment | Success Metric | Target |
|-----------------|----------------|--------|
| **Individual Developers** | Time to First Session | <10 minutes from docs to first session created |
| **Enterprise Teams** | Adoption Rate | 40% of team members using MCP within 3 months |
| **Platform Teams** | Integration Completeness | MCP server integrated into internal dev platform with RBAC |
| **All Segments** | User Satisfaction | NPS ≥50 (baseline: 32 for web UI) |
| **All Segments** | Self-Service Support | <20% support tickets (rest resolved via documentation) |

**Key Customer Questions to Address Proactively:**

1. **"How is this different from Claude Desktop/Code's built-in capabilities?"**
   - Answer: Claude Desktop/Code provide general-purpose AI assistance. ACP MCP Server adds specialized tools for multi-agent orchestration, RFE workflows, and integration with your existing ACP projects and sessions.

2. **"Will this replace the web UI?"**
   - Answer: No, MCP integration complements the web UI. Complex configuration and administrative tasks remain in web UI; day-to-day development workflows move to MCP for efficiency.

3. **"What data is sent to Anthropic vs kept internal?"**
   - Answer: MCP tool descriptions and results are sent to Claude (Anthropic) for natural language processing. Session data, workspace artifacts, and project metadata remain in your ACP deployment.

4. **"How do I control costs?"**
   - Answer: MCP tools are metered based on Anthropic API usage. Set budget limits in configuration, monitor usage via dashboard, optimize prompts using our best practices guide.

5. **"Is this supported in production?"**
   - Answer: Yes, v1.0 includes SLA, enterprise support, and production-ready deployment patterns (Kubernetes manifests, health checks, monitoring).
