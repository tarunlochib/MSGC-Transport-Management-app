import React, { useState } from 'react';

const ExpensesFilters = ({ filters, setFilters, vehicles, itemsPerPage, setItemsPerPage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Count active filters
  React.useEffect(() => {
    const count = Object.values(filters).filter(value => 
      value !== '' && value !== 'all'
    ).length;
    setActiveFilters(count);
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      expenseType: 'all',
      vehicleId: 'all',
      dateRange: 'all',
      minAmount: '',
      maxAmount: ''
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg mb-4 animate-slideDown overflow-hidden border border-gray-100">
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Filters & Search</h3>
              <p className="text-xs text-gray-500">
                {activeFilters > 0 ? `${activeFilters} active filter${activeFilters > 1 ? 's' : ''}` : 'No filters applied'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-200"
            >
              <svg className={`w-3 h-3 mr-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {isExpanded ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-4 space-y-4">
          {/* Search Bar */}
          <div className="animate-slideIn" style={{ animationDelay: '0ms' }}>
            <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
              Search Expenses
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search by description, type, vehicle..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Expense Type */}
            <div className="animate-slideIn" style={{ animationDelay: '100ms' }}>
              <label htmlFor="expenseType" className="block text-xs font-medium text-gray-700 mb-1">
                Expense Type
              </label>
              <div className="relative">
                <select
                  id="expenseType"
                  value={filters.expenseType}
                  onChange={(e) => handleFilterChange('expenseType', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="fuel">Fuel</option>
                  <option value="toll">Toll & Permits</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="misc">Miscellaneous</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div className="animate-slideIn" style={{ animationDelay: '200ms' }}>
              <label htmlFor="vehicle" className="block text-xs font-medium text-gray-700 mb-1">
                Vehicle
              </label>
              <div className="relative">
                <select
                  id="vehicle"
                  value={filters.vehicleId}
                  onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md appearance-none bg-white"
                >
                  <option value="all">All Vehicles</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicleNumber}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="animate-slideIn" style={{ animationDelay: '300ms' }}>
              <label htmlFor="dateRange" className="block text-xs font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="relative">
                <select
                  id="dateRange"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md appearance-none bg-white"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Items per page */}
            <div className="animate-slideIn" style={{ animationDelay: '400ms' }}>
              <label htmlFor="itemsPerPage" className="block text-xs font-medium text-gray-700 mb-1">
                Items per Page
              </label>
              <div className="relative">
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md appearance-none bg-white"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div className="animate-slideIn" style={{ animationDelay: '500ms' }}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Amount Range (₹)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-xs">₹</span>
                </div>
                <input
                  type="number"
                  placeholder="Minimum amount"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  className="block w-full pl-6 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-xs">₹</span>
                </div>
                <input
                  type="number"
                  placeholder="Maximum amount"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  className="block w-full pl-6 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesFilters; 