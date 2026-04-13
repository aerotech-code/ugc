// Logger utility
import fs from 'fs';
import path from 'path';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export const logger = {
  debug: (message: string, data?: unknown) => {
    logMessage(LogLevel.DEBUG, message, data);
  },

  info: (message: string, data?: unknown) => {
    logMessage(LogLevel.INFO, message, data);
  },

  warn: (message: string, data?: unknown) => {
    logMessage(LogLevel.WARN, message, data);
  },

  error: (message: string, data?: unknown) => {
    logMessage(LogLevel.ERROR, message, data);
  },
};

const logMessage = (level: LogLevel, message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  const logEntry: Record<string, unknown> = {
    timestamp,
    level,
    message,
  };

  if (data) {
    logEntry.data = data;
  }

  const logString = JSON.stringify(logEntry);

  // Console output
  const consoleMethod = level === LogLevel.ERROR ? console.error : console.log;
  consoleMethod(`[${level}] ${timestamp} - ${message}`, data ? data : '');

  // File output (optional)
  if (process.env.LOG_FILE) {
    try {
      const logDir = path.dirname(process.env.LOG_FILE);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      fs.appendFileSync(process.env.LOG_FILE, logString + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
};
