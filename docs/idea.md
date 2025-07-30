# Todoist MCP

Connect this Model Context Protocol server to your LLM to interact with Todoist.

## Integration Goal

This project aims to create a Todoist MCP server that can be integrated via `mcp.json` configuration, similar to other MCP servers:

```json
{
  "todoist": {
    "command": "npx",
    "args": ["-y", "@upspawn/todoist-mcp"],
    "env": {
      "TODOIST_API_KEY": "your-todoist-api-key-here"
    }
  }
}
```

The server will be distributed as an npm package that can be easily installed and configured with the user's Todoist API key.

## Functionality

This integration implements all the APIs available from the Todoist TypeScript Client, providing access to:

### Task Management

- **Create tasks** (with content, descriptions, due dates, priorities, labels, and more)
- **Create tasks with natural language** (e.g., "Submit report by Friday 5pm #Work")
- **Retrieve tasks** (individual, filtered, or all tasks)
- **Retrieve completed tasks** (by completion date or due date)
- **Get productivity statistics**
- **Update tasks**
- **Move tasks** (individually or in batches)
- **Close/reopen tasks**
- **Delete tasks**

### Project Management

- **Create, retrieve, update, and delete projects**

### Section Management

- **Create, retrieve, update, and delete sections** within projects

### Comment Management

- **Add, retrieve, update, and delete comments** for tasks or projects

### Label Management

- **Create, retrieve, update, and delete labels**
- **Manage shared labels**

### Collaboration

- **Get collaborators** for projects

## Todoist REST API Quick Reference

### Authentication
All requests require `Authorization: Bearer <TOKEN>` header.

### Projects
- `GET /projects` – list all projects
- `POST /projects` – create project
- `GET /projects/{project_id}` – get a single project
- `POST /projects/{project_id}` – update project
- `DELETE /projects/{project_id}` – delete project
- `GET /projects/{project_id}/collaborators` – list project collaborators

### Sections
- `GET /sections?project_id={project_id}` – list sections in a project
- `POST /sections` – create a new section
- `GET /sections/{section_id}` – get a section
- `POST /sections/{section_id}` – update section
- `DELETE /sections/{section_id}` – delete section

### Tasks
- `GET /tasks` – list active tasks (supports filters such as `project_id`, `label_id`, `filter` etc.)
- `POST /tasks` – create task
- `GET /tasks/{task_id}` – get a task
- `POST /tasks/{task_id}` – update task
- `POST /tasks/{task_id}/close` – mark task complete
- `POST /tasks/{task_id}/reopen` – reopen a completed task
- `DELETE /tasks/{task_id}` – delete task

### Comments
- `GET /comments?task_id={task_id}|project_id={project_id}` – list comments on a task or project
- `POST /comments` – add comment (must supply one of `task_id` or `project_id`)
- `GET /comments/{comment_id}` – get comment
- `POST /comments/{comment_id}` – update comment
- `DELETE /comments/{comment_id}` – delete comment

### Labels
- `GET /labels` – list labels
- `POST /labels` – create label
- `GET /labels/{label_id}` – get a label
- `POST /labels/{label_id}` – update label
- `DELETE /labels/{label_id}` – delete label

### Rate Limits & Limits
- Up to **450 requests per user per 15-minute window**
- Max request body: **1 MiB**
- Headers total size limit: **65 KiB**
- Processing time-out: **15 s** per request

For full details see the official Todoist REST API docs: <https://developer.todoist.com/rest/v2/>