import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChallanCard, Button, Alert, StatsCard, ChallanHeader } from './components';
import { format } from 'date-fns';

const ChallansListPage = () => {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [customMonth, setCustomMonth] = useState('');
  const [customYear, setCustomYear] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchChallans();
  }, []);

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/challans');
      if (!response.ok) {
        throw new Error('Failed to fetch challans');
      }
      const data = await response.json();
      setChallans(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this challan?')) {
      try {
        const response = await fetch(`/api/challans/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete challan');
        }
        fetchChallans(); // Refresh the list
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed': 
      case 'Delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'Completed':
      case 'Delivered':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'Cancelled':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Filter and sort challans
  const filteredAndSortedChallans = challans
    .filter(challan => {
      const matchesSearch = 
        challan.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challan.transportCompany?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challan.truck?.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challan.driver?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || challan.status === statusFilter;
      
      const matchesMonth = (() => {
        if (monthFilter === 'all') return true;
        
        const challanDate = new Date(challan.createdAt);
        const currentDate = new Date();
        
        switch (monthFilter) {
          case 'this-month':
            return challanDate.getMonth() === currentDate.getMonth() && 
                   challanDate.getFullYear() === currentDate.getFullYear();
          case 'last-month':
            const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
            return challanDate.getMonth() === lastMonth.getMonth() && 
                   challanDate.getFullYear() === lastMonth.getFullYear();
          case 'this-year':
            return challanDate.getFullYear() === currentDate.getFullYear();
          case 'custom':
            if (!customMonth || !customYear) return true;
            return challanDate.getFullYear() === parseInt(customYear) && 
                   challanDate.getMonth() === parseInt(customMonth) - 1;
          default:
            // Handle specific month format like "2024-01"
            const [year, month] = monthFilter.split('-');
            return challanDate.getFullYear() === parseInt(year) && 
                   challanDate.getMonth() === parseInt(month) - 1;
        }
      })();
      
      return matchesSearch && matchesStatus && matchesMonth;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'challanNumber':
          aValue = a.challanNumber;
          bValue = b.challanNumber;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'totalWeight':
          aValue = a.totalWeight || 0;
          bValue = b.totalWeight || 0;
          break;
        case 'totalCharges':
          aValue = a.totalCharges || 0;
          bValue = b.totalCharges || 0;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Calculate relevant metrics based on current filters
  const getFilteredChallans = () => {
    if (monthFilter === 'all') return challans;
    
    const currentDate = new Date();
    
    switch (monthFilter) {
      case 'this-month':
        return challans.filter(c => {
          const challanDate = new Date(c.createdAt);
          return challanDate.getMonth() === currentDate.getMonth() && 
                 challanDate.getFullYear() === currentDate.getFullYear();
        });
      case 'last-month':
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
        return challans.filter(c => {
          const challanDate = new Date(c.createdAt);
          return challanDate.getMonth() === lastMonth.getMonth() && 
                 challanDate.getFullYear() === lastMonth.getFullYear();
        });
      case 'this-year':
        return challans.filter(c => {
          const challanDate = new Date(c.createdAt);
          return challanDate.getFullYear() === currentDate.getFullYear();
        });
      case 'custom':
        if (!customMonth || !customYear) return challans;
        return challans.filter(c => {
          const challanDate = new Date(c.createdAt);
          return challanDate.getFullYear() === parseInt(customYear) && 
                 challanDate.getMonth() === parseInt(customMonth) - 1;
        });
      default:
        // Handle specific month format like "2024-01"
        const [year, month] = monthFilter.split('-');
        return challans.filter(c => {
          const challanDate = new Date(c.createdAt);
          return challanDate.getFullYear() === parseInt(year) && 
                 challanDate.getMonth() === parseInt(month) - 1;
        });
    }
  };

  const filteredChallansForMetrics = getFilteredChallans();
  
  const totalWeightThisMonth = filteredChallansForMetrics.reduce((sum, c) => sum + (c.totalWeight || 0), 0);
  const totalChargesThisMonth = filteredChallansForMetrics.reduce((sum, c) => sum + (c.totalCharges || 0), 0);
  const deliveredChallans = filteredChallansForMetrics.filter(c => c.status === 'Completed' || c.status === 'Delivered').length;
  const inTransitChallans = filteredChallansForMetrics.filter(c => c.status === 'Active').length;
  const cancelledChallans = filteredChallansForMetrics.filter(c => c.status === 'Cancelled').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading challans...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Clean Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Challans</h1>
              <p className="text-gray-600 mt-1">Manage and track all challans</p>
            </div>
            <Link
              to="/challans/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Challan
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert variant="error">
              {error}
            </Alert>
          </div>
        )}

        {/* Subtle Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  {monthFilter === 'all' ? 'Total Weight' : 
                   monthFilter === 'this-month' ? 'Weight This Month' :
                   monthFilter === 'last-month' ? 'Weight Last Month' :
                   monthFilter === 'this-year' ? 'Weight This Year' :
                   monthFilter === 'custom' ? `Weight ${customMonth && customYear ? `${new Date(parseInt(customYear), parseInt(customMonth) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'Custom Period'}` : 'Weight'}
                </p>
                <p className="text-lg font-semibold text-gray-900">{totalWeightThisMonth.toLocaleString()} kg</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  {monthFilter === 'all' ? 'Total Charges' : 
                   monthFilter === 'this-month' ? 'Charges This Month' :
                   monthFilter === 'last-month' ? 'Charges Last Month' :
                   monthFilter === 'this-year' ? 'Charges This Year' :
                   monthFilter === 'custom' ? `Charges ${customMonth && customYear ? `${new Date(parseInt(customYear), parseInt(customMonth) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'Custom Period'}` : 'Charges'}
                </p>
                <p className="text-lg font-semibold text-gray-900">₹{totalChargesThisMonth.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-lg font-semibold text-gray-900">{deliveredChallans}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-lg font-semibold text-gray-900">{inTransitChallans}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* First Row - Main Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search challans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Active">In Transit</option>
                  <option value="Completed">Delivered</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="sm:w-48">
                <select
                  value={monthFilter}
                  onChange={(e) => {
                    setMonthFilter(e.target.value);
                    if (e.target.value !== 'custom') {
                      setCustomMonth('');
                      setCustomYear('');
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="this-year">This Year</option>
                  <option value="custom">Custom Month/Year</option>
                </select>
              </div>
              <div className="sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt">Sort by Date</option>
                  <option value="challanNumber">Sort by Number</option>
                  <option value="status">Sort by Status</option>
                  <option value="totalWeight">Sort by Weight</option>
                  <option value="totalCharges">Sort by Charges</option>
                </select>
              </div>
            </div>
            
            {/* Second Row - Custom Month/Year Filters */}
            {monthFilter === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="sm:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                  <select
                    value={customMonth}
                    onChange={(e) => setCustomMonth(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="sm:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
                  <select
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="sm:w-48 flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomMonth('');
                      setCustomYear('');
                    }}
                    className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-gray-300 transition-colors duration-200"
                  >
                    Clear Custom Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Table Design */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Challans ({filteredAndSortedChallans.length})
              </h3>
              <div className="text-sm text-gray-500">
                {filteredAndSortedChallans.length} of {challans.length} total
              </div>
            </div>
          </div>

          {/* Table Content */}
          {filteredAndSortedChallans.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">No challans found</p>
              {searchTerm || statusFilter !== 'all' ? (
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
              ) : (
                <Link
                  to="/challans/create"
                  className="inline-flex items-center mt-6 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create First Challan
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Challan Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transport Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight & Charges
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedChallans.map((challan) => (
                    <tr key={challan.id} className="hover:bg-gray-50 transition-colors duration-150">
                      {/* Challan Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-20 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-3">
                            <span className="text-blue-600 font-semibold text-xs">
                              {challan.challanNumber}
                            </span>
                          </div>
                          <div>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(challan.status)}`}>
                                {getStatusIcon(challan.status)}
                                <span className="ml-1">{challan.status}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Transport Info */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{challan.transportCompany?.name || 'N/A'}</div>
                          <div className="text-gray-500 mt-1">
                            <div>Vehicle: {challan.truck?.vehicleNumber || 'N/A'}</div>
                            <div>Driver: {challan.driver?.name || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Weight & Charges */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-semibold">{challan.totalWeight || 0} kg</div>
                          <div className="text-gray-500">₹{(challan.totalCharges || 0).toLocaleString()}</div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>{format(new Date(challan.createdAt), 'MMM dd, yyyy')}</div>
                          <div className="text-gray-500">{format(new Date(challan.createdAt), 'HH:mm')}</div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/challans/${challan.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            to={`/challans/${challan.id}/edit`}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-150"
                            title="Edit Challan"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(challan.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete Challan"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallansListPage;