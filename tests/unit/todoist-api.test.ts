// Unit tests for Todoist API client

import axios from 'axios';
import { TodoistApiClient } from '../../src/services/todoist-api';
import { TodoistMcpConfig, RateLimitError, TodoistApiError } from '../../src/types/mcp';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios.isAxiosError
const originalIsAxiosError = axios.isAxiosError;
beforeAll(() => {
  (axios.isAxiosError as any) = jest.fn();
});

afterAll(() => {
  (axios.isAxiosError as any) = originalIsAxiosError;
});

describe('TodoistApiClient', () => {
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

  describe('Constructor and Setup', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: config.baseUrl,
        timeout: config.timeout,
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should set up request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Rate Limiting', () => {
    it('should track request count', async () => {
      const mockProjects = [{ id: 1, name: 'Test Project' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockProjects });

      // Make multiple requests
      await apiClient.getProjects();
      await apiClient.getProjects();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should throw rate limit error when limit exceeded', () => {
      // Access the private checkRateLimit method through the interceptor
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      // Simulate hitting rate limit by manually setting request count
      (apiClient as any).requestCount = 450;
      
      expect(() => {
        requestInterceptor({});
      }).toThrow(RateLimitError);
    });

    it('should reset rate limit window after time passes', () => {
      const originalDateNow = Date.now;
      const mockDate = jest.fn();
      Date.now = mockDate;

      try {
        // Set initial time
        mockDate.mockReturnValue(1000000);
        const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
        
        // Set request count to near limit
        (apiClient as any).requestCount = 400;
        (apiClient as any).windowStart = 1000000;
        
        // Advance time beyond window (15 minutes = 900000ms)
        mockDate.mockReturnValue(1000000 + 900001);
        
        // Should reset the window
        requestInterceptor({});
        
        expect((apiClient as any).requestCount).toBe(0);
        expect((apiClient as any).windowStart).toBe(1000000 + 900001);
      } finally {
        Date.now = originalDateNow;
      }
    });

    it('should increment request count on successful response', async () => {
      const mockProjects = [{ id: 1, name: 'Test Project' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockProjects });
      
      // Get the response interceptor success handler
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
      
      const mockResponse = { data: mockProjects };
      const result = responseInterceptor(mockResponse);
      
      expect(result).toBe(mockResponse);
      expect((apiClient as any).requestCount).toBeGreaterThan(0);
    });

    it('should increment request count on error response', async () => {
      const initialCount = (apiClient as any).requestCount;
      
      // Get the response interceptor error handler
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      const mockIsAxiosError = axios.isAxiosError as any;
      
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { error: 'Bad request' }
        },
        message: 'Request failed'
      };
      
      mockIsAxiosError.mockReturnValue(true);
      
      try {
        await errorHandler(axiosError);
      } catch (error) {
        // Expected to throw
      }
      
      expect((apiClient as any).requestCount).toBe(initialCount + 1);
    });
  });

  describe('Projects API', () => {
    it('should get all projects', async () => {
      const mockProjects = [
        { id: 1, name: 'Project 1', color: 47, shared: false },
        { id: 2, name: 'Project 2', color: 48, shared: true },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: mockProjects });

      const result = await apiClient.getProjects();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects');
      expect(result).toEqual(mockProjects);
    });

    it('should create a project', async () => {
      const newProject = { name: 'New Project', color: 47 };
      const createdProject = { id: 3, ...newProject, shared: false };
      mockAxiosInstance.post.mockResolvedValue({ data: createdProject });

      const result = await apiClient.createProject(newProject);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/projects', newProject);
      expect(result).toEqual(createdProject);
    });

    it('should get single project', async () => {
      const projectId = 1;
      const mockProject = { id: projectId, name: 'Test Project' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockProject });

      const result = await apiClient.getProject(projectId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/projects/${projectId}`);
      expect(result).toEqual(mockProject);
    });

    it('should update project', async () => {
      const projectId = 1;
      const updateData = { name: 'Updated Project' };
      mockAxiosInstance.post.mockResolvedValue({});

      await apiClient.updateProject(projectId, updateData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/projects/${projectId}`, updateData);
    });

    it('should delete project', async () => {
      const projectId = 1;
      mockAxiosInstance.delete.mockResolvedValue({});

      await apiClient.deleteProject(projectId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/projects/${projectId}`);
    });

    it('should get project collaborators', async () => {
      const projectId = 1;
      const mockCollaborators = [{ id: 1, name: 'User 1' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockCollaborators });

      const result = await apiClient.getProjectCollaborators(projectId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/projects/${projectId}/collaborators`);
      expect(result).toEqual(mockCollaborators);
    });
  });

  describe('Tasks API', () => {
    it('should get tasks with filters', async () => {
      const mockTasks = [{ id: 1, content: 'Test Task', project_id: 1 }];
      const filters = { project_id: 1, label_id: 2 };
      mockAxiosInstance.get.mockResolvedValue({ data: mockTasks });

      const result = await apiClient.getTasks(filters);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tasks?project_id=1&label_id=2');
      expect(result).toEqual(mockTasks);
    });

    it('should create task', async () => {
      const taskData = { content: 'New Task', priority: 2 };
      const createdTask = { id: 1, ...taskData, completed: false };
      mockAxiosInstance.post.mockResolvedValue({ data: createdTask });

      const result = await apiClient.createTask(taskData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/tasks', taskData);
      expect(result).toEqual(createdTask);
    });

    it('should close task', async () => {
      const taskId = 1;
      mockAxiosInstance.post.mockResolvedValue({});

      await apiClient.closeTask(taskId);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/tasks/${taskId}/close`);
    });

    it('should quick add task', async () => {
      const quickAddData = { text: 'Buy milk tomorrow p2' };
      const createdTask = { id: 1, content: 'Buy milk', priority: 2 };
      mockAxiosInstance.post.mockResolvedValue({ data: createdTask });

      const result = await apiClient.quickAddTask(quickAddData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/quick/add', quickAddData);
      expect(result).toEqual(createdTask);
    });

    it('should get tasks without filters', async () => {
      const mockTasks = [{ id: 1, content: 'Test Task' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockTasks });

      const result = await apiClient.getTasks();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tasks?');
      expect(result).toEqual(mockTasks);
    });

    it('should get tasks with all filter types', async () => {
      const mockTasks = [{ id: 1, content: 'Test Task' }];
      const filters = { 
        project_id: 1, 
        section_id: 2, 
        label_id: 3, 
        filter: 'today',
        ids: [1, 2, 3]
      };
      mockAxiosInstance.get.mockResolvedValue({ data: mockTasks });

      const result = await apiClient.getTasks(filters);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tasks?project_id=1&section_id=2&label_id=3&filter=today&ids=1%2C2%2C3');
      expect(result).toEqual(mockTasks);
    });

    it('should get single task', async () => {
      const taskId = 1;
      const mockTask = { id: taskId, content: 'Test Task' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockTask });

      const result = await apiClient.getTask(taskId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/tasks/${taskId}`);
      expect(result).toEqual(mockTask);
    });

    it('should update task', async () => {
      const taskId = 1;
      const updateData = { content: 'Updated Task' };
      mockAxiosInstance.post.mockResolvedValue({});

      await apiClient.updateTask(taskId, updateData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/tasks/${taskId}`, updateData);
    });

    it('should reopen task', async () => {
      const taskId = 1;
      mockAxiosInstance.post.mockResolvedValue({});

      await apiClient.reopenTask(taskId);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/tasks/${taskId}/reopen`);
    });

    it('should delete task', async () => {
      const taskId = 1;
      mockAxiosInstance.delete.mockResolvedValue({});

      await apiClient.deleteTask(taskId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/tasks/${taskId}`);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors (mocked)', async () => {
      // Test basic error handling logic
      const apiError = new Error('API Error');
      mockAxiosInstance.get.mockRejectedValue(apiError);

      await expect(apiClient.getProjects()).rejects.toThrow();
    });

    it('should handle successful responses', async () => {
      const mockProjects = [{ id: 1, name: 'Test' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockProjects });

      const result = await apiClient.getProjects();
      expect(result).toEqual(mockProjects);
    });

    it('should handle axios error with 429 status (rate limit)', async () => {
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      const mockIsAxiosError = axios.isAxiosError as any;
      
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' }
        },
        message: 'Request failed with status code 429'
      };

      mockIsAxiosError.mockReturnValue(true);
      await expect(errorHandler(axiosError)).rejects.toThrow(RateLimitError);
    });

    it('should handle axios error with non-429 status', async () => {
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      const mockIsAxiosError = axios.isAxiosError as any;
      
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { error: 'Bad request' }
        },
        message: 'Request failed with status code 400'
      };

      mockIsAxiosError.mockReturnValue(true);
      await expect(errorHandler(axiosError)).rejects.toThrow(TodoistApiError);
    });

    it('should handle axios error without response data', async () => {
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      const mockIsAxiosError = axios.isAxiosError as any;
      
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500
        },
        message: 'Network Error'
      };

      mockIsAxiosError.mockReturnValue(true);
      await expect(errorHandler(axiosError)).rejects.toThrow(TodoistApiError);
    });

    it('should handle axios error without response', async () => {
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      const mockIsAxiosError = axios.isAxiosError as any;
      
      const axiosError = {
        isAxiosError: true,
        message: 'Network Error'
      };

      mockIsAxiosError.mockReturnValue(true);
      await expect(errorHandler(axiosError)).rejects.toThrow(TodoistApiError);
    });

    it('should handle non-axios errors', async () => {
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      const mockIsAxiosError = axios.isAxiosError as any;
      
      const genericError = new Error('Some unexpected error');

      mockIsAxiosError.mockReturnValue(false);
      await expect(errorHandler(genericError)).rejects.toThrow(TodoistApiError);
      
      try {
        await errorHandler(genericError);
      } catch (error) {
        expect(error).toBeInstanceOf(TodoistApiError);
        expect((error as TodoistApiError).message).toBe('Unknown API error');
        expect((error as TodoistApiError).statusCode).toBeUndefined();
      }
    });

    it('should handle unknown error types', async () => {
      const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      const mockIsAxiosError = axios.isAxiosError as any;
      
      const unknownError = 'string error';

      mockIsAxiosError.mockReturnValue(false);
      await expect(errorHandler(unknownError)).rejects.toThrow(TodoistApiError);
    });
  });

  describe('Sections API', () => {
    it('should get all sections', async () => {
      const mockSections = [{ id: 1, name: 'Section 1', project_id: 1 }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockSections });

      const result = await apiClient.getSections();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/sections');
      expect(result).toEqual(mockSections);
    });

    it('should get sections by project', async () => {
      const projectId = 1;
      const mockSections = [{ id: 1, name: 'Section 1', project_id: projectId }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockSections });

      const result = await apiClient.getSections(projectId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/sections?project_id=${projectId}`);
      expect(result).toEqual(mockSections);
    });

    it('should create section', async () => {
      const sectionData = { name: 'New Section', project_id: 1 };
      const createdSection = { id: 1, ...sectionData };
      mockAxiosInstance.post.mockResolvedValue({ data: createdSection });

      const result = await apiClient.createSection(sectionData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/sections', sectionData);
      expect(result).toEqual(createdSection);
    });

    it('should get single section', async () => {
      const sectionId = 1;
      const mockSection = { id: sectionId, name: 'Test Section' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockSection });

      const result = await apiClient.getSection(sectionId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/sections/${sectionId}`);
      expect(result).toEqual(mockSection);
    });

    it('should update section', async () => {
      const sectionId = 1;
      const updateData = { name: 'Updated Section' };
      mockAxiosInstance.post.mockResolvedValue({});

      await apiClient.updateSection(sectionId, updateData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/sections/${sectionId}`, updateData);
    });

    it('should delete section', async () => {
      const sectionId = 1;
      mockAxiosInstance.delete.mockResolvedValue({});

      await apiClient.deleteSection(sectionId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/sections/${sectionId}`);
    });
  });

  describe('Comments API', () => {
    it('should get comments by task', async () => {
      const taskId = 1;
      const mockComments = [{ id: 1, content: 'Test comment' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockComments });

      const result = await apiClient.getComments(taskId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/comments?task_id=1');
      expect(result).toEqual(mockComments);
    });

    it('should get comments by project', async () => {
      const projectId = 1;
      const mockComments = [{ id: 1, content: 'Test comment' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockComments });

      const result = await apiClient.getComments(undefined, projectId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/comments?project_id=1');
      expect(result).toEqual(mockComments);
    });

    it('should get comments by both task and project', async () => {
      const taskId = 1;
      const projectId = 2;
      const mockComments = [{ id: 1, content: 'Test comment' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockComments });

      const result = await apiClient.getComments(taskId, projectId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/comments?task_id=1&project_id=2');
      expect(result).toEqual(mockComments);
    });

    it('should create comment', async () => {
      const commentData = { content: 'New comment', task_id: 1 };
      const createdComment = { id: 1, ...commentData };
      mockAxiosInstance.post.mockResolvedValue({ data: createdComment });

      const result = await apiClient.createComment(commentData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/comments', commentData);
      expect(result).toEqual(createdComment);
    });

    it('should get single comment', async () => {
      const commentId = 1;
      const mockComment = { id: commentId, content: 'Test comment' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockComment });

      const result = await apiClient.getComment(commentId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/comments/${commentId}`);
      expect(result).toEqual(mockComment);
    });

    it('should update comment', async () => {
      const commentId = 1;
      const updateData = { content: 'Updated comment' };
      mockAxiosInstance.post.mockResolvedValue({});

      await apiClient.updateComment(commentId, updateData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/comments/${commentId}`, updateData);
    });

    it('should delete comment', async () => {
      const commentId = 1;
      mockAxiosInstance.delete.mockResolvedValue({});

      await apiClient.deleteComment(commentId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/comments/${commentId}`);
    });
  });

  describe('Labels API', () => {
    it('should get all labels', async () => {
      const mockLabels = [{ id: 1, name: 'Label 1' }];
      mockAxiosInstance.get.mockResolvedValue({ data: mockLabels });

      const result = await apiClient.getLabels();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/labels');
      expect(result).toEqual(mockLabels);
    });

    it('should create label', async () => {
      const labelData = { name: 'New Label' };
      const createdLabel = { id: 1, ...labelData };
      mockAxiosInstance.post.mockResolvedValue({ data: createdLabel });

      const result = await apiClient.createLabel(labelData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/labels', labelData);
      expect(result).toEqual(createdLabel);
    });

    it('should get single label', async () => {
      const labelId = 1;
      const mockLabel = { id: labelId, name: 'Test Label' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockLabel });

      const result = await apiClient.getLabel(labelId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/labels/${labelId}`);
      expect(result).toEqual(mockLabel);
    });

    it('should update label', async () => {
      const labelId = 1;
      const updateData = { name: 'Updated Label' };
      mockAxiosInstance.post.mockResolvedValue({});

      await apiClient.updateLabel(labelId, updateData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/labels/${labelId}`, updateData);
    });

    it('should delete label', async () => {
      const labelId = 1;
      mockAxiosInstance.delete.mockResolvedValue({});

      await apiClient.deleteLabel(labelId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/labels/${labelId}`);
    });
  });

  describe('Productivity and Completion API', () => {
    it('should get completed tasks without filters', async () => {
      const mockResponse = { items: [{ id: 1, content: 'Completed task' }] };
      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getCompletedTasks();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/completed/get_all?');
      expect(result).toEqual(mockResponse);
    });

    it('should get completed tasks with filters', async () => {
      const filters = { limit: 50, since: '2023-01-01T00:00:00Z' };
      const mockResponse = { items: [{ id: 1, content: 'Completed task' }] };
      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getCompletedTasks(filters);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/completed/get_all?limit=50&since=2023-01-01T00%3A00%3A00Z');
      expect(result).toEqual(mockResponse);
    });

    it('should get completed tasks by project without filters', async () => {
      const projectId = 1;
      const mockResponse = { items: [{ id: 1, content: 'Completed task' }] };
      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getCompletedTasksByProject(projectId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/completed/get_project?project_id=1');
      expect(result).toEqual(mockResponse);
    });

    it('should get completed tasks by project with filters', async () => {
      const projectId = 1;
      const filters = { limit: 30, until: '2023-12-31' };
      const mockResponse = { items: [{ id: 1, content: 'Completed task' }] };
      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.getCompletedTasksByProject(projectId, filters);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/completed/get_project?project_id=1&limit=30&until=2023-12-31');
      expect(result).toEqual(mockResponse);
    });

    it('should get productivity stats', async () => {
      const mockStats = { karma: 1500, completed_count: 42 };
      mockAxiosInstance.get.mockResolvedValue({ data: mockStats });

      const result = await apiClient.getProductivityStats();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/completed/get_stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('Health Check', () => {
    it('should return true when API is healthy', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await apiClient.healthCheck();

      expect(result).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects');
    });

    it('should return false when API is unhealthy', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('API Error'));

      const result = await apiClient.healthCheck();

      expect(result).toBe(false);
    });
  });
});