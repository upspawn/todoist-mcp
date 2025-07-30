// MCP tool handlers that execute Todoist API operations

import { TodoistApiClient } from '../services/todoist-api.js';
import { McpToolResponse } from '../types/mcp.js';
import { logger } from '../utils/logger.js';

export class TodoistToolHandlers {
  constructor(private apiClient: TodoistApiClient) {}

  async handleTool(name: string, args: Record<string, unknown>): Promise<McpToolResponse> {
    try {
      logger.debug_log(`Handling tool: ${name}`, args);

      switch (name) {
        // Projects
        case 'list_projects':
          return await this.listProjects();
        case 'create_project':
          return await this.createProject(args);
        case 'get_project':
          return await this.getProject(args);
        case 'update_project':
          return await this.updateProject(args);
        case 'delete_project':
          return await this.deleteProject(args);
        case 'get_project_collaborators':
          return await this.getProjectCollaborators(args);

        // Tasks
        case 'list_tasks':
          return await this.listTasks(args);
        case 'create_task':
          return await this.createTask(args);
        case 'get_task':
          return await this.getTask(args);
        case 'update_task':
          return await this.updateTask(args);
        case 'close_task':
          return await this.closeTask(args);
        case 'reopen_task':
          return await this.reopenTask(args);
        case 'delete_task':
          return await this.deleteTask(args);
        case 'quick_add_task':
          return await this.quickAddTask(args);

        // Sections
        case 'list_sections':
          return await this.listSections(args);
        case 'create_section':
          return await this.createSection(args);
        case 'get_section':
          return await this.getSection(args);
        case 'update_section':
          return await this.updateSection(args);
        case 'delete_section':
          return await this.deleteSection(args);

        // Comments
        case 'list_comments':
          return await this.listComments(args);
        case 'create_comment':
          return await this.createComment(args);
        case 'get_comment':
          return await this.getComment(args);
        case 'update_comment':
          return await this.updateComment(args);
        case 'delete_comment':
          return await this.deleteComment(args);

        // Labels
        case 'list_labels':
          return await this.listLabels();
        case 'create_label':
          return await this.createLabel(args);
        case 'get_label':
          return await this.getLabel(args);
        case 'update_label':
          return await this.updateLabel(args);
        case 'delete_label':
          return await this.deleteLabel(args);

        // Productivity
        case 'get_completed_tasks':
          return await this.getCompletedTasks(args);
        case 'get_completed_tasks_by_project':
          return await this.getCompletedTasksByProject(args);
        case 'get_productivity_stats':
          return await this.getProductivityStats();

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Error handling tool ${name}:`, error);
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  // Project handlers
  private async listProjects(): Promise<McpToolResponse> {
    const projects = await this.apiClient.getProjects();
    return {
      content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }],
    };
  }

  private async createProject(args: Record<string, unknown>): Promise<McpToolResponse> {
    const project = await this.apiClient.createProject({
      name: args.name as string,
      parent_id: args.parent_id as number | undefined,
      color: args.color as number | undefined,
      favorite: args.favorite as boolean | undefined,
    });
    return {
      content: [{ type: 'text', text: `Project created successfully:\n${JSON.stringify(project, null, 2)}` }],
    };
  }

  private async getProject(args: Record<string, unknown>): Promise<McpToolResponse> {
    const project = await this.apiClient.getProject(args.project_id as number);
    return {
      content: [{ type: 'text', text: JSON.stringify(project, null, 2) }],
    };
  }

  private async updateProject(args: Record<string, unknown>): Promise<McpToolResponse> {
    await this.apiClient.updateProject(args.project_id as number, {
      name: args.name as string | undefined,
      color: args.color as number | undefined,
      favorite: args.favorite as boolean | undefined,
    });
    return {
      content: [{ type: 'text', text: 'Project updated successfully' }],
    };
  }

  private async deleteProject(args: Record<string, unknown>): Promise<McpToolResponse> {
    await this.apiClient.deleteProject(args.project_id as number);
    return {
      content: [{ type: 'text', text: 'Project deleted successfully' }],
    };
  }

  private async getProjectCollaborators(args: Record<string, unknown>): Promise<McpToolResponse> {
    const collaborators = await this.apiClient.getProjectCollaborators(args.project_id as number);
    return {
      content: [{ type: 'text', text: JSON.stringify(collaborators, null, 2) }],
    };
  }

  // Task handlers
  private async listTasks(args: Record<string, unknown>): Promise<McpToolResponse> {
    const tasks = await this.apiClient.getTasks({
      project_id: args.project_id as number | undefined,
      section_id: args.section_id as number | undefined,
      label_id: args.label_id as number | undefined,
      filter: args.filter as string | undefined,
      ids: args.ids as number[] | undefined,
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(tasks, null, 2) }],
    };
  }

  private async createTask(args: Record<string, unknown>): Promise<McpToolResponse> {
    const task = await this.apiClient.createTask({
      content: args.content as string,
      description: args.description as string | undefined,
      project_id: args.project_id as number | undefined,
      section_id: args.section_id as number | undefined,
      parent_id: args.parent_id as number | undefined,
      label_ids: args.label_ids as number[] | undefined,
      priority: args.priority as number | undefined,
      due_string: args.due_string as string | undefined,
      due_date: args.due_date as string | undefined,
      due_datetime: args.due_datetime as string | undefined,
      due_lang: args.due_lang as string | undefined,
      assignee: args.assignee as number | undefined,
    });
    return {
      content: [{ type: 'text', text: `Task created successfully:\n${JSON.stringify(task, null, 2)}` }],
    };
  }

  private async getTask(args: Record<string, unknown>): Promise<McpToolResponse> {
    const task = await this.apiClient.getTask(args.task_id as number);
    return {
      content: [{ type: 'text', text: JSON.stringify(task, null, 2) }],
    };
  }

  private async updateTask(args: Record<string, unknown>): Promise<McpToolResponse> {
    await this.apiClient.updateTask(args.task_id as number, {
      content: args.content as string | undefined,
      description: args.description as string | undefined,
      project_id: args.project_id as number | undefined,
      section_id: args.section_id as number | undefined,
      parent_id: args.parent_id as number | undefined,
      label_ids: args.label_ids as number[] | undefined,
      priority: args.priority as number | undefined,
      due_string: args.due_string as string | undefined,
      due_date: args.due_date as string | undefined,
      due_datetime: args.due_datetime as string | undefined,
      due_lang: args.due_lang as string | undefined,
      assignee: args.assignee as number | undefined,
    });
    return {
      content: [{ type: 'text', text: 'Task updated successfully' }],
    };
  }

  private async closeTask(args: Record<string, unknown>): Promise<McpToolResponse> {
    await this.apiClient.closeTask(args.task_id as number);
    return {
      content: [{ type: 'text', text: 'Task marked as completed successfully' }],
    };
  }

  private async reopenTask(args: Record<string, unknown>): Promise<McpToolResponse> {
    await this.apiClient.reopenTask(args.task_id as number);
    return {
      content: [{ type: 'text', text: 'Task reopened successfully' }],
    };
  }

  private async deleteTask(args: Record<string, unknown>): Promise<McpToolResponse> {
    await this.apiClient.deleteTask(args.task_id as number);
    return {
      content: [{ type: 'text', text: 'Task deleted successfully' }],
    };
  }

  private async quickAddTask(args: Record<string, unknown>): Promise<McpToolResponse> {
    const task = await this.apiClient.quickAddTask({
      text: args.text as string,
      note: args.note as string | undefined,
      reminder: args.reminder as string | undefined,
      project_id: args.project_id as number | undefined,
      section_id: args.section_id as number | undefined,
      parent_id: args.parent_id as number | undefined,
      due_lang: args.due_lang as string | undefined,
      priority: args.priority as number | undefined,
    });
    return {
      content: [{ type: 'text', text: `Task created via quick add:\n${JSON.stringify(task, null, 2)}` }],
    };
  }

  // Section handlers
  private async listSections(args: Record<string, unknown>): Promise<McpToolResponse> {
    const sections = await this.apiClient.getSections(args.project_id as number | undefined);
    return {
      content: [{ type: 'text', text: JSON.stringify(sections, null, 2) }],
    };
  }

  private async createSection(args: Record<string, unknown>): Promise<McpToolResponse> {
    const section = await this.apiClient.createSection({
      name: args.name as string,
      project_id: args.project_id as number,
      order: args.order as number | undefined,
    });
    return {
      content: [{ type: 'text', text: `Section created successfully:\n${JSON.stringify(section, null, 2)}` }],
    };
  }

  private async getSection(args: Record<string, unknown>): Promise<McpToolResponse> {
    const section = await this.apiClient.getSection(args.section_id as number);
    return {
      content: [{ type: 'text', text: JSON.stringify(section, null, 2) }],
    };
  }

  private async updateSection(args: Record<string, unknown>): Promise<McpToolResponse> {
    await this.apiClient.updateSection(args.section_id as number, {
      name: args.name as string | undefined,
      order: args.order as number | undefined,
    });
    return {
      content: [{ type: 'text', text: 'Section updated successfully' }],
    };
  }

  private async deleteSection(args: Record<string, unknown>): Promise<McpToolResponse> {
    await this.apiClient.deleteSection(args.section_id as number);
    return {
      content: [{ type: 'text', text: 'Section deleted successfully' }],
    };
  }

  // Comment handlers
  private async listComments(args: Record<string, unknown>): Promise<McpToolResponse> {
    const comments = await this.apiClient.getComments(
      args.task_id as number | undefined,
      args.project_id as number | undefined
    );
    return {
      content: [{ type: 'text', text: JSON.stringify(comments, null, 2) }],
    };
  }

  private async createComment(args: Record<string, unknown>): Promise<McpToolResponse> {
    const comment = await this.apiClient.createComment({
      content: args.content as string,
      task_id: args.task_id as number | undefined,
      project_id: args.project_id as number | undefined,
      attachment: args.attachment as object | undefined,
    });
    return {
      content: [{ type: 'text', text: `Comment created successfully:\n${JSON.stringify(comment, null, 2)}` }],
    };
  }

  private async getComment(args: Record<string, unknown>): Promise<McpToolResponse> {
    const comment = await this.apiClient.getComment(args.comment_id as number);
    return {
      content: [{ type: 'text', text: JSON.stringify(comment, null, 2) }],
    };
  }

  private async updateComment(args: Record<string, unknown>): Promise<McpToolResponse> {
    await this.apiClient.updateComment(args.comment_id as number, {
      content: args.content as string,
    });
    return {
      content: [{ type: 'text', text: 'Comment updated successfully' }],
    };
  }

  private async deleteComment(args: Record<string, unknown>): Promise<McpToolResponse> {
    await this.apiClient.deleteComment(args.comment_id as number);
    return {
      content: [{ type: 'text', text: 'Comment deleted successfully' }],
    };
  }

  // Label handlers
  private async listLabels(): Promise<McpToolResponse> {
    const labels = await this.apiClient.getLabels();
    return {
      content: [{ type: 'text', text: JSON.stringify(labels, null, 2) }],
    };
  }

  private async createLabel(args: Record<string, unknown>): Promise<McpToolResponse> {
    const label = await this.apiClient.createLabel({
      name: args.name as string,
      color: args.color as number | undefined,
      order: args.order as number | undefined,
      favorite: args.favorite as boolean | undefined,
    });
    return {
      content: [{ type: 'text', text: `Label created successfully:\n${JSON.stringify(label, null, 2)}` }],
    };
  }

  private async getLabel(args: Record<string, unknown>): Promise<McpToolResponse> {
    const label = await this.apiClient.getLabel(args.label_id as number);
    return {
      content: [{ type: 'text', text: JSON.stringify(label, null, 2) }],
    };
  }

  private async updateLabel(args: Record<string, unknown>): Promise<McpToolResponse> {
    await this.apiClient.updateLabel(args.label_id as number, {
      name: args.name as string | undefined,
      color: args.color as number | undefined,
      order: args.order as number | undefined,
      favorite: args.favorite as boolean | undefined,
    });
    return {
      content: [{ type: 'text', text: 'Label updated successfully' }],
    };
  }

  private async deleteLabel(args: Record<string, unknown>): Promise<McpToolResponse> {
    await this.apiClient.deleteLabel(args.label_id as number);
    return {
      content: [{ type: 'text', text: 'Label deleted successfully' }],
    };
  }

  // Productivity handlers
  private async getCompletedTasks(args: Record<string, unknown>): Promise<McpToolResponse> {
    const result = await this.apiClient.getCompletedTasks({
      limit: args.limit as number | undefined,
      since: args.since as string | undefined,
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }

  private async getCompletedTasksByProject(args: Record<string, unknown>): Promise<McpToolResponse> {
    const result = await this.apiClient.getCompletedTasksByProject(
      args.project_id as number,
      {
        limit: args.limit as number | undefined,
        until: args.until as string | undefined,
      }
    );
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }

  private async getProductivityStats(): Promise<McpToolResponse> {
    const stats = await this.apiClient.getProductivityStats();
    return {
      content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }],
    };
  }
}