# Quick Start Guide: ACP MCP Server

**Feature**: 001-acp-mcp-server
**Date**: 2025-10-24
**Purpose**: Get started with the ACP MCP Server in under 10 minutes

## Overview

The ACP MCP Server exposes the vTeam ACP (Agentic Code Platform) APIs to Claude Desktop and Claude Code, enabling you to create and manage AI-powered agentic sessions through natural language commands.

**What you'll accomplish**:
1. Install and configure the MCP server
2. Connect to your ACP backend
3. Execute your first MCP tool (list projects)
4. Create a session and monitor its progress

**Time Required**: ~10 minutes

---

## Prerequisites

- **Node.js 20+** installed on your system
- **ACP backend access**: Base URL and API key
- **Claude Desktop** or **Claude Code** (for testing)
- **npm** package manager

---

## Step 1: Installation

### From npm (when published):

```bash
npm install -g @vteam/acp-mcp-server
```

### From source (development):

```bash
# Clone repository
git clone https://github.com/vteam/acp-mcp-server.git
cd acp-mcp-server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Link globally for testing
npm link
```

---

## Step 2: Configuration

Create a configuration file in your project directory or home directory:

### Option A: JSON Configuration File

Create `.mcp.json`:

```json
{
  "apiKey": "your_acp_api_key_here",
  "baseUrl": "https://api.acp.example.com",
  "timeout": 60000,
  "retries": 3,
  "debug": false
}
```

### Option B: Environment Variables

Set environment variables:

```bash
export MCP_API_KEY="your_acp_api_key_here"
export MCP_BASE_URL="https://api.acp.example.com"
export MCP_TIMEOUT=60000
export MCP_RETRIES=3
export MCP_DEBUG=false
```

### Configuration Precedence

Configuration is loaded in this order (highest priority first):

1. **Explicit path**: `--config /path/to/config.json`
2. **Current directory**: `./.mcp.json`
3. **Workspace root**: `../../.mcp.json` (searches up)
4. **Environment variables**: `MCP_*` variables
5. **Defaults**: Built-in default values

---

## Step 3: Verify Installation

Test that the server starts correctly:

```bash
# Start the MCP server in stdio mode
acp-mcp-server

# You should see:
# ACP MCP Server v1.0.0
# Configuration loaded from: /path/to/.mcp.json
# ✓ Authentication validated
# ✓ Connected to ACP backend
# Server ready
```

Press `Ctrl+C` to stop the server.

---

## Step 4: Configure Claude Desktop

Add the MCP server to your Claude Desktop configuration:

### macOS/Linux:

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "acp": {
      "command": "acp-mcp-server",
      "args": [],
      "env": {
        "MCP_API_KEY": "your_acp_api_key_here",
        "MCP_BASE_URL": "https://api.acp.example.com"
      }
    }
  }
}
```

### Windows:

Edit `%APPDATA%\Claude\claude_desktop_config.json` with the same content.

### Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

---

## Step 5: Test MCP Tools

Open Claude Desktop and try these commands:

### List Projects

```
@vteam list projects
```

**Expected Response**:
```
I found 3 projects in your ACP account:

1. Security Audit Q4 (proj_abc123)
   Status: active
   Created: 2025-10-24

2. Feature Development (proj_def456)
   Status: active
   Created: 2025-10-20

3. Code Review Sprint (proj_ghi789)
   Status: archived
   Created: 2025-10-15
```

### Create a New Project

```
@vteam create project named "API Security Analysis"
```

**Expected Response**:
```
✓ Project created successfully!

Project ID: proj_new123
Name: API Security Analysis
Status: active
Created: 2025-10-24T10:00:00Z

You can now create sessions in this project.
```

### Create a Session

```
@vteam create session in proj_new123 to analyze authentication module for SQL injection vulnerabilities
```

**Expected Response**:
```
✓ Session created successfully!

Session ID: sess_xyz789
Project: API Security Analysis (proj_new123)
Description: analyze authentication module for SQL injection vulnerabilities
Status: created
Model: claude-sonnet-4

Ready to start. Use: @vteam start session sess_xyz789
```

### Start the Session

```
@vteam start session sess_xyz789
```

**Expected Response**:
```
✓ Session started!

Session ID: sess_xyz789
Status: running
Started: 2025-10-24T10:30:00Z

The AI agent is now analyzing your code. Check progress with:
@vteam get session status sess_xyz789
```

### Check Session Status

```
@vteam get session status sess_xyz789
```

**Expected Response**:
```
Session Status: running

Progress: 45%
Current Phase: code_analysis
Duration: 5 minutes 30 seconds

The session is actively analyzing your authentication module.
Check again in a few minutes for updated progress.
```

---

## Step 6: Retrieve Results

Once the session completes:

### List Workspace Files

```
@vteam list workspace files for sess_xyz789
```

**Expected Response**:
```
Workspace contains 5 files (15.2 KB total):

1. analysis/security-report.md (8.1 KB)
   Modified: 2025-10-24T10:45:00Z

2. findings/sql-injection-risks.json (2.5 KB)
   Modified: 2025-10-24T10:44:00Z

3. recommendations/remediation-steps.md (3.8 KB)
   Modified: 2025-10-24T10:45:00Z

4. results/summary.txt (0.8 KB)
   Modified: 2025-10-24T10:45:00Z
```

### Get Specific File

```
@vteam get workspace file analysis/security-report.md for sess_xyz789
```

**Expected Response**:
```markdown
# Security Analysis Report

## Executive Summary

The authentication module was analyzed for SQL injection vulnerabilities.
3 critical issues were identified and 5 recommendations provided.

## Critical Findings

### 1. Unsanitized User Input in Login Query
...
```

---

## Common Workflows

### Workflow 1: Quick Code Analysis

```bash
# 1. Create project
@vteam create project named "Quick Analysis"

# 2. Create and start session
@vteam create session in proj_xyz to review security of auth module
@vteam start session sess_abc

# 3. Monitor and retrieve results
@vteam get session status sess_abc
@vteam list workspace files for sess_abc
@vteam get workspace file analysis/report.md for sess_abc
```

### Workflow 2: RFE (Requirements Engineering)

```bash
# 1. Create RFE workflow
@vteam create RFE workflow for feature: real-time notifications with email, SMS, and push support

# 2. Monitor progress
@vteam get RFE workflow status rfe_flow_xyz

# 3. Retrieve artifacts
@vteam list workspace files for rfe_flow_xyz
@vteam get workspace file rfe/requirements.md for rfe_flow_xyz
```

### Workflow 3: Team Collaboration

```bash
# 1. List shared projects
@vteam list projects

# 2. View sessions created by teammates
@vteam list sessions in proj_shared

# 3. Access teammate's analysis results
@vteam get session sess_teammate
@vteam list workspace files for sess_teammate
```

---

## Testing with MCP Inspector

The MCP Inspector provides a web UI for testing and debugging MCP tools:

```bash
# Install inspector
npm install -g @modelcontextprotocol/inspector

# Launch inspector
npx @modelcontextprotocol/inspector acp-mcp-server
```

This opens:
- **Web UI**: http://localhost:6274
- **Interactive tool testing**: Test each tool with custom inputs
- **Real-time debugging**: See requests/responses

---

## Troubleshooting

### "Authentication failed" Error

**Problem**: Server can't authenticate with ACP backend

**Solutions**:
1. Verify API key is correct in `.mcp.json` or `MCP_API_KEY`
2. Check key hasn't expired in ACP dashboard
3. Ensure no extra spaces in configuration
4. Test key with curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_KEY" https://api.acp.example.com/health
   ```

---

### "Server not starting" Error

**Problem**: Server fails to start or crashes immediately

**Solutions**:
1. Check Node.js version: `node --version` (must be 20+)
2. Enable debug logging: `MCP_DEBUG=true acp-mcp-server`
3. Validate configuration syntax:
   ```bash
   cat .mcp.json | jq .  # Pretty-print JSON to check syntax
   ```
4. Check logs:
   ```bash
   acp-mcp-server 2>&1 | tee server.log
   ```

---

### "Rate limit exceeded" Error

**Problem**: Too many requests in short time

**Solutions**:
1. Wait 60 seconds and retry
2. Increase rate limit in configuration (if you have permissions):
   ```json
   {
     "rateLimitPerMinute": 120
   }
   ```
3. Check for unintentional loops in your code

---

### "Backend unavailable" Error

**Problem**: Can't reach ACP backend API

**Solutions**:
1. Verify `baseUrl` is correct
2. Check network connectivity:
   ```bash
   curl https://api.acp.example.com/health
   ```
3. Check firewall/proxy settings
4. Verify backend is operational (ask your admin)

---

### Claude Desktop Not Seeing MCP Server

**Problem**: @vteam commands don't work in Claude Desktop

**Solutions**:
1. Verify configuration file location:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
2. Check JSON syntax (no trailing commas, proper quotes)
3. Restart Claude Desktop completely (quit and reopen)
4. Check Claude Desktop logs for MCP errors
5. Test server independently: `acp-mcp-server`

---

## Performance Tips

### 1. Enable Caching

Caching reduces backend load and improves response time:

```json
{
  "cacheTTL": 60000  // 60 seconds (default)
}
```

**What's cached**:
- Project listings (60s TTL)
- Session status (10s TTL)
- Workspace metadata (30s TTL)
- RFE templates (5min TTL)

### 2. Adjust Timeouts

For long-running operations:

```json
{
  "timeout": 120000  // 2 minutes instead of default 60s
}
```

### 3. Concurrent Operations

MCP server handles multiple concurrent requests efficiently (up to 100).

---

## Next Steps

Now that you're set up, explore more capabilities:

1. **Read the Full Documentation**: See `docs/` directory
2. **Try Advanced Workflows**: RFE workflows, multi-session analysis
3. **Integrate with CI/CD**: Automate security scans
4. **Customize Configuration**: Tune performance and behavior
5. **Contribute**: Report issues or contribute features

---

## Getting Help

- **Documentation**: `/docs` directory in repository
- **Issues**: https://github.com/vteam/acp-mcp-server/issues
- **Discussions**: https://github.com/vteam/acp-mcp-server/discussions
- **Email**: support@vteam.example.com

---

## Configuration Reference

### Complete .mcp.json Example

```json
{
  "apiKey": "acp_key_your_key_here",
  "baseUrl": "https://api.acp.example.com",
  "timeout": 60000,
  "retries": 3,
  "cacheTTL": 60000,
  "rateLimitPerMinute": 60,
  "debug": false
}
```

### All Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `MCP_API_KEY` | string | (required) | ACP API authentication key |
| `MCP_BASE_URL` | string | (required) | ACP backend base URL |
| `MCP_TIMEOUT` | number | 30000 | Request timeout (ms) |
| `MCP_RETRIES` | number | 3 | Max retry attempts |
| `MCP_CACHE_TTL` | number | 60000 | Cache TTL (ms), 0=disabled |
| `MCP_RATE_LIMIT_PER_MINUTE` | number | 60 | Max requests per minute |
| `MCP_DEBUG` | boolean | false | Enable debug logging |

---

## Success Criteria

You've successfully completed the quickstart if you can:

- ✅ Start the MCP server without errors
- ✅ List your ACP projects via Claude Desktop
- ✅ Create a new project via natural language command
- ✅ Create and start a session
- ✅ Monitor session progress
- ✅ Retrieve workspace files

**Congratulations!** You're now ready to leverage AI-powered agentic workflows through Claude interfaces.

---

**Last Updated**: 2025-10-24
**Version**: 1.0.0
