/**
 * Tool registration and exports
 */
import type { ACPClient } from '../client/acp-client.js';
import type { Logger } from '../utils/logger.js';
import { formatErrorResponse } from '../errors/handler.js';

// Import all tool modules
import * as projects from './projects.js';
import * as sessions from './sessions.js';
import * as execution from './execution.js';
import * as workspace from './workspace.js';
import * as rfe from './rfe.js';

export type ToolHandler = (client: ACPClient, args: any, logger: Logger) => Promise<string>;

/**
 * Format tool response for display in Claude Desktop/Code
 */
function formatToolResponse(data: unknown): string {
  if (typeof data === 'string') {
    return data;
  }

  return JSON.stringify(data, null, 2);
}

/**
 * Tool handler registry
 */
export const toolHandlers: Record<string, ToolHandler> = {
  // Project Management
  list_projects: async (client, _args, logger) => {
    logger.debug('Executing list_projects');
    const result = await projects.listProjects(client);
    return formatToolResponse(result);
  },

  create_project: async (client, args, logger) => {
    logger.debug('Executing create_project', args);
    const result = await projects.createProject(client, args);
    return formatToolResponse(result);
  },

  get_project: async (client, args, logger) => {
    logger.debug('Executing get_project', args);
    const result = await projects.getProject(client, args.project_id);
    return formatToolResponse(result);
  },

  delete_project: async (client, args, logger) => {
    logger.debug('Executing delete_project', args);
    await projects.deleteProject(client, args.project_id);
    return 'Project deleted successfully';
  },

  // Session Management
  list_sessions: async (client, args, logger) => {
    logger.debug('Executing list_sessions', args);
    const result = await sessions.listSessions(client, args.project_id);
    return formatToolResponse(result);
  },

  create_session: async (client, args, logger) => {
    logger.debug('Executing create_session', args);
    const result = await sessions.createSession(client, args);
    return formatToolResponse(result);
  },

  get_session: async (client, args, logger) => {
    logger.debug('Executing get_session', args);
    const result = await sessions.getSession(client, args.session_id);
    return formatToolResponse(result);
  },

  update_session: async (client, args, logger) => {
    logger.debug('Executing update_session', args);
    const { session_id, ...updateParams } = args;
    const result = await sessions.updateSession(client, session_id, updateParams);
    return formatToolResponse(result);
  },

  delete_session: async (client, args, logger) => {
    logger.debug('Executing delete_session', args);
    await sessions.deleteSession(client, args.session_id);
    return 'Session deleted successfully';
  },

  // Session Execution
  start_session: async (client, args, logger) => {
    logger.debug('Executing start_session', args);
    const result = await execution.startSession(client, args.session_id);
    return formatToolResponse(result);
  },

  stop_session: async (client, args, logger) => {
    logger.debug('Executing stop_session', args);
    const result = await execution.stopSession(client, args.session_id);
    return formatToolResponse(result);
  },

  get_session_status: async (client, args, logger) => {
    logger.debug('Executing get_session_status', args);
    const result = await execution.getSessionStatus(client, args.session_id);
    return formatToolResponse(result);
  },

  // Workspace Access
  list_workspace_files: async (client, args, logger) => {
    logger.debug('Executing list_workspace_files', args);
    const result = await workspace.listWorkspaceFiles(client, args.session_id, args.path);
    return formatToolResponse(result);
  },

  get_workspace_file: async (client, args, logger) => {
    logger.debug('Executing get_workspace_file', args);
    const result = await workspace.getWorkspaceFile(client, args.session_id, args.file_path);
    return formatToolResponse(result);
  },

  // RFE Workflows
  list_rfe_templates: async (client, _args, logger) => {
    logger.debug('Executing list_rfe_templates');
    const result = await rfe.listRFETemplates(client);
    return formatToolResponse(result);
  },

  create_rfe_workflow: async (client, args, logger) => {
    logger.debug('Executing create_rfe_workflow', args);
    const result = await rfe.createRFEWorkflow(client, args);
    return formatToolResponse(result);
  },
};

/**
 * Execute a tool by name
 */
export async function executeTool(
  toolName: string,
  args: any,
  client: ACPClient,
  logger: Logger
): Promise<string> {
  const handler = toolHandlers[toolName];

  if (!handler) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  try {
    return await handler(client, args, logger);
  } catch (error) {
    logger.error(`Tool ${toolName} failed`, error);
    const errorResponse = formatErrorResponse(error);
    throw new Error(JSON.stringify(errorResponse));
  }
}
