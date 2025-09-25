import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TransporterWeightContribution = ({ transporters, bookings, loading }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Calculate weight contribution for each transporter
  const calculateTransporterWeights = () => {
    if (!transporters || !bookings) return [];

    // Filter bookings by selected month
    const [year, month] = selectedMonth.split('-').map(Number);
    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate.getFullYear() === year && bookingDate.getMonth() === month - 1;
    });

    return transporters.map(transporter => {
      const transporterBookings = filteredBookings.filter(booking => booking.transporterId === transporter.id);
      const totalWeight = transporterBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
      const totalBookings = transporterBookings.length;
      const totalRevenue = transporterBookings.reduce((sum, booking) => {
        const commissionAmount = (booking.weightKg || 0) * (transporter.commissionRate || 0);
        const localCartage = booking.localCartageCharges || 0;
        return sum + commissionAmount + localCartage;
      }, 0);

      return {
        ...transporter,
        totalWeight,
        totalBookings,
        totalRevenue,
        averageWeight: totalBookings > 0 ? totalWeight / totalBookings : 0
      };
    }).sort((a, b) => b.totalWeight - a.totalWeight); // Sort by weight descending
  };

  const transporterWeights = calculateTransporterWeights();
  const totalSystemWeight = transporterWeights.reduce((sum, t) => sum + t.totalWeight, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!transporterWeights || transporterWeights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Transporters</h3>
          <p className="mt-1 text-sm text-gray-500">Add transporters to see weight contributions.</p>
          <div className="mt-4">
            <Link
              to="/transporters/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Transporter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            Weight Contribution by Transporter
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Total system weight: <span className="font-semibold text-gray-900">{totalSystemWeight.toLocaleString()} kg</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Month Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
            >
              {(() => {
                const months = [];
                const now = new Date();
                for (let i = 0; i < 12; i++) {
                  const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                  months.push(
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                }
                return months;
              })()}
            </select>
          </div>
          <Link
            to="/transporters"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {transporterWeights.map((transporter, index) => {
          const percentage = totalSystemWeight > 0 ? (transporter.totalWeight / totalSystemWeight) * 100 : 0;
          const colors = [
            'from-blue-500 to-blue-600',
            'from-green-500 to-green-600', 
            'from-purple-500 to-purple-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
            'from-indigo-500 to-indigo-600',
            'from-red-500 to-red-600',
            'from-teal-500 to-teal-600'
          ];
          const bgColors = [
            'from-blue-50 to-blue-100',
            'from-green-50 to-green-100',
            'from-purple-50 to-purple-100', 
            'from-orange-50 to-orange-100',
            'from-pink-50 to-pink-100',
            'from-indigo-50 to-indigo-100',
            'from-red-50 to-red-100',
            'from-teal-50 to-teal-100'
          ];
          const colorClass = colors[index % colors.length];
          const bgColorClass = bgColors[index % bgColors.length];

          return (
            <Link
              key={transporter.id}
              to={`/transporters/${transporter.id}`}
              className="group relative overflow-hidden bg-white rounded-lg border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${bgColorClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className="relative p-4">
                {/* Header with icon and rank */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center shadow-sm`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Transporter name */}
                <h4 className="text-sm font-semibold text-gray-900 mb-2 truncate" title={transporter.name}>
                  {transporter.name}
                </h4>

                {/* Weight and percentage */}
                <div className="mb-3">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {transporter.totalWeight.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">kg</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Bookings:</span>
                    <span className="font-medium text-gray-900">{transporter.totalBookings}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Avg Weight:</span>
                    <span className="font-medium text-gray-900">{transporter.averageWeight.toFixed(0)} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Revenue:</span>
                    <span className="font-medium text-gray-900">₹{transporter.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

                {/* Commission rate */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Commission:</span>
                    <span className="font-medium text-gray-900">{transporter.commissionRate}₹/kg</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Summary stats */}
      {transporterWeights.length > 1 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Active Transporters */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{transporterWeights.length}</div>
                <div className="text-xs text-gray-500 font-medium">Active Transporters</div>
              </div>
            </div>

            {/* Avg Weight */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {transporterWeights.length > 0 ? (totalSystemWeight / transporterWeights.length).toFixed(0) : 0} kg
                </div>
                <div className="text-xs text-gray-500 font-medium">Avg Weight</div>
              </div>
            </div>

            {/* Top Contributor */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-bold text-gray-900 truncate" title={transporterWeights.length > 0 ? transporterWeights[0].name : 'N/A'}>
                  {transporterWeights.length > 0 ? transporterWeights[0].name : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 font-medium">Top Contributor</div>
              </div>
            </div>

            {/* Performance Indicator */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {transporterWeights.length > 0 ? transporterWeights[0].totalWeight.toLocaleString() : 0} kg
                </div>
                <div className="text-xs text-gray-500 font-medium">Leading Weight</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransporterWeightContribution;
