# umbrella
Umbrella repo for ACP prototyping

## ACP MCP Server

Model Context Protocol (MCP) server for vTeam Agentic Code Platform (ACP) APIs. Enables Claude Desktop and Claude Code to interact with ACP projects, sessions, and workflows through natural language.

### Features

- **Project Management**: Create, list, and manage ACP projects
- **Session Management**: Create, configure, and manage agentic sessions
- **Session Execution**: Start, stop, and monitor session execution
- **Workspace Access**: Browse and retrieve files from session workspaces
- **RFE Workflows**: Create multi-agent requirements engineering workflows

### Quick Start

1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Configure API key: `export MCP_API_KEY="your-key"`
4. Configure base URL: `export MCP_BASE_URL="https://api.acp.example.com"`
5. Run the server: `npm start`

For detailed documentation, see the [feature specification](specs/001-acp-mcp-server/spec.md).
