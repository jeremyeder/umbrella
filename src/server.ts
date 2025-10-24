/**
 * MCP Server initialization and lifecycle
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { ACPClient } from './client/acp-client.js';
import { loadConfig } from './config/loader.js';
import { createLogger, type Logger } from './utils/logger.js';
import { formatErrorResponse } from './errors/handler.js';
import type { ResolvedACPConfig } from './config/types.js';
import { executeTool } from './tools/index.js';

export class ACPMCPServer {
  private server: Server;
  private client: ACPClient | null = null;
  private logger: Logger;
  private config: ResolvedACPConfig | null = null;

  constructor() {
    this.logger = createLogger(false); // Will be updated with config

    this.server = new Server(
      {
        name: 'acp-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Initialize the server with configuration
   */
  async initialize(): Promise<void> {
    try {
      // Load configuration
      this.config = await loadConfig();
      this.logger = createLogger(this.config.debug);

      this.logger.info('Configuration loaded successfully');

      // Initialize ACP client
      this.client = new ACPClient({
        apiKey: this.config.apiKey,
        baseUrl: this.config.baseUrl,
        timeout: this.config.timeout,
        maxRetries: this.config.retries,
        cacheTTL: this.config.cacheTTL,
        rateLimitPerMinute: this.config.rateLimitPerMinute,
        debug: this.config.debug,
      });

      this.logger.info('ACP MCP Server initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize server', error);
      throw error;
    }
  }

  /**
   * Setup MCP protocol handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Project Management
          {
            name: 'list_projects',
            description: 'List all accessible ACP projects with their metadata',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_project',
            description: 'Create a new ACP project',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Project name (1-100 characters)',
                },
                description: {
                  type: 'string',
                  description: 'Optional project description (max 500 characters)',
                },
              },
              required: ['name'],
            },
          },
          {
            name: 'get_project',
            description: 'Get details of a specific project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID',
                },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'delete_project',
            description: 'Delete a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID to delete',
                },
              },
              required: ['project_id'],
            },
          },

          // Session Management
          {
            name: 'list_sessions',
            description: 'List all sessions in a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID',
                },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'create_session',
            description: 'Create a new session in a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: {
                  type: 'string',
                  description: 'Project ID',
                },
                description: {
                  type: 'string',
                  description: 'Session task description (1-1000 characters)',
                },
                config: {
                  type: 'object',
                  description: 'Optional session configuration',
                  properties: {
                    model: {
                      type: 'string',
                      enum: ['claude-sonnet-4', 'claude-haiku-3'],
                    },
                    timeout: {
                      type: 'number',
                      description: 'Timeout in seconds',
                    },
                    temperature: {
                      type: 'number',
                      description: 'Temperature (0.0-1.0)',
                    },
                    max_tokens: {
                      type: 'number',
                      description: 'Maximum tokens',
                    },
                  },
                },
              },
              required: ['project_id', 'description'],
            },
          },
          {
            name: 'get_session',
            description: 'Get details of a specific session',
            inputSchema: {
              type: 'object',
              properties: {
                session_id: {
                  type: 'string',
                  description: 'Session ID',
                },
              },
              required: ['session_id'],
            },
          },
          {
            name: 'update_session',
            description: 'Update session configuration or description',
            inputSchema: {
              type: 'object',
              properties: {
                session_id: {
                  type: 'string',
                  description: 'Session ID',
                },
                description: {
                  type: 'string',
                  description: 'Updated task description',
                },
                config: {
                  type: 'object',
                  description: 'Updated session configuration',
                },
              },
              required: ['session_id'],
            },
          },
          {
            name: 'delete_session',
            description: 'Delete a session',
            inputSchema: {
              type: 'object',
              properties: {
                session_id: {
                  type: 'string',
                  description: 'Session ID to delete',
                },
              },
              required: ['session_id'],
            },
          },

          // Session Execution
          {
            name: 'start_session',
            description: 'Start executing a session',
            inputSchema: {
              type: 'object',
              properties: {
                session_id: {
                  type: 'string',
                  description: 'Session ID to start',
                },
              },
              required: ['session_id'],
            },
          },
          {
            name: 'stop_session',
            description: 'Stop a running session',
            inputSchema: {
              type: 'object',
              properties: {
                session_id: {
                  type: 'string',
                  description: 'Session ID to stop',
                },
              },
              required: ['session_id'],
            },
          },
          {
            name: 'get_session_status',
            description: 'Get current execution status of a session',
            inputSchema: {
              type: 'object',
              properties: {
                session_id: {
                  type: 'string',
                  description: 'Session ID',
                },
              },
              required: ['session_id'],
            },
          },

          // Workspace Access
          {
            name: 'list_workspace_files',
            description: 'List all files in a session workspace',
            inputSchema: {
              type: 'object',
              properties: {
                session_id: {
                  type: 'string',
                  description: 'Session ID',
                },
                path: {
                  type: 'string',
                  description: 'Optional subdirectory path',
                },
              },
              required: ['session_id'],
            },
          },
          {
            name: 'get_workspace_file',
            description: 'Get contents of a specific workspace file',
            inputSchema: {
              type: 'object',
              properties: {
                session_id: {
                  type: 'string',
                  description: 'Session ID',
                },
                file_path: {
                  type: 'string',
                  description: 'Relative file path within workspace',
                },
              },
              required: ['session_id', 'file_path'],
            },
          },

          // RFE Workflows
          {
            name: 'list_rfe_templates',
            description: 'List available RFE workflow templates',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'create_rfe_workflow',
            description: 'Create a new multi-agent RFE workflow',
            inputSchema: {
              type: 'object',
              properties: {
                feature_description: {
                  type: 'string',
                  description: 'Feature description (1-2000 characters)',
                },
                template_id: {
                  type: 'string',
                  description: 'RFE template ID',
                },
              },
              required: ['feature_description', 'template_id'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      try {
        if (!this.client) {
          throw new Error('Server not initialized. Call initialize() first.');
        }

        const { name, arguments: args } = request.params;

        this.logger.debug(`Tool called: ${name}`, { args });

        // Execute the tool
        const result = await executeTool(name, args, this.client, this.logger);

        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      } catch (error) {
        this.logger.error('Tool execution error', error);

        const errorResponse = formatErrorResponse(error);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(errorResponse, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Run the server
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    this.logger.info('Server running on stdio');
  }

  /**
   * Shutdown the server gracefully
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down server');

    if (this.client) {
      await this.client.close();
    }

    await this.server.close();

    this.logger.info('Server shutdown complete');
  }

  /**
   * Get the underlying ACP client (for tool implementations)
   */
  getClient(): ACPClient {
    if (!this.client) {
      throw new Error('Client not initialized');
    }
    return this.client;
  }

  /**
   * Get the logger instance
   */
  getLogger(): Logger {
    return this.logger;
  }
}
