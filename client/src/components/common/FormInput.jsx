import React from 'react';

const FormInput = ({ 
  label, 
  type = "text", 
  name, 
  value, 
  onChange, 
  placeholder, 
  error, 
  disabled = false,
  icon,
  onIconClick,
  className = ""
}) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-gray-700 block">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2.5 border rounded-lg text-gray-900 placeholder-gray-500 
            transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 
            focus:border-blue-500 bg-white/90 hover:bg-white hover:scale-[1.02] hover:shadow-md
            ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 hover:border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
        />
        {icon && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {icon}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 font-medium flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormInput;
