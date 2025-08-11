import React from 'react';

const ViewBookingPaymentStatus = ({ paymentMethod }) => {
  const getPaymentStatusColor = (paymentMethod) => {
    switch (paymentMethod) {
      case 'Paid':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'To Pay':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'To be billed':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getPaymentStatusIcon = (paymentMethod) => {
    switch (paymentMethod) {
      case 'Paid':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'To Pay':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'To be billed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Method</p>
      <div className="flex items-center space-x-2">
        {getPaymentStatusIcon(paymentMethod)}
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(paymentMethod)}`}>
          {paymentMethod}
        </span>
      </div>
    </div>
  );
};

export default ViewBookingPaymentStatus; 