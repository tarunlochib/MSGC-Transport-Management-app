import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../Pagination';
import performanceOptimizer from '../../utils/performanceOptimization';

const BookingsListPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [transporterFilter, setTransporterFilter] = useState('all');
  const [transporters, setTransporters] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Enhanced UI state
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [weightRange, setWeightRange] = useState({ min: '', max: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter, transporterFilter, dateRange, weightRange, amountRange, sortConfig]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, transporterFilter, dateRange, weightRange, amountRange, sortConfig]);

  const fetchBookings = async () => {
    try {
      const [bookingsResponse, transportersResponse, challansResponse] = await Promise.all([
        axios.get('/api/bookings'),
        axios.get('/api/transporters'),
        axios.get('/api/challans')
      ]);
      // Map booking delivery status and challan info from challans
      const challans = challansResponse.data || [];
      const bookingIdToChallanInfo = new Map();
      challans.forEach(ch => {
        if (Array.isArray(ch.challanGoods)) {
          ch.challanGoods.forEach(g => {
            if (g.bookingId) {
              const existing = bookingIdToChallanInfo.get(g.bookingId);
              const current = ch.status || 'Generated';
              const priority = { 'Delivered': 3, 'Completed': 3, 'In Transit': 2, 'Generated': 1 };
              
              // Store the most recent or highest priority challan info
              if (!existing || (priority[current] || 0) > (priority[existing.status] || 0)) {
                bookingIdToChallanInfo.set(g.bookingId, {
                  status: current,
                  challanNumber: ch.challanNumber,
                  dispatchDate: ch.createdAt,
                  challanId: ch.id
                });
              }
            }
          });
        }
      });

      const bookingsWithStatus = (bookingsResponse.data || []).map(b => {
        const challanInfo = bookingIdToChallanInfo.get(b.id);
        return {
          ...b,
          deliveryStatus: challanInfo?.status || 'Not Dispatched',
          challanNumber: challanInfo?.challanNumber || null,
          dispatchDate: challanInfo?.dispatchDate || null,
          challanId: challanInfo?.challanId || null
        };
      });

      setBookings(bookingsWithStatus);
      setTransporters(transportersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    // Enhanced search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.grNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.consignorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.consigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.challanNumber && booking.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.paymentMethod === statusFilter);
    }

    // Enhanced date filter with date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    } else if (dateFilter !== 'all') {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        switch (dateFilter) {
          case 'today':
            return bookingDate.toDateString() === today.toDateString();
          case 'yesterday':
            return bookingDate.toDateString() === yesterday.toDateString();
          case 'lastWeek':
            return bookingDate >= lastWeek;
          case 'lastMonth':
            return bookingDate >= lastMonth;
          default:
            return true;
        }
      });
    }

    // Transporter filter
    if (transporterFilter !== 'all') {
      filtered = filtered.filter(booking => booking.transporterId === transporterFilter);
    }

    // Weight range filter
    if (weightRange.min || weightRange.max) {
      filtered = filtered.filter(booking => {
        const weight = booking.weightKg || 0;
        const minWeight = parseFloat(weightRange.min) || 0;
        const maxWeight = parseFloat(weightRange.max) || Infinity;
        return weight >= minWeight && weight <= maxWeight;
      });
    }

    // Amount range filter
    if (amountRange.min || amountRange.max) {
      filtered = filtered.filter(booking => {
        const amount = booking.totalCharges || 0;
        const minAmount = parseFloat(amountRange.min) || 0;
        const maxAmount = parseFloat(amountRange.max) || Infinity;
        return amount >= minAmount && amount <= maxAmount;
      });
    }

    // Enhanced sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'bookingDate' || sortConfig.key === 'createdAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sort: latest first by CREATED time, then by booking date, then by GR number
      filtered.sort((a, b) => {
        const aCreated = new Date(a.createdAt || 0).getTime();
        const bCreated = new Date(b.createdAt || 0).getTime();
        if (bCreated !== aCreated) return bCreated - aCreated;
        const aDate = new Date(a.bookingDate || 0).getTime();
        const bDate = new Date(b.bookingDate || 0).getTime();
        if (bDate !== aDate) return bDate - aDate;
        const aGr = parseInt(a.grNumber, 10) || 0;
        const bGr = parseInt(b.grNumber, 10) || 0;
        return bGr - aGr;
      });
    }

    setFilteredBookings(filtered);
    
    // Calculate pagination
    const newTotalPages = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(newTotalPages);
    
    // Reset to first page if current page is out of bounds
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  };

  // Enhanced helper functions
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleRowExpansion = (bookingId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  const handleSelectBooking = (bookingId) => {
    setSelectedBookings(prev => {
      if (prev.includes(bookingId)) {
        return prev.filter(id => id !== bookingId);
      } else {
        return [...prev, bookingId];
      }
    });
  };

  const handleSelectAll = () => {
    const currentPageData = getCurrentPageData();
    if (selectedBookings.length === currentPageData.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(currentPageData.map(booking => booking.id));
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
    setTransporterFilter('all');
    setDateRange({ start: '', end: '' });
    setWeightRange({ min: '', max: '' });
    setAmountRange({ min: '', max: '' });
    setSortConfig({ key: null, direction: 'asc' });
  };

  const exportToCSV = (exportSelected = false) => {
    const dataToExport = exportSelected 
      ? bookings.filter(booking => selectedBookings.includes(booking.id))
      : bookings;

    const csvData = dataToExport.map(booking => ({
      'GR Number': booking.grNumber,
      'Consignor Name': booking.consignorName,
      'Consignor Address': booking.consignorAddress,
      'Consignor GST': booking.consignorGST || '',
      'Consignee Name': booking.consigneeName,
      'Consignee Address': booking.consigneeAddress,
      'Consignee GST': booking.consigneeGST || '',
      'From Location': booking.fromLocation,
      'To Location': booking.toLocation,
      'E-way Bill': booking.ewayBill ? String(booking.ewayBill) : '',
      'Payment Method': booking.paymentMethod,
      'Payment Type': booking.paymentType || '',
      'Total Amount': booking.totalAmount ? String(booking.totalAmount) : '',
      'Paid Amount': booking.paidAmount ? String(booking.paidAmount) : '',
      'Delivery Against': booking.deliveryAgainst,
      'Weight (kg)': booking.weightKg ? String(booking.weightKg) : '',
      'Freight Charges': booking.freightCharges ? String(booking.freightCharges) : '',
      'Local Cartage Charges': booking.localCartageCharges ? String(booking.localCartageCharges) : '',
      'Door Delivery Charges': booking.doorDeliveryCharges ? String(booking.doorDeliveryCharges) : '',
      'Stationary Charges': booking.stationaryCharges ? String(booking.stationaryCharges) : '',
      'Labour Charges': booking.labourCharges ? String(booking.labourCharges) : '',
      'Other Charges': booking.otherCharges ? String(booking.otherCharges) : '',
      'Total Charges': booking.totalCharges ? String(booking.totalCharges) : '',
      'Transporter': booking.transporter?.name || '',
      'Vehicle Number': booking.vehicle?.vehicleNumber || '',
      'Driver Name': booking.driver?.name || '',
      'Booking Date': formatDate(booking.bookingDate),
      'Created Date': formatDate(booking.createdAt),
      'Delivery Status': booking.deliveryStatus,
      'Challan Number': booking.challanNumber || 'Not dispatched',
      'Dispatch Date': booking.dispatchDate ? formatDate(booking.dispatchDate) : '',
      'Private Marka': booking.privateMarka || ''
    }));

    if (csvData.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportSelected ? 'selected-bookings' : 'all-bookings'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await axios.delete(`/api/bookings/${id}`);
        
        // Invalidate dashboard cache to ensure fresh data
        performanceOptimizer.clearCacheEntry('bookings');
        performanceOptimizer.clearCacheEntry('challans');
        
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking. This booking may have associated data.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatCurrency = (amount) => {
    const value = parseFloat(amount) || 0;
    return value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
  };

  const getPaymentStatusColor = (paymentMethod) => {
    switch (paymentMethod) {
      case 'Paid':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'To Pay':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'To be billed':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getPaymentStatusIcon = (paymentMethod) => {
    switch (paymentMethod) {
      case 'Paid':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'To Pay':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'To be billed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBookings.slice(startIndex, endIndex);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Calculate stats
  const stats = {
    total: bookings.length,
    paid: bookings.filter(b => b.paymentMethod === 'Paid').length,
    toPay: bookings.filter(b => b.paymentMethod === 'To Pay').length,
    toBeBilled: bookings.filter(b => b.paymentMethod === 'To be billed').length,
    today: bookings.filter(b => {
      const bookingDate = new Date(b.bookingDate);
      const today = new Date();
      return bookingDate.toDateString() === today.toDateString();
    }).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 animate-slideDown">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border border-blue-100/50">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-20 h-20 bg-blue-400 rounded-full -translate-x-10 -translate-y-10"></div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-400 rounded-full translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-1/2 w-12 h-12 bg-indigo-400 rounded-full -translate-x-6 translate-y-6"></div>
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="animate-slideIn">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Bookings Management
              </h1>
              <p className="mt-2 text-sm text-gray-600 font-medium">
                Manage and track all transport bookings and deliveries
              </p>
              <div className="mt-3 flex items-center space-x-3 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Transport bookings</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Payment tracking</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3 animate-slideUp">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="group relative inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
                
                <button
                  onClick={() => exportToCSV(false)}
                  className="group relative inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export All
                </button>
                
                <Link
                  to="/bookings/create"
                  className="group relative inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                  <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="relative">Add Booking</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="animate-slideDown" style={{ animationDelay: '0ms' }}>
          <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 h-32">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative p-4 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">Total Bookings</p>
                  <p className="text-lg font-bold text-gray-900 mb-1">{stats.total}</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">All bookings</span>
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="h-1 bg-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-slideDown" style={{ animationDelay: '100ms' }}>
          <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 h-32">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative p-4 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">Paid</p>
                  <p className="text-lg font-bold text-gray-900 mb-1">{stats.paid}</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Completed payments</span>
                  </div>
                </div>
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="h-1 bg-green-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.total > 0 ? (stats.paid / stats.total) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-slideDown" style={{ animationDelay: '200ms' }}>
          <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 h-32">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative p-4 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">To Pay</p>
                  <p className="text-lg font-bold text-gray-900 mb-1">{stats.toPay}</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Pending payments</span>
                  </div>
                </div>
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="h-1 bg-yellow-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.total > 0 ? (stats.toPay / stats.total) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-slideDown" style={{ animationDelay: '300ms' }}>
          <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 h-32">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative p-4 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">To be Billed</p>
                  <p className="text-lg font-bold text-gray-900 mb-1">{stats.toBeBilled}</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Awaiting billing</span>
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="h-1 bg-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.total > 0 ? (stats.toBeBilled / stats.total) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-slideDown" style={{ animationDelay: '400ms' }}>
          <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 h-32">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative p-4 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">Today</p>
                  <p className="text-lg font-bold text-gray-900 mb-1">{stats.today}</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Today's bookings</span>
                  </div>
                </div>
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="h-1 bg-purple-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.total > 0 ? (stats.today / stats.total) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Bulk Actions Bar */}
      {selectedBookings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-slideDown">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">
                  {selectedBookings.length} booking{selectedBookings.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportToCSV(true)}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Selected
                </button>
                <button
                  onClick={() => setSelectedBookings([])}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Selection
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedBookings([])}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-slideUp">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Advanced Filters & Search
            </h3>
            <p className="text-sm text-gray-500 mt-1">Filter bookings by various criteria to find exactly what you need</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Clear All</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Bookings
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by GR number, consignor, consignee, location..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Transporter Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Transporter
            </label>
            <select
              value={transporterFilter}
              onChange={(e) => setTransporterFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">All Transporters</option>
              {transporters.map((transporter) => (
                <option key={transporter.id} value={transporter.id}>
                  {transporter.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payment Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="To Pay">To Pay</option>
              <option value="To be billed">To be billed</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="lastWeek">Last Week</option>
              <option value="lastMonth">Last Month</option>
            </select>
          </div>
        </div>

        {/* Enhanced Filters - Collapsible */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range Picker */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Custom Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="End Date"
                  />
                </div>
              </div>

              {/* Weight Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  Weight Range (kg)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={weightRange.min}
                    onChange={(e) => setWeightRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={weightRange.max}
                    onChange={(e) => setWeightRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Amount Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={amountRange.min}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={amountRange.max}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || transporterFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {transporterFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Transporter: {transporters.find(t => t.id === transporterFilter)?.name}
                      <button
                        onClick={() => setTransporterFilter('all')}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Status: {statusFilter}
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="ml-2 text-yellow-600 hover:text-yellow-800"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {dateFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Date: {dateFilter}
                      <button
                        onClick={() => setDateFilter('all')}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTransporterFilter('all');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-slideUp">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedBookings.length === getCurrentPageData().length && getCurrentPageData().length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span>Select</span>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('grNumber')}
                >
                  <div className="flex items-center space-x-1">
                    <span>GR Number</span>
                    {sortConfig.key === 'grNumber' && (
                      <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('consignorName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Consignor</span>
                    {sortConfig.key === 'consignorName' && (
                      <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('consigneeName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Consignee</span>
                    {sortConfig.key === 'consigneeName' && (
                      <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('weightKg')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Weight</span>
                    {sortConfig.key === 'weightKg' && (
                      <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('bookingDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    {sortConfig.key === 'bookingDate' && (
                      <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('totalCharges')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Charges</span>
                    {sortConfig.key === 'totalCharges' && (
                      <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('paymentMethod')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {sortConfig.key === 'paymentMethod' && (
                      <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Challan Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentPageData().map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking.id)}
                      onChange={() => handleSelectBooking(booking.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.grNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.consignorName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.consigneeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.fromLocation} → {booking.toLocation}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {booking.weightKg ? `${booking.weightKg.toLocaleString()} kg` : '0 kg'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.packages && booking.packages.length > 0 ? 
                            `${booking.packages.reduce((total, pkg) => total + (parseInt(pkg.numberOfItems) || 0), 0)} pkg${booking.packages.reduce((total, pkg) => total + (parseInt(pkg.numberOfItems) || 0), 0) > 1 ? 's' : ''}` : 
                            'No packages'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(booking.bookingDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">₹ {formatCurrency(booking.totalCharges)}</div>
                    <div className="text-xs text-gray-500">Freight + charges</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentMethod)}`}>
                      {getPaymentStatusIcon(booking.paymentMethod)}
                      <span className="ml-1">{booking.paymentMethod}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      booking.deliveryStatus === 'Delivered' || booking.deliveryStatus === 'Completed'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : booking.deliveryStatus === 'In Transit'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {booking.deliveryStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.challanNumber ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center justify-center w-6 h-6 bg-blue-50 rounded-md">
                            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.challanNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              Dispatched: {formatDate(booking.dispatchDate)}
                            </div>
                          </div>
                        </div>
                        {booking.challanId && (
                          <Link
                            to={`/challans/${booking.challanId}`}
                            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            View Challan
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <div className="flex items-center justify-center w-6 h-6 bg-gray-50 rounded-md">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm">Not dispatched</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all duration-200 transform hover:scale-110"
                        title="View"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link
                        to={`/bookings/${booking.id}/edit`}
                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-all duration-200 transform hover:scale-110"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200 transform hover:scale-110"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        
        {getCurrentPageData().length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new booking.</p>
            <div className="mt-6">
              <Link
                to="/bookings/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Booking
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={filteredBookings.length}
          itemsPerPage={itemsPerPage}
          startIndex={(currentPage - 1) * itemsPerPage}
          endIndex={Math.min(currentPage * itemsPerPage, filteredBookings.length)}
        />
      )}
    </div>
  );
};

export default BookingsListPage; 