// Comprehensive error handling tests for API client

import axios from 'axios';
import { TodoistApiClient } from '../../src/services/todoist-api';
import { TodoistMcpConfig, RateLimitError, TodoistApiError } from '../../src/types/mcp';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TodoistApiClient - Error Handling', () => {
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

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Mock Date.now to control rate limiting window
      jest.spyOn(Date, 'now').mockReturnValue(1000000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should track request counts properly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      // Make several requests
      await apiClient.getProjects();
      await apiClient.getProjects();
      await apiClient.getProjects();

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
    });

    it('should reset rate limit window after time passes', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      // Make request at time 1000000
      await apiClient.getProjects();

      // Advance time by 16 minutes (past the 15-minute window)
      jest.spyOn(Date, 'now').mockReturnValue(1000000 + 16 * 60 * 1000);

      // Should allow new requests after window reset
      await apiClient.getProjects();
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('HTTP Error Handling', () => {
    it('should handle 401 unauthorized errors', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
        isAxiosError: true,
        message: 'Request failed with status code 401',
      };
      mockAxiosInstance.get.mockRejectedValue(unauthorizedError);

      await expect(apiClient.getProjects()).rejects.toThrow();
    });

    it('should handle 403 forbidden errors', async () => {
      const forbiddenError = {
        response: {
          status: 403,
          data: { error: 'Forbidden' },
        },
        isAxiosError: true,
        message: 'Request failed with status code 403',
      };
      mockAxiosInstance.get.mockRejectedValue(forbiddenError);

      await expect(apiClient.getProjects()).rejects.toThrow();
    });

    it('should handle 404 not found errors', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { error: 'Not found' },
        },
        isAxiosError: true,
        message: 'Request failed with status code 404',
      };
      mockAxiosInstance.get.mockRejectedValue(notFoundError);

      await expect(apiClient.getProject(999)).rejects.toThrow();
    });

    it('should handle 500 server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
        isAxiosError: true,
        message: 'Request failed with status code 500',
      };
      mockAxiosInstance.get.mockRejectedValue(serverError);

      await expect(apiClient.getProjects()).rejects.toThrow();
    });

    it('should handle errors without response data', async () => {
      const networkError = {
        response: {
          status: 500,
        },
        isAxiosError: true,
        message: 'Network Error',
      };
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(apiClient.getProjects()).rejects.toThrow();
    });
  });

  describe('Network Error Handling', () => {
    it('should handle timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 15000ms exceeded',
        isAxiosError: true,
      };
      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(apiClient.getProjects()).rejects.toThrow();
    });

    it('should handle connection refused errors', async () => {
      const connectionError = {
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED 127.0.0.1:443',
        isAxiosError: true,
      };
      mockAxiosInstance.get.mockRejectedValue(connectionError);

      await expect(apiClient.getProjects()).rejects.toThrow();
    });

    it('should handle DNS resolution errors', async () => {
      const dnsError = {
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND api.todoist.com',
        isAxiosError: true,
      };
      mockAxiosInstance.get.mockRejectedValue(dnsError);

      await expect(apiClient.getProjects()).rejects.toThrow();
    });
  });

  describe('Non-Axios Errors', () => {
    it('should handle generic JavaScript errors', async () => {
      const genericError = new Error('Something went wrong');
      mockAxiosInstance.get.mockRejectedValue(genericError);

      await expect(apiClient.getProjects()).rejects.toThrow(TodoistApiError);
    });

    it('should handle null/undefined errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(null);

      await expect(apiClient.getProjects()).rejects.toThrow(TodoistApiError);
    });

    it('should handle string errors', async () => {
      mockAxiosInstance.get.mockRejectedValue('String error');

      await expect(apiClient.getProjects()).rejects.toThrow(TodoistApiError);
    });
  });

  describe('API Method Error Coverage', () => {
    const testError = new Error('Test error');

    it('should handle createProject errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(testError);
      await expect(apiClient.createProject({ name: 'Test' })).rejects.toThrow();
    });

    it('should handle createTask errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(testError);
      await expect(apiClient.createTask({ content: 'Test' })).rejects.toThrow();
    });

    it('should handle updateTask errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(testError);
      await expect(apiClient.updateTask(1, { content: 'Updated' })).rejects.toThrow();
    });

    it('should handle deleteTask errors', async () => {
      mockAxiosInstance.delete.mockRejectedValue(testError);
      await expect(apiClient.deleteTask(1)).rejects.toThrow();
    });

    it('should handle createSection errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(testError);
      await expect(apiClient.createSection({ name: 'Test', project_id: 1 })).rejects.toThrow();
    });

    it('should handle createComment errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(testError);
      await expect(apiClient.createComment({ content: 'Test', task_id: 1 })).rejects.toThrow();
    });

    it('should handle createLabel errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(testError);
      await expect(apiClient.createLabel({ name: 'Test' })).rejects.toThrow();
    });

    it('should handle quickAddTask errors', async () => {
      mockAxiosInstance.post.mockRejectedValue(testError);
      await expect(apiClient.quickAddTask({ text: 'Test task' })).rejects.toThrow();
    });

    it('should handle getCompletedTasks errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(testError);
      await expect(apiClient.getCompletedTasks()).rejects.toThrow();
    });

    it('should handle getProductivityStats errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(testError);
      await expect(apiClient.getProductivityStats()).rejects.toThrow();
    });
  });
});