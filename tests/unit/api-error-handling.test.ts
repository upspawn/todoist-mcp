// Comprehensive error handling tests for API client

import axios from 'axios';
import { TodoistApiClient } from '../../src/services/todoist-api';
import { TodoistMcpConfig, RateLimitError, TodoistApiError } from '../../src/types/mcp';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the isAxiosError function
const mockIsAxiosError = jest.fn();
(axios as any).isAxiosError = mockIsAxiosError;

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
    beforeEach(() => {
      // Reset the mock implementation before each test
      mockAxiosInstance.get.mockReset();
      mockAxiosInstance.post.mockReset();
      mockAxiosInstance.delete.mockReset();
    });

    it('should handle 401 unauthorized errors', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
        isAxiosError: true,
        message: 'Request failed with status code 401',
      };
      
      // Mock axios.isAxiosError to return true for our mock error
      mockIsAxiosError.mockReturnValue(true);
      
      // Get the error handler from the response interceptor and call it manually
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      const errorHandler = responseInterceptor[1];
      
      mockAxiosInstance.get.mockImplementation(async () => {
        const handledError = await errorHandler(unauthorizedError);
        return handledError;
      });

      await expect(apiClient.getProjects()).rejects.toThrow(TodoistApiError);
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
      
      mockIsAxiosError.mockReturnValue(true);
      
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      const errorHandler = responseInterceptor[1];
      
      mockAxiosInstance.get.mockImplementation(async () => {
        const handledError = await errorHandler(forbiddenError);
        return handledError;
      });

      await expect(apiClient.getProjects()).rejects.toThrow(TodoistApiError);
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
      
      mockIsAxiosError.mockReturnValue(true);
      
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      const errorHandler = responseInterceptor[1];
      
      mockAxiosInstance.get.mockImplementation(async () => {
        const handledError = await errorHandler(notFoundError);
        return handledError;
      });

      await expect(apiClient.getProject(999)).rejects.toThrow(TodoistApiError);
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
      
      mockIsAxiosError.mockReturnValue(true);
      
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      const errorHandler = responseInterceptor[1];
      
      mockAxiosInstance.get.mockImplementation(async () => {
        const handledError = await errorHandler(serverError);
        return handledError;
      });

      await expect(apiClient.getProjects()).rejects.toThrow(TodoistApiError);
    });

    it('should handle errors without response data', async () => {
      const networkError = {
        response: {
          status: 500,
        },
        isAxiosError: true,
        message: 'Network Error',
      };
      
      mockIsAxiosError.mockReturnValue(true);
      
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      const errorHandler = responseInterceptor[1];
      
      mockAxiosInstance.get.mockImplementation(async () => {
        const handledError = await errorHandler(networkError);
        return handledError;
      });

      await expect(apiClient.getProjects()).rejects.toThrow(TodoistApiError);
    });
  });

  describe('Network Error Handling', () => {
    it('should handle timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 15000ms exceeded',
        isAxiosError: true,
      };
      
      mockIsAxiosError.mockReturnValue(true);
      
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      const errorHandler = responseInterceptor[1];
      
      mockAxiosInstance.get.mockImplementation(async () => {
        const handledError = await errorHandler(timeoutError);
        return handledError;
      });

      await expect(apiClient.getProjects()).rejects.toThrow(TodoistApiError);
    });

    it('should handle connection refused errors', async () => {
      const connectionError = {
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED 127.0.0.1:443',
        isAxiosError: true,
      };
      
      mockIsAxiosError.mockReturnValue(true);
      
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      const errorHandler = responseInterceptor[1];
      
      mockAxiosInstance.get.mockImplementation(async () => {
        const handledError = await errorHandler(connectionError);
        return handledError;
      });

      await expect(apiClient.getProjects()).rejects.toThrow(TodoistApiError);
    });

    it('should handle DNS resolution errors', async () => {
      const dnsError = {
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND api.todoist.com',
        isAxiosError: true,
      };
      
      mockIsAxiosError.mockReturnValue(true);
      
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      const errorHandler = responseInterceptor[1];
      
      mockAxiosInstance.get.mockImplementation(async () => {
        const handledError = await errorHandler(dnsError);
        return handledError;
      });

      await expect(apiClient.getProjects()).rejects.toThrow(TodoistApiError);
    });
  });

  describe('Non-Axios Errors', () => {
    it('should handle generic JavaScript errors', async () => {
      const genericError = new Error('Something went wrong');
      
      mockIsAxiosError.mockReturnValue(false);
      
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      const errorHandler = responseInterceptor[1];
      
      mockAxiosInstance.get.mockImplementation(async () => {
        const handledError = await errorHandler(genericError);
        return handledError;
      });

      await expect(apiClient.getProjects()).rejects.toThrow(TodoistApiError);
    });

    it('should handle null/undefined errors', async () => {
      mockIsAxiosError.mockReturnValue(false);
      
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      const errorHandler = responseInterceptor[1];
      
      mockAxiosInstance.get.mockImplementation(async () => {
        const handledError = await errorHandler(null);
        return handledError;
      });

      await expect(apiClient.getProjects()).rejects.toThrow(TodoistApiError);
    });

    it('should handle string errors', async () => {
      mockIsAxiosError.mockReturnValue(false);
      
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
      const errorHandler = responseInterceptor[1];
      
      mockAxiosInstance.get.mockImplementation(async () => {
        const handledError = await errorHandler('String error');
        return handledError;
      });

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
      await expect(apiClient.quickAddTask({ content: 'Test task' })).rejects.toThrow();
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