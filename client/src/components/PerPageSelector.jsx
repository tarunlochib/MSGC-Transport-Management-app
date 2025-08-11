import React from 'react';

const PerPageSelector = ({ 
  itemsPerPage, 
  onItemsPerPageChange, 
  options = [5, 10, 25, 50, 100],
  label = "Show:",
  suffix = "per page"
}) => {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm text-gray-700">{label}</label>
      <select
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-700">{suffix}</span>
    </div>
  );
};

export default PerPageSelector; 