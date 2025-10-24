/**
 * Project management tools
 */
import type { ACPClient } from '../client/acp-client.js';
import type {
  Project,
  CreateProjectRequest,
  ListProjectsResponse,
} from '../client/types.js';
import { InvalidInputError } from '../errors/types.js';

/**
 * List all accessible projects
 */
export async function listProjects(client: ACPClient): Promise<ListProjectsResponse> {
  return await client.request<ListProjectsResponse>({
    method: 'GET',
    path: '/api/v1/projects',
  });
}

/**
 * Create a new project
 */
export async function createProject(
  client: ACPClient,
  params: CreateProjectRequest
): Promise<Project> {
  // Validate inputs
  if (!params.name || params.name.trim().length === 0) {
    throw new InvalidInputError('Project name is required');
  }

  if (params.name.length > 100) {
    throw new InvalidInputError('Project name must not exceed 100 characters');
  }

  if (params.description && params.description.length > 500) {
    throw new InvalidInputError('Project description must not exceed 500 characters');
  }

  const response = await client.request<{ project: Project }>({
    method: 'POST',
    path: '/api/v1/projects',
    body: params,
    skipCache: true,
  });

  // Invalidate projects list cache
  client.invalidateCache(/^request:GET:\/api\/v1\/projects/);

  return response.project;
}

/**
 * Get project details
 */
export async function getProject(client: ACPClient, projectId: string): Promise<Project> {
  if (!projectId || projectId.trim().length === 0) {
    throw new InvalidInputError('Project ID is required');
  }

  const response = await client.request<{ project: Project }>({
    method: 'GET',
    path: `/api/v1/projects/${projectId}`,
  });

  return response.project;
}

/**
 * Delete a project
 */
export async function deleteProject(client: ACPClient, projectId: string): Promise<void> {
  if (!projectId || projectId.trim().length === 0) {
    throw new InvalidInputError('Project ID is required');
  }

  await client.request({
    method: 'DELETE',
    path: `/api/v1/projects/${projectId}`,
    skipCache: true,
  });

  // Invalidate cache
  client.invalidateCache(/^request:GET:\/api\/v1\/projects/);
}
