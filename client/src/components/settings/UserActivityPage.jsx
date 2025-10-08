import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CustomDialog from '../common/CustomDialog';
import api from '../../utils/api';

const UserActivityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Fetch activities from API
  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/activities?type=${filter}&limit=50`);
      setActivities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // If no activities exist, show empty state
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Activities are already filtered by the API based on the filter parameter
  const filteredActivities = activities;

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diff = now - activityDate;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return activityDate.toLocaleDateString();
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      gray: 'bg-gray-100 text-gray-800',
      red: 'bg-red-100 text-red-800'
    };
    return colors[color] || colors.gray;
  };

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'booking', label: 'Bookings' },
    { value: 'challan', label: 'Challans' },
    { value: 'customer', label: 'Customers' },
    { value: 'transporter', label: 'Transporters' },
    { value: 'expense', label: 'Expenses' },
    { value: 'settings', label: 'Settings' },
    { value: 'login', label: 'Login/Logout' }
  ];

  const clearAllActivities = () => {
    setDialog({
      isOpen: true,
      title: 'Clear Activity History',
      message: 'Are you sure you want to clear all activity history? This action cannot be undone.',
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        try {
          await api.delete('/activities');
          setActivities([]);
          setDialog({
            isOpen: true,
            title: 'History Cleared',
            message: 'All activity history has been cleared successfully.',
            type: 'success'
          });
        } catch (error) {
          console.error('Error clearing activities:', error);
          setDialog({
            isOpen: true,
            title: 'Clear Failed',
            message: 'Failed to clear activity history. Please try again.',
            type: 'error'
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activity history...</p>
        </div>
      </div>
    );
  }

  const activityTypeConfig = {
    booking: { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ), 
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    challan: { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ), 
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    customer: { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ), 
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    expense: { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ), 
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    },
    login: { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      ), 
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    settings: { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ), 
      color: 'gray',
      gradient: 'from-gray-500 to-gray-600'
    },
    transporter: { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ), 
      color: 'red',
      gradient: 'from-red-500 to-red-600'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Activity</h1>
                <p className="text-gray-600 text-sm">Track your recent activities and system interactions</p>
              </div>
            </div>
            <button
              onClick={clearAllActivities}
              className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200 font-medium text-sm"
            >
              Clear History
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6 hover:shadow-md transition-all duration-300"
          style={{
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm floating-animation">
                <span className="text-white text-lg font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{user?.name || 'User'}</h2>
                <p className="text-white/80 text-sm">{user?.email || 'user@example.com'}</p>
                <p className="text-white/60 text-xs">
                  {filteredActivities.length} activities recorded
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6 hover:shadow-md transition-all duration-300"
          style={{
            animationDelay: '100ms',
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm floating-animation">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Activity Filter</h2>
                <p className="text-white/80 text-xs">Filter activities by type</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity Timeline */}
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
          style={{
            animationDelay: '200ms',
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm floating-animation">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Activity Timeline</h2>
                <p className="text-white/80 text-xs">
                  {filteredActivities.length} {filter === 'all' ? 'activities' : `${filter} activities`}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-500 text-sm">
                  {filter === 'all' 
                    ? 'No activities recorded yet.'
                    : `No ${filter} activities found.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity, index) => {
                  const config = activityTypeConfig[activity.type] || activityTypeConfig.settings;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 activity-item"
                      style={{
                        animationDelay: `${(index * 50)}ms`,
                        animation: 'slideIn 0.6s ease-out forwards'
                      }}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${config.gradient} text-white shadow-sm`}>
                          {config.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action}
                          </p>
                        <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {formatTimestamp(activity.createdAt)}
                        </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.details}
                        </p>
                      </div>
                      {index < filteredActivities.length - 1 && (
                        <div className="absolute left-9 mt-12 w-px h-8 bg-gradient-to-b from-gray-200 to-transparent"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Dialog */}
      <CustomDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        showCancel={dialog.showCancel}
        onConfirm={dialog.onConfirm}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .activity-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .activity-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
};

export default UserActivityPage;