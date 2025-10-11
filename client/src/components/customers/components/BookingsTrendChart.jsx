import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const BookingsTrendChart = ({ data, timeRange }) => {
  const [chartType, setChartType] = useState('line'); // line, bar
  const [metricType, setMetricType] = useState('weight'); // weight, bookings

  // Debug logging
  useEffect(() => {
    console.log('BookingsTrendChart - Data changed:', data);
    console.log('BookingsTrendChart - TimeRange changed:', timeRange);
  }, [data, timeRange]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get all unique months from all customers with their dates
    const monthMap = new Map();
    data.forEach(customer => {
      customer.data.forEach(item => {
        if (!monthMap.has(item.month)) {
          monthMap.set(item.month, item.date || new Date(item.month));
        }
      });
    });

    // Sort months chronologically by date
    const months = Array.from(monthMap.keys()).sort((a, b) => {
      const dateA = monthMap.get(a);
      const dateB = monthMap.get(b);
      return new Date(dateA) - new Date(dateB);
    });

    // Create chart data structure
    const chartData = months.map(month => {
      const monthData = { month };
      
      data.forEach(customer => {
        const customerMonthData = customer.data.find(item => item.month === month);
        if (customerMonthData) {
          monthData[customer.customerName] = metricType === 'weight' 
            ? customerMonthData.weight 
            : customerMonthData.bookings;
        } else {
          monthData[customer.customerName] = 0;
        }
      });

      return monthData;
    });

    return chartData;
  }, [data, metricType]);

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-700">
                {entry.dataKey}: {entry.value.toLocaleString()}
                {metricType === 'weight' ? 'kg' : ' bookings'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxisLabel = (value) => {
    if (metricType === 'weight') {
      return value >= 1000 ? `${(value / 1000).toFixed(1)}T` : `${value}kg`;
    }
    return value;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Monthly Bookings Trend</h3>
          <p className="text-sm text-gray-600">Top 10 customers performance over time</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Chart Type Toggle */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Chart:</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                  chartType === 'line'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                  chartType === 'bar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Bar
              </button>
            </div>
          </div>

          {/* Metric Type Toggle */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Metric:</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMetricType('weight')}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                  metricType === 'weight'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Weight
              </button>
              <button
                onClick={() => setMetricType('bookings')}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                  metricType === 'bookings'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Bookings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxisLabel}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {data?.slice(0, 10).map((customer, index) => (
                <Line
                  key={customer.customerName}
                  type="monotone"
                  dataKey={customer.customerName}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxisLabel}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {data?.slice(0, 10).map((customer, index) => (
                <Bar
                  key={customer.customerName}
                  dataKey={customer.customerName}
                  fill={colors[index % colors.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        {data?.slice(0, 10).map((customer, index) => (
          <div key={customer.customerName} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-xs text-gray-600 truncate" title={customer.customerName}>
              {customer.customerName}
            </span>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {data?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Customers Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {chartData.length}
            </div>
            <div className="text-sm text-gray-600">Time Periods</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {metricType === 'weight' ? 'kg' : '#'}
            </div>
            <div className="text-sm text-gray-600">Metric Type</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingsTrendChart;
