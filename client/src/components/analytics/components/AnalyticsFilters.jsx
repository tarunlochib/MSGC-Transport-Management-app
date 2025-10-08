import React, { useState, useEffect, useRef } from 'react';

const AnalyticsFilters = ({
  selectedPeriod,
  dateRange,
  selectedMetrics,
  onPeriodChange,
  onDateRangeChange,
  onMetricsChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPeriodDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Most commonly used periods (shown as buttons)
  const commonPeriods = [
    { value: 'today', label: 'Today', icon: '📅' },
    { value: 'last7days', label: 'Last 7 Days', icon: '📊' },
    { value: 'last30days', label: 'Last 30 Days', icon: '📈' },
    { value: 'currentMonth', label: 'Current Month', icon: '🗓️' },
    { value: 'lastMonth', label: 'Last Month', icon: '📅' }
  ];

  // Extended periods (shown in dropdown)
  const extendedPeriods = [
    { value: 'yesterday', label: 'Yesterday', icon: '📅' },
    { value: 'last3Months', label: 'Last 3 Months', icon: '📊' },
    { value: 'last6Months', label: 'Last 6 Months', icon: '📈' },
    { value: 'lastYear', label: 'Last Year', icon: '📅' },
    { value: 'last2Years', label: 'Last 2 Years', icon: '📊' },
    { value: 'last5Years', label: 'Last 5 Years', icon: '📈' },
    { value: 'allTime', label: 'All Time', icon: '🏆' },
    { value: 'custom', label: 'Custom Range', icon: '⚙️' }
  ];

  const allPeriods = [...commonPeriods, ...extendedPeriods];

  const metricOptions = [
    { value: 'revenue', label: 'Revenue', icon: '💰' },
    { value: 'bookings', label: 'Bookings', icon: '📦' },
    { value: 'customers', label: 'Customers', icon: '👥' },
    { value: 'transporters', label: 'Transporters', icon: '🚛' },
    { value: 'vehicles', label: 'Vehicles', icon: '🚚' },
    { value: 'drivers', label: 'Drivers', icon: '👨‍💼' },
    { value: 'expenses', label: 'Expenses', icon: '💸' },
    { value: 'profit', label: 'Profit', icon: '📈' },
    { value: 'efficiency', label: 'Efficiency', icon: '⚡' },
    { value: 'utilization', label: 'Utilization', icon: '📊' }
  ];

  const handleMetricToggle = (metric) => {
    const newMetrics = selectedMetrics.includes(metric)
      ? selectedMetrics.filter(m => m !== metric)
      : [...selectedMetrics, metric];
    onMetricsChange(newMetrics);
  };

  return (
    <div className="relative bg-gradient-to-br from-white via-emerald-50/40 to-cyan-50/40 border-b border-emerald-200/50">
      {/* Enhanced pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_3px_3px,rgba(16,185,129,0.12)_1px,transparent_0)] bg-[length:24px_24px] opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-4">
          {/* Time Period Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/40 shadow-lg relative z-40">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm"></div>
              <h3 className="text-base font-bold text-emerald-800">Time Period</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-emerald-200 to-transparent"></div>
            </div>
            
            <div className="space-y-3">
              {/* Common periods */}
              <div>
                <p className="text-xs font-medium text-emerald-700 mb-2">Quick Select</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {commonPeriods.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onPeriodChange(option.value)}
                      className={`group relative px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${
                        selectedPeriod === option.value
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-white/90 backdrop-blur-sm text-emerald-700 border border-emerald-200/60 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md'
                      }`}
                    >
                      <span className="mr-1.5 text-sm">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Extended periods dropdown */}
              <div className="relative z-50" ref={dropdownRef}>
                <button
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                  className="group relative w-full px-3 py-2 text-xs font-semibold text-emerald-700 bg-white/90 backdrop-blur-sm border border-emerald-200/60 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <span className="mr-1.5 text-sm">📅</span>
                  More Time Periods
                  <svg className="ml-1.5 w-3 h-3 transition-transform duration-300 group-hover:rotate-180 float-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showPeriodDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-emerald-200/60 rounded-xl shadow-2xl z-50">
                    <div className="p-1">
                      {extendedPeriods.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onPeriodChange(option.value);
                            setShowPeriodDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center transition-all duration-200 rounded-lg ${
                            selectedPeriod === option.value ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold' : 'text-gray-700'
                          }`}
                        >
                          <span className="mr-2 text-sm">{option.icon}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Custom Date Range */}
          {selectedPeriod === 'custom' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Date Range
              </label>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Start Date"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-teal-200/40 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-sm"></div>
                <h3 className="text-base font-bold text-teal-800">Key Metrics</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-teal-200 to-transparent"></div>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group relative px-3 py-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-white/80 backdrop-blur-sm border border-teal-200/60 rounded-lg hover:bg-teal-50 hover:border-teal-300 hover:shadow-md transition-all duration-300 transform hover:scale-105"
              >
                <span className="mr-1.5">{isExpanded ? '📉' : '📈'}</span>
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
            
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 transition-all duration-500 ${isExpanded ? 'max-h-none' : 'max-h-20 overflow-hidden'}`}>
              {metricOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleMetricToggle(option.value)}
                  className={`group relative px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    selectedMetrics.includes(option.value)
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30'
                      : 'bg-white/90 backdrop-blur-sm text-teal-700 border border-teal-200/60 hover:bg-teal-50 hover:border-teal-300 hover:shadow-md'
                  }`}
                >
                  <span className="mr-1.5 text-sm">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                onPeriodChange('currentMonth');
                onMetricsChange(['revenue', 'bookings', 'customers']);
                onDateRangeChange({ start: '', end: '' });
              }}
              className="group relative inline-flex items-center px-4 py-2 text-sm font-semibold text-emerald-700 bg-white/80 backdrop-blur-sm border border-emerald-200/60 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;
