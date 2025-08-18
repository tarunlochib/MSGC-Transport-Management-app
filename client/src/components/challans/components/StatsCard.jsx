import React from 'react';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  className = "",
  onClick
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-blue-600",
    green: "from-green-500 to-green-600 text-green-600",
    purple: "from-purple-500 to-purple-600 text-purple-600",
    orange: "from-orange-500 to-orange-600 text-orange-600",
    red: "from-red-500 to-red-600 text-red-600"
  };

  const colorClass = colorClasses[color];

  return (
    <div
      className={`group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 h-32 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative p-4 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
            <p className={`text-lg font-bold text-gray-900 mb-1`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={`w-8 h-8 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center ml-4 group-hover:scale-110 transition-transform duration-200`}>
              <div className="w-4 h-4 text-white">
                {icon}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
