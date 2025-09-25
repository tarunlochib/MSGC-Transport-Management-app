/**
 * Data Validation and Safety Utilities
 * Provides safe data access and validation without breaking existing logic
 */

// Safe number conversion with fallback
export const safeNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

// Safe date conversion with fallback
export const safeDate = (value, fallback = new Date()) => {
  if (!value) return fallback;
  const date = new Date(value);
  return isNaN(date.getTime()) ? fallback : date;
};

// Safe string access with fallback
export const safeString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

// Validate booking data
export const validateBookingData = (booking) => {
  if (!booking) return null;
  
  return {
    ...booking,
    // Normalize numbers
    weightKg: safeNumber(booking.weightKg),
    totalCharges: safeNumber(booking.totalCharges),
    totalAmount: safeNumber(booking.totalAmount),
    paidAmount: safeNumber(booking.paidAmount),
    freightCharges: safeNumber(booking.freightCharges),
    localCartageCharges: safeNumber(booking.localCartageCharges),
    doorDeliveryCharges: safeNumber(booking.doorDeliveryCharges),
    stationaryCharges: safeNumber(booking.stationaryCharges),
    labourCharges: safeNumber(booking.labourCharges),
    otherCharges: safeNumber(booking.otherCharges),
    
    // Normalize dates (keep both for different purposes)
    bookingDate: safeDate(booking.bookingDate),
    createdAt: safeDate(booking.createdAt),
    
    // Normalize strings
    paymentMethod: safeString(booking.paymentMethod),
    paymentType: safeString(booking.paymentType),
    status: safeString(booking.status),
    
    // Add validation flags
    _isValid: !isNaN(safeDate(booking.bookingDate).getTime()),
    _hasTransporter: !!booking.transporterId,
    _hasWeight: safeNumber(booking.weightKg) > 0
  };
};

// Validate transporter data
export const validateTransporterData = (transporter) => {
  if (!transporter) return null;
  
  return {
    ...transporter,
    // Normalize numbers
    commissionRate: safeNumber(transporter.commissionRate),
    
    // Normalize strings
    name: safeString(transporter.name),
    contactInfo: safeString(transporter.contactInfo),
    
    // Add validation flags
    _isValid: !!transporter.id && !!transporter.name,
    _hasCommissionRate: safeNumber(transporter.commissionRate) > 0
  };
};

// Validate expense data
export const validateExpenseData = (expense) => {
  if (!expense) return null;
  
  return {
    ...expense,
    // Normalize numbers
    amount: safeNumber(expense.amount),
    
    // Normalize dates
    date: safeDate(expense.date),
    createdAt: safeDate(expense.createdAt),
    
    // Normalize strings
    description: safeString(expense.description),
    category: safeString(expense.category),
    paymentMethod: safeString(expense.paymentMethod),
    
    // Add validation flags
    _isValid: !isNaN(safeDate(expense.date).getTime()) && safeNumber(expense.amount) > 0
  };
};

// Validate income data
export const validateIncomeData = (income) => {
  if (!income) return null;
  
  return {
    ...income,
    // Normalize numbers
    amount: safeNumber(income.amount),
    
    // Normalize dates
    date: safeDate(income.date),
    createdAt: safeDate(income.createdAt),
    
    // Normalize strings
    source: safeString(income.source),
    description: safeString(income.description),
    category: safeString(income.category),
    paymentMethod: safeString(income.paymentMethod),
    status: safeString(income.status),
    
    // Add validation flags
    _isValid: !isNaN(safeDate(income.date).getTime()) && safeNumber(income.amount) > 0
  };
};

// Safe commission calculation
export const safeCommissionCalculation = (booking, transporter) => {
  const weight = safeNumber(booking?.weightKg);
  const commissionRate = safeNumber(transporter?.commissionRate);
  return weight * commissionRate;
};

// Safe revenue calculation
export const safeRevenueCalculation = (booking, transporter) => {
  const commission = safeCommissionCalculation(booking, transporter);
  const localCartage = safeNumber(booking?.localCartageCharges);
  return commission + localCartage;
};

// Safe payment method check
export const isPaidBooking = (booking) => {
  const paymentMethod = safeString(booking?.paymentMethod).toLowerCase();
  const paymentType = safeString(booking?.paymentType).toLowerCase();
  
  // Consider Cheque payments as not "paid" for business logic
  if (paymentMethod === 'paid' && paymentType === 'cheque') {
    return false;
  }
  
  return paymentMethod === 'paid';
};

// Validate date range
export const isValidDateRange = (startDate, endDate) => {
  const start = safeDate(startDate);
  const end = safeDate(endDate);
  return start <= end;
};

// Safe array operations
export const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

// Safe object operations
export const safeObject = (value) => {
  return value && typeof value === 'object' ? value : {};
};
