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
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    red: "bg-red-50 text-red-600 border-red-200"
  };

  const colorClass = colorClasses[color];

  return (
    <div
      className={`rounded-lg border ${colorClass} p-4 ${onClick ? 'cursor-pointer hover:shadow-sm transition-shadow duration-200' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="w-8 h-8 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
