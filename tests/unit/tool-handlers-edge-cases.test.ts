// Edge cases and additional coverage for tool handlers

import { TodoistToolHandlers } from '../../src/handlers/tool-handlers';
import { TodoistApiClient } from '../../src/services/todoist-api';
import { RateLimitError, TodoistApiError } from '../../src/types/mcp';

// Mock the API client
jest.mock('../../src/services/todoist-api');

describe('TodoistToolHandlers - Edge Cases and Error Coverage', () => {
  let toolHandlers: TodoistToolHandlers;
  let mockApiClient: jest.Mocked<TodoistApiClient>;

  beforeEach(() => {
    mockApiClient = new TodoistApiClient({
      apiKey: 'test-key',
      baseUrl: 'https://api.todoist.com/rest/v2',
    }) as jest.Mocked<TodoistApiClient>;

    toolHandlers = new TodoistToolHandlers(mockApiClient);
  });

  describe('Rate Limit Error Handling', () => {
    it('should handle rate limit errors gracefully', async () => {
      const rateLimitError = new RateLimitError('Rate limit exceeded', Date.now() + 900000);
      mockApiClient.getProjects.mockRejectedValue(rateLimitError);

      const result = await toolHandlers.handleTool('list_projects', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Rate limit exceeded');
    });

    it('should handle TodoistApiError', async () => {
      const apiError = new TodoistApiError('API Error', 400, { error: 'Bad request' });
      mockApiClient.createTask.mockRejectedValue(apiError);

      const result = await toolHandlers.handleTool('create_task', { content: 'Test' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('API Error');
    });
  });

  describe('Null and Undefined Handling', () => {
    it('should handle null/undefined responses from API', async () => {
      mockApiClient.getProjects.mockResolvedValue(null as any);

      const result = await toolHandlers.handleTool('list_projects', {});

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toBe('null');
    });

    it('should handle empty arrays from API', async () => {
      mockApiClient.getProjects.mockResolvedValue([]);

      const result = await toolHandlers.handleTool('list_projects', {});

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toBe('[]');
    });
  });

  describe('Parameter Edge Cases', () => {
    it('should handle empty string parameters', async () => {
      const mockTask = {
        id: 1,
        content: '',
        project_id: 1,
        section_id: null,
        parent_id: null,
        description: '',
        completed: false,
        priority: 1,
        due: null,
        label_ids: [],
        url: 'https://todoist.com/task/1',
      };
      mockApiClient.createTask.mockResolvedValue(mockTask);

      const result = await toolHandlers.handleTool('create_task', { content: '' });

      expect(result.isError).toBeFalsy();
      expect(mockApiClient.createTask).toHaveBeenCalledWith({
        content: '',
        description: undefined,
        project_id: undefined,
        section_id: undefined,
        parent_id: undefined,
        label_ids: undefined,
        priority: undefined,
        due_string: undefined,
        due_date: undefined,
        due_datetime: undefined,
        due_lang: undefined,
        assignee: undefined,
      });
    });

    it('should handle zero values in parameters', async () => {
      const mockProject = {
        id: 0,
        name: 'Test Project',
        comment_count: 0,
        order: 0,
        color: 0,
        shared: false,
        favorite: false,
        parent_id: null,
        sync_id: 0,
        url: 'https://todoist.com/project/0',
      };
      mockApiClient.createProject.mockResolvedValue(mockProject);

      const result = await toolHandlers.handleTool('create_project', {
        name: 'Test Project',
        color: 0,
        parent_id: 0,
      });

      expect(result.isError).toBeFalsy();
      expect(mockApiClient.createProject).toHaveBeenCalledWith({
        name: 'Test Project',
        color: 0,
        parent_id: 0,
        favorite: undefined,
      });
    });

    it('should handle boolean false values', async () => {
      const mockProject = {
        id: 1,
        name: 'Test Project',
        comment_count: 0,
        order: 1,
        color: 47,
        shared: false,
        favorite: false,
        parent_id: null,
        sync_id: 123,
        url: 'https://todoist.com/project/1',
      };
      mockApiClient.createProject.mockResolvedValue(mockProject);

      const result = await toolHandlers.handleTool('create_project', {
        name: 'Test Project',
        favorite: false,
      });

      expect(result.isError).toBeFalsy();
      expect(mockApiClient.createProject).toHaveBeenCalledWith({
        name: 'Test Project',
        parent_id: undefined,
        color: undefined,
        favorite: false,
      });
    });

    it('should handle array parameters', async () => {
      const mockTask = {
        id: 1,
        content: 'Task with labels',
        project_id: 1,
        section_id: null,
        parent_id: null,
        description: '',
        completed: false,
        priority: 1,
        due: null,
        label_ids: [1, 2, 3],
        url: 'https://todoist.com/task/1',
      };
      mockApiClient.createTask.mockResolvedValue(mockTask);

      const result = await toolHandlers.handleTool('create_task', {
        content: 'Task with labels',
        label_ids: [1, 2, 3],
      });

      expect(result.isError).toBeFalsy();
      expect(mockApiClient.createTask).toHaveBeenCalledWith({
        content: 'Task with labels',
        label_ids: [1, 2, 3],
        description: undefined,
        project_id: undefined,
        section_id: undefined,
        parent_id: undefined,
        priority: undefined,
        due_string: undefined,
        due_date: undefined,
        due_datetime: undefined,
        due_lang: undefined,
        assignee: undefined,
      });
    });

    it('should handle empty array parameters', async () => {
      const mockTask = {
        id: 1,
        content: 'Task without labels',
        project_id: 1,
        section_id: null,
        parent_id: null,
        description: '',
        completed: false,
        priority: 1,
        due: null,
        label_ids: [],
        url: 'https://todoist.com/task/1',
      };
      mockApiClient.createTask.mockResolvedValue(mockTask);

      const result = await toolHandlers.handleTool('create_task', {
        content: 'Task without labels',
        label_ids: [],
      });

      expect(result.isError).toBeFalsy();
      expect(mockApiClient.createTask).toHaveBeenCalledWith({
        content: 'Task without labels',
        label_ids: [],
        description: undefined,
        project_id: undefined,
        section_id: undefined,
        parent_id: undefined,
        priority: undefined,
        due_string: undefined,
        due_date: undefined,
        due_datetime: undefined,
        due_lang: undefined,
        assignee: undefined,
      });
    });
  });

  describe('Complex Data Responses', () => {
    it('should handle tasks with complex due dates', async () => {
      const mockTask = {
        id: 1,
        content: 'Complex task',
        project_id: 1,
        section_id: null,
        parent_id: null,
        description: 'Complex description with\nmultiple lines',
        completed: false,
        priority: 4,
        due: {
          string: 'every Monday at 9am',
          date: '2024-01-08',
          datetime: '2024-01-08T09:00:00Z',
          recurring: true,
          timezone: 'America/New_York',
        },
        label_ids: [1, 2],
        url: 'https://todoist.com/task/1',
      };
      mockApiClient.getTask.mockResolvedValue(mockTask);

      const result = await toolHandlers.handleTool('get_task', { task_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Complex task');
      expect(result.content[0].text).toContain('every Monday at 9am');
      expect(result.content[0].text).toContain('recurring');
    });

    it('should handle comments with attachments', async () => {
      const mockComments = [
        {
          id: 1,
          task_id: 1,
          project_id: null,
          content: 'Comment with attachment',
          posted: '2024-01-01T10:00:00Z',
          attachment: {
            file_type: 'image/png',
            file_name: 'screenshot.png',
            file_size: 1024,
            file_url: 'https://example.com/file.png',
          },
        },
      ];
      mockApiClient.getComments.mockResolvedValue(mockComments);

      const result = await toolHandlers.handleTool('list_comments', { task_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('screenshot.png');
      expect(result.content[0].text).toContain('file_url');
    });
  });

  describe('All Remaining Tool Coverage', () => {
    it('should handle list_sections with no project_id', async () => {
      const mockSections = [
        { id: 1, project_id: 1, order: 1, name: 'Global Section 1' },
        { id: 2, project_id: 2, order: 1, name: 'Global Section 2' },
      ];
      mockApiClient.getSections.mockResolvedValue(mockSections);

      const result = await toolHandlers.handleTool('list_sections', {});

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Global Section');
      expect(mockApiClient.getSections).toHaveBeenCalledWith(undefined);
    });

    it('should handle list_comments with no parameters', async () => {
      const mockComments = [
        {
          id: 1,
          task_id: null,
          project_id: null,
          content: 'Global comment',
          posted: '2024-01-01T10:00:00Z',
          attachment: null,
        },
      ];
      mockApiClient.getComments.mockResolvedValue(mockComments);

      const result = await toolHandlers.handleTool('list_comments', {});

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Global comment');
      expect(mockApiClient.getComments).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should handle get_completed_tasks with no filters', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            content: 'Completed task',
            completed: true,
            project_id: 1,
            section_id: null,
            parent_id: null,
            description: '',
            priority: 1,
            due: null,
            label_ids: [],
            url: 'https://todoist.com/task/1',
          },
        ],
      };
      mockApiClient.getCompletedTasks.mockResolvedValue(mockResponse);

      const result = await toolHandlers.handleTool('get_completed_tasks', {});

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Completed task');
      expect(mockApiClient.getCompletedTasks).toHaveBeenCalledWith({
        limit: undefined,
        since: undefined,
      });
    });

    it('should handle get_completed_tasks_by_project with minimal params', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            content: 'Project completed task',
            completed: true,
            project_id: 1,
            section_id: null,
            parent_id: null,
            description: '',
            priority: 1,
            due: null,
            label_ids: [],
            url: 'https://todoist.com/task/1',
          },
        ],
      };
      mockApiClient.getCompletedTasksByProject.mockResolvedValue(mockResponse);

      const result = await toolHandlers.handleTool('get_completed_tasks_by_project', {
        project_id: 1,
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Project completed task');
      expect(mockApiClient.getCompletedTasksByProject).toHaveBeenCalledWith(1, {
        limit: undefined,
        until: undefined,
      });
    });
  });
});