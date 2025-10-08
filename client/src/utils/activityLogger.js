import api from './api';

class ActivityLogger {
  constructor() {
    this.isEnabled = true;
  }

  // Log a user activity
  async logActivity(type, action, details, metadata = null) {
    if (!this.isEnabled) return;

    try {
      await api.post('/activities', {
        type,
        action,
        details,
        metadata
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  // Log booking activities
  async logBookingActivity(action, details, metadata = null) {
    await this.logActivity('booking', action, details, metadata);
  }

  // Log challan activities
  async logChallanActivity(action, details, metadata = null) {
    await this.logActivity('challan', action, details, metadata);
  }

  // Log customer activities
  async logCustomerActivity(action, details, metadata = null) {
    await this.logActivity('customer', action, details, metadata);
  }

  // Log transporter activities
  async logTransporterActivity(action, details, metadata = null) {
    await this.logActivity('transporter', action, details, metadata);
  }

  // Log expense activities
  async logExpenseActivity(action, details, metadata = null) {
    await this.logActivity('expense', action, details, metadata);
  }

  // Log settings activities
  async logSettingsActivity(action, details, metadata = null) {
    await this.logActivity('settings', action, details, metadata);
  }

  // Log login activities
  async logLoginActivity(action, details, metadata = null) {
    await this.logActivity('login', action, details, metadata);
  }

  // Enable/disable activity logging
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Check if logging is enabled
  isLoggingEnabled() {
    return this.isEnabled;
  }
}

// Create a singleton instance
const activityLogger = new ActivityLogger();

export default activityLogger;
