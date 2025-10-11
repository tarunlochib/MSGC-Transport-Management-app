import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopCustomers from './components/TopCustomers';
import CustomersTable from './components/CustomersTable';
import BookingsTrendChart from './components/BookingsTrendChart';
import TransportUsageChart from './components/TransportUsageChart';
import CustomerDetailsModal from './components/CustomerDetailsModal';
import { getCustomerMetricsData } from '../../services/customerMetricsService';

const CustomerMetricsPage = () => {
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewType, setViewType] = useState('weight'); // weight, bookings, transport
  const [timeRange, setTimeRange] = useState('monthly'); // weekly, monthly, yearly
  const [currentTimeRange, setCurrentTimeRange] = useState('monthly'); // The actual timeRange being used
  const [dataVersion, setDataVersion] = useState(0); // Force re-render when data changes
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [specificMonth, setSpecificMonth] = useState('');
  const [specificYear, setSpecificYear] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [showSpecificMonth, setShowSpecificMonth] = useState(false);
  const [showMoreInsights, setShowMoreInsights] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Immediate fetch function for better performance
  const immediateFetch = useCallback(() => {
    fetchMetricsData();
  }, []);

  // Debounced fetch only for rapid filter changes (like typing in date inputs)
  const debouncedFetch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchMetricsData();
    }, 150); // Reduced to 150ms

    return () => clearTimeout(timeoutId);
  }, []);

  // Initial data fetch on component mount
  useEffect(() => {
    setCurrentTimeRange('monthly'); // Set initial timeRange
    fetchMetricsData(true);
  }, []);

  // Immediate fetch for predefined time ranges (no debouncing needed)
  useEffect(() => {
    if (timeRange && !showCustomDate && !showSpecificMonth) {
      setIsFiltering(true);
      fetchMetricsData(false); // Direct call instead of immediateFetch
    }
  }, [timeRange]);

  // Debounced fetch only for custom date inputs
  useEffect(() => {
    if (showCustomDate && (customStartDate || customEndDate)) {
      setIsFiltering(true);
      const cleanup = debouncedFetch();
      return cleanup;
    }
  }, [customStartDate, customEndDate, showCustomDate, debouncedFetch]);

  // Debounced fetch for specific month/year inputs
  useEffect(() => {
    if (showSpecificMonth && (specificMonth || specificYear)) {
      setIsFiltering(true);
      const cleanup = debouncedFetch();
      return cleanup;
    }
  }, [specificMonth, specificYear, showSpecificMonth, debouncedFetch]);

  // Cleanup modal state when component unmounts
  useEffect(() => {
    return () => {
      setShowDetailsModal(false);
      setSelectedCustomer(null);
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchMetricsData = async (forceLoading = false) => {
    // Only show loading overlay for initial load or forced loading
    if (forceLoading) {
      setLoading(true);
    } else {
      // For filter changes, just show the filtering indicator
      setIsFiltering(true);
    }
    
    try {
      const actualTimeRange = showCustomDate ? 'custom' : (showSpecificMonth ? 'specific' : timeRange);
      const filters = {
        timeRange: actualTimeRange,
        ...(showCustomDate && customStartDate && { customStartDate }),
        ...(showCustomDate && customEndDate && { customEndDate }),
        ...(showSpecificMonth && specificMonth && { specificMonth }),
        ...(showSpecificMonth && specificYear && { specificYear })
      };
      
      console.log('Fetching data with filters:', filters); // Debug log
      console.log('Actual timeRange being used:', actualTimeRange); // Debug log
      const data = await getCustomerMetricsData(filters);
      console.log('Received data:', data); // Debug log
      console.log('Previous data:', metricsData); // Debug log
      
      // Always update to ensure charts refresh
      setMetricsData(data);
      setCurrentTimeRange(actualTimeRange); // Update the current timeRange
      setDataVersion(prev => prev + 1); // Force re-render
      console.log('Updated currentTimeRange to:', actualTimeRange); // Debug log
      console.log('Data version updated to:', dataVersion + 1); // Debug log
      
      // Reset filtering state immediately after data is set
      setIsFiltering(false);
    } catch (error) {
      console.error('Error fetching customer metrics:', error);
      setIsFiltering(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const filteredData = useMemo(() => {
    if (!metricsData) return null;

    let sortedData = [...metricsData.customers];
    
    switch (viewType) {
      case 'weight':
        sortedData.sort((a, b) => b.totalWeight - a.totalWeight);
        break;
      case 'bookings':
        sortedData.sort((a, b) => b.totalBookings - a.totalBookings);
        break;
      case 'transport':
        sortedData.sort((a, b) => b.transportTypes.length - a.transportTypes.length);
        break;
      default:
        sortedData.sort((a, b) => b.totalWeight - a.totalWeight);
    }

    return {
      ...metricsData,
      customers: sortedData
    };
  }, [metricsData, viewType]);

  // Remove the loading return to prevent full page refresh

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-purple-100/20 to-indigo-100/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
        {/* Loading Overlay - Only for initial load */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-700 font-medium">Loading customer data...</p>
            </div>
          </div>
        )}

        {/* Filtering Indicator - For filter changes */}
        {isFiltering && !loading && (
          <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-40 flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Updating data...</span>
          </div>
        )}
      
      <div className="relative max-w-7xl mx-auto p-6">
        {/* Unique Header Design - Fixed Placement */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8 overflow-hidden"
        >
          {/* Unique Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-full blur-3xl transform -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl transform translate-x-20 translate-y-20"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-orange-400/10 to-pink-500/10 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          
          <div className="relative bg-gradient-to-br from-white/90 via-white/70 to-white/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Fixed Icon and Title Section */}
                <div className="flex items-start space-x-5 mb-4">
                  {/* Unique 3D Icon Design */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-xl shadow-xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                      <div className="absolute inset-1.5 bg-gradient-to-br from-white/20 to-transparent rounded-lg"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Unique Customer/Network Icon */}
                        <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    {/* Floating Elements */}
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce"></div>
                    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 bg-clip-text text-transparent tracking-tight">
                        Customer Intelligence
                      </h1>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                    <p className="text-base text-gray-600 font-medium mb-3">Advanced analytics dashboard for customer behavior insights</p>
                    
                    {/* Fixed Stats Bar */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                        <span className="text-sm font-semibold text-emerald-700">Real-time Data</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-sm font-semibold text-blue-700">Lightning Fast</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-purple-700">
                          {metricsData?.summary?.totalCustomers || 0} Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fixed Action Buttons */}
              <div className="flex flex-col space-y-3 flex-shrink-0 ml-6">
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export Report</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh Data</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Total Weight Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Weight</p>
                <p className="text-3xl font-bold">
                  {metricsData?.summary?.totalWeight ? 
                    `${(metricsData.summary.totalWeight / 1000).toFixed(1)}T` : 
                    '0T'
                  }
                </p>
                <p className="text-blue-100 text-xs mt-1">All customers</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Total Bookings Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Total Bookings</p>
                <p className="text-3xl font-bold">
                  {metricsData?.summary?.totalBookings || 0}
                </p>
                <p className="text-green-100 text-xs mt-1">All customers</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Total Customers Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Total Customers</p>
                <p className="text-3xl font-bold">
                  {metricsData?.summary?.totalCustomers || 0}
                </p>
                <p className="text-purple-100 text-xs mt-1">Active customers</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Top 5 Customers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <TopCustomers 
            customers={metricsData?.topCustomers || []} 
            onCustomerSelect={handleCustomerSelect}
            showAll={false}
          />
        </motion.div>

        {/* Unique Filters - Fixed Placement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              {/* View Type Filter */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Sort by</span>
                </div>
                <select
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value="weight">Total Weight</option>
                  <option value="bookings">Total Bookings</option>
                  <option value="transport">Transport Types</option>
                </select>
              </div>
              
              {/* Time Range Filter */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Period</span>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => {
                    setTimeRange(e.target.value);
                    if (e.target.value === 'custom') {
                      setShowCustomDate(true);
                      setShowSpecificMonth(false);
                      setSpecificMonth('');
                      setSpecificYear('');
                    } else if (e.target.value === 'specific') {
                      setShowSpecificMonth(true);
                      setShowCustomDate(false);
                      setCustomStartDate('');
                      setCustomEndDate('');
                    } else {
                      setShowCustomDate(false);
                      setShowSpecificMonth(false);
                      setCustomStartDate('');
                      setCustomEndDate('');
                      setSpecificMonth('');
                      setSpecificYear('');
                    }
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value="all">All Time</option>
                  <option value="weekly">Last 7 Days</option>
                  <option value="monthly">Last 30 Days</option>
                  <option value="yearly">Last Year</option>
                  <option value="specific">Specific Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range - Show when custom is selected */}
            <AnimatePresence>
              {showCustomDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">From</span>
                    </div>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">To</span>
                    </div>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    />
                  </div>
                  
                  {/* Apply Custom Date Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchMetricsData(false)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Apply</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Specific Month Selector - Show when specific month is selected */}
            <AnimatePresence>
              {showSpecificMonth && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Month</span>
                    </div>
                    <select
                      value={specificMonth}
                      onChange={(e) => setSpecificMonth(e.target.value)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <option value="">Select Month</option>
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Year</span>
                    </div>
                    <select
                      value={specificYear}
                      onChange={(e) => setSpecificYear(e.target.value)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  {/* Apply Month/Year Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchMetricsData(false)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Apply</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>


            {/* Filter Status and Toggle Button */}
            <div className="flex items-center space-x-4">
              {/* Filter Status Indicator */}
              {isFiltering && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 text-sm text-blue-600"
                >
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Applying filters...</span>
                </motion.div>
              )}

              {/* Unique Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMoreInsights(!showMoreInsights)}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>{showMoreInsights ? 'Hide' : 'View More'} Insights</span>
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: showMoreInsights ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Charts Section - Separate Lines */}
        <div className="space-y-6 mb-6">
          {/* Booking Trends Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Booking Trends</h3>
                <p className="text-sm text-gray-600">Monthly performance overview</p>
              </div>
            </div>
            {isFiltering ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Updating chart data...</p>
                </div>
              </div>
            ) : (
              <BookingsTrendChart 
                key={`bookings-trend-${currentTimeRange}-${customStartDate}-${customEndDate}-${specificMonth}-${specificYear}-${dataVersion}`}
                data={metricsData?.monthlyTrends || []} 
                timeRange={currentTimeRange}
              />
            )}
          </motion.div>

          {/* Transport Usage Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Transport Usage</h3>
                <p className="text-sm text-gray-600">Service type distribution</p>
              </div>
            </div>
            {isFiltering ? (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Updating chart data...</p>
                </div>
              </div>
            ) : (
              <TransportUsageChart 
                key={`transport-usage-${currentTimeRange}-${customStartDate}-${customEndDate}-${specificMonth}-${specificYear}-${dataVersion}`}
                data={metricsData?.transportUsage || []} 
                timeRange={currentTimeRange}
              />
            )}
          </motion.div>
        </div>

        {/* More Insights Section */}
        <AnimatePresence>
          {showMoreInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <CustomersTable 
                customers={filteredData?.customers || []} 
                onCustomerSelect={handleCustomerSelect}
                viewType={viewType}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customer Details Modal */}
        <CustomerDetailsModal
          customer={selectedCustomer}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCustomer(null);
          }}
        />
      </div>
    </div>
  );
};

export default CustomerMetricsPage;
