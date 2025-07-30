// Simple logging utility for the MCP server

export class Logger {
  private debug: boolean;

  constructor(debug = false) {
    this.debug = debug;
  }

  info(message: string, ...args: unknown[]): void {
    console.error(`[INFO] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.error(`[WARN] ${message}`, ...args);
  }

  debug_log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      console.error(`[DEBUG] ${message}`, ...args);
    }
  }

  setDebug(debug: boolean): void {
    this.debug = debug;
  }
}

// Global logger instance
export const logger = new Logger(process.env.DEBUG === 'true');
