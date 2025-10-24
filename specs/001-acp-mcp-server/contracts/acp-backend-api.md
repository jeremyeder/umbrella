# ACP Backend API Contract

**Feature**: 001-acp-mcp-server
**Date**: 2025-10-24
**Purpose**: Document expected ACP backend API endpoints and contracts

## Overview

This document specifies the expected REST API contract for the vTeam ACP backend (Go + Gin). The MCP server will integrate with these endpoints using the undici HTTP client.

**Base URL**: Configured via `.mcp.json` or `MCP_BASE_URL` environment variable
**Authentication**: Bearer token in Authorization header
**Content-Type**: `application/json`

---

## Authentication

All requests require authentication:

```http
GET /api/projects HTTP/1.1
Host: api.acp.example.com
Authorization: Bearer {apiKey}
Content-Type: application/json
```

**Response Codes**:
- `401 Unauthorized`: Invalid or missing API key
- `403 Forbidden`: Valid key but insufficient permissions

---

## Project Endpoints

### List Projects

```http
GET /api/projects
```

**Response** (200 OK):
```json
{
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
}
```

---

### Create Project

```http
POST /api/projects
Content-Type: application/json

{
  "name": "New Project",
  "description": "Optional description"
}
```

**Response** (201 Created):
```json
{
  "id": "proj_new123",
  "name": "New Project",
  "description": "Optional description",
  "owner": "user_xyz789",
  "status": "active",
  "created_at": "2025-10-24T12:00:00Z",
  "updated_at": "2025-10-24T12:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input (missing name, name too long, etc.)
- `401 Unauthorized`: Authentication failure
- `429 Too Many Requests`: Rate limit exceeded

---

### Get Project

```http
GET /api/projects/{project_id}
```

**Response** (200 OK):
```json
{
  "id": "proj_abc123",
  "name": "Security Audit Q4",
  "description": "Automated security analysis",
  "owner": "user_xyz789",
  "status": "active",
  "created_at": "2025-10-24T10:00:00Z",
  "updated_at": "2025-10-24T10:00:00Z",
  "sessions_count": 3
}
```

**Error Responses**:
- `404 Not Found`: Project does not exist

---

### Delete Project

```http
DELETE /api/projects/{project_id}
```

**Response** (200 OK):
```json
{
  "deleted_project_id": "proj_abc123",
  "deleted_sessions_count": 3
}
```

---

## Session Endpoints

### List Sessions

```http
GET /api/projects/{project_id}/sessions
```

**Response** (200 OK):
```json
{
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
}
```

---

### Create Session

```http
POST /api/projects/{project_id}/sessions
Content-Type: application/json

{
  "description": "Analyze authentication module for SQL injection",
  "config": {
    "model": "claude-sonnet-4",
    "timeout": 600,
    "temperature": 0.7,
    "max_tokens": 8192
  }
}
```

**Response** (201 Created):
```json
{
  "id": "sess_new789",
  "project_id": "proj_abc123",
  "description": "Analyze authentication module for SQL injection",
  "status": "created",
  "config": {
    "model": "claude-sonnet-4",
    "timeout": 600,
    "temperature": 0.7,
    "max_tokens": 8192
  },
  "created_at": "2025-10-24T13:00:00Z"
}
```

---

### Get Session

```http
GET /api/sessions/{session_id}
```

**Response** (200 OK):
```json
{
  "id": "sess_xyz789",
  "project_id": "proj_abc123",
  "description": "Security vulnerability scan",
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

---

### Update Session

```http
PATCH /api/sessions/{session_id}
Content-Type: application/json

{
  "config": {
    "timeout": 900
  }
}
```

**Response** (200 OK):
```json
{
  "id": "sess_xyz789",
  "config": {
    "model": "claude-sonnet-4",
    "timeout": 900,
    "temperature": 0.7,
    "max_tokens": 8192
  },
  "updated_at": "2025-10-24T13:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Cannot update running session

---

### Delete Session

```http
DELETE /api/sessions/{session_id}
```

**Response** (200 OK):
```json
{
  "deleted_session_id": "sess_xyz789"
}
```

---

## Session Execution Endpoints

### Start Session

```http
POST /api/sessions/{session_id}/start
```

**Response** (200 OK):
```json
{
  "id": "sess_xyz789",
  "status": "running",
  "started_at": "2025-10-24T14:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Session already running
- `404 Not Found`: Session does not exist

---

### Stop Session

```http
POST /api/sessions/{session_id}/stop
```

**Response** (200 OK):
```json
{
  "id": "sess_xyz789",
  "status": "paused",
  "stopped_at": "2025-10-24T14:15:00Z"
}
```

---

### Get Session Status

```http
GET /api/sessions/{session_id}/status
```

**Response** (200 OK):
```json
{
  "status": "running",
  "progress": 65,
  "current_phase": "code_review",
  "start_time": "2025-10-24T14:00:00Z",
  "end_time": null,
  "duration_ms": null,
  "error": null
}
```

---

## Workspace Endpoints

### List Workspace Files

```http
GET /api/sessions/{session_id}/workspace?path=/analysis
```

**Query Parameters**:
- `path` (optional): Directory path, default="/" (root)

**Response** (200 OK):
```json
{
  "files": [
    {
      "path": "analysis/security-report.md",
      "size_bytes": 8192,
      "mime_type": "text/markdown",
      "is_binary": false,
      "modified_at": "2025-10-24T11:00:00Z"
    },
    {
      "path": "analysis/findings.json",
      "size_bytes": 2048,
      "mime_type": "application/json",
      "is_binary": false,
      "modified_at": "2025-10-24T11:05:00Z"
    }
  ],
  "total_files": 2,
  "total_size_bytes": 10240
}
```

**Error Responses**:
- `404 Not Found`: Session not found or workspace not accessible
- `400 Bad Request`: Invalid path (contains `..`)

---

### Get Workspace File

```http
GET /api/sessions/{session_id}/workspace/{file_path}
```

**Example**:
```http
GET /api/sessions/sess_xyz789/workspace/analysis/security-report.md
```

**Response** (200 OK):
```json
{
  "path": "analysis/security-report.md",
  "content": "# Security Analysis Report\n\n## Findings\n...",
  "size_bytes": 8192,
  "mime_type": "text/markdown",
  "is_binary": false,
  "encoding": "utf-8"
}
```

**Binary File Response**:
```json
{
  "path": "diagrams/architecture.png",
  "content": "iVBORw0KGgoAAAANSUhEUgAAA...",
  "size_bytes": 524288,
  "mime_type": "image/png",
  "is_binary": true,
  "encoding": "base64"
}
```

**Error Responses**:
- `404 Not Found`: File not found
- `400 Bad Request`: Path security violation (contains `..`)
- `413 Payload Too Large`: File exceeds 10MB limit

---

## RFE Workflow Endpoints

### List RFE Templates

```http
GET /api/rfe/templates
```

**Response** (200 OK):
```json
{
  "templates": [
    {
      "id": "standard-rfe-v1",
      "name": "Standard RFE Workflow",
      "description": "Full RFE with Product, Architecture, UX, and Engineering perspectives",
      "agents": ["Parker", "Archie", "Uma", "Stella"]
    }
  ],
  "total": 1
}
```

---

### Create RFE Workflow

```http
POST /api/rfe/workflows
Content-Type: application/json

{
  "feature_description": "Real-time notification system with multi-channel support",
  "template_id": "standard-rfe-v1",
  "context": "Targeting mobile-first users, need high availability"
}
```

**Response** (201 Created):
```json
{
  "id": "rfe_flow_abc123",
  "feature_description": "Real-time notification system with multi-channel support",
  "template_id": "standard-rfe-v1",
  "agent_roster": [
    {
      "name": "Parker",
      "role": "Product Manager",
      "status": "pending",
      "completed_at": null
    },
    {
      "name": "Archie",
      "role": "Architect",
      "status": "pending",
      "completed_at": null
    },
    {
      "name": "Uma",
      "role": "UX Team Lead",
      "status": "pending",
      "completed_at": null
    },
    {
      "name": "Stella",
      "role": "Staff Engineer",
      "status": "pending",
      "completed_at": null
    }
  ],
  "current_phase": "initialization",
  "status": "created",
  "artifacts": [],
  "created_at": "2025-10-24T15:00:00Z",
  "completed_at": null
}
```

---

### Get RFE Workflow Status

```http
GET /api/rfe/workflows/{workflow_id}
```

**Response** (200 OK):
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
      "completed_at": "2025-10-24T15:30:00Z"
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
  "created_at": "2025-10-24T15:00:00Z",
  "completed_at": null
}
```

---

## Error Response Format

All ACP backend error responses follow this format:

```json
{
  "error": {
    "code": "AUTH_INVALID",
    "message": "Invalid API key",
    "details": {
      "provided_key_prefix": "acp_key_abc..."
    }
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200 OK` | Success | Successful GET, PUT, PATCH, DELETE |
| `201 Created` | Created | Successful POST creating resource |
| `400 Bad Request` | Client error | Invalid input, validation failure |
| `401 Unauthorized` | Auth failure | Missing or invalid API key |
| `403 Forbidden` | Permission denied | Valid key but insufficient permissions |
| `404 Not Found` | Resource not found | Project/session/file does not exist |
| `413 Payload Too Large` | File too large | Workspace file exceeds 10MB |
| `429 Too Many Requests` | Rate limited | Exceeded rate limit threshold |
| `500 Internal Server Error` | Server error | Backend error |
| `503 Service Unavailable` | Unavailable | Backend temporarily down |
| `504 Gateway Timeout` | Timeout | Request exceeded timeout |

---

## Rate Limiting

**Default Limits**:
- 60 requests per minute per API key
- Burst: 10 requests per second

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1635724800
```

**Rate Limit Response** (429):
```json
{
  "error": {
    "code": "RATE_LIMIT",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 60,
      "remaining": 0,
      "reset_at": "2025-10-24T16:00:00Z"
    }
  }
}
```

---

## Retry Strategy

The MCP server implements exponential backoff retry for transient errors:

**Retry Conditions**:
- HTTP 429 (Rate Limit): Retry with delay from `Retry-After` header
- HTTP 500-503: Retry with exponential backoff
- Network errors (ECONNRESET, ETIMEDOUT): Retry with exponential backoff

**Retry Configuration**:
- Max retries: 3
- Initial delay: 1 second
- Backoff factor: 2x (delays: 1s, 2s, 4s)
- Max delay: 30 seconds

**Non-Retryable Errors**:
- HTTP 400 (Bad Request): Client error, fix input
- HTTP 401 (Unauthorized): Invalid credentials
- HTTP 404 (Not Found): Resource doesn't exist
- HTTP 413 (Payload Too Large): File size issue

---

## Health Check

```http
GET /health
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-10-24T16:00:00Z"
}
```

---

## Next Steps

- Implement ACP client wrapper in `src/client/acp-client.ts`
- Add request/response type definitions in `src/client/types.ts`
- Implement retry logic with undici interceptors
- Add integration tests with MSW mocking these endpoints
