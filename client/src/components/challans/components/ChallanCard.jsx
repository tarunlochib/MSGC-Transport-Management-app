import React from 'react';

const ChallanCard = ({ 
  children, 
  className = "", 
  padding = "p-6",
  shadow = "shadow-sm",
  hover = true,
  animate = true,
  icon,
  title,
  subtitle,
  variant = "default"
}) => {
  const baseClasses = "bg-white rounded-lg border border-gray-100";
  const shadowClass = hover ? `${shadow} hover:shadow-md` : shadow;
  const animateClass = animate ? "transition-all duration-300 transform hover:scale-105 hover:-translate-y-1" : "";
  
  const variants = {
    default: "bg-white",
    elevated: "bg-white shadow-lg hover:shadow-xl",
    gradient: "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-100/50"
  };
  
  return (
    <div className={`${baseClasses} ${variants[variant]} ${shadowClass} ${padding} ${animateClass} ${className}`}>
      {(icon || title) && (
        <div className="flex items-center mb-4">
          {icon && (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 font-medium">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default ChallanCard;
