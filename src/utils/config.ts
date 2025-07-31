// Configuration management for the Todoist MCP server

import { TodoistMcpConfig } from '../types/mcp.js';
import { logger } from './logger.js';

export function loadConfig(): TodoistMcpConfig {
  const apiKey = process.env.TODOIST_API_KEY;

  if (!apiKey) {
    logger.error('TODOIST_API_KEY environment variable is required');
    throw new Error('TODOIST_API_KEY environment variable is required');
  }

  const config: TodoistMcpConfig = {
    apiKey,
    baseUrl:
      process.env.TODOIST_API_BASE_URL || 'https://api.todoist.com/api/v1',
    timeout: parseInt(process.env.TODOIST_TIMEOUT || '15000', 10),
    retryAttempts: parseInt(process.env.TODOIST_RETRY_ATTEMPTS || '3', 10),
    debug: process.env.DEBUG === 'true',
  };

  logger.setDebug(config.debug || false);
  logger.debug_log('Configuration loaded', {
    baseUrl: config.baseUrl,
    timeout: config.timeout,
    retryAttempts: config.retryAttempts,
    debug: config.debug,
  });

  return config;
}

export function validateApiKey(apiKey: string): boolean {
  // Basic validation - Todoist API keys are typically 40 character hex strings
  return /^[a-f0-9]{40}$/i.test(apiKey);
}
