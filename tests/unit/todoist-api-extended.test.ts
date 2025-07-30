// Extended API client tests for better coverage

import axios from 'axios';
import { TodoistApiClient } from '../../src/services/todoist-api';
import { TodoistMcpConfig } from '../../src/types/mcp';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TodoistApiClient - Extended Coverage', () => {
  let apiClient: TodoistApiClient;
  let mockAxiosInstance: jest.Mocked<any>;
  let config: TodoistMcpConfig;

  beforeEach(() => {
    config = {
      apiKey: 'test-api-key-1234567890abcdef1234567890abcdef12345678',
      baseUrl: 'https://api.todoist.com/rest/v2',
      timeout: 15000,
      retryAttempts: 3,
      debug: false,
    };

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    apiClient = new TodoistApiClient(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Sections API', () => {
    it('should get sections without project filter', async () => {
      const mockSections = [
        { id: 1, project_id: 1, order: 1, name: 'Section 1' },
        { id: 2, project_id: 2, order: 1, name: 'Section 2' },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: mockSections });

      const result = await apiClient.getSections();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/sections');
      expect(result).toEqual(mockSections);
    });

    it('should get sections with project filter', async () => {
      const mockSections = [{ id: 1, project_id: 1, order: 1, name: 'Section 1' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockSections });

      const result = await apiClient.getSections(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/sections?project_id=1');
      expect(result).toEqual(mockSections);
    });

    it('should create section', async () => {
      const sectionData = { name: 'New Section', project_id: 1, order: 2 };
      const createdSection = { id: 3, ...sectionData };
      mockAxiosInstance.post.mockResolvedValue({ data: createdSection });

      const result = await apiClient.createSection(sectionData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/sections', sectionData);
      expect(result).toEqual(createdSection);
    });

    it('should get single section', async () => {
      const mockSection = { id: 1, project_id: 1, order: 1, name: 'Test Section' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockSection });

      const result = await apiClient.getSection(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/sections/1');
      expect(result).toEqual(mockSection);
    });

    it('should update section', async () => {
      const updateData = { name: 'Updated Section', order: 3 };
      mockAxiosInstance.post.mockResolvedValue({});

      await apiClient.updateSection(1, updateData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/sections/1', updateData);
    });

    it('should delete section', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await apiClient.deleteSection(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/sections/1');
    });
  });

  describe('Comments API', () => {
    it('should get comments for task', async () => {
      const mockComments = [
        {
          id: 1,
          task_id: 1,
          project_id: null,
          content: 'Task comment',
          posted: '2024-01-01T10:00:00Z',
          attachment: null,
        },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: mockComments });

      const result = await apiClient.getComments(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/comments?task_id=1');
      expect(result).toEqual(mockComments);
    });

    it('should get comments for project', async () => {
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
      mockAxiosInstance.get.mockResolvedValue({ data: mockComments });

      const result = await apiClient.getComments(undefined, 1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/comments?project_id=1');
      expect(result).toEqual(mockComments);
    });

    it('should get comments for both task and project', async () => {
      const mockComments = [
        {
          id: 1,
          task_id: 1,
          project_id: 1,
          content: 'Both comment',
          posted: '2024-01-01T10:00:00Z',
          attachment: null,
        },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: mockComments });

      const result = await apiClient.getComments(1, 1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/comments?task_id=1&project_id=1');
      expect(result).toEqual(mockComments);
    });

    it('should create comment', async () => {
      const commentData = { content: 'New comment', task_id: 1 };
      const createdComment = { id: 1, ...commentData, posted: '2024-01-01T10:00:00Z', attachment: null };
      mockAxiosInstance.post.mockResolvedValue({ data: createdComment });

      const result = await apiClient.createComment(commentData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/comments', commentData);
      expect(result).toEqual(createdComment);
    });

    it('should get single comment', async () => {
      const mockComment = {
        id: 1,
        task_id: 1,
        project_id: null,
        content: 'Single comment',
        posted: '2024-01-01T10:00:00Z',
        attachment: null,
      };
      mockAxiosInstance.get.mockResolvedValue({ data: mockComment });

      const result = await apiClient.getComment(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/comments/1');
      expect(result).toEqual(mockComment);
    });

    it('should update comment', async () => {
      const updateData = { content: 'Updated comment' };
      mockAxiosInstance.post.mockResolvedValue({});

      await apiClient.updateComment(1, updateData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/comments/1', updateData);
    });

    it('should delete comment', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await apiClient.deleteComment(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/comments/1');
    });
  });

  describe('Labels API', () => {
    it('should get all labels', async () => {
      const mockLabels = [
        { id: 1, name: 'Work', color: 47, order: 1, favorite: false },
        { id: 2, name: 'Personal', color: 48, order: 2, favorite: true },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: mockLabels });

      const result = await apiClient.getLabels();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/labels');
      expect(result).toEqual(mockLabels);
    });

    it('should create label', async () => {
      const labelData = { name: 'Urgent', color: 47, order: 1, favorite: true };
      const createdLabel = { id: 1, ...labelData };
      mockAxiosInstance.post.mockResolvedValue({ data: createdLabel });

      const result = await apiClient.createLabel(labelData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/labels', labelData);
      expect(result).toEqual(createdLabel);
    });

    it('should get single label', async () => {
      const mockLabel = { id: 1, name: 'Important', color: 47, order: 1, favorite: false };
      mockAxiosInstance.get.mockResolvedValue({ data: mockLabel });

      const result = await apiClient.getLabel(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/labels/1');
      expect(result).toEqual(mockLabel);
    });

    it('should update label', async () => {
      const updateData = { name: 'Very Important', favorite: true };
      mockAxiosInstance.post.mockResolvedValue({});

      await apiClient.updateLabel(1, updateData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/labels/1', updateData);
    });

    it('should delete label', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await apiClient.deleteLabel(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/labels/1');
    });
  });

  describe('Tasks API Extended', () => {
    it('should get task by id', async () => {
      const mockTask = {
        id: 1,
        content: 'Test task',
        project_id: 1,
        completed: false,
        priority: 2,
      };
      mockAxiosInstance.get.mockResolvedValue({ data: mockTask });

      const result = await apiClient.getTask(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tasks/1');
      expect(result).toEqual(mockTask);
    });

    it('should update task', async () => {
      const updateData = { content: 'Updated task', priority: 3 };
      mockAxiosInstance.post.mockResolvedValue({});

      await apiClient.updateTask(1, updateData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/tasks/1', updateData);
    });

    it('should reopen task', async () => {
      mockAxiosInstance.post.mockResolvedValue({});

      await apiClient.reopenTask(1);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/tasks/1/reopen');
    });

    it('should delete task', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await apiClient.deleteTask(1);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/tasks/1');
    });

    it('should get tasks with complex filters', async () => {
      const mockTasks = [{ id: 1, content: 'Filtered task' }];
      const filters = {
        project_id: 1,
        section_id: 2,
        label_id: 3,
        filter: 'today',
        ids: [1, 2, 3],
      };
      mockAxiosInstance.get.mockResolvedValue({ data: mockTasks });

      const result = await apiClient.getTasks(filters);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/tasks?project_id=1&section_id=2&label_id=3&filter=today&ids=1%2C2%2C3'
      );
      expect(result).toEqual(mockTasks);
    });
  });

  describe('Productivity API', () => {
    it('should get completed tasks with filters', async () => {
      const mockResponse = {
        items: [{ id: 1, content: 'Completed task', completed: true }],
        next_cursor: 'cursor123',
      };
      const filters = { limit: 50, since: '2024-01-01T00:00:00Z' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getCompletedTasks(filters);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/completed/get_all?limit=50&since=2024-01-01T00%3A00%3A00Z'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get completed tasks without filters', async () => {
      const mockResponse = {
        items: [{ id: 1, content: 'Completed task', completed: true }],
      };
      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getCompletedTasks();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/completed/get_all?');
      expect(result).toEqual(mockResponse);
    });

    it('should get completed tasks by project with filters', async () => {
      const mockResponse = {
        items: [{ id: 1, content: 'Project completed task', completed: true }],
        next_cursor: 'project_cursor',
      };
      const filters = { limit: 25, until: '2024-12-31' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getCompletedTasksByProject(1, filters);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/completed/get_project?project_id=1&limit=25&until=2024-12-31'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get productivity stats', async () => {
      const mockStats = {
        karma: 4250,
        karma_trend: 'up' as const,
        days_items: [
          { day: '2024-01-01', completed: 5 },
          { day: '2024-01-02', completed: 3 },
        ],
      };
      mockAxiosInstance.get.mockResolvedValue({ data: mockStats });

      const result = await apiClient.getProductivityStats();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/completed/get_stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('Project API Extended', () => {
    it('should get project collaborators', async () => {
      const mockCollaborators = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: mockCollaborators });

      const result = await apiClient.getProjectCollaborators(1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/1/collaborators');
      expect(result).toEqual(mockCollaborators);
    });
  });
});