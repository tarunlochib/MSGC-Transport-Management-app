import React from 'react';
import { useNavigate } from 'react-router-dom';

const ViewBookingError = ({ error, message = 'Booking not found' }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error || message}</p>
          <button
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewBookingError; 