/**
 * Error Tracking and Logging System
 * Provides comprehensive error tracking without affecting existing functionality
 */

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Keep only last 100 errors
    this.isEnabled = true; // Always enabled for now
  }

  log(error, context = {}) {
    if (!this.isEnabled) return;

    const errorEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      },
      severity: this.getSeverity(error)
    };

    this.errors.unshift(errorEntry);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorTracker:', errorEntry);
    }

    // Send to external service in production (if configured)
    this.sendToExternalService(errorEntry);
  }

  getSeverity(error) {
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'high';
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'medium';
    }
    return 'low';
  }

  sendToExternalService(errorEntry) {
    // In a real application, you would send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
    // For now, we'll just log to console
    console.log('Error tracked:', errorEntry);
  }

  getErrors(severity = null) {
    if (severity) {
      return this.errors.filter(error => error.severity === severity);
    }
    return this.errors;
  }

  getErrorStats() {
    const stats = {
      total: this.errors.length,
      high: this.errors.filter(e => e.severity === 'high').length,
      medium: this.errors.filter(e => e.severity === 'medium').length,
      low: this.errors.filter(e => e.severity === 'low').length,
      last24Hours: this.errors.filter(e => {
        const errorTime = new Date(e.timestamp);
        const now = new Date();
        return (now - errorTime) < 24 * 60 * 60 * 1000;
      }).length
    };

    return stats;
  }

  clearErrors() {
    this.errors = [];
  }

  exportErrors() {
    return JSON.stringify(this.errors, null, 2);
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker();

// Global error handler
window.addEventListener('error', (event) => {
  errorTracker.log(event.error, {
    type: 'javascript',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  errorTracker.log(new Error(event.reason), {
    type: 'promise',
    promise: event.promise
  });
});

/**
 * React Error Boundary Hook
 * Provides error tracking for React components
 */
export const useErrorTracking = (componentName) => {
  const trackError = (error, context = {}) => {
    errorTracker.log(error, {
      component: componentName,
      ...context
    });
  };

  const trackAsyncError = (error, context = {}) => {
    errorTracker.log(error, {
      component: componentName,
      type: 'async',
      ...context
    });
  };

  return { trackError, trackAsyncError };
};

/**
 * API Error Tracking
 * Tracks API-related errors
 */
export const trackApiError = (error, endpoint, method = 'GET') => {
  errorTracker.log(error, {
    type: 'api',
    endpoint,
    method,
    status: error.response?.status,
    statusText: error.response?.statusText
  });
};

/**
 * Performance Error Tracking
 * Tracks performance-related issues
 */
export const trackPerformanceError = (operation, duration, threshold = 1000) => {
  if (duration > threshold) {
    errorTracker.log(new Error(`Slow operation: ${operation}`), {
      type: 'performance',
      operation,
      duration,
      threshold
    });
  }
};

/**
 * Data Quality Error Tracking
 * Tracks data quality issues
 */
export const trackDataQualityError = (dataType, issues) => {
  errorTracker.log(new Error(`Data quality issues in ${dataType}`), {
    type: 'data-quality',
    dataType,
    issues: issues.length,
    details: issues
  });
};

export default errorTracker;
