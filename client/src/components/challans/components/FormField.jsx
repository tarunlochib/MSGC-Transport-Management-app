import React from 'react';

const FormField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = "",
  helpText,
  children,
  options = []
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children || (
        type === 'select' ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`
              w-full px-3 py-2.5 border rounded-lg text-gray-900
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20
              focus:border-blue-500 bg-white hover:bg-gray-50 hover:scale-[1.01]
              ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 hover:border-gray-300'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
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
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20
              focus:border-blue-500 bg-white hover:bg-gray-50 hover:scale-[1.01]
              ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 hover:border-gray-300'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
        )
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormField;