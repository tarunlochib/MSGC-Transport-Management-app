import React from 'react';

const ViewBookingInfoField = ({ label, value, className = '' }) => {
  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
  );
};

export default ViewBookingInfoField; 