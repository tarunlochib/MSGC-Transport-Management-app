import React from 'react';
import { motion } from 'framer-motion';

const KPICards = ({ data, loading, error }) => {

  const kpiData = [
    {
      title: 'Total Revenue',
      value: data?.totalRevenue || 0,
      change: data?.revenueChange || 0,
      icon: '💰',
      gradient: 'from-emerald-600 to-teal-600',
      bgGradient: 'from-emerald-100 to-teal-100',
      textColor: 'text-emerald-800',
      borderColor: 'border-emerald-300',
      shadowColor: 'shadow-emerald-500/30'
    },
    {
      title: 'Total Bookings',
      value: data?.totalBookings || 0,
      change: data?.bookingsChange || 0,
      icon: '📦',
      gradient: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-100 to-cyan-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
      shadowColor: 'shadow-blue-500/30'
    },
    {
      title: 'Active Customers',
      value: data?.totalCustomers || 0,
      change: data?.customersChange || 0,
      icon: '👥',
      gradient: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-100 to-pink-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-300',
      shadowColor: 'shadow-purple-500/30'
    },
    {
      title: 'Total Weight (kg)',
      value: data?.totalWeight || 0,
      change: data?.weightChange || 0,
      icon: '⚖️',
      gradient: 'from-orange-600 to-red-600',
      bgGradient: 'from-orange-100 to-red-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-300',
      shadowColor: 'shadow-orange-500/30'
    }
  ];

  const formatValue = (value, title) => {
    if (title === 'Total Revenue') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (title === 'Total Weight (kg)') {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value) + ' kg';
    }
    return new Intl.NumberFormat('en-IN').format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-20 h-3 bg-gray-200 rounded"></div>
              <div className="w-24 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 font-medium text-sm">Error loading KPI data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {kpiData.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.1,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ 
            y: -4, 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          className={`relative bg-gradient-to-br ${kpi.bgGradient} rounded-lg border ${kpi.borderColor} p-4 hover:shadow-lg ${kpi.shadowColor} transition-all duration-300 group cursor-pointer w-full min-h-[120px] flex flex-col justify-between`}
        >
          {/* Animated background pattern */}
          <motion.div 
            className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.08)_1px,transparent_0)] bg-[length:8px_8px] opacity-40 rounded-lg"
            animate={{ 
              backgroundPosition: ["0px 0px", "8px 8px"],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <motion.div 
                className={`w-8 h-8 bg-gradient-to-br ${kpi.gradient} rounded-lg flex items-center justify-center text-lg shadow-md flex-shrink-0`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {kpi.icon}
              </motion.div>
              {kpi.change !== 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                    kpi.change > 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                  }`}
                >
                  <motion.svg 
                    className={`w-3 h-3 mr-1 ${kpi.change > 0 ? 'rotate-0' : 'rotate-180'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ y: kpi.change > 0 ? [-1, 1, -1] : [1, -1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </motion.svg>
                  {Math.abs(kpi.change)}%
                </motion.div>
              )}
            </div>
            
            <div className="flex flex-col justify-end flex-grow">
              <p className={`text-xs font-semibold ${kpi.textColor} uppercase tracking-wide mb-1`}>{kpi.title}</p>
              <motion.p 
                className="text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                {formatValue(kpi.value, kpi.title)}
              </motion.p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default KPICards;