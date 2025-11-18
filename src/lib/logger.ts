/**
 * Structured logging utility for production-grade observability
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
}

class Logger {
  private defaultContext: LogContext = {}

  /**
   * Set default context that will be included in all log entries
   */
  setDefaultContext(context: LogContext) {
    this.defaultContext = { ...this.defaultContext, ...context }
  }

  /**
   * Clear default context
   */
  clearDefaultContext() {
    this.defaultContext = {}
  }

  /**
   * Log a message with given level and context
   */
  private log(level: LogLevel, message: string, context?: LogContext) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.defaultContext, ...context }
    }

    // In production, this would send to a logging service (e.g., Datadog, CloudWatch)
    // For now, we use structured console logging
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(entry))
    } else {
      // Pretty print for development
      const contextStr = entry.context && Object.keys(entry.context).length > 0
        ? ` ${JSON.stringify(entry.context)}`
        : ''

      const levelColor = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      }[level]

      console.log(`${levelColor}[${level.toUpperCase()}]\x1b[0m ${message}${contextStr}`)
    }
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, context)
    }
  }

  /**
   * Log informational message
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext) {
    this.log('error', message, context)
  }

  /**
   * Log error with Error object
   */
  errorWithException(message: string, error: Error, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    })
  }
}

// Singleton instance
export const logger = new Logger()

/**
 * Create a child logger with additional default context
 */
export function createLogger(context: LogContext): Logger {
  const childLogger = new Logger()
  childLogger.setDefaultContext(context)
  return childLogger
}
