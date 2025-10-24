# Data Model: ACP MCP Server

**Feature**: 001-acp-mcp-server
**Date**: 2025-10-24
**Purpose**: Define entities, relationships, and validation rules

## Overview

This document defines the core entities managed by the ACP MCP Server. These entities represent the domain model exposed through MCP tools to Claude Desktop/Code interfaces.

---

## Entity Definitions

### 1. Project

Represents an ACP project container that groups related sessions.

**Fields:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | UUID format | Unique project identifier |
| `name` | string | Yes | 1-100 chars, alphanumeric + spaces/hyphens | Human-readable project name |
| `description` | string | No | Max 500 chars | Optional project description |
| `owner` | string | Yes | Non-empty string | Project owner identifier |
| `status` | enum | Yes | 'active' \| 'archived' | Current project status |
| `created_at` | string | Yes | ISO 8601 timestamp | Project creation timestamp |
| `updated_at` | string | Yes | ISO 8601 timestamp | Last modification timestamp |

**Example:**
```json
{
  "id": "proj_abc123def456",
  "name": "Security Audit Q4",
  "description": "Automated security analysis for Q4 release",
  "owner": "user_xyz789",
  "status": "active",
  "created_at": "2025-10-24T10:00:00Z",
  "updated_at": "2025-10-24T10:00:00Z"
}
```

**Relationships:**
- Has many `Session` entities
- Owns `Workspace` resources indirectly through sessions

**State Transitions:**
```
[Created] → active → archived
```

**Validation Rules:**
- Name must be unique per owner
- Cannot delete project with active sessions (must delete sessions first or cascade)
- Archived projects cannot create new sessions

---

### 2. Session

Represents an ACP agentic session within a project.

**Fields:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | UUID format | Unique session identifier |
| `project_id` | string | Yes | Valid project UUID | Parent project reference |
| `description` | string | Yes | 1-1000 chars | Session task description |
| `status` | enum | Yes | 'created' \| 'running' \| 'paused' \| 'completed' \| 'failed' | Current execution status |
| `progress` | number | No | 0-100 | Execution progress percentage |
| `current_phase` | string | No | Max 100 chars | Current execution phase name |
| `config` | object | No | Valid SessionConfig | Session configuration parameters |
| `created_at` | string | Yes | ISO 8601 timestamp | Session creation timestamp |
| `started_at` | string | No | ISO 8601 timestamp | Session start timestamp |
| `completed_at` | string | No | ISO 8601 timestamp | Session completion timestamp |
| `error` | object | No | Valid ErrorInfo | Error details if status is 'failed' |

**SessionConfig Fields:**

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `model` | enum | No | 'claude-sonnet-4' | 'claude-sonnet-4' \| 'claude-haiku-3' |
| `timeout` | number | No | 300 | 60-3600 seconds |
| `temperature` | number | No | 0.7 | 0.0-1.0 |
| `max_tokens` | number | No | 4096 | 1-100000 |

**ErrorInfo Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Machine-readable error code |
| `message` | string | Yes | Human-readable error message |
| `details` | object | No | Additional error context |

**Example:**
```json
{
  "id": "sess_xyz789abc123",
  "project_id": "proj_abc123def456",
  "description": "Analyze authentication module for security vulnerabilities",
  "status": "running",
  "progress": 45,
  "current_phase": "code_analysis",
  "config": {
    "model": "claude-sonnet-4",
    "timeout": 600,
    "temperature": 0.7,
    "max_tokens": 8192
  },
  "created_at": "2025-10-24T10:30:00Z",
  "started_at": "2025-10-24T10:31:00Z",
  "completed_at": null,
  "error": null
}
```

**Relationships:**
- Belongs to one `Project`
- Has one `Workspace`
- May be part of one `RFEWorkflow`

**State Transitions:**
```
[Created] → created → running → {completed | failed}
                    ↓         ↑
                    → paused →
```

**Validation Rules:**
- Cannot start session if project is archived
- Cannot modify configuration while status is 'running'
- Progress must increase monotonically (cannot decrease)
- `started_at` required if status is not 'created'
- `completed_at` required if status is 'completed' or 'failed'
- `error` required if status is 'failed'

---

### 3. Workspace

Represents the file system directory associated with a session containing generated artifacts.

**Fields:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `session_id` | string | Yes | Valid session UUID | Parent session reference |
| `root_path` | string | Yes | Valid path | Workspace root directory path |
| `size_bytes` | number | Yes | >= 0 | Total workspace size in bytes |
| `file_count` | number | Yes | >= 0 | Number of files in workspace |

**Example:**
```json
{
  "session_id": "sess_xyz789abc123",
  "root_path": "/workspaces/sess_xyz789abc123",
  "size_bytes": 1048576,
  "file_count": 12
}
```

**Relationships:**
- Belongs to one `Session`
- Contains many `WorkspaceFile` entities

**Validation Rules:**
- `root_path` must be absolute path
- Cannot be accessed if session status is 'created'
- Read-only access (no write operations via MCP tools)

---

### 4. WorkspaceFile

Represents an individual file within a session workspace.

**Fields:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `path` | string | Yes | Valid relative path, no `..` | File path relative to workspace root |
| `size_bytes` | number | Yes | >= 0 | File size in bytes |
| `mime_type` | string | Yes | Valid MIME type | File content type |
| `is_binary` | boolean | Yes | true \| false | Whether file is binary |
| `modified_at` | string | Yes | ISO 8601 timestamp | Last modification timestamp |

**Example:**
```json
{
  "path": "analysis/security-report.md",
  "size_bytes": 8192,
  "mime_type": "text/markdown",
  "is_binary": false,
  "modified_at": "2025-10-24T11:00:00Z"
}
```

**Relationships:**
- Belongs to one `Workspace`

**Validation Rules:**
- `path` must not contain `..` (prevent directory traversal)
- `path` must not start with `/` (relative paths only)
- Files > 10MB should return size warning, not content
- Binary files (is_binary=true) should not return text content

---

### 5. RFEWorkflow

Represents a multi-agent requirements engineering workflow.

**Fields:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | UUID format | Unique workflow identifier |
| `feature_description` | string | Yes | 1-2000 chars | Feature description for RFE |
| `template_id` | string | Yes | Valid template ID | RFE template identifier |
| `agent_roster` | array | Yes | Array of AgentInfo | Agents participating in workflow |
| `current_phase` | string | Yes | Phase name | Current workflow phase |
| `status` | enum | Yes | 'created' \| 'running' \| 'completed' \| 'failed' | Workflow status |
| `artifacts` | array | Yes | Array of ArtifactInfo | Generated artifacts |
| `created_at` | string | Yes | ISO 8601 timestamp | Workflow creation timestamp |
| `completed_at` | string | No | ISO 8601 timestamp | Workflow completion timestamp |

**AgentInfo Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Agent identifier (e.g., "Archie", "Parker") |
| `role` | string | Yes | Agent role (e.g., "Architect", "Product Manager") |
| `status` | enum | Yes | 'pending' \| 'working' \| 'completed' \| 'failed' |
| `completed_at` | string | No | Completion timestamp |

**ArtifactInfo Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | Yes | Artifact file path |
| `type` | enum | Yes | 'rfe' \| 'spec' \| 'plan' \| 'tasks' |
| `agent` | string | Yes | Agent that generated artifact |

**Example:**
```json
{
  "id": "rfe_flow_abc123",
  "feature_description": "Real-time notification system with multi-channel support",
  "template_id": "standard-rfe-v1",
  "agent_roster": [
    {
      "name": "Parker",
      "role": "Product Manager",
      "status": "completed",
      "completed_at": "2025-10-24T11:15:00Z"
    },
    {
      "name": "Archie",
      "role": "Architect",
      "status": "working",
      "completed_at": null
    },
    {
      "name": "Uma",
      "role": "UX Team Lead",
      "status": "pending",
      "completed_at": null
    }
  ],
  "current_phase": "technical_architecture",
  "status": "running",
  "artifacts": [
    {
      "path": "rfe/product-requirements.md",
      "type": "rfe",
      "agent": "Parker"
    }
  ],
  "created_at": "2025-10-24T11:00:00Z",
  "completed_at": null
}
```

**Relationships:**
- May create one or more `Session` entities (one per agent)
- Generates `WorkspaceFile` artifacts

**State Transitions:**
```
[Created] → created → running → {completed | failed}
```

**Validation Rules:**
- All agents must complete before workflow status becomes 'completed'
- If any agent fails, workflow status becomes 'failed'
- Artifacts can only be added, never removed
- Agent status transitions must be sequential (pending → working → {completed|failed})

---

### 6. MCPTool

Represents an individual tool exposed through the Model Context Protocol.

**Fields:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | lowercase_snake_case | Tool identifier |
| `description` | string | Yes | 1-500 chars | Tool purpose and usage |
| `parameters` | object | Yes | Valid Zod schema | Tool input parameters schema |
| `category` | enum | Yes | Tool category | Tool category for organization |

**Categories:**
- `project_management`: Project CRUD operations
- `session_management`: Session CRUD operations
- `session_execution`: Start/stop/status operations
- `workspace_access`: File listing and retrieval
- `rfe_workflows`: RFE workflow operations

**Example:**
```json
{
  "name": "list_projects",
  "description": "List all accessible ACP projects with their metadata",
  "parameters": {},
  "category": "project_management"
}
```

**Tool Inventory (16 total):**

| Tool Name | Category | Description |
|-----------|----------|-------------|
| `list_projects` | project_management | List all projects |
| `create_project` | project_management | Create new project |
| `get_project` | project_management | Get project details |
| `delete_project` | project_management | Delete project |
| `list_sessions` | session_management | List sessions in project |
| `create_session` | session_management | Create new session |
| `get_session` | session_management | Get session details |
| `update_session` | session_management | Update session config |
| `delete_session` | session_management | Delete session |
| `start_session` | session_execution | Start session execution |
| `stop_session` | session_execution | Stop running session |
| `get_session_status` | session_execution | Get execution status |
| `list_workspace_files` | workspace_access | List workspace contents |
| `get_workspace_file` | workspace_access | Get file content |
| `list_rfe_templates` | rfe_workflows | List available templates |
| `create_rfe_workflow` | rfe_workflows | Create RFE workflow |

---

### 7. Configuration

Represents the MCP server configuration.

**Fields:**

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `apiKey` | string | Yes | (none) | Min 32 chars | API authentication key |
| `baseUrl` | string | Yes | (none) | Valid URL | ACP backend base URL |
| `timeout` | number | No | 30000 | 1000-120000 | Request timeout in milliseconds |
| `retries` | number | No | 3 | 0-5 | Maximum retry attempts |
| `cacheTTL` | number | No | 60000 | 0-600000 | Cache TTL in milliseconds |
| `rateLimitPerMinute` | number | No | 60 | 1-1000 | Max requests per minute |
| `debug` | boolean | No | false | true \| false | Enable debug logging |

**Example (.mcp.json):**
```json
{
  "apiKey": "acp_key_abc123def456xyz789",
  "baseUrl": "https://api.acp.example.com",
  "timeout": 60000,
  "retries": 3,
  "cacheTTL": 60000,
  "rateLimitPerMinute": 60,
  "debug": false
}
```

**Environment Variable Mapping:**
```bash
MCP_API_KEY               → apiKey
MCP_BASE_URL              → baseUrl
MCP_TIMEOUT               → timeout
MCP_RETRIES               → retries
MCP_CACHE_TTL             → cacheTTL
MCP_RATE_LIMIT_PER_MINUTE → rateLimitPerMinute
MCP_DEBUG                 → debug
```

**Validation Rules:**
- `apiKey` must be provided (required)
- `baseUrl` must be valid HTTPS URL
- `timeout` must be reasonable (1s - 2min)
- `retries` capped at 5 to prevent excessive load
- `cacheTTL` of 0 disables caching
- Configuration must be validated on startup (fail-fast)

---

### 8. SessionStatus

Represents the current state of a running or completed session.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | enum | Yes | created \| running \| paused \| completed \| failed |
| `progress` | number | No | Progress percentage (0-100) |
| `current_phase` | string | No | Current execution phase |
| `start_time` | string | No | ISO 8601 timestamp |
| `end_time` | string | No | ISO 8601 timestamp |
| `duration_ms` | number | No | Execution duration in milliseconds |
| `error` | ErrorInfo | No | Error details if failed |

**Example:**
```json
{
  "status": "running",
  "progress": 65,
  "current_phase": "code_review",
  "start_time": "2025-10-24T10:00:00Z",
  "end_time": null,
  "duration_ms": null,
  "error": null
}
```

**Cacheable**: Yes, TTL = 10 seconds (status changes slowly)

---

## Entity Relationships Diagram

```
Project (1) ──< (N) Session (1) ── (1) Workspace (1) ──< (N) WorkspaceFile


RFEWorkflow (1) ──< (N) AgentInfo
            (1) ──< (N) ArtifactInfo

MCPTool [independent, no relationships]

Configuration [global singleton]

SessionStatus [derived from Session]
```

---

## Validation Summary

### Cross-Entity Validation

1. **Session → Project**: Session.project_id must reference existing active Project
2. **Workspace → Session**: Workspace.session_id must reference existing Session
3. **WorkspaceFile → Workspace**: File paths must be within Workspace.root_path
4. **RFEWorkflow → Sessions**: May create multiple Session entities internally

### Security Validation

1. **Path Traversal Prevention**: All file paths validated to prevent `../` attacks
2. **API Key Validation**: Minimum length, format checks on startup
3. **URL Validation**: Base URL must be HTTPS (TLS required)
4. **Size Limits**: Workspace files > 10MB return metadata only, not content

### Business Rule Validation

1. **Project Deletion**: Cannot delete project with active sessions
2. **Session Creation**: Cannot create session in archived project
3. **Session Start**: Cannot start session already in 'running' status
4. **Workspace Access**: Cannot access workspace before session starts

---

## Caching Strategy

### Cacheable Entities

| Entity | TTL | Invalidation Trigger |
|--------|-----|---------------------|
| Project List | 60s | Project create/delete |
| Session Status | 10s | Status update |
| Workspace Metadata | 30s | File modification |
| RFE Templates | 300s | (static, rarely changes) |

### Non-Cacheable Operations

- Create/Update/Delete operations (always fresh)
- Workspace file content (may change frequently)
- Authentication validation (always check)

---

## Error Codes

### Client Errors (4xx)

| Code | HTTP Status | Description | User Action |
|------|-------------|-------------|-------------|
| `AUTH_INVALID` | 401 | Invalid API key | Check API key in config |
| `NOT_FOUND` | 404 | Resource not found | Verify resource ID |
| `RATE_LIMIT` | 429 | Rate limit exceeded | Wait and retry |
| `INVALID_INPUT` | 400 | Invalid parameters | Check parameter format |

### Server Errors (5xx)

| Code | HTTP Status | Description | User Action |
|------|-------------|-------------|-------------|
| `SERVER_ERROR` | 500 | Internal server error | Contact support |
| `SERVICE_UNAVAILABLE` | 503 | Backend unavailable | Retry later |
| `TIMEOUT` | 504 | Request timeout | Increase timeout config |

---

## Next Steps

With the data model defined, proceed to:
1. Generate API contracts (OpenAPI specifications)
2. Create quickstart guide
3. Update agent context files
