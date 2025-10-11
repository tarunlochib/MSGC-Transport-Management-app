import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerSearchBar from './components/CustomerSearchBar';
import CustomerStatsCards from './components/CustomerStatsCards';
import CustomerDataTable from './components/CustomerDataTable';
import CustomerDetailsHeader from './components/CustomerDetailsHeader';
import CustomerDetailsModal from './components/CustomerDetailsModal';
import { getCustomerDetailsData } from '../../services/customerDetailsService';

const CustomerDetailsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalWeight');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Fetch customer data
  const fetchCustomerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching customer details...');
      const data = await getCustomerDetailsData();
      console.log('Received customer data:', data);
      console.log('Number of customers:', data?.length || 0);
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }
      
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      console.error('Error fetching customer data:', err);
      console.error('Error response:', err.response);
      console.error('Error details:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load customer data';
      console.error('Final error message:', errorMessage);
      setError(errorMessage);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  // Filter and sort customers
  useEffect(() => {
    let result = customers;
    
    // Filter based on search term
    if (searchTerm.trim()) {
      result = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort the filtered results
    const sorted = [...result].sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      
      // Handle string sorting (for name, phone, etc.)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // Handle number sorting
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    
    setFilteredCustomers(sorted);
  }, [searchTerm, customers, sortBy, sortOrder]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Calculate summary statistics
  const summaryStats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'Active').length,
    totalWeight: customers.reduce((sum, c) => sum + (c.totalWeight || 0), 0),
    totalBookings: customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0),
    averageWeightPerCustomer: customers.length > 0 ? customers.reduce((sum, c) => sum + (c.totalWeight || 0), 0) / customers.length : 0,
    averageBookingsPerCustomer: customers.length > 0 ? customers.reduce((sum, c) => sum + (c.totalBookings || 0), 0) / customers.length : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}
        ></div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Loading customer data...</p>
          </div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header */}
        <CustomerDetailsHeader />

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3"
          >
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-red-800 font-semibold">Error Loading Data</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={fetchCustomerData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Search and Stats */}
        <div className="space-y-6 mb-8">
          {/* Search Bar */}
          <CustomerSearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalResults={filteredCustomers.length}
          />

          {/* Stats Cards */}
          <CustomerStatsCards stats={summaryStats} />
        </div>

        {/* Customer Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CustomerDataTable 
            customers={filteredCustomers}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onCustomerSelect={handleCustomerSelect}
            loading={loading}
          />
        </motion.div>

        {/* Customer Details Modal */}
        <CustomerDetailsModal 
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          customer={selectedCustomer}
        />
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
