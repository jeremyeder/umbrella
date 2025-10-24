/**
 * RFE workflow tools
 */
import type { ACPClient } from '../client/acp-client.js';
import type {
  ListRFETemplatesResponse,
  CreateRFEWorkflowRequest,
  RFEWorkflow,
} from '../client/types.js';
import { InvalidInputError } from '../errors/types.js';

export async function listRFETemplates(client: ACPClient): Promise<ListRFETemplatesResponse> {
  return await client.request<ListRFETemplatesResponse>({
    method: 'GET',
    path: '/api/v1/rfe/templates',
  });
}

export async function createRFEWorkflow(
  client: ACPClient,
  params: CreateRFEWorkflowRequest
): Promise<RFEWorkflow> {
  if (!params.feature_description || params.feature_description.trim().length === 0) {
    throw new InvalidInputError('Feature description is required');
  }

  if (params.feature_description.length > 2000) {
    throw new InvalidInputError('Feature description must not exceed 2000 characters');
  }

  if (!params.template_id || params.template_id.trim().length === 0) {
    throw new InvalidInputError('Template ID is required');
  }

  const response = await client.request<{ workflow: RFEWorkflow }>({
    method: 'POST',
    path: '/api/v1/rfe/workflows',
    body: params,
    skipCache: true,
  });

  return response.workflow;
}
