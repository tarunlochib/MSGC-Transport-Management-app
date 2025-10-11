import axios from 'axios';

export const getCustomerDetailsData = async () => {
  try {
    const response = await axios.get('/api/customer-details');
    return response.data;
  } catch (error) {
    console.error('Error fetching customer details data:', error);
    throw error;
  }
};
