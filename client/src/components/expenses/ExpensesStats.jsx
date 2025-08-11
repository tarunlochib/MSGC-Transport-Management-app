import React, { useState, useEffect } from 'react';

const ExpensesStats = ({ stats }) => {
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    thisMonth: 0,
    fuel: 0,
    maintenance: 0,
    toll: 0
  });

  useEffect(() => {
    const animateValue = (start, end, duration, callback) => {
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (end - start) * progress;
        callback(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    // Animate each stat with staggered timing
    animateValue(0, stats.total, 1500, (value) => setAnimatedStats(prev => ({ ...prev, total: value })));
    setTimeout(() => animateValue(0, stats.thisMonth, 1200, (value) => setAnimatedStats(prev => ({ ...prev, thisMonth: value })), 200));
    setTimeout(() => animateValue(0, stats.fuel, 1000, (value) => setAnimatedStats(prev => ({ ...prev, fuel: value })), 400));
    setTimeout(() => animateValue(0, stats.maintenance, 1000, (value) => setAnimatedStats(prev => ({ ...prev, maintenance: value })), 600));
    setTimeout(() => animateValue(0, stats.toll, 1000, (value) => setAnimatedStats(prev => ({ ...prev, toll: value })), 800));
  }, [stats]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const getPercentageChange = (current, total) => {
    if (total === 0) return 0;
    return ((current / total) * 100).toFixed(1);
  };

  const StatCard = ({ title, value, percentage, icon, color, delay, gradient }) => (
    <div 
      className={`group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 h-32`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative p-4 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-lg font-bold text-gray-900 mb-1">
              {formatCurrency(value)}
            </p>
            <div className="flex items-center space-x-1">
              <div className={`w-1.5 h-1.5 ${color} rounded-full animate-pulse`}></div>
              <span className="text-xs text-gray-500">
                {getPercentageChange(value, stats.total)}% of total
              </span>
            </div>
          </div>
          
          <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
            {icon}
          </div>
        </div>
        
        {/* Animated progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className={`h-1 ${color} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${getPercentageChange(value, stats.total)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="animate-slideDown" style={{ animationDelay: '0ms' }}>
        <StatCard
          title="Total Expenses"
          value={animatedStats.total}
          percentage={100}
          icon={
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          color="bg-blue-500"
          gradient="bg-gradient-to-r from-blue-400 to-blue-600"
          delay={0}
        />
      </div>

      <div className="animate-slideDown" style={{ animationDelay: '100ms' }}>
        <StatCard
          title="This Month"
          value={animatedStats.thisMonth}
          percentage={getPercentageChange(stats.thisMonth, stats.total)}
          icon={
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="bg-green-500"
          gradient="bg-gradient-to-r from-green-400 to-green-600"
          delay={100}
        />
      </div>

      <div className="animate-slideDown" style={{ animationDelay: '200ms' }}>
        <StatCard
          title="Fuel Expenses"
          value={animatedStats.fuel}
          percentage={getPercentageChange(stats.fuel, stats.total)}
          icon={
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="bg-yellow-500"
          gradient="bg-gradient-to-r from-yellow-400 to-yellow-600"
          delay={200}
        />
      </div>

      <div className="animate-slideDown" style={{ animationDelay: '300ms' }}>
        <StatCard
          title="Maintenance"
          value={animatedStats.maintenance}
          percentage={getPercentageChange(stats.maintenance, stats.total)}
          icon={
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          color="bg-purple-500"
          gradient="bg-gradient-to-r from-purple-400 to-purple-600"
          delay={300}
        />
      </div>

      <div className="animate-slideDown" style={{ animationDelay: '400ms' }}>
        <StatCard
          title="Toll & Permits"
          value={animatedStats.toll}
          percentage={getPercentageChange(stats.toll, stats.total)}
          icon={
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          color="bg-red-500"
          gradient="bg-gradient-to-r from-red-400 to-red-600"
          delay={400}
        />
      </div>
    </div>
  );
};

export default ExpensesStats; 