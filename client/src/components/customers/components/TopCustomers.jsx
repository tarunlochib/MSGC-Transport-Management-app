    import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from 'react-countup';

const TopCustomers = ({ customers, onCustomerSelect, showAll = false }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const gradientColors = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600'
  ];

  const formatWeight = (weight) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}T`;
    }
    return `${weight.toFixed(0)}kg`;
  };

  const CountUpNumber = ({ end, duration = 2, suffix = '', prefix = '' }) => {
    const countUpRef = useRef();
    const { start, reset } = useCountUp({
      ref: countUpRef,
      end,
      duration,
      suffix,
      prefix
    });

    useEffect(() => {
      start();
    }, [start]);

    return <span ref={countUpRef}></span>;
  };

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 5 Customers</h2>
        <p className="text-gray-600">Leading customers by total weight booked</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {customers.map((customer, index) => (
          <motion.div
            key={customer.id}
            variants={cardVariants}
            whileHover={{ 
              y: -2,
              transition: { duration: 0.2 }
            }}
            onClick={() => onCustomerSelect(customer)}
            className={`relative bg-gradient-to-br ${gradientColors[index]} rounded-lg p-4 text-white cursor-pointer shadow-sm hover:shadow-md transition-all duration-200`}
          >
            {/* Rank Badge */}
            <div className="absolute top-3 right-3 w-6 h-6 bg-white bg-opacity-25 rounded-full flex items-center justify-center text-xs font-semibold">
              {index + 1}
            </div>

            {/* Customer Info */}
            <div className="pr-8">
              <h3 className="text-sm font-bold mb-1 truncate" title={customer.name}>
                {customer.name}
              </h3>
              <p className="text-xs opacity-80 truncate mb-3" title={customer.gstNumber}>
                {customer.gstNumber}
              </p>

              {/* Key Metrics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-90">Weight</span>
                  <span className="font-bold text-sm">
                    <CountUpNumber end={customer.totalWeight} suffix="kg" />
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-90">Bookings</span>
                  <span className="font-semibold text-sm">
                    <CountUpNumber end={customer.totalBookings} />
                  </span>
                </div>

                {customer.mostUsedTransport && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-90">Transport</span>
                    <span className="text-xs font-medium truncate ml-2" title={customer.mostUsedTransport}>
                      {customer.mostUsedTransport}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Weight</p>
              <p className="text-lg font-bold text-gray-900">
                <CountUpNumber 
                  end={customers.reduce((sum, c) => sum + c.totalWeight, 0)} 
                  suffix="kg" 
                />
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Bookings</p>
              <p className="text-lg font-bold text-gray-900">
                <CountUpNumber 
                  end={customers.reduce((sum, c) => sum + c.totalBookings, 0)} 
                />
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Top Customers</p>
              <p className="text-lg font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TopCustomers;
