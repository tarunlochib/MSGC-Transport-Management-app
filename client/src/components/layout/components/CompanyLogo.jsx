import React from 'react';

const CompanyLogo = () => {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 flex items-center justify-center">
        <img 
          src="/MSGC_Transparent.png" 
          alt="MSGC Transport Logo" 
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to SVG if logo fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md hidden">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      </div>
      <div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MSGC Transport
        </h1>
        <p className="text-xs text-gray-500">Transport Management System</p>
      </div>
    </div>
  );
};

export default CompanyLogo; 