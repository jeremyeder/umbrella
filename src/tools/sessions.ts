/**
 * Session management tools
 */
import type { ACPClient } from '../client/acp-client.js';
import type {
  Session,
  CreateSessionRequest,
  UpdateSessionRequest,
  ListSessionsResponse,
} from '../client/types.js';
import { InvalidInputError } from '../errors/types.js';

/**
 * List all sessions in a project
 */
export async function listSessions(
  client: ACPClient,
  projectId: string
): Promise<ListSessionsResponse> {
  if (!projectId || projectId.trim().length === 0) {
    throw new InvalidInputError('Project ID is required');
  }

  return await client.request<ListSessionsResponse>({
    method: 'GET',
    path: `/api/v1/projects/${projectId}/sessions`,
  });
}

/**
 * Create a new session
 */
export async function createSession(
  client: ACPClient,
  params: CreateSessionRequest
): Promise<Session> {
  // Validate inputs
  if (!params.project_id || params.project_id.trim().length === 0) {
    throw new InvalidInputError('Project ID is required');
  }

  if (!params.description || params.description.trim().length === 0) {
    throw new InvalidInputError('Session description is required');
  }

  if (params.description.length > 1000) {
    throw new InvalidInputError('Session description must not exceed 1000 characters');
  }

  // Validate config if provided
  if (params.config) {
    const { model, timeout, temperature, max_tokens } = params.config;

    if (model && !['claude-sonnet-4', 'claude-haiku-3'].includes(model)) {
      throw new InvalidInputError('Model must be either claude-sonnet-4 or claude-haiku-3');
    }

    if (timeout !== undefined && (timeout < 60 || timeout > 3600)) {
      throw new InvalidInputError('Timeout must be between 60 and 3600 seconds');
    }

    if (temperature !== undefined && (temperature < 0 || temperature > 1)) {
      throw new InvalidInputError('Temperature must be between 0.0 and 1.0');
    }

    if (max_tokens !== undefined && (max_tokens < 1 || max_tokens > 100000)) {
      throw new InvalidInputError('Max tokens must be between 1 and 100000');
    }
  }

  const response = await client.request<{ session: Session }>({
    method: 'POST',
    path: `/api/v1/projects/${params.project_id}/sessions`,
    body: params,
    skipCache: true,
  });

  // Invalidate sessions list cache
  client.invalidateCache(/^request:GET:\/api\/v1\/projects\/.*\/sessions/);

  return response.session;
}

/**
 * Get session details
 */
export async function getSession(client: ACPClient, sessionId: string): Promise<Session> {
  if (!sessionId || sessionId.trim().length === 0) {
    throw new InvalidInputError('Session ID is required');
  }

  const response = await client.request<{ session: Session }>({
    method: 'GET',
    path: `/api/v1/sessions/${sessionId}`,
  });

  return response.session;
}

/**
 * Update a session
 */
export async function updateSession(
  client: ACPClient,
  sessionId: string,
  params: UpdateSessionRequest
): Promise<Session> {
  if (!sessionId || sessionId.trim().length === 0) {
    throw new InvalidInputError('Session ID is required');
  }

  // Validate description if provided
  if (params.description !== undefined) {
    if (params.description.trim().length === 0) {
      throw new InvalidInputError('Session description cannot be empty');
    }

    if (params.description.length > 1000) {
      throw new InvalidInputError('Session description must not exceed 1000 characters');
    }
  }

  // Validate config if provided
  if (params.config) {
    const { model, timeout, temperature, max_tokens } = params.config;

    if (model && !['claude-sonnet-4', 'claude-haiku-3'].includes(model)) {
      throw new InvalidInputError('Model must be either claude-sonnet-4 or claude-haiku-3');
    }

    if (timeout !== undefined && (timeout < 60 || timeout > 3600)) {
      throw new InvalidInputError('Timeout must be between 60 and 3600 seconds');
    }

    if (temperature !== undefined && (temperature < 0 || temperature > 1)) {
      throw new InvalidInputError('Temperature must be between 0.0 and 1.0');
    }

    if (max_tokens !== undefined && (max_tokens < 1 || max_tokens > 100000)) {
      throw new InvalidInputError('Max tokens must be between 1 and 100000');
    }
  }

  const response = await client.request<{ session: Session }>({
    method: 'PATCH',
    path: `/api/v1/sessions/${sessionId}`,
    body: params,
    skipCache: true,
  });

  // Invalidate caches
  client.invalidateCache(/^request:GET:\/api\/v1\/sessions/);

  return response.session;
}

/**
 * Delete a session
 */
export async function deleteSession(client: ACPClient, sessionId: string): Promise<void> {
  if (!sessionId || sessionId.trim().length === 0) {
    throw new InvalidInputError('Session ID is required');
  }

  await client.request({
    method: 'DELETE',
    path: `/api/v1/sessions/${sessionId}`,
    skipCache: true,
  });

  // Invalidate caches
  client.invalidateCache(/^request:GET:\/api\/v1\/(projects\/.*\/)?sessions/);
}
