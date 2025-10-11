import axios from 'axios';

// Get customer metrics data from backend API
export const getCustomerMetricsData = async (filters = {}) => {
  try {
    const params = {
      timeRange: filters.timeRange || 'monthly',
      ...(filters.customStartDate && { customStartDate: filters.customStartDate }),
      ...(filters.customEndDate && { customEndDate: filters.customEndDate }),
      ...(filters.specificMonth && { specificMonth: filters.specificMonth }),
      ...(filters.specificYear && { specificYear: filters.specificYear })
    };
    
    const response = await axios.get(`/api/customer-metrics`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer metrics data:', error);
    throw error;
  }
};

// Get detailed customer metrics for modal from backend API
export const getCustomerDetails = async (customerId, timeRange = 'monthly') => {
  try {
    const response = await axios.get(`/api/customer-metrics/${customerId}?timeRange=${timeRange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer details:', error);
    throw error;
  }
};