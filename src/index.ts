#!/usr/bin/env node

// Main entry point for the Todoist MCP server

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { loadConfig, validateApiKey } from './utils/config.js';
import { logger } from './utils/logger.js';
import { TodoistApiClient } from './services/todoist-api.js';
import { TodoistToolHandlers } from './handlers/tool-handlers.js';
import { TODOIST_TOOLS } from './handlers/tool-definitions.js';

async function main() {
  try {
    logger.info('Starting Todoist MCP Server...');

    // Load configuration
    const config = loadConfig();

    // Validate API key format
    if (!validateApiKey(config.apiKey)) {
      logger.warn(
        'API key format appears invalid (expected 40-character hex string)'
      );
    }

    // Initialize Todoist API client
    const apiClient = new TodoistApiClient(config);

    // Test API connection
    logger.info('Testing Todoist API connection...');
    const isHealthy = await apiClient.healthCheck();
    if (!isHealthy) {
      logger.error(
        'Failed to connect to Todoist API. Please check your API key.'
      );
      process.exit(1);
    }
    logger.info('✓ Successfully connected to Todoist API');

    // Initialize tool handlers
    const toolHandlers = new TodoistToolHandlers(apiClient);

    // Create MCP server
    const server = new Server(
      {
        name: 'todoist-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Register tool list handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug_log('Listing available tools');
      return {
        tools: TODOIST_TOOLS,
      };
    });

    // Register tool call handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.debug_log(`Executing tool: ${name}`, args);

      try {
        const result = await toolHandlers.handleTool(name, args || {});
        return {
          content: result.content,
          isError: result.isError,
        };
      } catch (error) {
        logger.error(`Tool execution failed: ${name}`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Set up stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    logger.info('🚀 Todoist MCP Server started successfully');
    logger.info(`Available tools: ${TODOIST_TOOLS.length}`);

    // Keep the process running
    process.on('SIGINT', async () => {
      logger.info('Shutting down Todoist MCP Server...');
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start Todoist MCP Server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
