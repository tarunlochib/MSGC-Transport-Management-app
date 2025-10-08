import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import CustomDialog from '../common/CustomDialog';

const SystemReportsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
    showDateRange: false
  });
  const [reportData, setReportData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    totalTransporters: 0,
    totalCustomers: 0,
    totalVehicles: 0
  });
  const [rawData, setRawData] = useState({
    bookings: [],
    transporters: [],
    customers: [],
    vehicles: [],
    expenses: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Dynamic reports array that uses actual data
  const reports = [
    {
      id: 'bookings-report',
      name: 'Bookings Report',
      description: 'Detailed report of all bookings with filters',
      icon: '📋',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      hoverColor: 'hover:from-blue-600 hover:to-cyan-600',
      stats: `${reportData.totalBookings.toLocaleString()} bookings`
    },
    {
      id: 'financial-report',
      name: 'Financial Report',
      description: 'Revenue, expenses, and profit analysis',
      icon: '💰',
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      hoverColor: 'hover:from-emerald-600 hover:to-teal-600',
      stats: `₹${(reportData.totalRevenue / 100000).toFixed(1)}L revenue`
    },
    {
      id: 'transporter-report',
      name: 'Transporter Performance',
      description: 'Performance analysis by transporter',
      icon: '🚛',
      gradient: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      hoverColor: 'hover:from-purple-600 hover:to-violet-600',
      stats: `${reportData.totalTransporters} transporters`
    },
    {
      id: 'customer-report',
      name: 'Customer Analysis',
      description: 'Customer booking patterns and revenue',
      icon: '👥',
      gradient: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      hoverColor: 'hover:from-orange-600 hover:to-amber-600',
      stats: `${reportData.totalCustomers} customers`
    },
    {
      id: 'vehicle-report',
      name: 'Vehicle Utilization',
      description: 'Vehicle usage and performance metrics',
      icon: '🚚',
      gradient: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      hoverColor: 'hover:from-indigo-600 hover:to-blue-600',
      stats: `${reportData.totalVehicles} vehicles`
    },
    {
      id: 'monthly-summary',
      name: 'Monthly Summary',
      description: 'Comprehensive monthly business overview',
      icon: '📊',
      gradient: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      hoverColor: 'hover:from-rose-600 hover:to-pink-600',
      stats: `₹${(reportData.totalExpenses / 1000).toFixed(0)}K expenses`
    }
  ];

  useEffect(() => {
    fetchSummaryData();
  }, [dateRange]);

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      // Fetch basic summary data (you can expand this with actual API calls)
      const [bookings, transporters, customers, vehicles, expenses, drivers] = await Promise.all([
        api.get('/bookings'),
        api.get('/transporters'),
        api.get('/customers'),
        api.get('/vehicles'),
        api.get('/expenses'),
        api.get('/drivers')
      ]);

      // Calculate total revenue correctly: Total Charges from bookings
      const totalRevenue = bookings.data?.reduce((sum, booking) => sum + (booking.totalCharges || 0), 0) || 0;

      // Calculate total expenses
      const totalExpenses = expenses.data?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

      setReportData({
        totalBookings: bookings.data?.length || 0,
        totalRevenue: totalRevenue,
        totalExpenses: totalExpenses,
        totalTransporters: transporters.data?.length || 0,
        totalCustomers: customers.data?.length || 0,
        totalVehicles: vehicles.data?.length || 0
      });

      // Store raw data for report generation
      setRawData({
        bookings: bookings.data || [],
        transporters: transporters.data || [],
        customers: customers.data || [],
        vehicles: vehicles.data || [],
        expenses: expenses.data || [],
        drivers: drivers.data || []
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType) => {
    setGenerating(reportType);
    
    try {
      // Generate actual report based on type
      let reportData = null;
      let fileName = '';
      let reportContent = '';

      switch (reportType) {
        case 'bookings-report':
          fileName = `bookings-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
          reportContent = generateBookingsReport();
          break;
        case 'financial-report':
          fileName = `financial-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
          reportContent = generateFinancialReport();
          break;
        case 'transporter-report':
          fileName = `transporter-performance-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
          reportContent = generateTransporterReport();
          break;
        case 'customer-report':
          fileName = `customer-analysis-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
          reportContent = generateCustomerReport();
          break;
        case 'vehicle-report':
          fileName = `vehicle-utilization-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
          reportContent = generateVehicleReport();
          break;
        case 'monthly-summary':
          fileName = `monthly-summary-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
          reportContent = generateMonthlySummary();
          break;
        default:
          throw new Error('Unknown report type');
      }

      // Download the report
      downloadReport(reportContent, fileName);

      // Show success dialog
      setDialog({
        isOpen: true,
        title: 'Report Generated Successfully',
        message: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been generated and downloaded to your device.`,
        type: 'success',
        showDateRange: true
      });
    } catch (error) {
      console.error('Error generating report:', error);
      setDialog({
        isOpen: true,
        title: 'Report Generation Failed',
        message: 'Failed to generate report. Please check your connection and try again.',
        type: 'error',
        showDateRange: false
      });
    } finally {
      setGenerating(null);
    }
  };

  const exportAllReports = async () => {
    setGenerating('all');
    
    try {
      // Generate all reports
      const reports = [
        { type: 'bookings-report', content: generateBookingsReport(), fileName: `bookings-report-${dateRange.startDate}-to-${dateRange.endDate}.csv` },
        { type: 'financial-report', content: generateFinancialReport(), fileName: `financial-report-${dateRange.startDate}-to-${dateRange.endDate}.csv` },
        { type: 'transporter-report', content: generateTransporterReport(), fileName: `transporter-performance-${dateRange.startDate}-to-${dateRange.endDate}.csv` },
        { type: 'customer-report', content: generateCustomerReport(), fileName: `customer-analysis-${dateRange.startDate}-to-${dateRange.endDate}.csv` },
        { type: 'vehicle-report', content: generateVehicleReport(), fileName: `vehicle-utilization-${dateRange.startDate}-to-${dateRange.endDate}.csv` },
        { type: 'monthly-summary', content: generateMonthlySummary(), fileName: `monthly-summary-${dateRange.startDate}-to-${dateRange.endDate}.csv` }
      ];

      // Download all reports
      reports.forEach(report => {
        downloadReport(report.content, report.fileName);
      });
      
      setDialog({
        isOpen: true,
        title: 'All Reports Exported Successfully',
        message: 'All 6 reports have been generated and downloaded to your device.',
        type: 'success',
        showDateRange: true
      });
    } catch (error) {
      console.error('Error exporting reports:', error);
      setDialog({
        isOpen: true,
        title: 'Export Failed',
        message: 'Failed to export reports. Please check your connection and try again.',
        type: 'error',
        showDateRange: false
      });
    } finally {
      setGenerating(null);
    }
  };

  // Download utility function
  const downloadReport = (content, fileName) => {
    // Add BOM (Byte Order Mark) to ensure proper UTF-8 encoding and text formatting
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to escape CSV values
  const escapeCSVValue = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    
    // For E-way bill numbers, prefix with single quote to force text formatting in Excel
    if (stringValue.match(/^\d{12,}$/)) {
      return `'${stringValue}`;
    }
    
    // If value contains comma, newline, or quote, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Report generation functions
  const generateBookingsReport = () => {
    const filteredBookings = rawData.bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      return bookingDate >= startDate && bookingDate <= endDate;
    });

    const headers = [
      'GR Number', 'Booking Date', 'Consignor Name', 'Consignor Address', 'Consignor GST',
      'Consignee Name', 'Consignee Address', 'Consignee GST', 'From Location', 'To Location',
      'E-way Bill', 'Payment Method', 'Payment Type', 'Total Amount', 'Paid Amount',
      'Delivery Against', 'Weight (kg)', 'Freight Charges', 'Local Cartage Charges',
      'Door Delivery Charges', 'Stationary Charges', 'Labour Charges', 'Other Charges',
      'Total Charges', 'Transporter', 'Vehicle Number', 'Driver Name', 'Private Marka',
      'Created Date', 'Updated Date'
    ];
    
    const rows = filteredBookings.map(booking => {
      const transporter = rawData.transporters.find(t => t.id === booking.transporterId);
      const vehicle = rawData.vehicles.find(v => v.id === booking.vehicleId);
      const driver = rawData.drivers?.find(d => d.id === booking.driverId);

      return [
        booking.grNumber || 'N/A',
        booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A',
        booking.consignorName || 'N/A',
        booking.consignorAddress || 'N/A',
        booking.consignorGST || 'N/A',
        booking.consigneeName || 'N/A',
        booking.consigneeAddress || 'N/A',
        booking.consigneeGST || 'N/A',
        booking.fromLocation || 'N/A',
        booking.toLocation || 'N/A',
        booking.ewayBill || 'N/A',
        booking.paymentMethod || 'N/A',
        booking.paymentType || 'N/A',
        booking.totalAmount || 0,
        booking.paidAmount || 0,
        booking.deliveryAgainst || 'N/A',
        booking.weightKg || 0,
        booking.freightCharges || 0,
        booking.localCartageCharges || 0,
        booking.doorDeliveryCharges || 0,
        booking.stationaryCharges || 0,
        booking.labourCharges || 0,
        booking.otherCharges || 0,
        booking.totalCharges || 0,
        transporter?.name || 'N/A',
        vehicle?.vehicleNumber || 'N/A',
        driver?.name || 'N/A',
        booking.privateMarka || 'N/A',
        booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A',
        booking.updatedAt ? new Date(booking.updatedAt).toLocaleDateString() : 'N/A'
      ];
    });

    return [headers, ...rows].map(row => row.map(escapeCSVValue).join(',')).join('\n');
  };

  const generateFinancialReport = () => {
    const filteredBookings = rawData.bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      return bookingDate >= startDate && bookingDate <= endDate;
    });

    const headers = [
      'GR Number', 'Booking Date', 'Consignor Name', 'Consignee Name', 'Transporter',
      'Weight (kg)', 'Total Amount', 'Paid Amount', 'Freight Charges', 'Local Cartage Charges',
      'Door Delivery Charges', 'Stationary Charges', 'Labour Charges', 'Other Charges',
      'Total Charges', 'Payment Method', 'Payment Type', 'Created Date'
    ];
    
    const rows = filteredBookings.map(booking => {
      const transporter = rawData.transporters.find(t => t.id === booking.transporterId);

      return [
        booking.grNumber || 'N/A',
        booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A',
        booking.consignorName || 'N/A',
        booking.consigneeName || 'N/A',
        transporter?.name || 'N/A',
        booking.weightKg || 0,
        booking.totalAmount || 0,
        booking.paidAmount || 0,
        booking.freightCharges || 0,
        booking.localCartageCharges || 0,
        booking.doorDeliveryCharges || 0,
        booking.stationaryCharges || 0,
        booking.labourCharges || 0,
        booking.otherCharges || 0,
        booking.totalCharges || 0,
        booking.paymentMethod || 'N/A',
        booking.paymentType || 'N/A',
        booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'
      ];
    });

    return [headers, ...rows].map(row => row.map(escapeCSVValue).join(',')).join('\n');
  };

  const generateTransporterReport = () => {
    const headers = [
      'Transporter ID', 'Name', 'Address', 'Phone', 'Commission Rate', 'Contact Info',
      'Total Bookings', 'Total Weight (kg)', 'Total Revenue', 'Average Revenue per Booking',
      'Last Booking Date', 'Created Date', 'Updated Date'
    ];
    
    const rows = rawData.transporters.map(transporter => {
      const transporterBookings = rawData.bookings.filter(booking => booking.transporterId === transporter.id);
      const totalWeight = transporterBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
      const totalRevenue = transporterBookings.reduce((sum, booking) => sum + (booking.totalCharges || 0), 0);
      
      const averageRevenuePerBooking = transporterBookings.length > 0 ? totalRevenue / transporterBookings.length : 0;
      const lastBookingDate = transporterBookings.length > 0 
        ? new Date(Math.max(...transporterBookings.map(b => new Date(b.createdAt)))).toLocaleDateString()
        : 'N/A';

      return [
        transporter.id || 'N/A',
        transporter.name || 'N/A',
        transporter.address || 'N/A',
        transporter.phone || 'N/A',
        transporter.commissionRate || 0,
        transporter.contactInfo || 'N/A',
        transporterBookings.length,
        totalWeight,
        totalRevenue,
        averageRevenuePerBooking.toFixed(2),
        lastBookingDate,
        transporter.createdAt ? new Date(transporter.createdAt).toLocaleDateString() : 'N/A',
        transporter.updatedAt ? new Date(transporter.updatedAt).toLocaleDateString() : 'N/A'
      ];
    });

    return [headers, ...rows].map(row => row.map(escapeCSVValue).join(',')).join('\n');
  };

  const generateCustomerReport = () => {
    const headers = [
      'Customer ID', 'Name', 'Address', 'GST Number', 'PAN Number', 'Phone', 'Email',
      'Contact Person', 'Alternate Phone', 'Customer Type', 'Credit Limit', 'Payment Terms',
      'Status', 'Total Bookings', 'Total Weight (kg)', 'Total Spent', 'Average Booking Value',
      'Last Booking Date', 'Created Date', 'Updated Date'
    ];
    
    const rows = rawData.customers.map(customer => {
      const customerBookings = rawData.bookings.filter(booking => 
        booking.consignorId === customer.id || booking.consigneeId === customer.id
      );
      const totalWeight = customerBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
      const totalSpent = customerBookings.reduce((sum, booking) => sum + (booking.totalCharges || 0), 0);
      
      const averageBookingValue = customerBookings.length > 0 ? totalSpent / customerBookings.length : 0;
      const lastBookingDate = customerBookings.length > 0 
        ? new Date(Math.max(...customerBookings.map(b => new Date(b.createdAt)))).toLocaleDateString()
        : 'N/A';

      return [
        customer.id || 'N/A',
        customer.name || 'N/A',
        customer.address || 'N/A',
        customer.gstNumber || 'N/A',
        customer.panNumber || 'N/A',
        customer.phone || 'N/A',
        customer.email || 'N/A',
        customer.contactPerson || 'N/A',
        customer.alternatePhone || 'N/A',
        customer.customerType || 'N/A',
        customer.creditLimit || 'N/A',
        customer.paymentTerms || 'N/A',
        customer.status || 'N/A',
        customerBookings.length,
        totalWeight,
        totalSpent,
        averageBookingValue.toFixed(2),
        lastBookingDate,
        customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A',
        customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : 'N/A'
      ];
    });

    return [headers, ...rows].map(row => row.map(escapeCSVValue).join(',')).join('\n');
  };

  const generateVehicleReport = () => {
    const headers = [
      'Vehicle ID', 'Vehicle Number', 'Make', 'Model', 'Registration Number', 'Driver Name',
      'Status', 'Capacity (kg)', 'Year', 'Fuel Type', 'Insurance Expiry', 'Permit Expiry',
      'Fitness Expiry', 'PUC Expiry', 'Notes', 'Is Owned', 'Transporter', 'Total Trips',
      'Total Weight Carried (kg)', 'Average Weight per Trip', 'Last Trip Date', 'Created Date', 'Updated Date'
    ];
    
    const rows = rawData.vehicles.map(vehicle => {
      const transporter = rawData.transporters.find(t => t.id === vehicle.transporterId);
      const vehicleBookings = rawData.bookings.filter(booking => booking.vehicleId === vehicle.id);
      const totalWeightCarried = vehicleBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
      
      const averageWeightPerTrip = vehicleBookings.length > 0 ? totalWeightCarried / vehicleBookings.length : 0;
      const lastTripDate = vehicleBookings.length > 0 
        ? new Date(Math.max(...vehicleBookings.map(b => new Date(b.createdAt)))).toLocaleDateString()
        : 'N/A';

      return [
        vehicle.id || 'N/A',
        vehicle.vehicleNumber || 'N/A',
        vehicle.make || 'N/A',
        vehicle.model || 'N/A',
        vehicle.registrationNumber || 'N/A',
        vehicle.driverName || 'N/A',
        vehicle.status || 'N/A',
        vehicle.capacity || 'N/A',
        vehicle.year || 'N/A',
        vehicle.fuelType || 'N/A',
        vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : 'N/A',
        vehicle.permitExpiry ? new Date(vehicle.permitExpiry).toLocaleDateString() : 'N/A',
        vehicle.fitnessExpiry ? new Date(vehicle.fitnessExpiry).toLocaleDateString() : 'N/A',
        vehicle.pucExpiry ? new Date(vehicle.pucExpiry).toLocaleDateString() : 'N/A',
        vehicle.notes || 'N/A',
        vehicle.isOwned ? 'Yes' : 'No',
        transporter?.name || 'N/A',
        vehicleBookings.length,
        totalWeightCarried,
        averageWeightPerTrip.toFixed(2),
        lastTripDate,
        vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A',
        vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleDateString() : 'N/A'
      ];
    });

    return [headers, ...rows].map(row => row.map(escapeCSVValue).join(',')).join('\n');
  };

  const generateMonthlySummary = () => {
    const headers = ['Metric', 'Value', 'Description'];
    const rows = [
      ['Total Bookings', reportData.totalBookings, 'Number of bookings in selected period'],
      ['Total Revenue', `₹${reportData.totalRevenue.toLocaleString()}`, 'Total revenue (commission + local cartage)'],
      ['Total Expenses', `₹${reportData.totalExpenses.toLocaleString()}`, 'Total expenses in selected period'],
      ['Active Transporters', reportData.totalTransporters, 'Number of active transporters'],
      ['Total Customers', reportData.totalCustomers, 'Number of registered customers'],
      ['Total Vehicles', reportData.totalVehicles, 'Number of registered vehicles'],
      ['Report Period', `${dateRange.startDate} to ${dateRange.endDate}`, 'Date range for this report'],
      ['Generated On', new Date().toLocaleString(), 'Report generation timestamp']
    ];

    return [headers, ...rows].map(row => row.map(escapeCSVValue).join(',')).join('\n');
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100 mx-4 my-6">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50 opacity-60"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full translate-y-24 -translate-x-24"></div>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">System Reports</h1>
                <p className="text-sm text-white/90">Generate and export comprehensive business reports</p>
              </div>
            </div>
            <button
              onClick={exportAllReports}
              disabled={generating === 'all'}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium border border-white/30 flex items-center"
            >
              {generating === 'all' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export All
                </>
              )}
            </button>
          </div>
        </div>

        <div className="relative p-6 space-y-6">
          {/* Date Range Selector */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-bold text-gray-900">Report Date Range</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Select Date Range</h4>
                  <p className="text-sm text-gray-600">Choose the period for your reports</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-bold text-gray-900">Business Overview</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Bookings */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-blue-200">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                      BOOKINGS
                    </div>
                  </div>
                  <div className="text-3xl font-black text-blue-700 mb-1 font-mono">
                    {reportData.totalBookings}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Total Bookings</div>
                  <div className="text-xs text-blue-500 mt-1">In selected period</div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-emerald-200">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-1 rounded-full">
                      REVENUE
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-700 mb-1 font-mono">
                    ₹{reportData.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-emerald-600 font-medium">Total Revenue</div>
                  <div className="text-xs text-emerald-500 mt-1">Generated income</div>
                </div>
              </div>

              {/* Active Transporters */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-purple-200">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded-full">
                      TRANSPORTERS
                    </div>
                  </div>
                  <div className="text-3xl font-black text-purple-700 mb-1 font-mono">
                    {reportData.totalTransporters}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Active Partners</div>
                  <div className="text-xs text-purple-500 mt-1">Working transporters</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-bold text-gray-900">Available Reports</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-indigo-200 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report, index) => (
                <div
                  key={report.id}
                  className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-300 transform hover:scale-105"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
                  <div className="relative">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${report.gradient} rounded-2xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        <span className="text-2xl">{report.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                          {report.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">{report.stats}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">
                      {report.description}
                    </p>
                    <button
                      onClick={() => generateReport(report.id)}
                      disabled={generating === report.id}
                      className={`w-full px-4 py-3 bg-gradient-to-r ${report.gradient} text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm transform hover:scale-105 flex items-center justify-center group-hover:shadow-xl`}
                    >
                      {generating === report.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Generate Report
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideInUp {
            animation: slideInUp 0.6s ease-out forwards;
          }
        `}</style>
      </div>

      {/* Custom Dialog */}
      <CustomDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        showDateRange={dialog.showDateRange}
        dateRange={dateRange}
      />
    </div>
  );
};

export default SystemReportsPage;
