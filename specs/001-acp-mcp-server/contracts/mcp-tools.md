# MCP Tools Contract Specification

**Feature**: 001-acp-mcp-server
**Date**: 2025-10-24
**Purpose**: Define all MCP tool interfaces, parameters, and responses

## Overview

This document specifies the contract for all 16 MCP tools exposed by the ACP MCP Server. These tools follow the Model Context Protocol specification and integrate with Claude Desktop and Claude Code.

---

## Tool Categories

1. **Project Management** (4 tools): CRUD operations for projects
2. **Session Management** (5 tools): CRUD operations for sessions
3. **Session Execution** (3 tools): Start/stop/monitor sessions
4. **Workspace Access** (2 tools): Browse and retrieve workspace files
5. **RFE Workflows** (2 tools): Requirements engineering workflows

---

## 1. Project Management Tools

### 1.1 list_projects

**Description**: List all accessible ACP projects with their metadata.

**Parameters**: None (empty object)

**Returns**:
```typescript
{
  success: boolean;
  data: {
    projects: Array<{
      id: string;
      name: string;
      description?: string;
      owner: string;
      status: 'active' | 'archived';
      created_at: string;
      updated_at: string;
    }>;
    total: number;
  };
  message: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj_abc123",
        "name": "Security Audit Q4",
        "description": "Automated security analysis",
        "owner": "user_xyz789",
        "status": "active",
        "created_at": "2025-10-24T10:00:00Z",
        "updated_at": "2025-10-24T10:00:00Z"
      }
    ],
    "total": 1
  },
  "message": "Retrieved 1 project(s)"
}
```

**Errors**:
- `AUTH_INVALID` (401): Invalid API key → Check your configuration
- `SERVER_ERROR` (500): Backend unavailable → Retry later

---

### 1.2 create_project

**Description**: Create a new ACP project.

**Parameters**:
```typescript
{
  name: string;           // Required, 1-100 chars
  description?: string;   // Optional, max 500 chars
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    project: {
      id: string;
      name: string;
      description?: string;
      owner: string;
      status: 'active';
      created_at: string;
      updated_at: string;
    };
  };
  message: string;
}
```

**Example Request**:
```json
{
  "name": "New Feature Development",
  "description": "Development project for user authentication feature"
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "proj_new123",
      "name": "New Feature Development",
      "description": "Development project for user authentication feature",
      "owner": "user_xyz789",
      "status": "active",
      "created_at": "2025-10-24T12:00:00Z",
      "updated_at": "2025-10-24T12:00:00Z"
    }
  },
  "message": "Project created successfully"
}
```

**Errors**:
- `INVALID_INPUT` (400): Invalid name/description → Check parameter format
- `AUTH_INVALID` (401): Invalid API key
- `SERVER_ERROR` (500): Backend error

---

### 1.3 get_project

**Description**: Retrieve detailed information about a specific project including all sessions.

**Parameters**:
```typescript
{
  project_id: string;  // Required, UUID format
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    project: {
      id: string;
      name: string;
      description?: string;
      owner: string;
      status: 'active' | 'archived';
      created_at: string;
      updated_at: string;
      sessions_count: number;
    };
  };
  message: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "proj_abc123",
      "name": "Security Audit Q4",
      "description": "Automated security analysis",
      "owner": "user_xyz789",
      "status": "active",
      "created_at": "2025-10-24T10:00:00Z",
      "updated_at": "2025-10-24T10:00:00Z",
      "sessions_count": 3
    }
  },
  "message": "Project retrieved successfully"
}
```

**Errors**:
- `NOT_FOUND` (404): Project not found → Verify project ID
- `AUTH_INVALID` (401): Invalid API key

---

### 1.4 delete_project

**Description**: Delete an existing project and cascade delete all associated sessions.

**Parameters**:
```typescript
{
  project_id: string;  // Required, UUID format
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    deleted_project_id: string;
    deleted_sessions_count: number;
  };
  message: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "deleted_project_id": "proj_abc123",
    "deleted_sessions_count": 3
  },
  "message": "Project and 3 session(s) deleted successfully"
}
```

**Errors**:
- `NOT_FOUND` (404): Project not found
- `AUTH_INVALID` (401): Invalid API key

---

## 2. Session Management Tools

### 2.1 list_sessions

**Description**: List all sessions within a specified project.

**Parameters**:
```typescript
{
  project_id: string;  // Required, UUID format
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    sessions: Array<{
      id: string;
      project_id: string;
      description: string;
      status: 'created' | 'running' | 'paused' | 'completed' | 'failed';
      progress?: number;
      created_at: string;
      started_at?: string;
      completed_at?: string;
    }>;
    total: number;
  };
  message: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "sess_xyz789",
        "project_id": "proj_abc123",
        "description": "Security vulnerability scan",
        "status": "completed",
        "progress": 100,
        "created_at": "2025-10-24T10:30:00Z",
        "started_at": "2025-10-24T10:31:00Z",
        "completed_at": "2025-10-24T10:45:00Z"
      }
    ],
    "total": 1
  },
  "message": "Retrieved 1 session(s)"
}
```

---

### 2.2 create_session

**Description**: Create a new session with project association, description, and configuration parameters.

**Parameters**:
```typescript
{
  project_id: string;    // Required
  description: string;   // Required, 1-1000 chars
  config?: {
    model?: 'claude-sonnet-4' | 'claude-haiku-3';  // Default: claude-sonnet-4
    timeout?: number;     // Default: 300 (seconds)
    temperature?: number; // Default: 0.7 (0.0-1.0)
    max_tokens?: number;  // Default: 4096
  };
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    session: {
      id: string;
      project_id: string;
      description: string;
      status: 'created';
      config: {
        model: string;
        timeout: number;
        temperature: number;
        max_tokens: number;
      };
      created_at: string;
    };
  };
  message: string;
}
```

**Example Request**:
```json
{
  "project_id": "proj_abc123",
  "description": "Analyze authentication module for SQL injection vulnerabilities",
  "config": {
    "model": "claude-sonnet-4",
    "timeout": 600,
    "temperature": 0.7
  }
}
```

---

### 2.3 get_session

**Description**: Retrieve detailed session information including status, logs, and metadata.

**Parameters**:
```typescript
{
  session_id: string;  // Required
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    session: {
      id: string;
      project_id: string;
      description: string;
      status: 'created' | 'running' | 'paused' | 'completed' | 'failed';
      progress?: number;
      current_phase?: string;
      config: object;
      created_at: string;
      started_at?: string;
      completed_at?: string;
      error?: {
        code: string;
        message: string;
        details?: object;
      };
    };
  };
  message: string;
}
```

---

### 2.4 update_session

**Description**: Update session configuration parameters (only allowed when status is 'created').

**Parameters**:
```typescript
{
  session_id: string;  // Required
  config: {
    model?: 'claude-sonnet-4' | 'claude-haiku-3';
    timeout?: number;
    temperature?: number;
    max_tokens?: number;
  };
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    session: {
      id: string;
      config: object;
      updated_at: string;
    };
  };
  message: string;
}
```

**Errors**:
- `INVALID_INPUT` (400): Cannot update running session

---

### 2.5 delete_session

**Description**: Delete an individual session.

**Parameters**:
```typescript
{
  session_id: string;  // Required
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    deleted_session_id: string;
  };
  message: string;
}
```

---

## 3. Session Execution Tools

### 3.1 start_session

**Description**: Start session execution.

**Parameters**:
```typescript
{
  session_id: string;  // Required
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    session: {
      id: string;
      status: 'running';
      started_at: string;
    };
  };
  message: string;
}
```

**Errors**:
- `INVALID_INPUT` (400): Session already running

---

### 3.2 stop_session

**Description**: Stop a running session gracefully.

**Parameters**:
```typescript
{
  session_id: string;  // Required
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    session: {
      id: string;
      status: 'paused';
      stopped_at: string;
    };
  };
  message: string;
}
```

---

### 3.3 get_session_status

**Description**: Retrieve current session status including progress indicators.

**Parameters**:
```typescript
{
  session_id: string;  // Required
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    status: {
      status: 'created' | 'running' | 'paused' | 'completed' | 'failed';
      progress?: number;          // 0-100
      current_phase?: string;
      start_time?: string;
      end_time?: string;
      duration_ms?: number;
      error?: {
        code: string;
        message: string;
      };
    };
  };
  message: string;
}
```

**Caching**: Cached for 10 seconds

---

## 4. Workspace Access Tools

### 4.1 list_workspace_files

**Description**: List all files and directories in a session workspace.

**Parameters**:
```typescript
{
  session_id: string;  // Required
  path?: string;       // Optional, default: "/" (root)
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    files: Array<{
      path: string;
      size_bytes: number;
      mime_type: string;
      is_binary: boolean;
      modified_at: string;
    }>;
    total_files: number;
    total_size_bytes: number;
  };
  message: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "path": "analysis/security-report.md",
        "size_bytes": 8192,
        "mime_type": "text/markdown",
        "is_binary": false,
        "modified_at": "2025-10-24T11:00:00Z"
      },
      {
        "path": "results/findings.json",
        "size_bytes": 2048,
        "mime_type": "application/json",
        "is_binary": false,
        "modified_at": "2025-10-24T11:05:00Z"
      }
    ],
    "total_files": 2,
    "total_size_bytes": 10240
  },
  "message": "Retrieved 2 file(s)"
}
```

**Errors**:
- `NOT_FOUND` (404): Session not found or workspace not accessible
- `INVALID_INPUT` (400): Invalid path (e.g., contains `..`)

---

### 4.2 get_workspace_file

**Description**: Retrieve specific file contents from a session workspace with path validation.

**Parameters**:
```typescript
{
  session_id: string;  // Required
  file_path: string;   // Required, relative path
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    file: {
      path: string;
      content: string;        // Text content or base64 for binary
      size_bytes: number;
      mime_type: string;
      is_binary: boolean;
      encoding: 'utf-8' | 'base64';
    };
  };
  message: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "file": {
      "path": "analysis/security-report.md",
      "content": "# Security Analysis Report\n\n## Findings\n...",
      "size_bytes": 8192,
      "mime_type": "text/markdown",
      "is_binary": false,
      "encoding": "utf-8"
    }
  },
  "message": "File retrieved successfully"
}
```

**Errors**:
- `NOT_FOUND` (404): File not found
- `INVALID_INPUT` (400): Path contains `..` (security violation)
- `FILE_TOO_LARGE` (400): File exceeds 10MB limit

---

## 5. RFE Workflow Tools

### 5.1 list_rfe_templates

**Description**: List available RFE workflow templates.

**Parameters**: None

**Returns**:
```typescript
{
  success: boolean;
  data: {
    templates: Array<{
      id: string;
      name: string;
      description: string;
      agents: Array<string>;  // Agent names
    }>;
    total: number;
  };
  message: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "standard-rfe-v1",
        "name": "Standard RFE Workflow",
        "description": "Full RFE with Product, Architecture, UX, and Engineering perspectives",
        "agents": ["Parker", "Archie", "Uma", "Stella"]
      }
    ],
    "total": 1
  },
  "message": "Retrieved 1 template(s)"
}
```

---

### 5.2 create_rfe_workflow

**Description**: Create a new RFE workflow with feature description and optional context.

**Parameters**:
```typescript
{
  feature_description: string;  // Required, 1-2000 chars
  template_id?: string;          // Optional, default: "standard-rfe-v1"
  context?: string;              // Optional, additional context
}
```

**Returns**:
```typescript
{
  success: boolean;
  data: {
    workflow: {
      id: string;
      feature_description: string;
      template_id: string;
      agent_roster: Array<{
        name: string;
        role: string;
        status: 'pending';
      }>;
      status: 'created';
      created_at: string;
    };
  };
  message: string;
}
```

**Example Request**:
```json
{
  "feature_description": "Real-time notification system with multi-channel support (email, SMS, push notifications)",
  "template_id": "standard-rfe-v1",
  "context": "Targeting mobile-first users, need high availability"
}
```

---

## Error Response Format

All tools return errors in this format:

```typescript
{
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    details?: object;       // Additional error context
    remediation: string;    // Actionable guidance for resolution
  };
}
```

**Example Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID",
    "message": "Authentication failed: Invalid API key",
    "details": {
      "provided_key_prefix": "acp_key_abc..."
    },
    "remediation": "Check your API key in .mcp.json or MCP_API_KEY environment variable. Get a valid key from the ACP dashboard."
  }
}
```

---

## Common Error Codes

| Code | HTTP Status | Description | User Action |
|------|-------------|-------------|-------------|
| `AUTH_INVALID` | 401 | Invalid API key | Check API key configuration |
| `NOT_FOUND` | 404 | Resource not found | Verify resource ID |
| `INVALID_INPUT` | 400 | Invalid parameters | Check parameter format and constraints |
| `RATE_LIMIT` | 429 | Rate limit exceeded | Wait before retrying, check rate limit config |
| `SERVER_ERROR` | 500 | Internal server error | Contact support if persists |
| `SERVICE_UNAVAILABLE` | 503 | Backend unavailable | Retry after a few minutes |
| `TIMEOUT` | 504 | Request timeout | Increase timeout in configuration |
| `FILE_TOO_LARGE` | 400 | File exceeds size limit | File too large to retrieve inline |

---

## Tool Response Standards

All tools follow these standards:

1. **Consistent Format**: Every response has `success`, `data`/`error`, and `message` fields
2. **Actionable Errors**: Error messages include remediation guidance
3. **Type Safety**: Zod schemas validate all inputs and outputs
4. **Performance**: Responses optimized for Claude Desktop display
5. **Security**: Sensitive data (API keys, tokens) never appear in responses
6. **Timestamps**: All timestamps use ISO 8601 format with UTC timezone

---

## Next Steps

- Implement tool handlers in `src/tools/`
- Add integration tests using MSW to mock ACP backend
- Validate against MCP Inspector tool
- Document tool usage in quickstart guide
