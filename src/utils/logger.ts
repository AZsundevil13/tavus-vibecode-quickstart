import { config } from '@/config/environment';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = config.enableDebugLogs ? LogLevel.DEBUG : LogLevel.ERROR;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.formatMessage('ERROR', message, error);
      
      // Send to error tracking service in production
      if (config.enableErrorTracking && config.sentryDsn) {
        // Sentry integration would go here
        this.sendToErrorTracking(message, error);
      }
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.formatMessage('WARN', message, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.formatMessage('INFO', message, data);
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.formatMessage('DEBUG', message, data);
    }
  }

  private sendToErrorTracking(message: string, error?: any): void {
    // Placeholder for error tracking service integration
    // In production, this would send to Sentry, LogRocket, etc.
    console.error('Error tracking:', { message, error });
  }
}

export const logger = new Logger();