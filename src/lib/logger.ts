/**
 * Production-Safe Logger
 * 
 * A simple logger that can be disabled in production to avoid
 * exposing debug information in the browser console.
 * 
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.log('[Component]', 'Message');
 *   logger.warn('[Component]', 'Warning');
 *   logger.error('[Component]', 'Error');
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Force logging in development, suppress in production
// Can be overridden with NEXT_PUBLIC_ENABLE_LOGGING=true in production
const isLoggingEnabled = isDevelopment || process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true';

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

interface Logger {
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
}

const createLogger = (): Logger => {
    const logMethod = (level: LogLevel) => (...args: unknown[]) => {
        // Always log errors
        if (level === 'error') {
            console[level](...args);
            return;
        }

        // Only log other levels if enabled
        if (isLoggingEnabled) {
            console[level](...args);
        }
    };

    return {
        log: logMethod('log'),
        warn: logMethod('warn'),
        error: logMethod('error'),
        info: logMethod('info'),
        debug: logMethod('debug'),
    };
};

export const logger = createLogger();

// Also export individual methods for convenience
export const { log, warn, error, info, debug } = logger;
