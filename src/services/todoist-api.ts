// Todoist REST API client with rate limiting and error handling

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Project, Task, Section, Comment, Label,
  CreateProjectRequest, UpdateProjectRequest,
  CreateTaskRequest, UpdateTaskRequest,
  CreateSectionRequest, CreateCommentRequest, CreateLabelRequest,
  QuickAddRequest, TaskFilters, CompletionFilters,
  CompletedTasksResponse, ProductivityStats
} from '../types/todoist.js';
import { TodoistMcpConfig, TodoistApiError, RateLimitError } from '../types/mcp.js';
import { logger } from '../utils/logger.js';

export class TodoistApiClient {
  private client: AxiosInstance;
  private config: TodoistMcpConfig;
  private requestCount = 0;
  private windowStart = Date.now();
  private readonly RATE_LIMIT = 450; // requests per 15 minutes
  private readonly WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes in ms

  constructor(config: TodoistMcpConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use((config) => {
      this.checkRateLimit();
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        this.requestCount++;
        return response;
      },
      (error) => {
        this.requestCount++;
        return this.handleApiError(error);
      }
    );
  }

  private checkRateLimit(): void {
    const now = Date.now();
    if (now - this.windowStart > this.WINDOW_SIZE) {
      // Reset window
      this.windowStart = now;
      this.requestCount = 0;
    }

    if (this.requestCount >= this.RATE_LIMIT) {
      const resetTime = this.windowStart + this.WINDOW_SIZE;
      throw new RateLimitError(
        `Rate limit exceeded. Resets at ${new Date(resetTime).toISOString()}`,
        resetTime
      );
    }
  }

  private async handleApiError(error: unknown): Promise<never> {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error || error.message;
      
      logger.error(`Todoist API error: ${status} - ${message}`);
      
      if (status === 429) {
        throw new RateLimitError('Rate limit exceeded', Date.now() + 15 * 60 * 1000);
      }
      
      throw new TodoistApiError(message, status, error.response?.data);
    }
    
    throw new TodoistApiError('Unknown API error', undefined, error);
  }

  // Projects API
  async getProjects(): Promise<Project[]> {
    logger.debug_log('Fetching all projects');
    const response: AxiosResponse<Project[]> = await this.client.get('/projects');
    return response.data;
  }

  async createProject(data: CreateProjectRequest): Promise<Project> {
    logger.debug_log('Creating project', data);
    const response: AxiosResponse<Project> = await this.client.post('/projects', data);
    return response.data;
  }

  async getProject(projectId: number): Promise<Project> {
    logger.debug_log('Fetching project', { projectId });
    const response: AxiosResponse<Project> = await this.client.get(`/projects/${projectId}`);
    return response.data;
  }

  async updateProject(projectId: number, data: UpdateProjectRequest): Promise<void> {
    logger.debug_log('Updating project', { projectId, data });
    await this.client.post(`/projects/${projectId}`, data);
  }

  async deleteProject(projectId: number): Promise<void> {
    logger.debug_log('Deleting project', { projectId });
    await this.client.delete(`/projects/${projectId}`);
  }

  async getProjectCollaborators(projectId: number): Promise<unknown[]> {
    logger.debug_log('Fetching project collaborators', { projectId });
    const response: AxiosResponse<unknown[]> = await this.client.get(`/projects/${projectId}/collaborators`);
    return response.data;
  }

  // Tasks API
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    logger.debug_log('Fetching tasks', filters);
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.project_id) params.append('project_id', filters.project_id.toString());
      if (filters.section_id) params.append('section_id', filters.section_id.toString());
      if (filters.label_id) params.append('label_id', filters.label_id.toString());
      if (filters.filter) params.append('filter', filters.filter);
      if (filters.ids) params.append('ids', filters.ids.join(','));
    }

    const response: AxiosResponse<Task[]> = await this.client.get(`/tasks?${params}`);
    return response.data;
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    logger.debug_log('Creating task', data);
    const response: AxiosResponse<Task> = await this.client.post('/tasks', data);
    return response.data;
  }

  async getTask(taskId: number): Promise<Task> {
    logger.debug_log('Fetching task', { taskId });
    const response: AxiosResponse<Task> = await this.client.get(`/tasks/${taskId}`);
    return response.data;
  }

  async updateTask(taskId: number, data: UpdateTaskRequest): Promise<void> {
    logger.debug_log('Updating task', { taskId, data });
    await this.client.post(`/tasks/${taskId}`, data);
  }

  async closeTask(taskId: number): Promise<void> {
    logger.debug_log('Closing task', { taskId });
    await this.client.post(`/tasks/${taskId}/close`);
  }

  async reopenTask(taskId: number): Promise<void> {
    logger.debug_log('Reopening task', { taskId });
    await this.client.post(`/tasks/${taskId}/reopen`);
  }

  async deleteTask(taskId: number): Promise<void> {
    logger.debug_log('Deleting task', { taskId });
    await this.client.delete(`/tasks/${taskId}`);
  }

  async quickAddTask(data: QuickAddRequest): Promise<Task> {
    logger.debug_log('Quick adding task', data);
    const response: AxiosResponse<Task> = await this.client.post('/quick/add', data);
    return response.data;
  }

  // Sections API
  async getSections(projectId?: number): Promise<Section[]> {
    logger.debug_log('Fetching sections', { projectId });
    const params = projectId ? `?project_id=${projectId}` : '';
    const response: AxiosResponse<Section[]> = await this.client.get(`/sections${params}`);
    return response.data;
  }

  async createSection(data: CreateSectionRequest): Promise<Section> {
    logger.debug_log('Creating section', data);
    const response: AxiosResponse<Section> = await this.client.post('/sections', data);
    return response.data;
  }

  async getSection(sectionId: number): Promise<Section> {
    logger.debug_log('Fetching section', { sectionId });
    const response: AxiosResponse<Section> = await this.client.get(`/sections/${sectionId}`);
    return response.data;
  }

  async updateSection(sectionId: number, data: Partial<CreateSectionRequest>): Promise<void> {
    logger.debug_log('Updating section', { sectionId, data });
    await this.client.post(`/sections/${sectionId}`, data);
  }

  async deleteSection(sectionId: number): Promise<void> {
    logger.debug_log('Deleting section', { sectionId });
    await this.client.delete(`/sections/${sectionId}`);
  }

  // Comments API
  async getComments(taskId?: number, projectId?: number): Promise<Comment[]> {
    logger.debug_log('Fetching comments', { taskId, projectId });
    const params = new URLSearchParams();
    if (taskId) params.append('task_id', taskId.toString());
    if (projectId) params.append('project_id', projectId.toString());
    
    const response: AxiosResponse<Comment[]> = await this.client.get(`/comments?${params}`);
    return response.data;
  }

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    logger.debug_log('Creating comment', data);
    const response: AxiosResponse<Comment> = await this.client.post('/comments', data);
    return response.data;
  }

  async getComment(commentId: number): Promise<Comment> {
    logger.debug_log('Fetching comment', { commentId });
    const response: AxiosResponse<Comment> = await this.client.get(`/comments/${commentId}`);
    return response.data;
  }

  async updateComment(commentId: number, data: { content: string }): Promise<void> {
    logger.debug_log('Updating comment', { commentId, data });
    await this.client.post(`/comments/${commentId}`, data);
  }

  async deleteComment(commentId: number): Promise<void> {
    logger.debug_log('Deleting comment', { commentId });
    await this.client.delete(`/comments/${commentId}`);
  }

  // Labels API
  async getLabels(): Promise<Label[]> {
    logger.debug_log('Fetching labels');
    const response: AxiosResponse<Label[]> = await this.client.get('/labels');
    return response.data;
  }

  async createLabel(data: CreateLabelRequest): Promise<Label> {
    logger.debug_log('Creating label', data);
    const response: AxiosResponse<Label> = await this.client.post('/labels', data);
    return response.data;
  }

  async getLabel(labelId: number): Promise<Label> {
    logger.debug_log('Fetching label', { labelId });
    const response: AxiosResponse<Label> = await this.client.get(`/labels/${labelId}`);
    return response.data;
  }

  async updateLabel(labelId: number, data: Partial<CreateLabelRequest>): Promise<void> {
    logger.debug_log('Updating label', { labelId, data });
    await this.client.post(`/labels/${labelId}`, data);
  }

  async deleteLabel(labelId: number): Promise<void> {
    logger.debug_log('Deleting label', { labelId });
    await this.client.delete(`/labels/${labelId}`);
  }

  // Productivity and completion endpoints
  async getCompletedTasks(filters?: CompletionFilters): Promise<CompletedTasksResponse> {
    logger.debug_log('Fetching completed tasks', filters);
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.since) params.append('since', filters.since);
    }

    const response: AxiosResponse<CompletedTasksResponse> = await this.client.get(`/completed/get_all?${params}`);
    return response.data;
  }

  async getCompletedTasksByProject(projectId: number, filters?: CompletionFilters): Promise<CompletedTasksResponse> {
    logger.debug_log('Fetching completed tasks by project', { projectId, filters });
    const params = new URLSearchParams();
    params.append('project_id', projectId.toString());
    
    if (filters) {
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.until) params.append('until', filters.until);
    }

    const response: AxiosResponse<CompletedTasksResponse> = await this.client.get(`/completed/get_project?${params}`);
    return response.data;
  }

  async getProductivityStats(): Promise<ProductivityStats> {
    logger.debug_log('Fetching productivity stats');
    const response: AxiosResponse<ProductivityStats> = await this.client.get('/completed/get_stats');
    return response.data;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.getProjects();
      return true;
    } catch (error) {
      logger.error('Health check failed', error);
      return false;
    }
  }
}