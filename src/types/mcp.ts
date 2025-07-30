// MCP-specific types for tool definitions and responses

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface McpToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

// Configuration types
export interface TodoistMcpConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  debug?: boolean;
}

// Error types
export class TodoistApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'TodoistApiError';
  }
}

export class RateLimitError extends TodoistApiError {
  constructor(message: string, public resetTime?: number) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}