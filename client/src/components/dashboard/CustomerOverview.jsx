import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CustomerOverview = ({ bookings, customers, loading }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Calculate customer metrics
  const calculateCustomerMetrics = () => {
    if (!bookings || !customers) return [];

    // Filter bookings by selected period
    const now = new Date();
    let filteredBookings = bookings;

    if (selectedPeriod === 'currentMonth') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      filteredBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      });
    } else if (selectedPeriod === 'lastMonth') {
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      filteredBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === year;
      });
    } else if (selectedPeriod === 'last3Months') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      filteredBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= threeMonthsAgo;
      });
    }

    // Group bookings by customer (consignor)
    const customerStats = {};
    
    filteredBookings.forEach(booking => {
      const customerId = booking.consignorId;
      const customerName = booking.consignorName;
      
      if (!customerStats[customerId]) {
        customerStats[customerId] = {
          id: customerId,
          name: customerName,
          gstNumber: booking.consignorGST || 'N/A',
          totalBookings: 0,
          totalWeight: 0,
          totalCharges: 0,
          avgWeightPerBooking: 0,
          lastBookingDate: null,
          bookingFrequency: 0
        };
      }
      
      customerStats[customerId].totalBookings += 1;
      customerStats[customerId].totalWeight += booking.weightKg || 0;
      customerStats[customerId].totalCharges += booking.totalCharges || 0;
      
      const bookingDate = new Date(booking.bookingDate);
      if (!customerStats[customerId].lastBookingDate || bookingDate > customerStats[customerId].lastBookingDate) {
        customerStats[customerId].lastBookingDate = bookingDate;
      }
    });

    // Calculate additional metrics
    Object.values(customerStats).forEach(customer => {
      customer.avgWeightPerBooking = customer.totalBookings > 0 ? customer.totalWeight / customer.totalBookings : 0;
      customer.bookingFrequency = customer.totalBookings / Math.max(1, filteredBookings.length) * 100;
    });

    // Convert to array and sort by different metrics
    const customerArray = Object.values(customerStats);
    
    return {
      topByBookings: [...customerArray].sort((a, b) => b.totalBookings - a.totalBookings).slice(0, 5),
      topByWeight: [...customerArray].sort((a, b) => b.totalWeight - a.totalWeight).slice(0, 5),
      topByCharges: [...customerArray].sort((a, b) => b.totalCharges - a.totalCharges).slice(0, 5),
      topByFrequency: [...customerArray].sort((a, b) => b.bookingFrequency - a.bookingFrequency).slice(0, 5)
    };
  };

  const customerMetrics = calculateCustomerMetrics();
  const totalCustomers = Object.keys(customerMetrics.topByBookings).length;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatWeight = (weight) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}T`;
    }
    return `${Math.round(weight)}kg`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 px-6 py-4">
          <div className="animate-pulse">
            <div className="h-6 bg-white/20 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-1/4"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Customer Insights
              </h3>
              <p className="text-purple-100 text-sm">
                Top performers • {totalCustomers} active customers
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 bg-white/20 text-white text-sm rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="currentMonth" className="text-gray-900">This Month</option>
              <option value="lastMonth" className="text-gray-900">Last Month</option>
              <option value="last3Months" className="text-gray-900">Last 3 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {totalCustomers === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customer Data</h3>
            <p className="text-gray-600">No bookings found for the selected period.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top by Bookings */}
            <div 
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition-all duration-300"
              onMouseEnter={() => setHoveredCard('bookings')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                animationDelay: '0ms',
                animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Most Bookings</h4>
                </div>
                <span className="text-xs text-blue-600 font-medium">Top 5</span>
              </div>
              
              <div className="space-y-2">
                {customerMetrics.topByBookings.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {customer.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer.gstNumber}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-600">
                        {customer.totalBookings}
                      </div>
                      <div className="text-xs text-gray-500">
                        bookings
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top by Weight */}
            <div 
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100 hover:shadow-md transition-all duration-300"
              onMouseEnter={() => setHoveredCard('weight')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                animationDelay: '100ms',
                animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Highest Weight</h4>
                </div>
                <span className="text-xs text-green-600 font-medium">Top 5</span>
              </div>
              
              <div className="space-y-2">
                {customerMetrics.topByWeight.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {customer.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer.avgWeightPerBooking.toFixed(0)}kg avg
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">
                        {formatWeight(customer.totalWeight)}
                      </div>
                      <div className="text-xs text-gray-500">
                        total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top by Revenue */}
            <div 
              className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-100 hover:shadow-md transition-all duration-300"
              onMouseEnter={() => setHoveredCard('revenue')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                animationDelay: '200ms',
                animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Highest Revenue</h4>
                </div>
                <span className="text-xs text-yellow-600 font-medium">Top 5</span>
              </div>
              
              <div className="space-y-2">
                {customerMetrics.topByCharges.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-yellow-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-yellow-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {customer.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer.totalBookings} bookings
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-yellow-600">
                        {formatCurrency(customer.totalCharges)}
                      </div>
                      <div className="text-xs text-gray-500">
                        total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top by Frequency */}
            <div 
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 hover:shadow-md transition-all duration-300"
              onMouseEnter={() => setHoveredCard('frequency')}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                animationDelay: '300ms',
                animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Most Active</h4>
                </div>
                <span className="text-xs text-purple-600 font-medium">Top 5</span>
              </div>
              
              <div className="space-y-2">
                {customerMetrics.topByFrequency.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {customer.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last: {formatDate(customer.lastBookingDate)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-purple-600">
                        {customer.bookingFrequency.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>📊 {totalCustomers} active customers</span>
            <span>📈 Data updated in real-time</span>
          </div>
          <Link 
            to="/customers" 
            className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
          >
            View All Customers →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;
