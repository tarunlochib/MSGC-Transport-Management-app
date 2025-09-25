import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StockExceptionsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('age'); // age, weight, charges
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'stock',
    ageGroup: searchParams.get('ageGroup') || '',
    transporterId: searchParams.get('transporterId') || '',
    godownId: searchParams.get('godownId') || ''
  });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.transporterId) params.append('transporterId', filters.transporterId);
      if (filters.godownId) params.append('godownId', filters.godownId);
      
      let url = `/api/stock-exceptions/details/${filters.category}`;
      if (filters.ageGroup) {
        url += `/${filters.ageGroup}`;
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setBookings(response.data);
      
      // Animate stats after data loads
      setTimeout(() => {
        animateStats(response.data);
      }, 500);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateStats = (bookingsData) => {
    const totalWeight = bookingsData.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
    const totalValue = bookingsData.reduce((sum, booking) => sum + (booking.totalCharges || 0), 0);
    const avgAge = bookingsData.length > 0 ? 
      bookingsData.reduce((sum, booking) => {
        const daysDiff = Math.ceil((new Date() - new Date(booking.bookingDate)) / (1000 * 60 * 60 * 24));
        return sum + daysDiff;
      }, 0) / bookingsData.length : 0;

    // Animate counters
    ['count', 'weight', 'value', 'avgAge'].forEach(key => {
      let current = 0;
      const target = key === 'count' ? bookingsData.length : 
                   key === 'weight' ? totalWeight :
                   key === 'value' ? totalValue : avgAge;
      const increment = Math.ceil(target / 30);
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedStats(prev => ({ ...prev, [key]: current }));
      }, 30);
    });
  };

  const getCategoryConfig = () => {
    if (filters.category === 'stock') {
      if (filters.ageGroup === 'one-day') {
        return {
          title: 'Fresh Stock',
          subtitle: '≤ 1 Day Old',
          icon: '✅',
          gradient: 'from-emerald-600 via-green-500 to-teal-600',
          bgPattern: 'from-emerald-50 to-green-50',
          urgency: 'low',
          description: 'Recently received items ready for dispatch'
        };
      }
      if (filters.ageGroup === 'two-days') {
        return {
          title: 'Aging Stock',
          subtitle: '2-3 Days Old',
          icon: '⚠️',
          gradient: 'from-amber-600 via-yellow-500 to-orange-600',
          bgPattern: 'from-amber-50 to-yellow-50',
          urgency: 'medium',
          description: 'Items requiring attention for timely dispatch'
        };
      }
      if (filters.ageGroup === 'four-days') {
        return {
          title: 'Critical Stock',
          subtitle: '&gt;= 4 Days Old',
          icon: '🚨',
          gradient: 'from-red-600 via-rose-500 to-pink-600',
          bgPattern: 'from-red-50 to-rose-50',
          urgency: 'critical',
          description: 'URGENT: Items requiring immediate dispatch'
        };
      }
      return {
        title: 'All Stock',
        subtitle: 'In Godown',
        icon: '📦',
        gradient: 'from-blue-600 via-indigo-500 to-purple-600',
        bgPattern: 'from-blue-50 to-indigo-50',
        urgency: 'normal',
        description: 'Complete inventory overview'
      };
    }
    if (filters.category === 'in-transit') {
      return {
        title: 'In Transit',
        subtitle: 'Active Shipments',
        icon: '🚛',
        gradient: 'from-blue-600 via-cyan-500 to-teal-600',
        bgPattern: 'from-blue-50 to-cyan-50',
        urgency: 'normal',
        description: 'Items currently being transported'
      };
    }
    return {
      title: 'Delivered',
      subtitle: 'Completed',
      icon: '✅',
      gradient: 'from-green-600 via-emerald-500 to-teal-600',
      bgPattern: 'from-green-50 to-emerald-50',
      urgency: 'normal',
      description: 'Successfully delivered items'
    };
  };

  const getStatusBadge = (booking) => {
    const daysDiff = Math.ceil((new Date() - new Date(booking.bookingDate)) / (1000 * 60 * 60 * 24));
    
    if (filters.category === 'in-transit') {
      const challan = booking.challanGoods?.[0]?.challan;
      return (
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 animate-pulse">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-ping"></div>
            {challan?.status}
          </span>
          <span className="text-xs text-gray-600">{challan?.challanNumber}</span>
        </div>
      );
    }
    
    if (filters.category === 'delivered') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Delivered
        </span>
      );
    }
    
    // Stock age badges
    let badgeClass = 'bg-gray-100 text-gray-800';
    let icon = '📦';
    let pulseClass = '';
    
    if (daysDiff <= 1) {
      badgeClass = 'bg-emerald-100 text-emerald-800';
      icon = '✅';
    } else if (daysDiff >= 2 && daysDiff <= 3) {
      badgeClass = 'bg-amber-100 text-amber-800';
      icon = '⚠️';
    } else if (daysDiff >= 4) {
      badgeClass = 'bg-red-100 text-red-800';
      icon = '🚨';
      pulseClass = 'animate-pulse';
    }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass} ${pulseClass}`}>
        <span className="mr-1">{icon}</span>
        {daysDiff} day{daysDiff !== 1 ? 's' : ''} old
      </span>
    );
  };

  const filteredAndSortedBookings = bookings
    .filter(booking => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        booking.grNumber.toLowerCase().includes(searchLower) ||
        booking.consignorName.toLowerCase().includes(searchLower) ||
        booking.consigneeName.toLowerCase().includes(searchLower) ||
        booking.transporter.name.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'age') {
        const ageA = Math.floor((new Date() - new Date(a.bookingDate)) / (1000 * 60 * 60 * 24));
        const ageB = Math.floor((new Date() - new Date(b.bookingDate)) / (1000 * 60 * 60 * 24));
        return ageB - ageA; // Oldest first
      }
      if (sortBy === 'weight') {
        return (b.weightKg || 0) - (a.weightKg || 0);
      }
      if (sortBy === 'charges') {
        return (b.totalCharges || 0) - (a.totalCharges || 0);
      }
      return 0;
    });

  const config = getCategoryConfig();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            {/* Header skeleton */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-2"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3"></div>
                </div>
              </div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-3 shadow-lg">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
            
            {/* List skeleton */}
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgPattern} p-4`}>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-5`}></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="relative p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="group p-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
                >
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transform group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className={`w-10 h-10 bg-gradient-to-r ${config.gradient} rounded-lg flex items-center justify-center text-lg ${config.urgency === 'critical' ? 'animate-pulse' : ''}`}>
                  {config.icon}
                </div>
                
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 font-medium">{config.subtitle}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      config.urgency === 'critical' ? 'bg-red-100 text-red-800 animate-pulse' :
                      config.urgency === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {animatedStats.count || 0} items
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-3 border border-blue-200">
                <div className="text-xl font-bold text-blue-700 font-mono">
                  {animatedStats.count || 0}
                </div>
                <div className="text-xs text-blue-600 font-medium">Total Items</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg p-3 border border-purple-200">
                <div className="text-xl font-bold text-purple-700 font-mono">
                  {(animatedStats.weight || 0).toLocaleString()}
                </div>
                <div className="text-xs text-purple-600 font-medium">Total Weight (kg)</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-3 border border-green-200">
                <div className="text-xl font-bold text-green-700 font-mono">
                  ₹{(animatedStats.value || 0).toLocaleString()}
                </div>
                <div className="text-xs text-green-600 font-medium">Total Value</div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg p-3 border border-amber-200">
                <div className="text-xl font-bold text-amber-700 font-mono">
                  {Math.round(animatedStats.avgAge || 0)}
                </div>
                <div className="text-xs text-amber-600 font-medium">Avg Age (days)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters & Search */}
        <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-3">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by GR Number, Consignor, Consignee, or Transporter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200 text-sm"
              >
                <option value="age">Sort by Age</option>
                <option value="weight">Sort by Weight</option>
                <option value="charges">Sort by Value</option>
              </select>
              
              <div className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                {filteredAndSortedBookings.length} of {bookings.length} items
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bookings List */}
        <div className="space-y-3">
          {filteredAndSortedBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0l-4 4-4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 text-sm">No bookings match your current search criteria.</p>
            </div>
          ) : (
            filteredAndSortedBookings.map((booking, index) => (
              <div 
                key={booking.id} 
                className="group bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 animate-slideInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-r ${config.gradient} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                        {booking.grNumber.slice(-2)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          GR: {booking.grNumber}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(booking)}
                          {booking.godown && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {booking.godown.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                      className="group-hover:bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
                    >
                      View →
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">From</div>
                      <div className="font-medium text-gray-900 text-sm">{booking.consignorName}</div>
                      <div className="text-xs text-gray-600">{booking.fromLocation}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">To</div>
                      <div className="font-medium text-gray-900 text-sm">{booking.consigneeName}</div>
                      <div className="text-xs text-gray-600">{booking.toLocation}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Transporter</div>
                      <div className="font-medium text-gray-900 text-sm">{booking.transporter.name}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Details</div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-xs text-gray-600">
                          <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l-3-9m3 9l3-9" />
                          </svg>
                          {booking.weightKg} kg
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          ₹{booking.totalCharges}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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
  );
};

export default StockExceptionsPage;