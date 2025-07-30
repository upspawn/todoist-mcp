// Unit tests for custom error types

import { TodoistApiError, RateLimitError } from '../../src/types/mcp';

describe('Error Types', () => {
  describe('TodoistApiError', () => {
    it('should create error with message only', () => {
      const error = new TodoistApiError('Test error');
      
      expect(error.name).toBe('TodoistApiError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBeUndefined();
      expect(error.response).toBeUndefined();
    });

    it('should create error with status code', () => {
      const error = new TodoistApiError('Test error', 400);
      
      expect(error.name).toBe('TodoistApiError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.response).toBeUndefined();
    });

    it('should create error with full details', () => {
      const response = { error: 'Bad request' };
      const error = new TodoistApiError('Test error', 400, response);
      
      expect(error.name).toBe('TodoistApiError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.response).toEqual(response);
    });

    it('should be instance of Error', () => {
      const error = new TodoistApiError('Test error');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with message only', () => {
      const error = new RateLimitError('Rate limit exceeded');
      
      expect(error.name).toBe('RateLimitError');
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.resetTime).toBeUndefined();
    });

    it('should create rate limit error with reset time', () => {
      const resetTime = Date.now() + 900000; // 15 minutes from now
      const error = new RateLimitError('Rate limit exceeded', resetTime);
      
      expect(error.name).toBe('RateLimitError');
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.resetTime).toBe(resetTime);
    });

    it('should be instance of TodoistApiError', () => {
      const error = new RateLimitError('Rate limit exceeded');
      expect(error instanceof TodoistApiError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });
});