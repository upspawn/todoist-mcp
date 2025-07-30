// MCP tool definitions for all Todoist operations

import { McpTool } from '../types/mcp.js';

export const TODOIST_TOOLS: McpTool[] = [
  // Projects
  {
    name: 'list_projects',
    description: 'List all Todoist projects',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_project',
    description: 'Create a new Todoist project',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        parent_id: { type: 'number', description: 'Parent project ID (optional)' },
        color: { type: 'number', description: 'Color ID (optional)' },
        favorite: { type: 'boolean', description: 'Mark as favorite (optional)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_project',
    description: 'Get a specific Todoist project by ID',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'Project ID' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'update_project',
    description: 'Update a Todoist project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'Project ID' },
        name: { type: 'string', description: 'New project name (optional)' },
        color: { type: 'number', description: 'Color ID (optional)' },
        favorite: { type: 'boolean', description: 'Favorite status (optional)' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'delete_project',
    description: 'Delete a Todoist project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'Project ID' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_project_collaborators',
    description: 'Get collaborators for a specific project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'Project ID' },
      },
      required: ['project_id'],
    },
  },

  // Tasks
  {
    name: 'list_tasks',
    description: 'List Todoist tasks with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'Filter by project ID (optional)' },
        section_id: { type: 'number', description: 'Filter by section ID (optional)' },
        label_id: { type: 'number', description: 'Filter by label ID (optional)' },
        filter: { type: 'string', description: 'Filter expression (optional)' },
        ids: { type: 'array', items: { type: 'number' }, description: 'Specific task IDs (optional)' },
      },
    },
  },
  {
    name: 'create_task',
    description: 'Create a new Todoist task',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Task content/title' },
        description: { type: 'string', description: 'Task description (optional)' },
        project_id: { type: 'number', description: 'Project ID (optional, defaults to Inbox)' },
        section_id: { type: 'number', description: 'Section ID (optional)' },
        parent_id: { type: 'number', description: 'Parent task ID for subtasks (optional)' },
        label_ids: { type: 'array', items: { type: 'number' }, description: 'Label IDs (optional)' },
        priority: { type: 'number', description: 'Priority 1-4 (optional)' },
        due_string: { type: 'string', description: 'Natural language due date (optional)' },
        due_date: { type: 'string', description: 'Due date YYYY-MM-DD (optional)' },
        due_datetime: { type: 'string', description: 'Due datetime RFC3339 (optional)' },
        due_lang: { type: 'string', description: 'Language for date parsing (optional)' },
        assignee: { type: 'number', description: 'Assignee user ID (optional)' },
      },
      required: ['content'],
    },
  },
  {
    name: 'get_task',
    description: 'Get a specific Todoist task by ID',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number', description: 'Task ID' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'update_task',
    description: 'Update a Todoist task',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number', description: 'Task ID' },
        content: { type: 'string', description: 'Task content/title (optional)' },
        description: { type: 'string', description: 'Task description (optional)' },
        project_id: { type: 'number', description: 'Project ID (optional)' },
        section_id: { type: 'number', description: 'Section ID (optional)' },
        parent_id: { type: 'number', description: 'Parent task ID (optional)' },
        label_ids: { type: 'array', items: { type: 'number' }, description: 'Label IDs (optional)' },
        priority: { type: 'number', description: 'Priority 1-4 (optional)' },
        due_string: { type: 'string', description: 'Natural language due date (optional)' },
        due_date: { type: 'string', description: 'Due date YYYY-MM-DD (optional)' },
        due_datetime: { type: 'string', description: 'Due datetime RFC3339 (optional)' },
        due_lang: { type: 'string', description: 'Language for date parsing (optional)' },
        assignee: { type: 'number', description: 'Assignee user ID (optional)' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'close_task',
    description: 'Mark a Todoist task as completed',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number', description: 'Task ID' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'reopen_task',
    description: 'Reopen a completed Todoist task',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number', description: 'Task ID' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'delete_task',
    description: 'Delete a Todoist task',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number', description: 'Task ID' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'quick_add_task',
    description: 'Create a task using natural language (quick add)',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Natural language task description (e.g., "Submit report by Friday 5pm #Work p2")' },
        note: { type: 'string', description: 'Initial note/comment (optional)' },
        reminder: { type: 'string', description: 'Reminder specification (optional)' },
        project_id: { type: 'number', description: 'Override project ID (optional)' },
        section_id: { type: 'number', description: 'Override section ID (optional)' },
        parent_id: { type: 'number', description: 'Make this a subtask (optional)' },
        due_lang: { type: 'string', description: 'Language for date parsing (optional)' },
        priority: { type: 'number', description: 'Priority override 1-4 (optional)' },
      },
      required: ['text'],
    },
  },

  // Sections
  {
    name: 'list_sections',
    description: 'List sections, optionally filtered by project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'Project ID to filter by (optional)' },
      },
    },
  },
  {
    name: 'create_section',
    description: 'Create a new section in a project',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Section name' },
        project_id: { type: 'number', description: 'Project ID' },
        order: { type: 'number', description: 'Sort order (optional)' },
      },
      required: ['name', 'project_id'],
    },
  },
  {
    name: 'get_section',
    description: 'Get a specific section by ID',
    inputSchema: {
      type: 'object',
      properties: {
        section_id: { type: 'number', description: 'Section ID' },
      },
      required: ['section_id'],
    },
  },
  {
    name: 'update_section',
    description: 'Update a section',
    inputSchema: {
      type: 'object',
      properties: {
        section_id: { type: 'number', description: 'Section ID' },
        name: { type: 'string', description: 'New section name (optional)' },
        order: { type: 'number', description: 'New sort order (optional)' },
      },
      required: ['section_id'],
    },
  },
  {
    name: 'delete_section',
    description: 'Delete a section',
    inputSchema: {
      type: 'object',
      properties: {
        section_id: { type: 'number', description: 'Section ID' },
      },
      required: ['section_id'],
    },
  },

  // Comments
  {
    name: 'list_comments',
    description: 'List comments for a task or project',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'number', description: 'Task ID (optional, either task_id or project_id required)' },
        project_id: { type: 'number', description: 'Project ID (optional, either task_id or project_id required)' },
      },
    },
  },
  {
    name: 'create_comment',
    description: 'Add a comment to a task or project',
    inputSchema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Comment content' },
        task_id: { type: 'number', description: 'Task ID (optional, either task_id or project_id required)' },
        project_id: { type: 'number', description: 'Project ID (optional, either task_id or project_id required)' },
        attachment: { type: 'object', description: 'File attachment metadata (optional)' },
      },
      required: ['content'],
    },
  },
  {
    name: 'get_comment',
    description: 'Get a specific comment by ID',
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'number', description: 'Comment ID' },
      },
      required: ['comment_id'],
    },
  },
  {
    name: 'update_comment',
    description: 'Update a comment',
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'number', description: 'Comment ID' },
        content: { type: 'string', description: 'New comment content' },
      },
      required: ['comment_id', 'content'],
    },
  },
  {
    name: 'delete_comment',
    description: 'Delete a comment',
    inputSchema: {
      type: 'object',
      properties: {
        comment_id: { type: 'number', description: 'Comment ID' },
      },
      required: ['comment_id'],
    },
  },

  // Labels
  {
    name: 'list_labels',
    description: 'List all labels',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_label',
    description: 'Create a new label',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Label name' },
        color: { type: 'number', description: 'Color ID (optional)' },
        order: { type: 'number', description: 'Sort order (optional)' },
        favorite: { type: 'boolean', description: 'Mark as favorite (optional)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_label',
    description: 'Get a specific label by ID',
    inputSchema: {
      type: 'object',
      properties: {
        label_id: { type: 'number', description: 'Label ID' },
      },
      required: ['label_id'],
    },
  },
  {
    name: 'update_label',
    description: 'Update a label',
    inputSchema: {
      type: 'object',
      properties: {
        label_id: { type: 'number', description: 'Label ID' },
        name: { type: 'string', description: 'New label name (optional)' },
        color: { type: 'number', description: 'Color ID (optional)' },
        order: { type: 'number', description: 'Sort order (optional)' },
        favorite: { type: 'boolean', description: 'Favorite status (optional)' },
      },
      required: ['label_id'],
    },
  },
  {
    name: 'delete_label',
    description: 'Delete a label',
    inputSchema: {
      type: 'object',
      properties: {
        label_id: { type: 'number', description: 'Label ID' },
      },
      required: ['label_id'],
    },
  },

  // Productivity and completion
  {
    name: 'get_completed_tasks',
    description: 'Get completed tasks with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of tasks (default 30, max 200)' },
        since: { type: 'string', description: 'Only tasks completed after this timestamp (RFC3339)' },
      },
    },
  },
  {
    name: 'get_completed_tasks_by_project',
    description: 'Get completed tasks for a specific project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: { type: 'number', description: 'Project ID' },
        limit: { type: 'number', description: 'Maximum number of tasks (default 30, max 200)' },
        until: { type: 'string', description: 'Only tasks completed before this date (YYYY-MM-DD)' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_productivity_stats',
    description: 'Get productivity statistics including karma and daily completion counts',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];