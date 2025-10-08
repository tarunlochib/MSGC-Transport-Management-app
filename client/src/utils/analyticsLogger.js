/**
 * Analytics Logger for tracking user interactions and system events
 * Provides security, performance monitoring, and business intelligence
 */

class AnalyticsLogger {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.startTime = Date.now();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getUserId() {
    // Get user ID from localStorage or context
    return localStorage.getItem('userId') || 'anonymous';
  }

  log(event, data = {}) {
    const logEntry = {
      event,
      data: this.sanitizeData(data),
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer
    };

    // Send to analytics service (implement based on your needs)
    this.sendToAnalytics(logEntry);
    
    // Store locally for debugging
    this.storeLocally(logEntry);
  }

  sanitizeData(data) {
    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];
    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  sendToAnalytics(logEntry) {
    // Implement your analytics service integration
    // Examples: Google Analytics, Mixpanel, Custom API
    
    try {
      // Example: Send to custom analytics endpoint
      if (import.meta.env.PROD) {
        fetch('/api/analytics/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logEntry)
        }).catch(error => {
          console.warn('Analytics logging failed:', error);
        });
      }
    } catch (error) {
      console.warn('Analytics logging error:', error);
    }
  }

  storeLocally(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('analytics_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('analytics_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Local analytics storage failed:', error);
    }
  }

  // Track page views
  trackPageView(page, data = {}) {
    this.log('page_view', {
      page,
      ...data
    });
  }

  // Track user interactions
  trackInteraction(action, element, data = {}) {
    this.log('user_interaction', {
      action,
      element,
      ...data
    });
  }

  // Track business events
  trackBusinessEvent(event, data = {}) {
    this.log('business_event', {
      event,
      ...data
    });
  }

  // Track performance metrics
  trackPerformance(metric, value, data = {}) {
    this.log('performance_metric', {
      metric,
      value,
      ...data
    });
  }

  // Track errors
  trackError(error, context = {}) {
    this.log('error', {
      error: error.message || error,
      stack: error.stack,
      context
    });
  }

  // Track security events
  trackSecurityEvent(event, data = {}) {
    this.log('security_event', {
      event,
      ...data
    });
  }

  // Get session duration
  getSessionDuration() {
    return Date.now() - this.startTime;
  }

  // End session
  endSession() {
    this.log('session_end', {
      duration: this.getSessionDuration()
    });
  }
}

// Create singleton instance
export const analyticsLogger = new AnalyticsLogger();

// Track page unload
window.addEventListener('beforeunload', () => {
  analyticsLogger.endSession();
});

export default analyticsLogger;
