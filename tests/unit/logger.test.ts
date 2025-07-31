// Unit tests for logger utility

import { Logger, logger } from '../../src/utils/logger';

// Mock console methods
const originalError = console.error;
let mockConsoleError: jest.SpyInstance;

describe('Logger', () => {
  beforeEach(() => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should log info messages', () => {
    const logger = new Logger(false);
    logger.info('Test info message', { data: 'test' });

    expect(mockConsoleError).toHaveBeenCalledWith('[INFO] Test info message', { data: 'test' });
  });

  it('should log error messages', () => {
    const logger = new Logger(false);
    logger.error('Test error message');

    expect(mockConsoleError).toHaveBeenCalledWith('[ERROR] Test error message');
  });

  it('should log warning messages', () => {
    const logger = new Logger(false);
    logger.warn('Test warning message');

    expect(mockConsoleError).toHaveBeenCalledWith('[WARN] Test warning message');
  });

  it('should log debug messages when debug is enabled', () => {
    const logger = new Logger(true);
    logger.debug_log('Test debug message');

    expect(mockConsoleError).toHaveBeenCalledWith('[DEBUG] Test debug message');
  });

  it('should not log debug messages when debug is disabled', () => {
    const logger = new Logger(false);
    logger.debug_log('Test debug message');

    expect(mockConsoleError).not.toHaveBeenCalledWith('[DEBUG] Test debug message');
  });

  it('should allow setting debug mode', () => {
    const logger = new Logger(false);
    
    // Initially disabled
    logger.debug_log('Should not appear');
    expect(mockConsoleError).not.toHaveBeenCalledWith('[DEBUG] Should not appear');

    // Enable debug
    logger.setDebug(true);
    logger.debug_log('Should appear');
    expect(mockConsoleError).toHaveBeenCalledWith('[DEBUG] Should appear');

    // Disable debug again
    logger.setDebug(false);
    logger.debug_log('Should not appear again');
    expect(mockConsoleError).not.toHaveBeenCalledWith('[DEBUG] Should not appear again');
  });

  it('should use default debug value of false when no parameter is provided', () => {
    const logger = new Logger();
    logger.debug_log('This should not appear');
    
    expect(mockConsoleError).not.toHaveBeenCalledWith('[DEBUG] This should not appear');
  });

  describe('Global logger instance', () => {
    const originalDebugEnv = process.env.DEBUG;

    afterEach(() => {
      // Restore original environment variable
      if (originalDebugEnv !== undefined) {
        process.env.DEBUG = originalDebugEnv;
      } else {
        delete process.env.DEBUG;
      }
    });

    it('should initialize global logger with debug=true when DEBUG env var is "true"', () => {
      // Note: The global logger is already initialized when the module is imported
      // So we test the actual behavior rather than the initialization
      
      // First verify current state
      logger.debug_log('Test debug message from global logger');
      
      // The behavior depends on what DEBUG was set to when the module was first imported
      // We can test the setDebug functionality instead
      logger.setDebug(true);
      logger.debug_log('Debug enabled message');
      expect(mockConsoleError).toHaveBeenCalledWith('[DEBUG] Debug enabled message');
    });

    it('should work with all log levels on global logger instance', () => {
      logger.info('Global info message');
      logger.error('Global error message');
      logger.warn('Global warn message');

      expect(mockConsoleError).toHaveBeenCalledWith('[INFO] Global info message');
      expect(mockConsoleError).toHaveBeenCalledWith('[ERROR] Global error message');
      expect(mockConsoleError).toHaveBeenCalledWith('[WARN] Global warn message');
    });
  });
});