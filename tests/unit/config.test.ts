// Unit tests for configuration management

import { loadConfig, validateApiKey } from '../../src/utils/config';

describe('Configuration', () => {
  beforeEach(() => {
    // Clear environment variables
    delete process.env.TODOIST_API_KEY;
    delete process.env.TODOIST_API_BASE_URL;
    delete process.env.TODOIST_TIMEOUT;
    delete process.env.DEBUG;
  });

  describe('loadConfig', () => {
    it('should throw error when TODOIST_API_KEY is missing', () => {
      expect(() => loadConfig()).toThrow('TODOIST_API_KEY environment variable is required');
    });

    it('should load basic config with API key', () => {
      process.env.TODOIST_API_KEY = 'test-api-key';
      
      const config = loadConfig();
      
      expect(config.apiKey).toBe('test-api-key');
      expect(config.baseUrl).toBe('https://api.todoist.com/rest/v2');
      expect(config.timeout).toBe(15000);
      expect(config.retryAttempts).toBe(3);
      expect(config.debug).toBe(false);
    });

    it('should load custom configuration from environment', () => {
      process.env.TODOIST_API_KEY = 'test-api-key';
      process.env.TODOIST_API_BASE_URL = 'https://custom.api.com';
      process.env.TODOIST_TIMEOUT = '30000';
      process.env.TODOIST_RETRY_ATTEMPTS = '5';
      process.env.DEBUG = 'true';
      
      const config = loadConfig();
      
      expect(config.apiKey).toBe('test-api-key');
      expect(config.baseUrl).toBe('https://custom.api.com');
      expect(config.timeout).toBe(30000);
      expect(config.retryAttempts).toBe(5);
      expect(config.debug).toBe(true);
    });
  });

  describe('validateApiKey', () => {
    it('should validate correct API key format', () => {
      const validKey = 'a1b2c3d4e5f6789012345678901234567890abcd';
      expect(validateApiKey(validKey)).toBe(true);
    });

    it('should reject invalid API key formats', () => {
      expect(validateApiKey('too-short')).toBe(false);
      expect(validateApiKey('contains-invalid-chars-!')).toBe(false);
      expect(validateApiKey('1234567890123456789012345678901234567890123456789')).toBe(false); // too long
      expect(validateApiKey('')).toBe(false);
    });
  });
});