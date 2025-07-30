// Extended unit tests for all tool handlers

import { TodoistToolHandlers } from '../../src/handlers/tool-handlers';
import { TodoistApiClient } from '../../src/services/todoist-api';
import { Section, Comment, Label, CompletedTasksResponse, ProductivityStats } from '../../src/types/todoist';

// Mock the API client
jest.mock('../../src/services/todoist-api');

describe('TodoistToolHandlers - Extended Coverage', () => {
  let toolHandlers: TodoistToolHandlers;
  let mockApiClient: jest.Mocked<TodoistApiClient>;

  beforeEach(() => {
    mockApiClient = new TodoistApiClient({
      apiKey: 'test-key',
      baseUrl: 'https://api.todoist.com/rest/v2',
    }) as jest.Mocked<TodoistApiClient>;

    toolHandlers = new TodoistToolHandlers(mockApiClient);
  });

  describe('Sections', () => {
    it('should handle list_sections tool', async () => {
      const mockSections: Section[] = [
        { id: 1, project_id: 1, order: 1, name: 'To Do' },
        { id: 2, project_id: 1, order: 2, name: 'In Progress' },
      ];
      mockApiClient.getSections.mockResolvedValue(mockSections);

      const result = await toolHandlers.handleTool('list_sections', { project_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('To Do');
      expect(mockApiClient.getSections).toHaveBeenCalledWith(1);
    });

    it('should handle create_section tool', async () => {
      const mockSection: Section = { id: 1, project_id: 1, order: 1, name: 'New Section' };
      mockApiClient.createSection.mockResolvedValue(mockSection);

      const result = await toolHandlers.handleTool('create_section', {
        name: 'New Section',
        project_id: 1,
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Section created successfully');
      expect(mockApiClient.createSection).toHaveBeenCalledWith({
        name: 'New Section',
        project_id: 1,
        order: undefined,
      });
    });

    it('should handle update_section tool', async () => {
      mockApiClient.updateSection.mockResolvedValue();

      const result = await toolHandlers.handleTool('update_section', {
        section_id: 1,
        name: 'Updated Section',
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Section updated successfully');
      expect(mockApiClient.updateSection).toHaveBeenCalledWith(1, {
        name: 'Updated Section',
        order: undefined,
      });
    });

    it('should handle delete_section tool', async () => {
      mockApiClient.deleteSection.mockResolvedValue();

      const result = await toolHandlers.handleTool('delete_section', { section_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Section deleted successfully');
      expect(mockApiClient.deleteSection).toHaveBeenCalledWith(1);
    });
  });

  describe('Comments', () => {
    it('should handle list_comments tool for task', async () => {
      const mockComments: Comment[] = [
        {
          id: 1,
          task_id: 1,
          project_id: null,
          content: 'Great work!',
          posted: '2024-01-01T10:00:00Z',
          attachment: null,
        },
      ];
      mockApiClient.getComments.mockResolvedValue(mockComments);

      const result = await toolHandlers.handleTool('list_comments', { task_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Great work!');
      expect(mockApiClient.getComments).toHaveBeenCalledWith(1, undefined);
    });

    it('should handle create_comment tool', async () => {
      const mockComment: Comment = {
        id: 1,
        task_id: 1,
        project_id: null,
        content: 'New comment',
        posted: '2024-01-01T10:00:00Z',
        attachment: null,
      };
      mockApiClient.createComment.mockResolvedValue(mockComment);

      const result = await toolHandlers.handleTool('create_comment', {
        content: 'New comment',
        task_id: 1,
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Comment created successfully');
      expect(mockApiClient.createComment).toHaveBeenCalledWith({
        content: 'New comment',
        task_id: 1,
        project_id: undefined,
        attachment: undefined,
      });
    });
  });

  describe('Labels', () => {
    it('should handle list_labels tool', async () => {
      const mockLabels: Label[] = [
        { id: 1, name: 'Work', color: 47, order: 1, favorite: false },
        { id: 2, name: 'Personal', color: 48, order: 2, favorite: true },
      ];
      mockApiClient.getLabels.mockResolvedValue(mockLabels);

      const result = await toolHandlers.handleTool('list_labels', {});

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Work');
      expect(result.content[0].text).toContain('Personal');
      expect(mockApiClient.getLabels).toHaveBeenCalledTimes(1);
    });

    it('should handle create_label tool', async () => {
      const mockLabel: Label = { id: 1, name: 'Urgent', color: 47, order: 1, favorite: false };
      mockApiClient.createLabel.mockResolvedValue(mockLabel);

      const result = await toolHandlers.handleTool('create_label', {
        name: 'Urgent',
        color: 47,
        favorite: true,
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Label created successfully');
      expect(mockApiClient.createLabel).toHaveBeenCalledWith({
        name: 'Urgent',
        color: 47,
        order: undefined,
        favorite: true,
      });
    });
  });

  describe('Productivity and Completion', () => {
    it('should handle get_completed_tasks tool', async () => {
      const mockResponse: CompletedTasksResponse = {
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
        next_cursor: 'cursor123',
      };
      mockApiClient.getCompletedTasks.mockResolvedValue(mockResponse);

      const result = await toolHandlers.handleTool('get_completed_tasks', {
        limit: 10,
        since: '2024-01-01T00:00:00Z',
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Completed task');
      expect(mockApiClient.getCompletedTasks).toHaveBeenCalledWith({
        limit: 10,
        since: '2024-01-01T00:00:00Z',
      });
    });

    it('should handle get_productivity_stats tool', async () => {
      const mockStats: ProductivityStats = {
        karma: 4250,
        karma_trend: 'up',
        days_items: [
          { day: '2024-01-01', completed: 5 },
          { day: '2024-01-02', completed: 3 },
        ],
      };
      mockApiClient.getProductivityStats.mockResolvedValue(mockStats);

      const result = await toolHandlers.handleTool('get_productivity_stats', {});

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('4250');
      expect(result.content[0].text).toContain('up');
      expect(mockApiClient.getProductivityStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('Task Operations', () => {
    it('should handle get_task tool', async () => {
      const mockTask = {
        id: 1,
        content: 'Test task',
        project_id: 1,
        section_id: null,
        parent_id: null,
        description: 'Test description',
        completed: false,
        priority: 2,
        due: null,
        label_ids: [1, 2],
        url: 'https://todoist.com/task/1',
      };
      mockApiClient.getTask.mockResolvedValue(mockTask);

      const result = await toolHandlers.handleTool('get_task', { task_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Test task');
      expect(mockApiClient.getTask).toHaveBeenCalledWith(1);
    });

    it('should handle update_task tool', async () => {
      mockApiClient.updateTask.mockResolvedValue();

      const result = await toolHandlers.handleTool('update_task', {
        task_id: 1,
        content: 'Updated task',
        priority: 3,
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Task updated successfully');
      expect(mockApiClient.updateTask).toHaveBeenCalledWith(1, {
        content: 'Updated task',
        priority: 3,
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

    it('should handle reopen_task tool', async () => {
      mockApiClient.reopenTask.mockResolvedValue();

      const result = await toolHandlers.handleTool('reopen_task', { task_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Task reopened successfully');
      expect(mockApiClient.reopenTask).toHaveBeenCalledWith(1);
    });

    it('should handle delete_task tool', async () => {
      mockApiClient.deleteTask.mockResolvedValue();

      const result = await toolHandlers.handleTool('delete_task', { task_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Task deleted successfully');
      expect(mockApiClient.deleteTask).toHaveBeenCalledWith(1);
    });
  });

  describe('Project Operations', () => {
    it('should handle get_project_collaborators tool', async () => {
      const mockCollaborators = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ];
      mockApiClient.getProjectCollaborators.mockResolvedValue(mockCollaborators);

      const result = await toolHandlers.handleTool('get_project_collaborators', { project_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('John Doe');
      expect(mockApiClient.getProjectCollaborators).toHaveBeenCalledWith(1);
    });
  });
});