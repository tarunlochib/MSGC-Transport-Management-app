// Currency formatting
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  const isNegative = amount < 0;
  const absValue = Math.abs(amount);
  const formatted = `₹${absValue.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
  return isNegative ? `-${formatted}` : formatted;
};

// Date formatting
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN');
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-IN');
};

// Number formatting
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  return number.toLocaleString('en-IN');
};

export const formatWeight = (weight) => {
  if (weight === null || weight === undefined) return '0 kg';
  return `${weight.toLocaleString('en-IN')} kg`;
};

// Status color utilities
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'active':
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'in progress':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
    case 'inactive':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Revenue color utilities
export const getRevenueColor = (revenue) => {
  if (revenue === null || revenue === undefined) return 'text-gray-600';
  return revenue < 0 ? 'text-red-600' : 'text-green-600';
};

// Percentage formatting
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

// Phone number formatting
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Format as Indian phone number
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}; 