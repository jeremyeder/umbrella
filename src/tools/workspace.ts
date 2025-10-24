/**
 * Workspace access tools
 */
import type { ACPClient } from '../client/acp-client.js';
import type { ListWorkspaceFilesResponse, GetWorkspaceFileResponse } from '../client/types.js';
import { InvalidInputError } from '../errors/types.js';
import { validateWorkspacePath } from '../utils/path-validator.js';

export async function listWorkspaceFiles(
  client: ACPClient,
  sessionId: string,
  path?: string
): Promise<ListWorkspaceFilesResponse> {
  if (!sessionId || sessionId.trim().length === 0) {
    throw new InvalidInputError('Session ID is required');
  }

  // Validate path if provided
  if (path) {
    validateWorkspacePath(path);
  }

  const queryPath = path ? `/api/v1/sessions/${sessionId}/workspace/files?path=${encodeURIComponent(path)}` : `/api/v1/sessions/${sessionId}/workspace/files`;

  return await client.request<ListWorkspaceFilesResponse>({
    method: 'GET',
    path: queryPath,
  });
}

export async function getWorkspaceFile(
  client: ACPClient,
  sessionId: string,
  filePath: string
): Promise<GetWorkspaceFileResponse> {
  if (!sessionId || sessionId.trim().length === 0) {
    throw new InvalidInputError('Session ID is required');
  }

  if (!filePath || filePath.trim().length === 0) {
    throw new InvalidInputError('File path is required');
  }

  // Validate and sanitize path
  const safePath = validateWorkspacePath(filePath);

  return await client.request<GetWorkspaceFileResponse>({
    method: 'GET',
    path: `/api/v1/sessions/${sessionId}/workspace/files/${encodeURIComponent(safePath)}`,
  });
}
