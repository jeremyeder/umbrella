# Tasks: ACP MCP Server

**Input**: Design documents from `/specs/001-acp-mcp-server/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Tests are NOT explicitly requested in the feature specification. No test tasks are included per spec-kit guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Single project structure: `src/`, `tests/` at repository root
- Paths are absolute from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Node.js project with TypeScript 5.x and package.json
- [ ] T002 Install production dependencies (@modelcontextprotocol/sdk, undici, zod, cosmiconfig, deepmerge, zod-validation-error)
- [ ] T003 [P] Install development dependencies (typescript, @types/node, vitest, @vitest/coverage-v8, @vitest/ui, msw)
- [ ] T004 [P] Configure TypeScript compiler in tsconfig.json with strict mode and ES2022 target
- [ ] T005 [P] Configure Vitest test framework in vitest.config.ts with coverage thresholds (80% lines, 80% functions)
- [ ] T006 [P] Create project directory structure (src/config/, src/tools/, src/client/, src/auth/, src/errors/, src/utils/, tests/)
- [ ] T007 [P] Add npm scripts for build, test, lint, and start in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 [P] Define configuration schema with Zod validation in src/config/schema.ts
- [ ] T009 [P] Define configuration type definitions in src/config/types.ts
- [ ] T010 Implement configuration loader with cosmiconfig and precedence logic in src/config/loader.ts
- [ ] T011 [P] Define custom error classes (AuthError, NotFoundError, RateLimitError, etc.) in src/errors/types.ts
- [ ] T012 [P] Implement error handler with HTTP status mapping and actionable messages in src/errors/handler.ts
- [ ] T013 [P] Implement logger with credential redaction in src/utils/logger.ts
- [ ] T014 [P] Implement path validator for workspace security in src/utils/path-validator.ts
- [ ] T015 [P] Define ACP API request/response types in src/client/types.ts
- [ ] T016 Implement authentication provider with credential management in src/auth/provider.ts
- [ ] T017 [P] Implement credential validator in src/auth/validator.ts
- [ ] T018 Implement undici HTTP client wrapper with connection pooling in src/client/acp-client.ts
- [ ] T019 [P] Implement exponential backoff retry logic in src/client/retry.ts
- [ ] T020 [P] Implement in-memory caching layer with TTL in src/client/cache.ts
- [ ] T021 Initialize MCP server with metadata in src/server.ts
- [ ] T022 Create MCP server entry point with stdio transport in src/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Project and Session Management (Priority: P1) 🎯 MVP

**Goal**: Enable developers to create and manage ACP projects and sessions through natural language commands in Claude Desktop/Code

**Independent Test**: Install MCP server, configure authentication, execute "@vteam create project test-project" followed by "@vteam create session in [project_id] for code review" and verify both resources are created in ACP

### Implementation for User Story 1

- [ ] T023 [P] [US1] Implement list_projects tool in src/tools/projects.ts
- [ ] T024 [P] [US1] Implement create_project tool in src/tools/projects.ts
- [ ] T025 [P] [US1] Implement get_project tool in src/tools/projects.ts
- [ ] T026 [P] [US1] Implement delete_project tool in src/tools/projects.ts
- [ ] T027 [P] [US1] Implement list_sessions tool in src/tools/sessions.ts
- [ ] T028 [P] [US1] Implement create_session tool in src/tools/sessions.ts
- [ ] T029 [P] [US1] Implement get_session tool in src/tools/sessions.ts
- [ ] T030 [P] [US1] Implement update_session tool in src/tools/sessions.ts
- [ ] T031 [P] [US1] Implement delete_session tool in src/tools/sessions.ts
- [ ] T032 [US1] Register all project and session management tools in src/tools/index.ts
- [ ] T033 [US1] Add tool response formatting for Claude Desktop display
- [ ] T034 [US1] Add error handling with actionable messages for authentication failures
- [ ] T035 [US1] Add validation for project/session parameters (name length, description length)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can create, list, get, update, and delete projects and sessions

---

## Phase 4: User Story 2 - Session Execution and Monitoring (Priority: P1)

**Goal**: Enable developers to start, monitor, and retrieve results from long-running ACP sessions

**Independent Test**: Create a session, start it with "@vteam start session [session_id]", poll status with "@vteam get session status [session_id]", and retrieve artifacts with "@vteam get workspace file [session_id] results.md"

### Implementation for User Story 2

- [ ] T036 [P] [US2] Implement start_session tool in src/tools/execution.ts
- [ ] T037 [P] [US2] Implement stop_session tool in src/tools/execution.ts
- [ ] T038 [P] [US2] Implement get_session_status tool with caching (10s TTL) in src/tools/execution.ts
- [ ] T039 [US2] Register all session execution tools in src/tools/index.ts
- [ ] T040 [US2] Add progress indicator formatting for Claude display
- [ ] T041 [US2] Add error handling for session state transitions (cannot start already running session)
- [ ] T042 [US2] Add status caching with 10 second TTL to reduce backend load

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can execute and monitor sessions

---

## Phase 5: User Story 3 - Workspace File Access (Priority: P2)

**Goal**: Enable developers to browse and retrieve files from session workspaces

**Independent Test**: Complete a session that generates artifacts, list workspace contents with "@vteam list workspace files [session_id]", and retrieve specific files to verify content matches expectations

### Implementation for User Story 3

- [ ] T043 [P] [US3] Implement list_workspace_files tool with path validation in src/tools/workspace.ts
- [ ] T044 [P] [US3] Implement get_workspace_file tool with path security checks in src/tools/workspace.ts
- [ ] T045 [US3] Register workspace access tools in src/tools/index.ts
- [ ] T046 [US3] Add file size limit handling (10MB warning) for large files
- [ ] T047 [US3] Add binary file detection and base64 encoding support
- [ ] T048 [US3] Add path traversal validation using path-validator utility
- [ ] T049 [US3] Add MIME type detection and formatting hints for Claude display

**Checkpoint**: All core user stories (P1 + P2 for workspace access) should now be independently functional

---

## Phase 6: User Story 4 - RFE Workflow Automation (Priority: P2)

**Goal**: Enable developers to initiate multi-agent RFE workflows through a single command

**Independent Test**: Execute "@vteam create RFE workflow for feature: real-time notifications", monitor workflow progress, and verify the generated rfe.md contains contributions from multiple agent perspectives

### Implementation for User Story 4

- [ ] T050 [P] [US4] Implement list_rfe_templates tool with template caching (300s TTL) in src/tools/rfe.ts
- [ ] T051 [P] [US4] Implement create_rfe_workflow tool in src/tools/rfe.ts
- [ ] T052 [US4] Register RFE workflow tools in src/tools/index.ts
- [ ] T053 [US4] Add agent roster formatting for Claude display
- [ ] T054 [US4] Add workflow progress tracking with per-agent status
- [ ] T055 [US4] Add artifact path resolution for generated RFE documents

**Checkpoint**: All P1 and P2 user stories should now be complete and independently functional

---

## Phase 7: User Story 5 - Session Context Preservation (Priority: P3)

**Goal**: Enable developers to access previously created sessions days or weeks later

**Independent Test**: Create a session with artifacts, wait a period of time, then list projects, list sessions, and retrieve the original artifacts to verify they remain accessible

### Implementation for User Story 5

- [ ] T056 [US5] Add session sorting by creation date (most recent first) in list_sessions tool
- [ ] T057 [US5] Add date formatting for creation timestamps in all list tools
- [ ] T058 [US5] Add cache invalidation for project and session lists when data is stale
- [ ] T059 [US5] Verify workspace file access works for old sessions (integration with Phase 5)

**Checkpoint**: Historical session access should work seamlessly

---

## Phase 8: User Story 6 - Team Collaboration (Priority: P3)

**Goal**: Enable multiple developers to access shared projects and view each other's sessions

**Independent Test**: Have two developers (with different API keys) access the same project, create sessions independently, and verify both can list and access all sessions in the shared project

### Implementation for User Story 6

- [ ] T060 [US6] Add owner information display in project listings
- [ ] T061 [US6] Add created_by information in session listings if available from backend
- [ ] T062 [US6] Add permission error handling with clear messages for access denied scenarios
- [ ] T063 [US6] Verify multi-user access patterns work with shared authentication

**Checkpoint**: All user stories (P1, P2, P3) should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T064 [P] Add comprehensive error messages with remediation guidance for all tools
- [ ] T065 [P] Add request/response logging with credential redaction for debugging
- [ ] T066 [P] Optimize connection pooling settings (10 connections per origin)
- [ ] T067 [P] Add rate limiting configuration with 60 req/min default
- [ ] T068 [P] Add timeout configuration (10s connect, 60s body, 30s keep-alive)
- [ ] T069 Create README.md with installation and configuration instructions
- [ ] T070 [P] Add inline documentation for all public APIs and tool handlers
- [ ] T071 [P] Add configuration schema file (.mcp.json.schema) for IDE autocomplete
- [ ] T072 Validate all tools work end-to-end using quickstart.md scenarios
- [ ] T073 [P] Add health check logging on server startup
- [ ] T074 [P] Add graceful shutdown handler for MCP server
- [ ] T075 Verify all success criteria from spec.md are met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
  - **US1 (Phase 3)**: Can start after Foundational - No dependencies on other stories
  - **US2 (Phase 4)**: Can start after Foundational - Integrates with US1 (needs session management) but independently testable
  - **US3 (Phase 5)**: Can start after Foundational - Integrates with US2 (needs session execution) but independently testable
  - **US4 (Phase 6)**: Can start after Foundational - Independent of other stories
  - **US5 (Phase 7)**: Builds on US1, US2, US3 (needs all listing and access features)
  - **US6 (Phase 8)**: Builds on US1 (needs project/session management)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### Within Each User Story

- Models before services (N/A - no separate model layer in MCP server)
- Tools before registration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T002-T007 can all run in parallel (independent setup tasks)
- **Foundational Phase**: T008-T009, T011-T015, T017, T019-T020 can run in parallel (different files)
- **User Story 1**: T023-T031 can all run in parallel (independent tool implementations)
- **User Story 2**: T036-T038 can run in parallel
- **User Story 3**: T043-T044 can run in parallel
- **User Story 4**: T050-T051 can run in parallel
- **Polish Phase**: T064-T068, T070-T071, T073-T074 can run in parallel

Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)

---

## Parallel Example: User Story 1 (Project and Session Management)

```bash
# Launch all project management tools together:
Task: "Implement list_projects tool in src/tools/projects.ts"
Task: "Implement create_project tool in src/tools/projects.ts"
Task: "Implement get_project tool in src/tools/projects.ts"
Task: "Implement delete_project tool in src/tools/projects.ts"

# Launch all session management tools together:
Task: "Implement list_sessions tool in src/tools/sessions.ts"
Task: "Implement create_session tool in src/tools/sessions.ts"
Task: "Implement get_session tool in src/tools/sessions.ts"
Task: "Implement update_session tool in src/tools/sessions.ts"
Task: "Implement delete_session tool in src/tools/sessions.ts"
```

---

## Parallel Example: Foundational Phase

```bash
# Launch independent foundational components together:
Task: "Define configuration schema with Zod validation in src/config/schema.ts"
Task: "Define configuration type definitions in src/config/types.ts"
Task: "Define custom error classes in src/errors/types.ts"
Task: "Implement logger with credential redaction in src/utils/logger.ts"
Task: "Implement path validator for workspace security in src/utils/path-validator.ts"
Task: "Define ACP API request/response types in src/client/types.ts"
Task: "Implement credential validator in src/auth/validator.ts"
Task: "Implement exponential backoff retry logic in src/client/retry.ts"
Task: "Implement in-memory caching layer with TTL in src/client/cache.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Project and Session Management)
4. Complete Phase 4: User Story 2 (Session Execution and Monitoring)
5. **STOP and VALIDATE**: Test User Stories 1 & 2 independently
6. Deploy/demo if ready

**Rationale**: US1 + US2 together provide the core value proposition - creating projects, sessions, and executing them. This is the minimal viable product that delivers immediate value.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 + 2 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 3 (Workspace Access) → Test independently → Deploy/Demo
4. Add User Story 4 (RFE Workflows) → Test independently → Deploy/Demo
5. Add User Story 5 (Context Preservation) → Test independently → Deploy/Demo
6. Add User Story 6 (Team Collaboration) → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Project/Session Management)
   - Developer B: User Story 2 (Session Execution)
   - Developer C: User Story 4 (RFE Workflows)
3. User Story 3 depends on US2 completion (needs session execution)
4. User Stories 5 & 6 can proceed after their dependencies
5. Stories complete and integrate independently

---

## Task Statistics

- **Total Tasks**: 75
- **Setup Phase**: 7 tasks
- **Foundational Phase**: 15 tasks (CRITICAL PATH)
- **User Story 1 (P1)**: 13 tasks
- **User Story 2 (P1)**: 7 tasks
- **User Story 3 (P2)**: 7 tasks
- **User Story 4 (P2)**: 6 tasks
- **User Story 5 (P3)**: 4 tasks
- **User Story 6 (P3)**: 4 tasks
- **Polish Phase**: 12 tasks

### Parallel Opportunities Identified

- **Setup**: 6 of 7 tasks can run in parallel (85% parallelizable)
- **Foundational**: 11 of 15 tasks can run in parallel (73% parallelizable)
- **User Story 1**: 9 of 13 tasks can run in parallel (69% parallelizable)
- **User Story 2**: 3 of 7 tasks can run in parallel (43% parallelizable)
- **User Story 3**: 2 of 7 tasks can run in parallel (29% parallelizable)
- **User Story 4**: 2 of 6 tasks can run in parallel (33% parallelizable)
- **Polish**: 8 of 12 tasks can run in parallel (67% parallelizable)

### MVP Scope (User Stories 1 + 2)

- **MVP Tasks**: Setup (7) + Foundational (15) + US1 (13) + US2 (7) = **42 tasks**
- **MVP Estimated Effort**: ~5 days (based on plan.md estimates)
- **MVP Delivers**: Complete project/session management + execution/monitoring workflow

---

## Notes

- **[P] tasks** = different files, no dependencies on incomplete tasks within the same phase
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate story independently
- **No test tasks included** - tests were not explicitly requested in the feature specification
- **Avoid**: vague tasks, same file conflicts, cross-story dependencies that break independence
- **File size limits**: Workspace files > 10MB return metadata only (FR-014)
- **Security**: All workspace paths must pass path-validator checks (FR-019)
- **Performance**: Connection pooling (10 per origin), caching (10-300s TTL), retry logic (3 attempts max)

---

## Format Validation

✅ All tasks follow required checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ All tasks have sequential IDs (T001-T075)
✅ All user story tasks have [Story] labels ([US1]-[US6])
✅ All parallelizable tasks have [P] marker
✅ All tasks include specific file paths
✅ Tasks organized by user story for independent implementation
✅ Clear checkpoints after each user story phase
✅ Dependencies clearly documented
✅ MVP scope clearly defined (US1 + US2)
