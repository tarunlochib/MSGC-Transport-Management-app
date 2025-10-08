import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomDialog from '../common/CustomDialog';
import notificationService from '../../utils/notificationService';

const NotificationPreferencesPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    bookingNotifications: true,
    paymentNotifications: true,
    challanNotifications: true,
    expenseNotifications: false,
    systemNotifications: true,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true
  });
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  useEffect(() => {
    // Load saved preferences from notification service
    setPreferences(notificationService.loadPreferences());
  }, []);

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Save preferences using notification service
      notificationService.updatePreferences(preferences);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDialog({
        isOpen: true,
        title: 'Preferences Saved Successfully',
        message: 'Your notification preferences have been updated and saved.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      setDialog({
        isOpen: true,
        title: 'Save Failed',
        message: 'Failed to save preferences. Please check your connection and try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultPreferences = {
      emailNotifications: true,
      bookingNotifications: true,
      paymentNotifications: true,
      challanNotifications: true,
      expenseNotifications: false,
      systemNotifications: true,
      dailyReports: false,
      weeklyReports: true,
      monthlyReports: true
    };
    setPreferences(defaultPreferences);
  };

  const notificationCategories = [
    {
      id: 'general',
      title: 'General Notifications',
      description: 'Basic notification settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.83 17h5.67a2 2 0 002-2V9a2 2 0 00-2-2H4.83a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      ),
      color: 'blue',
      items: [
        {
          key: 'emailNotifications',
          title: 'Email Notifications',
          description: 'Receive notifications via email',
          enabled: preferences.emailNotifications
        },
        {
          key: 'systemNotifications',
          title: 'System Notifications',
          description: 'Receive system alerts and updates',
          enabled: preferences.systemNotifications
        }
      ]
    },
    {
      id: 'business',
      title: 'Business Notifications',
      description: 'Notifications related to your business operations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'green',
      items: [
        {
          key: 'bookingNotifications',
          title: 'Booking Notifications',
          description: 'Get notified about new bookings and updates',
          enabled: preferences.bookingNotifications
        },
        {
          key: 'paymentNotifications',
          title: 'Payment Notifications',
          description: 'Get notified about payments and billing updates',
          enabled: preferences.paymentNotifications
        },
        {
          key: 'challanNotifications',
          title: 'Challan Notifications',
          description: 'Get notified about challan generation and updates',
          enabled: preferences.challanNotifications
        },
        {
          key: 'expenseNotifications',
          title: 'Expense Notifications',
          description: 'Get notified about expense entries and updates',
          enabled: preferences.expenseNotifications
        }
      ]
    },
    {
      id: 'reports',
      title: 'Report Notifications',
      description: 'Automated report notifications',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'purple',
      items: [
        {
          key: 'dailyReports',
          title: 'Daily Reports',
          description: 'Receive daily summary reports',
          enabled: preferences.dailyReports
        },
        {
          key: 'weeklyReports',
          title: 'Weekly Reports',
          description: 'Receive weekly summary reports',
          enabled: preferences.weeklyReports
        },
        {
          key: 'monthlyReports',
          title: 'Monthly Reports',
          description: 'Receive monthly summary reports',
          enabled: preferences.monthlyReports
        }
      ]
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        gradient: 'from-blue-500 to-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        gradient: 'from-green-500 to-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        gradient: 'from-purple-500 to-purple-600'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
                <p className="text-gray-600 text-sm">Manage your notification settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Categories */}
        <div className="space-y-4">
          {notificationCategories.map((category, index) => {
            const colorClasses = getColorClasses(category.color);
            return (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${colorClasses.gradient} p-4`}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <div className="text-white">
                        {category.icon}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{category.title}</h2>
                      <p className="text-white/80 text-xs">{category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Category Items */}
                <div className="p-4">
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200"
                        style={{
                          animationDelay: `${(index * 100) + (itemIndex * 50)}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange(item.key)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 ${
                            item.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                              item.enabled ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
          >
            Reset to Default
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl text-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Dialog */}
      <CustomDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
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
      `}</style>
    </div>
  );
};

export default NotificationPreferencesPage;