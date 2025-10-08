import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueAnalytics = ({ data, period, dateRange }) => {
  const [chartType, setChartType] = useState('line');
  const [timeframe, setTimeframe] = useState('monthly');

  // Extract real data from props
  const topCustomers = data?.customers?.topCustomers || [];
  const transporterPerformance = data?.transporters?.performance || [];
  const revenueData = data?.revenue;

  // Debug logging

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            weight: '600'
          },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        intersect: false,
        mode: 'index',
        titleFont: {
          size: 11,
          weight: '600'
        },
        bodyFont: {
          size: 10
        },
        padding: 8,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ₹${value.toLocaleString()}`;
          },
          title: function(context) {
            const label = context[0].label;
            const date = new Date(label);
            
            if (timeframe === 'daily') {
              return date.toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
            }
            
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10,
            weight: '500'
          },
          color: '#6B7280',
          callback: function(value, index, ticks) {
            // Clean date formatting for daily view
            const label = this.getLabelForValue(value);
            const date = new Date(label);
            
            // For daily view, show clean format like "1 Oct", "2 Oct", "3 Nov"
            if (timeframe === 'daily') {
              return date.toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short' 
              });
            }
            
            return label;
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 10,
            weight: '500'
          },
          color: '#6B7280',
          callback: function(value) {
            return `₹${value.toLocaleString()}`;
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        hoverBackgroundColor: '#FFFFFF',
        hoverBorderWidth: 3
      }
    }
  };

  const chartData = useMemo(() => {
    if (!revenueData) return null;

    const baseData = timeframe === 'monthly' ? revenueData.monthly : revenueData.daily;
    
    // Check if we have valid data for the selected timeframe
    if (!baseData || !Array.isArray(baseData) || baseData.length === 0) {
      return null;
    }
    
    return {
      labels: baseData.map(item => item.period),
      datasets: [
        {
          label: 'Revenue',
          data: baseData.map(item => item.revenue || 0),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: chartType === 'line' 
            ? 'rgba(99, 102, 241, 0.1)' 
            : 'rgba(99, 102, 241, 0.8)',
          borderWidth: 3,
          fill: chartType === 'line',
          tension: 0.4,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: 'white',
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 10,
          pointHoverBackgroundColor: 'rgb(99, 102, 241)',
          pointHoverBorderColor: 'white',
          pointHoverBorderWidth: 3,
        },
        {
          label: 'Expenses',
          data: baseData.map(item => item.expenses || 0),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: chartType === 'line' 
            ? 'rgba(239, 68, 68, 0.1)' 
            : 'rgba(239, 68, 68, 0.8)',
          borderWidth: 3,
          fill: chartType === 'line',
          tension: 0.4,
          pointBackgroundColor: 'rgb(239, 68, 68)',
          pointBorderColor: 'white',
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 10,
          pointHoverBackgroundColor: 'rgb(239, 68, 68)',
          pointHoverBorderColor: 'white',
          pointHoverBorderWidth: 3,
        },
        {
          label: 'Profit',
          data: baseData.map(item => item.profit || 0),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: chartType === 'line' 
            ? 'rgba(16, 185, 129, 0.1)' 
            : 'rgba(16, 185, 129, 0.8)',
          borderWidth: 3,
          fill: chartType === 'line',
          tension: 0.4,
          pointBackgroundColor: 'rgb(16, 185, 129)',
          pointBorderColor: 'white',
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 10,
          pointHoverBackgroundColor: 'rgb(16, 185, 129)',
          pointHoverBorderColor: 'white',
          pointHoverBorderWidth: 3,
        }
      ]
    };
  }, [data, timeframe, chartType]);

  const topRoutes = useMemo(() => {
    if (!data?.byRoute) return [];
    return data.byRoute
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [data]);

  const topTransporters = useMemo(() => {
    if (!data?.byTransporter) return [];
    return data.byTransporter
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [data]);

  if (!data) {
    return (
      <div className="relative bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-2xl shadow-lg border border-indigo-200/40 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-lg w-1/3 mb-4"></div>
          <div className="h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="relative bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 rounded-xl shadow-lg border border-indigo-200/30 p-4 overflow-hidden"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.05)_1px,transparent_0)] bg-[length:16px_16px] opacity-40"></div>
      
      {/* Compact Header */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-800 to-purple-800 bg-clip-text text-transparent">
              Revenue Analytics
            </h3>
            <p className="text-xs text-indigo-600 font-medium">Revenue trends and performance insights</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${
              chartType === 'line'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-white/80 text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            📈 Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${
              chartType === 'bar'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-white/80 text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            📊 Bar
          </button>
        </div>
      </div>

      {/* Compact Timeframe Selector */}
      <div className="relative flex items-center space-x-2 mb-4">
        <div className="flex items-center space-x-1.5">
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
          <span className="text-xs font-semibold text-indigo-800">View:</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${
              timeframe === 'monthly'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/80 text-purple-700 border border-purple-200 hover:bg-purple-50'
            }`}
          >
            📅 Monthly
          </button>
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${
              timeframe === 'daily'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/80 text-purple-700 border border-purple-200 hover:bg-purple-50'
            }`}
          >
            📆 Daily
          </button>
        </div>
      </div>

      {/* Compact Chart Container */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-200/30 shadow-md">
        <div className="h-96">
          {chartData ? (
            <div className="w-full h-full relative">
              {chartType === 'line' ? (
                <Line 
                  data={chartData} 
                  options={chartOptions}
                  style={{ width: '100%', height: '384px' }}
                />
              ) : (
                <Bar 
                  data={chartData} 
                  options={chartOptions}
                  style={{ width: '100%', height: '384px' }}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="text-base font-semibold text-gray-700 mb-2">No Data Available</h3>
                <p className="text-gray-500 text-xs">
                  {timeframe === 'daily' 
                    ? 'No daily data available for the selected period. Try switching to monthly view.' 
                    : 'No data available for the selected period.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact Business Metrics Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Customers by Weight */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/30 shadow-md"
        >
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-gray-900">Top Consignors by Weight</h4>
          </div>
          <div className="space-y-2">
            {topCustomers.slice(0, 5).map((customer, index) => (
              <motion.div 
                key={customer.id || customer.name} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200/30 hover:shadow-sm transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-xs text-blue-600 font-medium">{customer.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">{customer.weight?.toLocaleString() || '0'} kg</p>
                  <p className="text-xs text-blue-600 font-semibold">₹{customer.revenue?.toLocaleString() || '0'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Revenue by Transporter */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/30 shadow-md"
        >
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-gray-900">Revenue by Transporter</h4>
          </div>
          <div className="space-y-2">
            {transporterPerformance.slice(0, 5).map((transporter, index) => (
              <motion.div 
                key={transporter.id || transporter.name} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200/30 hover:shadow-sm transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{transporter.name}</p>
                    <p className="text-xs text-emerald-600 font-medium">{transporter.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹{transporter.revenue?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-emerald-600 font-semibold">{transporter.weight?.toLocaleString() || '0'} kg</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RevenueAnalytics;
