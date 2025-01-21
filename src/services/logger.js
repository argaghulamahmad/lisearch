// Log levels
const LogLevel = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
};

class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Keep last 1000 logs in memory
        this.performanceMarks = new Map();

        // Initialize performance monitoring
        if (typeof window !== 'undefined') {
            this.observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.log(LogLevel.DEBUG, 'Performance', {
                        name: entry.name,
                        duration: entry.duration,
                        startTime: entry.startTime,
                        entryType: entry.entryType
                    });
                });
            });

            this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
        }
    }

    log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data
        };

        this.logs.push(logEntry);

        // Trim old logs if exceeding max size
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Console output with styling
        const styles = {
            debug: 'color: #808080',
            info: 'color: #0066cc',
            warn: 'color: #ff9900',
            error: 'color: #cc0000'
        };

        console.log(
            `%c[${level.toUpperCase()}] ${message}`,
            styles[level],
            data
        );

        // Send to error reporting service if error
        if (level === LogLevel.ERROR) {
            this.reportError(message, data);
        }
    }

    // Convenience methods for different log levels
    debug(message, data) {
        this.log(LogLevel.DEBUG, message, data);
    }

    info(message, data) {
        this.log(LogLevel.INFO, message, data);
    }

    warn(message, data) {
        this.log(LogLevel.WARN, message, data);
    }

    error(message, data) {
        this.log(LogLevel.ERROR, message, data);
    }

    // Performance monitoring
    startTimer(label) {
        this.performanceMarks.set(label, performance.now());
    }

    endTimer(label) {
        const startTime = this.performanceMarks.get(label);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.performanceMarks.delete(label);
            this.debug(`Timer ${label}`, { duration: `${duration.toFixed(2)}ms` });
            return duration;
        }
        return null;
    }

    // Error reporting
    reportError(message, data) {
        // TODO: Integrate with your preferred error reporting service
        // Example: Sentry, LogRocket, etc.
        console.error('Error reported:', message, data);
    }

    // Analytics tracking
    trackEvent(category, action, label = null, value = null) {
        const event = {
            category,
            action,
            label,
            value,
            timestamp: new Date().toISOString()
        };

        this.debug('Event tracked', event);

        // TODO: Integrate with your analytics service
        // Example: Google Analytics, Mixpanel, etc.
    }

    // Get logs for debugging
    getLogs(level = null, limit = 100) {
        let filtered = this.logs;
        if (level) {
            filtered = filtered.filter(log => log.level === level);
        }
        return filtered.slice(-limit);
    }

    // Clear logs
    clearLogs() {
        this.logs = [];
    }
}

export const logger = new Logger();
export { LogLevel };