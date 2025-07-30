# Todoist MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with comprehensive access to Todoist's task management capabilities.

## Features

- **Complete Todoist API Coverage**: Access all major Todoist features including tasks, projects, sections, comments, and labels
- **Natural Language Task Creation**: Use Todoist's quick add feature with natural language (e.g., "Submit report by Friday 5pm #Work p2")
- **Rate Limit Handling**: Built-in rate limiting and retry logic respecting Todoist's 450 requests per 15 minutes limit
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Easy Integration**: Simple npm installation and configuration via mcp.json

## Installation

### For Use with AI Assistants

Install via npx (recommended):

```bash
npx @upspawn/todoist-mcp
```

### For Development

```bash
git clone <repository>
cd todoist-mcp
npm install
npm run build
```

## Configuration

### 1. Get Your Todoist API Token

1. Go to [Todoist Integrations](https://todoist.com/prefs/integrations)
2. Scroll down to "API token" 
3. Copy your API token

### 2. Configure MCP Client

Add the following to your `mcp.json` configuration:

```json
{
  "mcpServers": {
    "todoist": {
      "command": "npx",
      "args": ["-y", "@upspawn/todoist-mcp"],
      "env": {
        "TODOIST_API_KEY": "your-todoist-api-key-here"
      }
    }
  }
}
```

### Local Development Configuration

For local development, use:

```json
{
  "mcpServers": {
    "todoist": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/todoist-mcp",
      "env": {
        "TODOIST_API_KEY": "your-todoist-api-key-here",
        "DEBUG": "true"
      }
    }
  }
}
```

## Available Tools

### Projects
- `list_projects` - List all projects
- `create_project` - Create a new project
- `get_project` - Get project details
- `update_project` - Update project properties
- `delete_project` - Delete a project
- `get_project_collaborators` - List project collaborators

### Tasks
- `list_tasks` - List tasks with optional filters
- `create_task` - Create a new task
- `get_task` - Get task details
- `update_task` - Update task properties
- `close_task` - Mark task as completed
- `reopen_task` - Reopen a completed task
- `delete_task` - Delete a task
- `quick_add_task` - Create task using natural language

### Sections
- `list_sections` - List sections in projects
- `create_section` - Create a new section
- `get_section` - Get section details
- `update_section` - Update section properties
- `delete_section` - Delete a section

### Comments
- `list_comments` - List comments on tasks/projects
- `create_comment` - Add a comment
- `get_comment` - Get comment details
- `update_comment` - Update comment content
- `delete_comment` - Delete a comment

### Labels
- `list_labels` - List all labels
- `create_label` - Create a new label
- `get_label` - Get label details
- `update_label` - Update label properties
- `delete_label` - Delete a label

### Productivity
- `get_completed_tasks` - Get completed tasks with filters
- `get_completed_tasks_by_project` - Get completed tasks for a project
- `get_productivity_stats` - Get productivity statistics and karma

## Usage Examples

### Creating a Task
```
I need to create a task to "Review quarterly budget" due next Friday in my Work project with high priority.
```

### Natural Language Task Creation
```
Add task "Submit expense report by Monday 3pm #Finance p1"
```

### Managing Projects
```
Create a new project called "Q4 Marketing Campaign" and list all my current projects.
```

### Productivity Tracking
```
Show me my productivity stats and recent completed tasks.
```

## Development

### Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Run in development mode with auto-reload
- `npm test` - Run test suite
- `npm run lint` - Check code style
- `npm run format` - Format code with Prettier

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Local Testing

1. Build the project: `npm run build`
2. Set your API key: `export TODOIST_API_KEY=your-api-key`
3. Test the server: `node dist/index.js`

## Error Handling

The server includes comprehensive error handling for:

- **Rate Limits**: Automatic detection and helpful error messages
- **API Errors**: Detailed error reporting with status codes
- **Network Issues**: Timeout and retry logic
- **Invalid Requests**: Clear validation error messages

## Rate Limits

Todoist allows up to 450 requests per user per 15-minute window. The server automatically tracks and respects these limits, throwing helpful errors when limits are approached.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the [Todoist API documentation](https://developer.todoist.com/rest/v2/)
- Review the MCP specification