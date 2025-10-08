import React, { useState, useEffect, useRef } from 'react';

const AutocompleteInput = ({
  value,
  onChange,
  onSelect,
  suggestions = [],
  placeholder = '',
  className = '',
  required = false,
  type = 'text',
  label = '',
  showGST = false,
  showAddress = false,
  loading = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter suggestions based on input value
  useEffect(() => {
    if (!value || value.length < 2) {
      setFilteredSuggestions([]);
      setIsOpen(false);
      return;
    }

    const filtered = suggestions.filter(item => {
      const searchTerm = value.toLowerCase();
      return (
        item.name?.toLowerCase().includes(searchTerm) ||
        item.gstNumber?.toLowerCase().includes(searchTerm) ||
        item.address?.toLowerCase().includes(searchTerm)
      );
    });

    setFilteredSuggestions(filtered);
    setIsOpen(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [value, suggestions]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    onChange(suggestion.name);
    if (onSelect) {
      onSelect(suggestion);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          handleSuggestionSelect(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input focus
  const handleFocus = () => {
    if (filteredSuggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm ${className}`}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {value && !loading && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
              setHighlightedIndex(-1);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`px-3 py-2 cursor-pointer transition-colors duration-150 ${
                index === highlightedIndex
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{suggestion.name}</div>
                  {showGST && suggestion.gstNumber && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      GST: {suggestion.gstNumber}
                    </div>
                  )}
                  {showAddress && suggestion.address && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {suggestion.address}
                    </div>
                  )}
                </div>
                <div className="ml-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && filteredSuggestions.length === 0 && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-3 py-2 text-sm text-gray-500 text-center">
            No matching customers found
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
