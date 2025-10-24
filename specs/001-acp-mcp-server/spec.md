# Feature Specification: ACP MCP Server

**Feature Branch**: `001-acp-mcp-server`
**Created**: 2025-10-24
**Status**: Draft
**Input**: User description: "we want an mcp server for the acp APIs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Project and Session Management (Priority: P1)

A developer using Claude Desktop can create and manage ACP projects and sessions through natural language commands without leaving their AI assistant interface.

**Why this priority**: This is the foundation for all other functionality. Without the ability to create projects and sessions, no other features can be used. This delivers immediate value by eliminating context switching to the web UI.

**Independent Test**: Can be fully tested by installing the MCP server, configuring authentication, and executing "@vteam create project test-project" followed by "@vteam create session in [project_id] for code review" and verifying both resources are created in ACP.

**Acceptance Scenarios**:

1. **Given** Claude Desktop is configured with the ACP MCP Server, **When** a developer types "@vteam create project my-feature", **Then** a new ACP project is created and the project_id is returned
2. **Given** a project exists, **When** the developer types "@vteam create session in [project_id] for analyzing security vulnerabilities", **Then** a new ACP session is created with the specified context
3. **Given** multiple projects exist, **When** the developer types "@vteam list projects", **Then** all accessible projects are displayed with their status and metadata
4. **Given** a project exists, **When** the developer types "@vteam delete project [project_id]", **Then** the project and all associated sessions are removed
5. **Given** authentication credentials are invalid, **When** any MCP tool is invoked, **Then** a clear error message explains the authentication issue with remediation steps

---

### User Story 2 - Session Execution and Monitoring (Priority: P1)

A developer can start, monitor, and retrieve results from long-running ACP sessions without leaving their AI interface.

**Why this priority**: The core value of ACP is running agentic sessions. This story enables developers to leverage ACP's multi-agent capabilities through their familiar Claude interface.

**Independent Test**: Can be tested by creating a session, starting it with "@vteam start session [session_id]", polling status with "@vteam get session status [session_id]", and retrieving artifacts with "@vteam get workspace file [session_id] results.md".

**Acceptance Scenarios**:

1. **Given** a created session, **When** the developer types "@vteam start session [session_id]", **Then** the session begins execution and returns the current status
2. **Given** a running session, **When** the developer checks status, **Then** they receive progress information including current phase and percentage complete
3. **Given** a completed session, **When** the developer types "@vteam list workspace contents [session_id]", **Then** all generated files and artifacts are listed with sizes and modification times
4. **Given** a completed session with results, **When** the developer requests a specific file, **Then** the file contents are returned formatted for Claude to display inline
5. **Given** a long-running session exceeds expected time, **When** the developer checks status, **Then** they receive detailed progress indicators showing work is still proceeding

---

### User Story 3 - Workspace File Access (Priority: P2)

A developer can browse and retrieve files from session workspaces to review AI-generated artifacts, analysis reports, and code changes.

**Why this priority**: Session results are only valuable if developers can access them. This enables the "retrieve results" part of the workflow loop.

**Independent Test**: Can be tested by completing a session that generates artifacts, listing workspace contents, and retrieving specific files to verify content matches expectations.

**Acceptance Scenarios**:

1. **Given** a session has generated multiple files, **When** the developer lists workspace contents, **Then** files are organized by directory with clear paths
2. **Given** a large file exists in the workspace, **When** the developer attempts to retrieve it, **Then** the system either returns the content or provides a clear size limit warning
3. **Given** a developer requests a non-existent file, **When** the request is processed, **Then** a helpful error explains the file wasn't found and suggests listing workspace contents first
4. **Given** binary files exist in the workspace, **When** listed, **Then** they are clearly marked as binary with appropriate handling guidance
5. **Given** potential path traversal attempts in file requests, **When** validation runs, **Then** only files within the workspace boundary are accessible

---

### User Story 4 - RFE Workflow Automation (Priority: P2)

A developer can initiate multi-agent RFE workflows to generate comprehensive requirements documents through a single natural language command.

**Why this priority**: This showcases ACP's unique multi-agent orchestration capability and delivers significant time savings for requirements planning.

**Independent Test**: Can be tested by executing "@vteam create RFE workflow for feature: real-time notifications", monitoring workflow progress, and verifying the generated rfe.md contains contributions from multiple agent perspectives.

**Acceptance Scenarios**:

1. **Given** the developer provides a feature description, **When** they initiate an RFE workflow, **Then** a workflow is created with all required agents configured
2. **Given** an RFE workflow is running, **When** the developer checks progress, **Then** they see which agents have completed their contributions and which are still working
3. **Given** an RFE workflow completes, **When** artifacts are requested, **Then** the consolidated rfe.md document integrates all agent perspectives
4. **Given** the developer provides additional context, **When** creating the workflow, **Then** the context is passed to all participating agents
5. **Given** an RFE workflow fails partway through, **When** the developer checks status, **Then** they receive clear information about which agent failed and why

---

### User Story 5 - Session Context Preservation Across Time (Priority: P3)

A developer can return to previously created sessions days or weeks later and retrieve artifacts or continue work.

**Why this priority**: Enables workflows where planning happens early in a sprint and implementation references those plans later, supporting continuous development assistance.

**Independent Test**: Can be tested by creating a session with artifacts, waiting a period of time, then listing projects, listing sessions, and retrieving the original artifacts to verify they remain accessible.

**Acceptance Scenarios**:

1. **Given** sessions were created days ago, **When** the developer lists sessions in a project, **Then** historical sessions appear with creation dates and final status
2. **Given** a completed session from a previous week, **When** the developer retrieves a workspace file, **Then** the file content is still available
3. **Given** multiple sessions exist in a project, **When** listed, **Then** they are sorted by creation date with the most recent first
4. **Given** a developer wants to reference an earlier decision, **When** they search sessions by description, **Then** relevant sessions are identified
5. **Given** session retention policies exist, **When** very old sessions are accessed, **Then** either content is available or clear expiration information is provided

---

### User Story 6 - Team Collaboration on Shared Projects (Priority: P3)

Multiple developers on a team can access shared projects and view each other's sessions to collaborate on AI-assisted development tasks.

**Why this priority**: Enables team workflows where one developer's analysis can inform another's implementation, reducing duplicate work.

**Independent Test**: Can be tested by having two developers (with different API keys) access the same project, create sessions independently, and verify both can list and access all sessions in the shared project.

**Acceptance Scenarios**:

1. **Given** a shared project exists, **When** Developer A creates a session, **Then** Developer B can see it when listing project sessions
2. **Given** Developer A's session generated artifacts, **When** Developer B requests those artifacts, **Then** they can access the workspace files
3. **Given** concurrent session creation by multiple developers, **When** sessions are listed, **Then** all sessions appear without conflicts
4. **Given** one developer deletes a session, **When** another developer attempts to access it, **Then** a clear "session not found" error is returned
5. **Given** team members have different permission levels, **When** they attempt operations, **Then** permissions are enforced consistently

---

### Edge Cases

- What happens when a session creation request times out before ACP responds?
  - The MCP server returns a clear timeout error with the session creation status unknown, suggesting the developer check project sessions list to see if it was created

- What happens when the ACP backend is unavailable during a tool invocation?
  - The MCP server detects the connection failure and returns a detailed error explaining the backend is unreachable, including health check suggestions

- What happens when a developer requests a workspace file that exceeds size limits?
  - The request is rejected with a clear error stating the file size, the limit, and suggesting alternative access methods

- What happens when API rate limits are exceeded?
  - The MCP server returns a rate limit error with retry-after timing information and current usage metrics

- What happens when authentication tokens expire during a long session?
  - The MCP server detects the 401 response and returns a clear authentication error prompting credential refresh

- What happens when a session fails during execution?
  - Status checks reveal the failure state with error details from ACP, allowing the developer to understand what went wrong

- What happens when two developers try to delete the same session simultaneously?
  - One delete succeeds, the other receives a "session not found" response indicating it was already deleted

- What happens when workspace paths contain special characters or attempt directory traversal?
  - Path validation rejects unsafe paths with security warnings, only allowing access to files within the workspace boundary

- What happens when the configuration file has syntax errors?
  - Server startup fails fast with a clear error message pointing to the configuration syntax issue and line number

- What happens when a developer tries to access a project they don't have permissions for?
  - The ACP backend returns a permission denied error, which the MCP server forwards with context about the permission model

## Requirements *(mandatory)*

### Functional Requirements

**Project Management Tools:**

- **FR-001**: System MUST provide a tool to list all accessible ACP projects with their metadata (id, name, status, creation date)
- **FR-002**: System MUST provide a tool to create new ACP projects with user-specified names and descriptions
- **FR-003**: System MUST provide a tool to retrieve detailed information about a specific project including all sessions
- **FR-004**: System MUST provide a tool to delete existing projects and cascade delete associated sessions

**Session Management Tools:**

- **FR-005**: System MUST provide a tool to list all sessions within a specified project
- **FR-006**: System MUST provide a tool to create new sessions with project association, description, and configuration parameters
- **FR-007**: System MUST provide a tool to retrieve detailed session information including status, logs, and metadata
- **FR-008**: System MUST provide a tool to update session configuration parameters
- **FR-009**: System MUST provide a tool to delete individual sessions

**Session Execution Tools:**

- **FR-010**: System MUST provide a tool to start session execution
- **FR-011**: System MUST provide a tool to stop running sessions gracefully
- **FR-012**: System MUST provide a tool to retrieve current session status including progress indicators
- **FR-013**: System MUST provide a tool to list all files and directories in a session workspace
- **FR-014**: System MUST provide a tool to retrieve specific file contents from a session workspace with path validation

**RFE Workflow Tools:**

- **FR-015**: System MUST provide a tool to list available RFE workflow templates
- **FR-016**: System MUST provide a tool to create new RFE workflows with feature descriptions and optional context

**Authentication & Security:**

- **FR-017**: System MUST authenticate all requests to the ACP backend using API keys or tokens
- **FR-018**: System MUST validate authentication credentials on startup and fail fast with clear error messages if invalid
- **FR-019**: System MUST prevent path traversal attacks in workspace file access by validating all file paths
- **FR-020**: System MUST redact API keys and sensitive credentials from all log output
- **FR-021**: System MUST use TLS for all HTTPS connections to the ACP backend

**Configuration Management:**

- **FR-022**: System MUST support loading configuration from .mcp.json files discovered in the workspace
- **FR-023**: System MUST support environment variable overrides for configuration values
- **FR-024**: System MUST validate configuration schema on startup and report specific validation errors
- **FR-025**: System MUST apply configuration precedence: MCP_CONFIG_PATH environment variable > current directory .mcp.json > workspace root .mcp.json > environment variables > defaults

**Error Handling:**

- **FR-026**: System MUST handle HTTP 401 responses with clear authentication error messages
- **FR-027**: System MUST handle HTTP 404 responses with clear "resource not found" messages
- **FR-028**: System MUST handle HTTP 429 rate limit responses with retry-after information
- **FR-029**: System MUST handle HTTP 500+ server errors with backend unavailability messages
- **FR-030**: System MUST handle network timeouts with clear timeout error messages and suggested retry actions
- **FR-031**: System MUST handle connection failures with backend health check suggestions

**Response Format:**

- **FR-032**: All tool responses MUST follow a consistent schema with success boolean, data or error object, and message fields
- **FR-033**: All error responses MUST include actionable guidance for resolution
- **FR-034**: All tool responses MUST be formatted for optimal display in Claude Desktop and Claude Code interfaces

**Performance & Reliability:**

- **FR-035**: System MUST implement connection pooling for HTTP requests to the ACP backend
- **FR-036**: System MUST implement configurable timeouts for all network operations
- **FR-037**: System MUST implement exponential backoff retry logic for transient failures (HTTP 429, 500, 503)
- **FR-038**: System MUST implement rate limiting with configurable calls-per-minute thresholds
- **FR-039**: System MUST cache session status and project metadata with configurable TTL to reduce backend load

### Key Entities

- **Project**: Represents an ACP project container that groups related sessions. Key attributes include unique identifier, name, description, owner information, creation timestamp, and current status.

- **Session**: Represents an ACP agentic session within a project. Key attributes include unique identifier, parent project reference, description, configuration parameters, current execution status, progress indicators, creation and modification timestamps, and workspace location.

- **Workspace**: Represents the file system directory associated with a session containing generated artifacts, analysis results, and code changes. Key attributes include session reference, root path, file listing, and size metrics.

- **RFE Workflow**: Represents a multi-agent requirements engineering workflow. Key attributes include unique identifier, feature description, agent roster, current phase, progress per agent, and artifact locations.

- **MCP Tool**: Represents an individual tool exposed through the Model Context Protocol. Key attributes include tool name, description, parameter schema, and backend API endpoint mapping.

- **Configuration**: Represents the MCP server configuration. Key attributes include ACP API base URL, authentication credentials, rate limit settings, timeout values, cache TTL, and logging configuration.

- **Session Status**: Represents the current state of a running or completed session. Key attributes include status value (created, running, paused, completed, failed), current phase, progress percentage, start and end timestamps, and error information if applicable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can complete their first successful MCP tool invocation (list projects or create project) within 10 minutes of reading installation documentation
- **SC-002**: Time to create a new project and session through MCP is under 30 seconds compared to 5 minutes through the web UI
- **SC-003**: Tool response time for cached operations (project list, session status checks) is under 100 milliseconds at P95
- **SC-004**: Tool response time for ACP API calls is under 2 seconds at P95
- **SC-005**: 95% of installation attempts succeed without requiring support intervention
- **SC-006**: 40% of ACP sessions are initiated via MCP within 3 months of launch
- **SC-007**: Developer satisfaction (NPS score) for MCP users reaches 50 or higher, exceeding web UI baseline of 32
- **SC-008**: 80% of common user questions are resolved by documentation without support tickets
- **SC-009**: Zero API keys or tokens appear in logs during security audit scans
- **SC-010**: The MCP server handles 100 concurrent tool invocations without errors or degradation
- **SC-011**: Authentication errors are resolved by developers without support assistance in 90% of cases due to clear error messages
- **SC-012**: Path traversal attack attempts are successfully blocked with 100% effectiveness during security testing
