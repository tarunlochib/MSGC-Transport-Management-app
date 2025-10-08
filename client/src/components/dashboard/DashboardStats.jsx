import React from 'react';

const DashboardStats = ({ stats, loading }) => {
  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.revenue?.toLocaleString() || '0'}`,
      change: stats?.revenueChange ? `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}%` : '0%',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      bgColor: 'bg-green-500',
      changeColor: stats?.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Total Income',
      value: `₹${stats?.income?.toLocaleString() || '0'}`,
      change: stats?.incomeChange ? `${stats.incomeChange >= 0 ? '+' : ''}${stats.incomeChange.toFixed(1)}%` : '0%',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      bgColor: 'bg-emerald-500',
      changeColor: stats?.incomeChange >= 0 ? 'text-emerald-600' : 'text-red-600'
    },
    {
      title: 'Total Bookings',
      value: stats?.bookings?.toString() || '0',
      change: stats?.bookingsChange ? `${stats.bookingsChange >= 0 ? '+' : ''}${stats.bookingsChange.toFixed(1)}%` : '0%',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bgColor: 'bg-blue-500',
      changeColor: stats?.bookingsChange >= 0 ? 'text-blue-600' : 'text-red-600'
    },
    {
      title: 'Active Vehicles',
      value: stats?.vehicles?.toString() || '0',
      change: stats?.vehiclesChange ? `${stats.vehiclesChange >= 0 ? '+' : ''}${stats.vehiclesChange.toFixed(1)}%` : '0%',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      bgColor: 'bg-purple-500',
      changeColor: stats?.vehiclesChange >= 0 ? 'text-purple-600' : 'text-red-600'
    },
    {
      title: 'Active Drivers',
      value: stats?.drivers?.toString() || '0',
      change: stats?.driversChange ? `${stats.driversChange >= 0 ? '+' : ''}${stats.driversChange.toFixed(1)}%` : '0%',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      bgColor: 'bg-indigo-500',
      changeColor: stats?.driversChange >= 0 ? 'text-indigo-600' : 'text-red-600'
    },
    {
      title: 'Total Customers',
      value: stats?.customers?.toString() || '0',
      change: stats?.customersChange ? `${stats.customersChange >= 0 ? '+' : ''}${stats.customersChange.toFixed(1)}%` : '0%',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-orange-500',
      changeColor: stats?.customersChange >= 0 ? 'text-orange-600' : 'text-red-600'
    }
  ];

  const getChangeIcon = (change) => {
    const isPositive = change.startsWith('+');
    return (
      <svg className={`w-3 h-3 ${isPositive ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 gap-3">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
          <p className="text-sm text-gray-600">Key performance metrics</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {statCards.map((card, index) => (
          <div
            key={card.title}
            className="group relative overflow-hidden rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:shadow-md animate-slideIn"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <div className="text-white">
                  {card.icon}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {getChangeIcon(card.change)}
                <span className={`text-xs font-medium ${card.changeColor}`}>
                  {card.change}
                </span>
              </div>
            </div>
            
            <div>
              <div className="text-base font-bold text-gray-900">
                {card.value}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {card.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats; 