/**
 * ACP API request/response types
 */

// ============================================================================
// Common Types
// ============================================================================

export interface Timestamps {
  created_at: string;
  updated_at?: string;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================================================
// Project Types
// ============================================================================

export type ProjectStatus = 'active' | 'archived';

export interface Project extends Timestamps {
  id: string;
  name: string;
  description?: string;
  owner: string;
  status: ProjectStatus;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface ListProjectsResponse {
  projects: Project[];
}

// ============================================================================
// Session Types
// ============================================================================

export type SessionStatus = 'created' | 'running' | 'paused' | 'completed' | 'failed';

export interface SessionConfig {
  model?: 'claude-sonnet-4' | 'claude-haiku-3';
  timeout?: number;
  temperature?: number;
  max_tokens?: number;
}

export interface Session extends Timestamps {
  id: string;
  project_id: string;
  description: string;
  status: SessionStatus;
  progress?: number;
  current_phase?: string;
  config?: SessionConfig;
  started_at?: string;
  completed_at?: string;
  error?: ErrorInfo;
}

export interface CreateSessionRequest {
  project_id: string;
  description: string;
  config?: SessionConfig;
}

export interface UpdateSessionRequest {
  description?: string;
  config?: SessionConfig;
}

export interface ListSessionsResponse {
  sessions: Session[];
}

export interface SessionStatusResponse {
  status: SessionStatus;
  progress?: number;
  current_phase?: string;
  start_time?: string;
  end_time?: string;
  duration_ms?: number;
  error?: ErrorInfo;
}

// ============================================================================
// Workspace Types
// ============================================================================

export interface WorkspaceFile {
  path: string;
  size_bytes: number;
  mime_type: string;
  is_binary: boolean;
  modified_at: string;
}

export interface Workspace {
  session_id: string;
  root_path: string;
  size_bytes: number;
  file_count: number;
}

export interface ListWorkspaceFilesResponse {
  files: WorkspaceFile[];
  workspace: Workspace;
}

export interface GetWorkspaceFileResponse {
  file: WorkspaceFile;
  content?: string; // Base64 for binary, UTF-8 for text
  encoding: 'utf-8' | 'base64';
}

// ============================================================================
// RFE Workflow Types
// ============================================================================

export type RFEWorkflowStatus = 'created' | 'running' | 'completed' | 'failed';
export type AgentStatus = 'pending' | 'working' | 'completed' | 'failed';
export type ArtifactType = 'rfe' | 'spec' | 'plan' | 'tasks';

export interface AgentInfo {
  name: string;
  role: string;
  status: AgentStatus;
  completed_at?: string;
}

export interface ArtifactInfo {
  path: string;
  type: ArtifactType;
  agent: string;
}

export interface RFEWorkflow extends Timestamps {
  id: string;
  feature_description: string;
  template_id: string;
  agent_roster: AgentInfo[];
  current_phase: string;
  status: RFEWorkflowStatus;
  artifacts: ArtifactInfo[];
  completed_at?: string;
}

export interface RFETemplate {
  id: string;
  name: string;
  description: string;
  agents: Array<{ name: string; role: string }>;
}

export interface ListRFETemplatesResponse {
  templates: RFETemplate[];
}

export interface CreateRFEWorkflowRequest {
  feature_description: string;
  template_id: string;
}

// ============================================================================
// HTTP Client Types
// ============================================================================

export interface HTTPClientOptions {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  maxRetries: number;
  cacheTTL: number;
  rateLimitPerMinute: number;
  debug: boolean;
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  skipCache?: boolean;
}
