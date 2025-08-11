import React from 'react';

const BillingStats = ({ stats, loading }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    const isNegative = amount < 0;
    const absValue = Math.abs(amount);
    const formatted = `₹${absValue.toLocaleString()}`;
    return isNegative ? `-${formatted}` : formatted;
  };

  const getRevenueColor = (revenue) => {
    if (revenue === null || revenue === undefined) return 'text-gray-600';
    return revenue < 0 ? 'text-red-600' : 'text-green-600';
  };

  // Calculate percentage changes (simulating month-over-month comparison)
  const calculatePercentageChange = (currentValue, previousValue = 0) => {
    if (previousValue === 0) return currentValue > 0 ? '+12.5%' : '0%';
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const getChangeType = (currentValue, previousValue = 0) => {
    if (previousValue === 0) return currentValue > 0 ? 'positive' : 'neutral';
    const change = currentValue - previousValue;
    return change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  };

  const billingMetrics = [
    {
      name: 'Total Commission',
      value: formatCurrency(stats?.totalCommission || 0),
      change: calculatePercentageChange(stats?.totalCommission || 0, (stats?.totalCommission || 0) * 0.89), // Simulate 11% increase
      changeType: getChangeType(stats?.totalCommission || 0, (stats?.totalCommission || 0) * 0.89),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: getRevenueColor(stats?.totalCommission),
      bgColor: (stats?.totalCommission || 0) < 0 ? 'bg-red-50' : 'bg-green-50',
      iconBg: (stats?.totalCommission || 0) < 0 ? 'bg-red-500' : 'bg-green-500',
      hoverBg: (stats?.totalCommission || 0) < 0 ? 'hover:bg-red-100' : 'hover:bg-green-100'
    },
    {
      name: 'Pending Bills',
      value: stats?.pendingBills || 0,
      change: calculatePercentageChange(stats?.pendingBills || 0, Math.max((stats?.pendingBills || 0) - 2, 0)), // Simulate some decrease
      changeType: getChangeType(stats?.pendingBills || 0, Math.max((stats?.pendingBills || 0) - 2, 0)),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      hoverBg: 'hover:bg-blue-100'
    },
    {
      name: 'Total Weight',
      value: `${(stats?.totalWeight || 0).toLocaleString()} kg`,
      change: calculatePercentageChange(stats?.totalWeight || 0, (stats?.totalWeight || 0) * 0.88), // Simulate 12% increase
      changeType: getChangeType(stats?.totalWeight || 0, (stats?.totalWeight || 0) * 0.88),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-500',
      hoverBg: 'hover:bg-purple-100'
    },
    {
      name: 'Average Commission',
      value: `₹${(stats?.averageCommission || 0).toFixed(2)}`,
      change: calculatePercentageChange(stats?.averageCommission || 0, (stats?.averageCommission || 0) * 0.94), // Simulate 6% increase
      changeType: getChangeType(stats?.averageCommission || 0, (stats?.averageCommission || 0) * 0.94),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-500',
      hoverBg: 'hover:bg-orange-100'
    }
  ];

  const getChangeColor = (changeType) => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-600'; // neutral
  };

  const getChangeBgColor = (changeType) => {
    if (changeType === 'positive') return 'bg-green-50';
    if (changeType === 'negative') return 'bg-red-50';
    return 'bg-gray-50'; // neutral
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {billingMetrics.map((metric, index) => (
        <div
          key={metric.name}
          className={`animate-slideUp bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-md ${metric.hoverBg}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-8 h-8 ${metric.iconBg} rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 hover:scale-110`}>
              <div className="text-white">
                {metric.icon}
              </div>
            </div>
            <div className={`text-xs font-medium ${getChangeColor(metric.changeType)} ${getChangeBgColor(metric.changeType)} px-2 py-1 rounded-full`}>
              {metric.change}
            </div>
          </div>
          
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">{metric.name}</p>
            <p className={`text-lg font-bold ${metric.color} transition-colors duration-300`}>
              {metric.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BillingStats; 