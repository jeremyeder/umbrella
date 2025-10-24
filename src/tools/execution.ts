/**
 * Session execution tools
 */
import type { ACPClient } from '../client/acp-client.js';
import type { SessionStatusResponse } from '../client/types.js';
import { InvalidInputError } from '../errors/types.js';

export async function startSession(client: ACPClient, sessionId: string): Promise<{ message: string }> {
  if (!sessionId || sessionId.trim().length === 0) {
    throw new InvalidInputError('Session ID is required');
  }

  const response = await client.request<{ message: string }>({
    method: 'POST',
    path: `/api/v1/sessions/${sessionId}/start`,
    skipCache: true,
  });

  client.invalidateCache(/^request:GET:\/api\/v1\/sessions/);
  return response;
}

export async function stopSession(client: ACPClient, sessionId: string): Promise<{ message: string }> {
  if (!sessionId || sessionId.trim().length === 0) {
    throw new InvalidInputError('Session ID is required');
  }

  const response = await client.request<{ message: string }>({
    method: 'POST',
    path: `/api/v1/sessions/${sessionId}/stop`,
    skipCache: true,
  });

  client.invalidateCache(/^request:GET:\/api\/v1\/sessions/);
  return response;
}

export async function getSessionStatus(client: ACPClient, sessionId: string): Promise<SessionStatusResponse> {
  if (!sessionId || sessionId.trim().length === 0) {
    throw new InvalidInputError('Session ID is required');
  }

  return await client.request<SessionStatusResponse>({
    method: 'GET',
    path: `/api/v1/sessions/${sessionId}/status`,
  });
}
