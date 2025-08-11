import React from 'react';

const DashboardHeader = ({ apiStatus, error }) => {
  return (
    <div className="animate-slideDown">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border border-blue-100/50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-20 h-20 bg-blue-400 rounded-full -translate-x-10 -translate-y-10"></div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-400 rounded-full translate-x-8 -translate-y-8"></div>
          <div className="absolute bottom-0 left-1/2 w-12 h-12 bg-indigo-400 rounded-full -translate-x-6 translate-y-6"></div>
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="animate-slideIn">
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600 font-medium">
              Welcome back! Here's what's happening with your transport business.
            </p>
            <div className="mt-3 flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span>Real-time updates</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Live data sync</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3 animate-slideUp">
            {/* System Status */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${
              apiStatus === 'online' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>{apiStatus === 'online' ? 'Online System' : 'System Offline'}</span>
              {apiStatus === 'online' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            
            {/* Auto-refresh Status */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Auto-refresh enabled</span>
            </div>
          </div>
        </div>
        
        {/* System Health Bar */}
        <div className="mt-6 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">System Health</span>
            <span className="text-sm text-gray-500">{apiStatus === 'online' ? '100%' : '0%'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                apiStatus === 'online' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-red-500'
              }`}
              style={{ width: apiStatus === 'online' ? '100%' : '0%' }}
            ></div>
          </div>
        </div>
        
        {/* System Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="flex items-center space-x-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">24/7 Support</p>
              <p className="text-xs text-gray-500">Always available</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">99.9% Uptime</p>
              <p className="text-xs text-gray-500">Reliable service</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Real-time Updates</p>
              <p className="text-xs text-gray-500">Live data sync</p>
            </div>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">System Error</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader; 