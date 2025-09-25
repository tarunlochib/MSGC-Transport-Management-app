import React from 'react';

const ChallanCard = ({ 
  children, 
  className = "", 
  padding = "p-6",
  icon,
  title,
  subtitle
}) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${padding} ${className}`}>
      {(icon || title) && (
        <div className="flex items-center mb-4">
          {icon && (
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default ChallanCard;
