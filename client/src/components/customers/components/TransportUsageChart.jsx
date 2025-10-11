import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const TransportUsageChart = ({ data, timeRange }) => {
  const [chartType, setChartType] = useState('pie'); // pie, bar
  const [showPercentage, setShowPercentage] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('TransportUsageChart - Data changed:', data);
    console.log('TransportUsageChart - TimeRange changed:', timeRange);
  }, [data, timeRange]);

  const getColor = (index) => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
      '#14B8A6', '#F43F5E', '#8B5A2B', '#1E40AF', '#7C3AED'
    ];
    return colors[index % colors.length];
  };

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item, index) => ({
      name: item.name,
      value: item.count,
      percentage: item.percentage,
      color: getColor(index)
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bookings:</span>
              <span className="text-sm font-medium text-gray-900">{data.value}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Percentage:</span>
              <span className="text-sm font-medium text-gray-900">{data.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {showPercentage ? `${(percent * 100).toFixed(0)}%` : name}
      </text>
    );
  };

  const totalBookings = data?.reduce((sum, item) => sum + item.count, 0) || 0;

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
          <h3 className="text-lg font-semibold text-gray-900">Transport Usage Breakdown</h3>
          <p className="text-sm text-gray-600">Distribution of bookings by transport type</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Chart Type Toggle */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Chart:</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('pie')}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                  chartType === 'pie'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pie
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

          {/* Label Type Toggle */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Labels:</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setShowPercentage(true)}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                  showPercentage
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                %
              </button>
              <button
                onClick={() => setShowPercentage(false)}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                  !showPercentage
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Names
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700 truncate" title={item.name}>
                {item.name}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {item.value} ({item.percentage.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {chartData.length}
            </div>
            <div className="text-sm text-gray-600">Transport Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {totalBookings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {chartData.length > 0 ? (totalBookings / chartData.length).toFixed(0) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg per Type</div>
          </div>
        </div>
      </div>

      {/* Top Performer */}
      {chartData.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">Top Performer</h4>
              <p className="text-sm text-gray-600">
                {chartData[0].name} leads with {chartData[0].percentage.toFixed(1)}% of all bookings
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{chartData[0].value}</div>
              <div className="text-sm text-gray-600">bookings</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TransportUsageChart;
