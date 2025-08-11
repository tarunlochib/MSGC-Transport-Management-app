import React from 'react';

const BillingHeader = () => {
  return (
    <div className="animate-slideDown">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 border border-blue-100/50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-16 h-16 bg-blue-400 rounded-full -translate-x-8 -translate-y-8"></div>
          <div className="absolute top-0 right-0 w-12 h-12 bg-purple-400 rounded-full translate-x-6 -translate-y-6"></div>
          <div className="absolute bottom-0 left-1/2 w-8 h-8 bg-indigo-400 rounded-full -translate-x-4 translate-y-4"></div>
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="animate-slideIn">
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Billing Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 font-medium">
              Generate bills and manage transporter payments
            </p>
            <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                <span>Commission tracking</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Payment management</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 lg:mt-0 flex items-center space-x-3 animate-slideUp">
            <div className="text-right">
              <p className="text-xs text-gray-500">Current Month</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingHeader; 