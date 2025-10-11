import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const EwayBillTrackerPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Data states
  const [ewayBills, setEwayBills] = useState([]);
  const [summary, setSummary] = useState({});
  const [availableBookings, setAvailableBookings] = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [expiringEwayBills, setExpiringEwayBills] = useState([]);
  const [showExpiringAlert, setShowExpiringAlert] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [transporterFilter, setTransporterFilter] = useState('');
  const [daysFilter, setDaysFilter] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEwayBill, setSelectedEwayBill] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    bookingId: '',
    ewayBillNumber: '',
    generatedDate: '',
    expiryDate: '',
    billValue: '',
    transporterId: ''
  });

  useEffect(() => {
    setIsVisible(true);
    fetchData();
  }, []);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showAddModal || showEditModal) {
          closeModals();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showAddModal, showEditModal]);

  useEffect(() => {
    fetchEwayBills();
  }, [statusFilter, transporterFilter, daysFilter]);

  // Periodic check for expiring eway bills (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchExpiringEwayBills();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchEwayBills(),
        fetchSummary(),
        fetchAvailableBookings(),
        fetchTransporters(),
        fetchExpiringEwayBills()
      ]);
    } catch (err) {
      setError('Failed to load eway bill data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEwayBills = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (transporterFilter) params.append('transporterId', transporterFilter);
      if (daysFilter) params.append('daysUntilExpiry', daysFilter);

      const response = await axios.get(`/api/eway-bills/tracking?${params}`);
      setEwayBills(response.data);
    } catch (err) {
      console.error('Error fetching eway bills:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get('/api/eway-bills/summary');
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchAvailableBookings = async () => {
    try {
      const response = await axios.get('/api/eway-bills/available-bookings');
      setAvailableBookings(response.data);
    } catch (err) {
      console.error('Error fetching available bookings:', err);
    }
  };

  const fetchTransporters = async () => {
    try {
      const response = await axios.get('/api/transporters');
      setTransporters(response.data);
    } catch (err) {
      console.error('Error fetching transporters:', err);
    }
  };

  const fetchExpiringEwayBills = async () => {
    try {
      const response = await axios.get('/api/eway-bills/expiring?days=1');
      const expiringBills = response.data;
      setExpiringEwayBills(expiringBills);
      
      // Show alert if there are expiring eway bills
      if (expiringBills.length > 0) {
        setShowExpiringAlert(true);
      }
    } catch (err) {
      console.error('Error fetching expiring eway bills:', err);
    }
  };

  const handleAddEwayBill = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/eway-bills', formData);
      setSuccess('Eway bill record created successfully');
      setError(null);
      closeModals();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create eway bill record');
    }
  };

  const handleEditEwayBill = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/eway-bills/${selectedEwayBill.id}`, formData);
      setSuccess('Eway bill record updated successfully');
      setError(null);
      closeModals();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update eway bill record');
    }
  };

  const handleDeleteEwayBill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this eway bill record?')) {
      return;
    }

    try {
      await axios.delete(`/api/eway-bills/${id}`);
      setSuccess('Eway bill record deleted successfully');
      setError(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete eway bill record');
    }
  };

  const openEditModal = (ewayBill) => {
    setSelectedEwayBill(ewayBill);
    setFormData({
      bookingId: ewayBill.bookingId,
      ewayBillNumber: ewayBill.ewayBillNumber,
      generatedDate: ewayBill.generatedDate.split('T')[0],
      expiryDate: ewayBill.expiryDate.split('T')[0],
      billValue: ewayBill.billValue,
      transporterId: ewayBill.transporterId
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedEwayBill(null);
    // Reset form data when closing modals
    setFormData({
      bookingId: '',
      ewayBillNumber: '',
      generatedDate: '',
      expiryDate: '',
      billValue: '',
      transporterId: ''
    });
  };

  const getStatusBadge = (ewayBill) => {
    const { daysUntilExpiry, statusText, statusColor } = ewayBill;
    
    let bgColor = 'bg-green-100 text-green-800';
    if (statusColor === 'red') bgColor = 'bg-red-100 text-red-800';
    if (statusColor === 'yellow') bgColor = 'bg-yellow-100 text-yellow-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {statusText} ({daysUntilExpiry} days)
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading eway bill data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Modern Header */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-5 shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-50">
              <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-2xl font-bold text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    Eway Bill Tracker
                  </motion.h1>
                  <motion.p 
                    className="text-white/90 text-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    Monitor expiration dates and manage eway bill compliance
                  </motion.p>
                </div>
              </div>
              
              <motion.button
                onClick={() => {
                  // Reset form data when opening add modal
                  setFormData({
                    bookingId: '',
                    ewayBillNumber: '',
                    generatedDate: '',
                    expiryDate: '',
                    billValue: '',
                    transporterId: ''
                  });
                  setShowAddModal(true);
                }}
                className="group relative flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium text-sm">Add Eway Bill</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Alert */}
        {success && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2 text-sm text-green-700">{success}</div>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSuccess(null)}
                    className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expiring Eway Bills Alert */}
        {showExpiringAlert && expiringEwayBills.length > 0 && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center animate-pulse">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-red-800 mb-1">
                        ⚠️ Eway Bills Expiring Soon!
                      </h3>
                      <p className="text-red-700 text-sm">
                        {expiringEwayBills.length} eway bill{expiringEwayBills.length > 1 ? 's' : ''} will expire within 1 day
                      </p>
                    </div>
                    <button
                      onClick={() => setShowExpiringAlert(false)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* List of expiring eway bills */}
                  <div className="mt-4 space-y-2">
                    {expiringEwayBills.slice(0, 3).map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between bg-white/50 rounded-lg p-3 border border-red-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {bill.booking?.grNumber?.slice(-2) || 'NA'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {bill.booking?.grNumber}
                            </p>
                            <p className="text-xs text-gray-600">
                              {bill.transporter?.name} • {bill.booking?.fromLocation} → {bill.booking?.toLocation}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-red-600">
                            {bill.daysUntilExpiry === 0 ? 'Expires Today' : 
                             bill.daysUntilExpiry === 1 ? 'Expires Tomorrow' : 
                             `Expires in ${bill.daysUntilExpiry} days`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(bill.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {expiringEwayBills.length > 3 && (
                      <p className="text-xs text-red-600 text-center mt-2">
                        And {expiringEwayBills.length - 3} more...
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => {
                        // Filter to show only expiring eway bills
                        setDaysFilter('1');
                        setShowExpiringAlert(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 text-sm font-medium"
                    >
                      View All Expiring
                    </button>
                    <button
                      onClick={() => setShowExpiringAlert(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modern Summary Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {[
            { 
              title: 'Total Bills', 
              value: summary.totalBills || 0, 
              color: 'blue', 
              icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
              gradient: 'from-blue-500 to-blue-600',
              bgGradient: 'from-blue-50 to-blue-100'
            },
            { 
              title: 'Active Bills', 
              value: summary.activeBills || 0, 
              color: 'green', 
              icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
              gradient: 'from-green-500 to-green-600',
              bgGradient: 'from-green-50 to-green-100'
            },
            { 
              title: 'Expiring Soon', 
              value: summary.expiringInSevenDays || 0, 
              color: 'yellow', 
              icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z',
              gradient: 'from-yellow-500 to-orange-500',
              bgGradient: 'from-yellow-50 to-orange-100'
            },
            { 
              title: 'Critical', 
              value: summary.expiringInThreeDays || 0, 
              color: 'red', 
              icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
              gradient: 'from-red-500 to-red-600',
              bgGradient: 'from-red-50 to-red-100'
            },
            { 
              title: 'Expired', 
              value: summary.expiredBills || 0, 
              color: 'gray', 
              icon: 'M6 18L18 6M6 6l12 12',
              gradient: 'from-gray-500 to-gray-600',
              bgGradient: 'from-gray-50 to-gray-100'
            }
          ].map((card, index) => (
            <motion.div
              key={card.title}
              className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} rounded-xl p-4 shadow-md border border-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group cursor-pointer`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              {/* Floating Particles */}
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse"></div>
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/20 rounded-full animate-ping"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <motion.p 
                    className="text-xs font-medium text-gray-600 mb-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  >
                    {card.title}
                  </motion.p>
                  <motion.p 
                    className={`text-2xl font-bold text-${card.color}-600`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
                  >
                    {card.value}
                  </motion.p>
                </div>
                
                <motion.div 
                  className={`w-10 h-10 bg-gradient-to-r ${card.gradient} rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </motion.div>
              </div>
              
              {/* Progress Indicator */}
              <motion.div 
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
              ></motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modern Filters */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/30 p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">Smart Filters</h3>
            <p className="text-xs text-gray-500 ml-2">Refine your search</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Days Until Expiry</label>
              <select
                value={daysFilter}
                onChange={(e) => setDaysFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">All</option>
                <option value="3">Expiring in 3 days</option>
                <option value="7">Expiring in 7 days</option>
                <option value="15">Expiring in 15 days</option>
              </select>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Transporter</label>
              <select
                value={transporterFilter}
                onChange={(e) => setTransporterFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white/50 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">All Transporters</option>
                {transporters && transporters.length > 0 ? (
                  transporters.map((transporter) => (
                    <option key={transporter.id} value={transporter.id}>
                      {transporter.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading transporters...</option>
                )}
              </select>
            </motion.div>
            
            <motion.div 
              className="flex items-end"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <motion.button
                onClick={() => {
                  setStatusFilter('');
                  setTransporterFilter('');
                  setDaysFilter('');
                }}
                className="w-full px-3 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium shadow-sm hover:shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Modern Eway Bills Table */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="relative px-5 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </motion.div>
                <div>
                  <motion.h3 
                    className="text-lg font-bold text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                  >
                    Eway Bill Tracking
                  </motion.h3>
                  <motion.p 
                    className="text-white/90 text-xs"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    Monitor and manage eway bill expiration dates
                  </motion.p>
                </div>
              </div>
              
              <motion.div
                className="flex items-center space-x-1.5 text-white/80"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-medium">Live Updates</span>
              </motion.div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">GR Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Eway Bill</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transporter</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bill Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Generated Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/50">
                {ewayBills.map((bill, index) => (
                  <motion.tr 
                    key={bill.id} 
                    className="hover:bg-white/80 transition-all duration-200 group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                          <span className="text-white text-[10px] font-bold">
                            {bill.booking?.grNumber?.slice(-2) || 'NA'}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {bill.booking?.grNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-full">
                        {bill.ewayBillNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">
                        {bill.transporter?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        ₹{bill.billValue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(bill.generatedDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(bill.expiryDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(bill)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-1.5">
                        <motion.button
                          onClick={() => openEditModal(bill)}
                          className="px-2.5 py-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-all duration-200 text-xs font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteEwayBill(bill.id)}
                          className="px-2.5 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 text-xs font-medium"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Add Eway Bill Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Add Eway Bill Record</h3>
                  <button
                    onClick={closeModals}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleAddEwayBill} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Booking</label>
                    <select
                      required
                      value={formData.bookingId}
                      onChange={(e) => {
                        const booking = availableBookings.find(b => b.id === e.target.value);
                        setFormData({
                          ...formData,
                          bookingId: e.target.value,
                          ewayBillNumber: booking?.ewayBill || '',
                          transporterId: booking?.transporter?.id || ''
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                      <option value="">Select Booking</option>
                      {availableBookings.map((booking) => (
                        <option key={booking.id} value={booking.id}>
                          GR: {booking.grNumber} - {booking.ewayBill}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Eway Bill Number</label>
                    <input
                      type="text"
                      required
                      value={formData.ewayBillNumber}
                      onChange={(e) => setFormData({ ...formData, ewayBillNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Generated Date</label>
                    <input
                      type="date"
                      required
                      value={formData.generatedDate}
                      onChange={(e) => setFormData({ ...formData, generatedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bill Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.billValue}
                      onChange={(e) => setFormData({ ...formData, billValue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Add Eway Bill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Eway Bill Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Edit Eway Bill Record</h3>
                  <button
                    onClick={closeModals}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleEditEwayBill} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Eway Bill Number</label>
                    <input
                      type="text"
                      required
                      value={formData.ewayBillNumber}
                      onChange={(e) => setFormData({ ...formData, ewayBillNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Generated Date</label>
                    <input
                      type="date"
                      required
                      value={formData.generatedDate}
                      onChange={(e) => setFormData({ ...formData, generatedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bill Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.billValue}
                      onChange={(e) => setFormData({ ...formData, billValue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Update Eway Bill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default EwayBillTrackerPage;
