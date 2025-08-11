import React from 'react';

const ViewBookingCard = ({ 
  title, 
  icon, 
  iconColor, 
  children, 
  animationDelay = '0ms',
  className = ''
}) => {
  return (
    <div className={`animate-slideUp ${className}`} style={{ animationDelay }}>
      <div className="bg-white shadow-md rounded-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className={`w-8 h-8 ${iconColor} rounded-lg flex items-center justify-center mr-3`}>
              {icon}
            </div>
            {title}
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ViewBookingCard; 