/**
 * src/utils/logger.ts
 *
 * Centralized logging utility using Pino for structured logging.
 * Environment-aware configuration: pretty-print in development, JSON in production.
 * Provides specialized helpers for common logging scenarios.
 */

import pino from 'pino';

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Build pino options based on environment
const pinoOptions = {
  level,
  timestamp: pino.stdTimeFunctions.isoTime,
} as any;

// Add pretty-print transport in development for readability
if (process.env.NODE_ENV !== 'production') {
  pinoOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: false,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

export const logger = pino(pinoOptions);

/**
 * Generic logging helpers
 */

/**
 * Log informational message with optional metadata
 */
export const logInfo = (message: string, meta?: any) => {
  logger.info(meta || {}, message);
};

/**
 * Log error with Error object and optional metadata
 */
export const logError = (message: string, error?: Error | any, meta?: any) => {
  if (error instanceof Error) {
    logger.error({ err: error, ...meta }, message);
  } else {
    logger.error({ ...meta }, message);
  }
};

/**
 * Log warning message with optional metadata
 */
export const logWarn = (message: string, meta?: any) => {
  logger.warn(meta || {}, message);
};

/**
 * Log debug message (verbose, development only)
 */
export const logDebug = (message: string, meta?: any) => {
  logger.debug(meta || {}, message);
};

/**
 * Specialized logging helpers
 */

/**
 * Log HTTP request details
 */
export const logRequest = (method: string, url: string, meta?: any) => {
  logDebug(`${method} ${url}`, {
    type: 'request',
    ...meta,
  });
};

/**
 * Log HTTP response with duration
 * Automatically sets level based on status code (warn for 4xx/5xx)
 */
export const logResponse = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  meta?: any
) => {
  const level = statusCode >= 400 ? 'warn' : 'debug';
  logger[level](
    {
      type: 'response',
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ...meta,
    },
    `${method} ${url} ${statusCode}`
  );
};

/**
 * Log API errors with appropriate severity
 * 5xx errors logged as errors, 4xx as warnings
 */
export const logApiError = (message: string, statusCode: number, error?: any, meta?: any) => {
  const level = statusCode >= 500 ? 'error' : 'warn';
  logger[level](
    {
      type: 'api-error',
      statusCode,
      ...(error && { err: error }),
      ...meta,
    },
    message
  );
};

/**
 * Log database operation performance
 */
export const logDatabaseOperation = (operation: string, table: string, duration: number, meta?: any) => {
  logDebug(`DB ${operation} on ${table}`, {
    type: 'database',
    operation,
    table,
    duration: `${duration}ms`,
    ...meta,
  });
};

/**
 * Log authentication events (register, login, logout, etc.)
 * Automatically sets level based on success
 */
export const logAuthEvent = (event: string, email: string, success: boolean, meta?: any) => {
  const level = success ? 'debug' : 'warn';
  logger[level](
    {
      type: 'auth',
      event,
      email,
      success,
      ...meta,
    },
    `Auth ${event}: ${email}`
  );
};

/**
 * Log server lifecycle events (startup, shutdown, etc.)
 */
export const logServerEvent = (event: string, meta?: any) => {
  logInfo(`Server: ${event}`, {
    type: 'server',
    event,
    ...meta,
  });
};
