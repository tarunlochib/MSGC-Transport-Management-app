import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookingHeader = ({ title, subtitle, currentStep, totalSteps, stepName, backUrl }) => {
  const navigate = useNavigate();

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
              {title}
            </h1>
            <p className="mt-2 text-sm text-gray-600 font-medium">
              {subtitle}
            </p>
            <div className="mt-3 flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span>Step {currentStep} of {totalSteps}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <span>{stepName}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3 animate-slideUp">
            <button
              onClick={() => navigate(backUrl)}
              className="group relative inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Bookings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHeader; 