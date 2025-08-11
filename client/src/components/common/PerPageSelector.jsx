import React from 'react';

const PerPageSelector = ({ value, onChange }) => {
  const options = [10, 25, 50, 100];

  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option} per page
        </option>
      ))}
    </select>
  );
};

export default PerPageSelector; 