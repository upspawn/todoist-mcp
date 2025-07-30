// Unit tests for logger utility

import { Logger } from '../../src/utils/logger';

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
});