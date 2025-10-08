import React from 'react';

const CustomDialog = ({ isOpen, onClose, title, message, type = 'success', showDateRange = false, dateRange }) => {
  if (!isOpen) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          bgColor: 'bg-emerald-50',
          iconBg: 'bg-emerald-500',
          textColor: 'text-emerald-800',
          accentColor: 'text-emerald-600',
          borderColor: 'border-emerald-200'
        };
      case 'error':
        return {
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          bgColor: 'bg-red-50',
          iconBg: 'bg-red-500',
          textColor: 'text-red-800',
          accentColor: 'text-red-600',
          borderColor: 'border-red-200'
        };
      case 'warning':
        return {
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          bgColor: 'bg-amber-50',
          iconBg: 'bg-amber-500',
          textColor: 'text-amber-800',
          accentColor: 'text-amber-600',
          borderColor: 'border-amber-200'
        };
      case 'info':
        return {
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-blue-50',
          iconBg: 'bg-blue-500',
          textColor: 'text-blue-800',
          accentColor: 'text-blue-600',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          bgColor: 'bg-emerald-50',
          iconBg: 'bg-emerald-500',
          textColor: 'text-emerald-800',
          accentColor: 'text-emerald-600',
          borderColor: 'border-emerald-200'
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-5">
          {/* Icon and Title */}
          <div className="flex items-start space-x-3 mb-4">
            <div className={`w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {type === 'success' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
                {type === 'error' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />}
                {type === 'warning' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />}
                {type === 'info' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold ${config.textColor} mb-1`}>
                {title}
              </h3>
              <p className={`text-sm text-gray-600 leading-relaxed ${config.textColor}`}>
                {message}
              </p>
            </div>
          </div>
          
          {/* Date Range Info */}
          {showDateRange && dateRange && (
            <div className={`${config.bgColor} rounded-xl p-3 border ${config.borderColor} mb-4`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-1.5 h-1.5 ${config.iconBg} rounded-full`}></div>
                <span className={`text-xs font-semibold ${config.accentColor}`}>Report Period</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className={`${config.accentColor} font-medium`}>From:</span>
                  <div className={`${config.textColor} font-semibold`}>{dateRange.startDate}</div>
                </div>
                <div>
                  <span className={`${config.accentColor} font-medium`}>To:</span>
                  <div className={`${config.textColor} font-semibold`}>{dateRange.endDate}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-6 py-2.5 ${config.iconBg} text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold text-sm tracking-wide transform hover:scale-105 active:scale-95`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDialog;
