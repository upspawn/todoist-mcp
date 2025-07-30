# Todoist MCP Server Implementation Plan

## Project Overview
Building a Model Context Protocol (MCP) server for Todoist that can be installed via npm and configured through `mcp.json`. The server will provide full access to Todoist's REST API through a standardized MCP interface.

**Target Package:** `@upspawn/todoist-mcp`  
**Installation:** `npx -y @upspawn/todoist-mcp`  
**Configuration:** Via `TODOIST_API_KEY` environment variable

## Implementation Tasks

### Phase 1: Project Setup & Infrastructure
- [ ] **1.1 Initialize Project Structure**
  - Create package.json with proper metadata
  - Set up TypeScript configuration (tsconfig.json)
  - Configure ESLint and Prettier
  - Set up Jest for testing
  - Create basic folder structure (src/, tests/, docs/)
  
- [ ] **1.2 Set Up Development Environment**
  - Configure npm scripts (build, test, lint, dev)
  - Set up nodemon for development
  - Create .env.example file
  - Add .gitignore with proper patterns

### Phase 2: Core MCP Server Implementation
- [ ] **2.1 Implement MCP Server Base**
  - Create server entry point (index.ts)
  - Implement stdin/stdout communication protocol
  - Add request/response message handling
  - Implement error handling and logging
  
- [ ] **2.2 Configuration & Authentication**
  - Load TODOIST_API_KEY from environment
  - Implement API key validation
  - Create configuration schema
  - Add health check endpoint

### Phase 3: Todoist API Integration
- [ ] **3.1 Projects Management**
  - [ ] List all projects
  - [ ] Create project
  - [ ] Get single project
  - [ ] Update project
  - [ ] Delete project
  - [ ] Get project collaborators
  
- [ ] **3.2 Tasks Management**
  - [ ] List active tasks (with filters)
  - [ ] Create task
  - [ ] Get single task
  - [ ] Update task
  - [ ] Close task (mark complete)
  - [ ] Reopen task
  - [ ] Delete task
  - [ ] Quick add task (natural language)
  
- [ ] **3.3 Sections Management**
  - [ ] List sections
  - [ ] Create section
  - [ ] Get section
  - [ ] Update section
  - [ ] Delete section
  
- [ ] **3.4 Comments Management**
  - [ ] List comments (task/project)
  - [ ] Create comment
  - [ ] Get comment
  - [ ] Update comment
  - [ ] Delete comment
  
- [ ] **3.5 Labels Management**
  - [ ] List labels
  - [ ] Create label
  - [ ] Get label
  - [ ] Update label
  - [ ] Delete label
  
- [ ] **3.6 Productivity Features**
  - [ ] Get completed tasks
  - [ ] Get completed tasks by project
  - [ ] Get productivity stats

### Phase 4: Robustness & Quality
- [ ] **4.1 Error Handling & Rate Limiting**
  - Implement rate limit tracking (450 req/15min)
  - Add retry logic with exponential backoff
  - Create custom error types
  - Add request timeout handling (15s)
  
- [ ] **4.2 Testing**
  - [ ] Unit tests for all endpoints
  - [ ] Integration tests with mock Todoist API
  - [ ] End-to-end tests with test account
  - [ ] Test rate limit handling
  - [ ] Test error scenarios
  
- [ ] **4.3 Local Testing Setup**
  - Create test harness script
  - Provide sample mcp.json configuration
  - Create test data fixtures
  - Add debugging documentation

### Phase 5: Documentation & Publishing
- [ ] **5.1 Documentation**
  - [ ] Write comprehensive README.md
  - [ ] Create API reference documentation
  - [ ] Add usage examples for each endpoint
  - [ ] Document error codes and handling
  - [ ] Create CONTRIBUTING.md
  
- [ ] **5.2 CI/CD Setup**
  - [ ] Configure GitHub Actions workflow
  - [ ] Add automated testing on PR
  - [ ] Set up semantic-release
  - [ ] Configure npm publishing automation
  
- [ ] **5.3 Package Publishing**
  - [ ] Verify package.json metadata
  - [ ] Test local npm pack
  - [ ] Publish to npm registry
  - [ ] Test installation via npx
  - [ ] Create GitHub release

## Testing Checkpoints

### Checkpoint 1: Basic Server (After Phase 2)
- Server starts and responds to health checks
- Configuration loads correctly
- Can authenticate with Todoist API

### Checkpoint 2: Core Features (After Phase 3.2)
- Can list and create projects
- Can manage tasks with all CRUD operations
- Natural language task creation works

### Checkpoint 3: Full API Coverage (After Phase 3)
- All Todoist endpoints are accessible
- Data transformations work correctly
- Response formats match MCP standards

### Checkpoint 4: Production Ready (After Phase 4)
- Handles errors gracefully
- Respects rate limits
- All tests pass
- Performance is acceptable

### Checkpoint 5: Published Package (After Phase 5)
- Package installs via npx
- Works with standard mcp.json config
- Documentation is complete
- CI/CD pipeline is functional

## Success Criteria
1. ✅ Server can be installed with `npx -y @upspawn/todoist-mcp`
2. ✅ Configurable via mcp.json with API key
3. ✅ Implements all Todoist REST API endpoints
4. ✅ Handles rate limits and errors gracefully
5. ✅ Includes comprehensive documentation
6. ✅ Has >80% test coverage
7. ✅ Published to npm registry
8. ✅ Works with Claude, Cursor, and other MCP clients

## Notes & Decisions
- Using TypeScript for type safety
- Following MCP protocol standards
- Implementing as a standalone process (not HTTP server)
- Using official Todoist REST API v2
- Package scoped under @upspawn organization