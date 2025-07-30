// Complete test coverage for all remaining tool handlers

import { TodoistToolHandlers } from '../../src/handlers/tool-handlers';
import { TodoistApiClient } from '../../src/services/todoist-api';

// Mock the API client
jest.mock('../../src/services/todoist-api');

describe('TodoistToolHandlers - Complete Coverage', () => {
  let toolHandlers: TodoistToolHandlers;
  let mockApiClient: jest.Mocked<TodoistApiClient>;

  beforeEach(() => {
    mockApiClient = new TodoistApiClient({
      apiKey: 'test-key',
      baseUrl: 'https://api.todoist.com/rest/v2',
    }) as jest.Mocked<TodoistApiClient>;

    toolHandlers = new TodoistToolHandlers(mockApiClient);
  });

  describe('Remaining Project Operations', () => {
    it('should handle get_project tool', async () => {
      const mockProject = {
        id: 1,
        name: 'Test Project',
        comment_count: 5,
        order: 1,
        color: 47,
        shared: true,
        favorite: false,
        parent_id: null,
        sync_id: 123,
        url: 'https://todoist.com/project/1',
      };
      mockApiClient.getProject.mockResolvedValue(mockProject);

      const result = await toolHandlers.handleTool('get_project', { project_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Test Project');
      expect(mockApiClient.getProject).toHaveBeenCalledWith(1);
    });

    it('should handle update_project tool', async () => {
      mockApiClient.updateProject.mockResolvedValue();

      const result = await toolHandlers.handleTool('update_project', {
        project_id: 1,
        name: 'Updated Project',
        favorite: true,
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Project updated successfully');
      expect(mockApiClient.updateProject).toHaveBeenCalledWith(1, {
        name: 'Updated Project',
        color: undefined,
        favorite: true,
      });
    });

    it('should handle delete_project tool', async () => {
      mockApiClient.deleteProject.mockResolvedValue();

      const result = await toolHandlers.handleTool('delete_project', { project_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Project deleted successfully');
      expect(mockApiClient.deleteProject).toHaveBeenCalledWith(1);
    });
  });

  describe('Remaining Task Operations', () => {
    it('should handle list_tasks tool with multiple filters', async () => {
      const mockTasks = [
        {
          id: 1,
          content: 'Task 1',
          project_id: 1,
          section_id: null,
          parent_id: null,
          description: '',
          completed: false,
          priority: 2,
          due: null,
          label_ids: [],
          url: 'https://todoist.com/task/1',
        },
        {
          id: 2,
          content: 'Task 2',
          project_id: 1,
          section_id: null,
          parent_id: null,
          description: '',
          completed: false,
          priority: 1,
          due: null,
          label_ids: [],
          url: 'https://todoist.com/task/2',
        },
      ];
      mockApiClient.getTasks.mockResolvedValue(mockTasks);

      const result = await toolHandlers.handleTool('list_tasks', {
        project_id: 1,
        label_id: 2,
        filter: 'today',
        ids: [1, 2],
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Task 1');
      expect(mockApiClient.getTasks).toHaveBeenCalledWith({
        project_id: 1,
        section_id: undefined,
        label_id: 2,
        filter: 'today',
        ids: [1, 2],
      });
    });

    it('should handle list_tasks tool with no filters', async () => {
      const mockTasks = [
        {
          id: 1,
          content: 'All Tasks',
          project_id: 1,
          section_id: null,
          parent_id: null,
          description: '',
          completed: false,
          priority: 1,
          due: null,
          label_ids: [],
          url: 'https://todoist.com/task/1',
        },
      ];
      mockApiClient.getTasks.mockResolvedValue(mockTasks);

      const result = await toolHandlers.handleTool('list_tasks', {});

      expect(result.isError).toBeFalsy();
      expect(mockApiClient.getTasks).toHaveBeenCalledWith({
        project_id: undefined,
        section_id: undefined,
        label_id: undefined,
        filter: undefined,
        ids: undefined,
      });
    });

    it('should handle close_task tool', async () => {
      mockApiClient.closeTask.mockResolvedValue();

      const result = await toolHandlers.handleTool('close_task', { task_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Task marked as completed successfully');
      expect(mockApiClient.closeTask).toHaveBeenCalledWith(1);
    });
  });

  describe('Remaining Section Operations', () => {
    it('should handle get_section tool', async () => {
      const mockSection = { id: 1, project_id: 1, order: 1, name: 'Test Section' };
      mockApiClient.getSection.mockResolvedValue(mockSection);

      const result = await toolHandlers.handleTool('get_section', { section_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Test Section');
      expect(mockApiClient.getSection).toHaveBeenCalledWith(1);
    });
  });

  describe('Remaining Comment Operations', () => {
    it('should handle list_comments tool for project', async () => {
      const mockComments = [
        {
          id: 1,
          task_id: null,
          project_id: 1,
          content: 'Project comment',
          posted: '2024-01-01T10:00:00Z',
          attachment: null,
        },
      ];
      mockApiClient.getComments.mockResolvedValue(mockComments);

      const result = await toolHandlers.handleTool('list_comments', { project_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Project comment');
      expect(mockApiClient.getComments).toHaveBeenCalledWith(undefined, 1);
    });

    it('should handle get_comment tool', async () => {
      const mockComment = {
        id: 1,
        task_id: 1,
        project_id: null,
        content: 'Single comment',
        posted: '2024-01-01T10:00:00Z',
        attachment: null,
      };
      mockApiClient.getComment.mockResolvedValue(mockComment);

      const result = await toolHandlers.handleTool('get_comment', { comment_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Single comment');
      expect(mockApiClient.getComment).toHaveBeenCalledWith(1);
    });

    it('should handle update_comment tool', async () => {
      mockApiClient.updateComment.mockResolvedValue();

      const result = await toolHandlers.handleTool('update_comment', {
        comment_id: 1,
        content: 'Updated comment text',
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Comment updated successfully');
      expect(mockApiClient.updateComment).toHaveBeenCalledWith(1, {
        content: 'Updated comment text',
      });
    });

    it('should handle delete_comment tool', async () => {
      mockApiClient.deleteComment.mockResolvedValue();

      const result = await toolHandlers.handleTool('delete_comment', { comment_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Comment deleted successfully');
      expect(mockApiClient.deleteComment).toHaveBeenCalledWith(1);
    });
  });

  describe('Remaining Label Operations', () => {
    it('should handle get_label tool', async () => {
      const mockLabel = { id: 1, name: 'Important', color: 47, order: 1, favorite: true };
      mockApiClient.getLabel.mockResolvedValue(mockLabel);

      const result = await toolHandlers.handleTool('get_label', { label_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Important');
      expect(mockApiClient.getLabel).toHaveBeenCalledWith(1);
    });

    it('should handle update_label tool', async () => {
      mockApiClient.updateLabel.mockResolvedValue();

      const result = await toolHandlers.handleTool('update_label', {
        label_id: 1,
        name: 'Very Important',
        favorite: false,
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Label updated successfully');
      expect(mockApiClient.updateLabel).toHaveBeenCalledWith(1, {
        name: 'Very Important',
        color: undefined,
        order: undefined,
        favorite: false,
      });
    });

    it('should handle delete_label tool', async () => {
      mockApiClient.deleteLabel.mockResolvedValue();

      const result = await toolHandlers.handleTool('delete_label', { label_id: 1 });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Label deleted successfully');
      expect(mockApiClient.deleteLabel).toHaveBeenCalledWith(1);
    });
  });

  describe('Remaining Productivity Operations', () => {
    it('should handle get_completed_tasks_by_project tool', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            content: 'Completed project task',
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
        next_cursor: 'cursor456',
      };
      mockApiClient.getCompletedTasksByProject.mockResolvedValue(mockResponse);

      const result = await toolHandlers.handleTool('get_completed_tasks_by_project', {
        project_id: 1,
        limit: 25,
        until: '2024-12-31',
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Completed project task');
      expect(mockApiClient.getCompletedTasksByProject).toHaveBeenCalledWith(1, {
        limit: 25,
        until: '2024-12-31',
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle tools with minimal required arguments', async () => {
      const mockTask = {
        id: 1,
        content: 'Minimal task',
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
        content: 'Minimal task',
      });

      expect(result.isError).toBeFalsy();
      expect(mockApiClient.createTask).toHaveBeenCalledWith({
        content: 'Minimal task',
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

    it('should handle create_comment with project_id', async () => {
      const mockComment = {
        id: 1,
        task_id: null,
        project_id: 1,
        content: 'Project comment',
        posted: '2024-01-01T10:00:00Z',
        attachment: null,
      };
      mockApiClient.createComment.mockResolvedValue(mockComment);

      const result = await toolHandlers.handleTool('create_comment', {
        content: 'Project comment',
        project_id: 1,
      });

      expect(result.isError).toBeFalsy();
      expect(result.content[0].text).toContain('Comment created successfully');
      expect(mockApiClient.createComment).toHaveBeenCalledWith({
        content: 'Project comment',
        task_id: undefined,
        project_id: 1,
        attachment: undefined,
      });
    });

    it('should handle create_section with order', async () => {
      const mockSection = { id: 1, project_id: 1, order: 5, name: 'Ordered Section' };
      mockApiClient.createSection.mockResolvedValue(mockSection);

      const result = await toolHandlers.handleTool('create_section', {
        name: 'Ordered Section',
        project_id: 1,
        order: 5,
      });

      expect(result.isError).toBeFalsy();
      expect(mockApiClient.createSection).toHaveBeenCalledWith({
        name: 'Ordered Section',
        project_id: 1,
        order: 5,
      });
    });

    it('should handle quick_add_task with all optional parameters', async () => {
      const mockTask = {
        id: 1,
        content: 'Full quick add task',
        project_id: 2,
        section_id: 3,
        parent_id: null,
        description: '',
        completed: false,
        priority: 3,
        due: { string: 'tomorrow', date: '2024-01-02', recurring: false },
        label_ids: [1],
        url: 'https://todoist.com/task/1',
      };
      mockApiClient.quickAddTask.mockResolvedValue(mockTask);

      const result = await toolHandlers.handleTool('quick_add_task', {
        text: 'Complete project tomorrow p3 #work',
        note: 'This is a note',
        reminder: '1 hour before',
        project_id: 2,
        section_id: 3,
        parent_id: 4,
        due_lang: 'en',
        priority: 3,
      });

      expect(result.isError).toBeFalsy();
      expect(mockApiClient.quickAddTask).toHaveBeenCalledWith({
        text: 'Complete project tomorrow p3 #work',
        note: 'This is a note',
        reminder: '1 hour before',
        project_id: 2,
        section_id: 3,
        parent_id: 4,
        due_lang: 'en',
        priority: 3,
      });
    });
  });
});