/**
 * Validation utilities for analytics and general application
 */

// Date range validation
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { isValid: true }; // Allow empty dates
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      isValid: false,
      error: 'Invalid date format'
    };
  }

  // Check if start date is before end date
  if (start > end) {
    return {
      isValid: false,
      error: 'Start date must be before end date'
    };
  }

  // Check if dates are not in the future
  if (start > now || end > now) {
    return {
      isValid: false,
      error: 'Dates cannot be in the future'
    };
  }

  // Check if date range is not too large (max 2 years)
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 730) {
    return {
      isValid: false,
      error: 'Date range cannot exceed 2 years'
    };
  }

  return { isValid: true };
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .slice(0, 100); // Limit length
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// GST validation
export const validateGST = (gst) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

// PAN validation
export const validatePAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

// Number validation
export const validateNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Required field validation
export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

// Analytics metrics validation
export const validateAnalyticsMetrics = (metrics) => {
  const allowedMetrics = [
    'revenue',
    'bookings',
    'customers',
    'transporters',
    'vehicles',
    'drivers',
    'expenses',
    'profit',
    'efficiency',
    'utilization'
  ];
  
  return metrics.every(metric => allowedMetrics.includes(metric));
};

// Period validation
export const validatePeriod = (period) => {
  const allowedPeriods = [
    'today',
    'yesterday',
    'last7days',
    'last30days',
    'currentMonth',
    'lastMonth',
    'last3Months',
    'last6Months',
    'lastYear',
    'custom'
  ];
  
  return allowedPeriods.includes(period);
};

// Security validation for user inputs
export const validateSecurity = (input) => {
  if (typeof input !== 'string') return true;
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
    /(\b(UNION|OR|AND)\b.*\b(SELECT|INSERT|UPDATE|DELETE)\b)/i,
    /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/i,
    /(\b(ONLOAD|ONERROR|ONCLICK)\b)/i
  ];
  
  return !sqlPatterns.some(pattern => pattern.test(input));
};

// File upload validation
export const validateFileUpload = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
