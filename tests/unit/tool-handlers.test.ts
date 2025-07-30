// Unit tests for tool handlers

import { TodoistToolHandlers } from '../../src/handlers/tool-handlers';
import { TodoistApiClient } from '../../src/services/todoist-api';
import { Project, Task } from '../../src/types/todoist';

// Mock the API client
jest.mock('../../src/services/todoist-api');

describe('TodoistToolHandlers', () => {
  let toolHandlers: TodoistToolHandlers;
  let mockApiClient: jest.Mocked<TodoistApiClient>;

  beforeEach(() => {
    mockApiClient = new TodoistApiClient({
      apiKey: 'test-key',
      baseUrl: 'https://api.todoist.com/rest/v2',
    }) as jest.Mocked<TodoistApiClient>;

    toolHandlers = new TodoistToolHandlers(mockApiClient);
  });

  describe('Projects', () => {
    it('should handle list_projects tool', async () => {
      const mockProjects: Project[] = [
        {
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
        },
      ];

      mockApiClient.getProjects.mockResolvedValue(mockProjects);

      const result = await toolHandlers.handleTool('list_projects', {});

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Test Project');
      expect(mockApiClient.getProjects).toHaveBeenCalledTimes(1);
    });

    it('should handle create_project tool', async () => {
      const mockProject: Project = {
        id: 1,
        name: 'New Project',
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
        name: 'New Project',
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Project created successfully');
      expect(mockApiClient.createProject).toHaveBeenCalledWith({
        name: 'New Project',
        parent_id: undefined,
        color: undefined,
        favorite: undefined,
      });
    });
  });

  describe('Tasks', () => {
    it('should handle create_task tool', async () => {
      const mockTask: Task = {
        id: 1,
        project_id: 1,
        section_id: null,
        parent_id: null,
        content: 'Test Task',
        description: '',
        completed: false,
        priority: 1,
        due: null,
        label_ids: [],
        url: 'https://todoist.com/task/1',
      };

      mockApiClient.createTask.mockResolvedValue(mockTask);

      const result = await toolHandlers.handleTool('create_task', {
        content: 'Test Task',
        priority: 2,
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Task created successfully');
      expect(mockApiClient.createTask).toHaveBeenCalledWith({
        content: 'Test Task',
        priority: 2,
        description: undefined,
        project_id: undefined,
        section_id: undefined,
        parent_id: undefined,
        label_ids: undefined,
        due_string: undefined,
        due_date: undefined,
        due_datetime: undefined,
        due_lang: undefined,
        assignee: undefined,
      });
    });

    it('should handle quick_add_task tool', async () => {
      const mockTask: Task = {
        id: 1,
        project_id: 1,
        section_id: null,
        parent_id: null,
        content: 'Submit report',
        description: '',
        completed: false,
        priority: 2,
        due: {
          string: 'Friday 5pm',
          date: '2024-01-05',
          recurring: false,
        },
        label_ids: [1],
        url: 'https://todoist.com/task/1',
      };

      mockApiClient.quickAddTask.mockResolvedValue(mockTask);

      const result = await toolHandlers.handleTool('quick_add_task', {
        text: 'Submit report by Friday 5pm #Work p2',
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Task created via quick add');
      expect(mockApiClient.quickAddTask).toHaveBeenCalledWith({
        text: 'Submit report by Friday 5pm #Work p2',
        note: undefined,
        reminder: undefined,
        project_id: undefined,
        section_id: undefined,
        parent_id: undefined,
        due_lang: undefined,
        priority: undefined,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockApiClient.getProjects.mockRejectedValue(new Error('API Error'));

      const result = await toolHandlers.handleTool('list_projects', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error: API Error');
    });

    it('should handle unknown tools', async () => {
      const result = await toolHandlers.handleTool('unknown_tool', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown tool: unknown_tool');
    });
  });
});