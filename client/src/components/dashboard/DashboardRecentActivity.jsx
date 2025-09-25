import React from 'react';
import { Link } from 'react-router-dom';

const DashboardRecentActivity = ({ title, data, type, loading }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'paid':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'pending':
      case 'in progress':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'cancelled':
      case 'inactive':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'paid':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'pending':
      case 'in progress':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'cancelled':
      case 'inactive':
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Reset time to start of day for accurate comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = today - targetDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return `₹${amount?.toLocaleString() || '0'}`;
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="w-32 h-5 bg-gray-200 rounded mb-2"></div>
            <div className="w-48 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slideUp" style={{ animationDelay: '400ms' }}>
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 p-6 border border-blue-100/50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-12 h-12 bg-blue-400 rounded-full -translate-x-6 -translate-y-6"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-400 rounded-full translate-x-4 translate-y-4"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {type === 'bookings' ? 'Recent transport bookings' : 'Recent expense records'}
              </p>
            </div>
            <div className="text-right">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{data?.length || 0}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Items</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <div
                  key={item.id || index}
                  className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-lg border border-white/50 hover:shadow-md hover:scale-[1.01] transition-all duration-300"
                  style={{ animationDelay: `${500 + index * 100}ms` }}
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-sm">
                        {type === 'bookings' ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {type === 'bookings' 
                              ? `GR: ${item.grNumber || 'N/A'}`
                              : item.description || 'Expense'
                            }
                          </h3>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span>{item.status || 'Unknown'}</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2">
                          {type === 'bookings' 
                            ? `${item.consignorName || 'N/A'} → ${item.consigneeName || 'N/A'}`
                            : item.category || 'General'
                          }
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDate(item.createdAt || item.bookingDate)}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {type === 'bookings' 
                              ? formatAmount(item.totalCharges)
                              : formatAmount(item.amount)
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No {type === 'bookings' ? 'bookings' : 'expenses'} found</p>
                <p className="text-gray-400 text-xs mt-1">Recent activity will appear here</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200/50">
            <Link
              to={type === 'bookings' ? '/bookings' : '/expenses'}
              className="flex items-center justify-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 group"
            >
              <span>View all {type === 'bookings' ? 'bookings' : 'expenses'}</span>
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRecentActivity; 