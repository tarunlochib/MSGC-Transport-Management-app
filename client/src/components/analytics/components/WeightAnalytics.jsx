import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const WeightAnalytics = ({ data, period }) => {
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loadingWeightData, setLoadingWeightData] = useState(false);
  const [dataInfo, setDataInfo] = useState(null);

  // Generate months for the selected year
  const months = useMemo(() => {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return monthNames.map((name, index) => ({
      value: index + 1,
      label: name
    }));
  }, []);

  // Generate days for the selected month
  const days = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [selectedYear, selectedMonth]);

  // Color palette for transporters
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  // State for weight analytics data
  const [weightAnalyticsData, setWeightAnalyticsData] = useState(null);

  // Fetch real weight data from API
  useEffect(() => {
    const fetchWeightData = async () => {
      setLoadingWeightData(true);
      try {
        const response = await fetch(`/api/analytics/weight?viewMode=${viewMode}&year=${selectedYear}&month=${selectedMonth}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setWeightAnalyticsData(data);
          
          // Check if data is from a different year than requested
          if (data.actualYear && data.actualYear !== selectedYear) {
            setDataInfo({
              message: `No data found for ${selectedYear}. Showing data from ${data.actualYear} instead.`,
              actualYear: data.actualYear,
              requestedYear: selectedYear
            });
          } else {
            setDataInfo(null);
          }
        } else {
          console.error('Failed to fetch weight data');
        }
      } catch (error) {
        console.error('Error fetching weight data:', error);
      } finally {
        setLoadingWeightData(false);
      }
    };

    fetchWeightData();
  }, [viewMode, selectedYear, selectedMonth]);

  // Process real weight data by transporter
  const weightData = useMemo(() => {
    if (!weightAnalyticsData?.data) return null;


    const transporters = weightAnalyticsData.transporters || [];
    const rawData = weightAnalyticsData.data;
    
    if (viewMode === 'monthly') {
      // Process monthly data
      const monthlyData = transporters.map((transporterName, index) => {
        const monthlyWeights = months.map((_, monthIndex) => {
          const month = monthIndex + 1;
          return rawData[month]?.[transporterName] || 0;
        });
        
        return {
          name: transporterName,
          data: monthlyWeights,
          color: colors[index % colors.length]
        };
      });

      return {
        labels: months.map(m => m.label),
        datasets: monthlyData.map((transporter) => ({
          label: transporter.name,
          data: transporter.data,
          borderColor: transporter.color,
          backgroundColor: transporter.color + '20',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: transporter.color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }))
      };
    } else {
      // Process daily data
      const dailyData = transporters.map((transporterName, index) => {
        const dailyWeights = days.map((_, dayIndex) => {
          const day = dayIndex + 1;
          return rawData[day]?.[transporterName] || 0;
        });
        
        return {
          name: transporterName,
          data: dailyWeights,
          color: colors[index % colors.length]
        };
      });

      return {
        labels: days.map(d => `${d}`),
        datasets: dailyData.map((transporter) => ({
          label: transporter.name,
          data: transporter.data,
          borderColor: transporter.color,
          backgroundColor: transporter.color + '20',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: transporter.color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }))
      };
    }
  }, [weightAnalyticsData, viewMode, selectedYear, selectedMonth, months, days, colors]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            weight: '500'
          },
          color: '#374151',
          boxWidth: 12,
          boxHeight: 12
        }
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        callbacks: {
          title: function(context) {
            return viewMode === 'monthly' 
              ? `Month: ${context[0].label}` 
              : `Day ${context[0].label}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} kg`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: viewMode === 'monthly' ? 'Months' : 'Days',
          color: '#6B7280',
          font: {
            size: 12,
            weight: '500'
          }
        },
        grid: {
          display: true,
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Weight (kg)',
          color: '#6B7280',
          font: {
            size: 12,
            weight: '500'
          }
        },
        grid: {
          display: true,
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          },
          callback: function(value) {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k kg';
            }
            return value.toLocaleString() + ' kg';
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        hoverBackgroundColor: '#fff'
      }
    }
  };

  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Ultra Modern Header with Glass Effect */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-8 py-6">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">⚖️</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Weight Analytics</h3>
              <p className="text-blue-100 text-sm">Real-time weight distribution by transporter</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Live Data</span>
            </div>
            <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Data Info Banner - Ultra Modern Design */}
        {dataInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center gap-4 shadow-sm"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">{dataInfo.message}</p>
            </div>
            <button
              onClick={() => setSelectedYear(dataInfo.actualYear)}
              className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors duration-200 shadow-sm"
            >
              Switch to {dataInfo.actualYear}
            </button>
          </motion.div>
        )}

        {/* Clean Modern Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-4 mb-6 relative z-20"
        >
          {/* Balanced View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                viewMode === 'monthly'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <div className="w-5 h-5 rounded-md flex items-center justify-center bg-blue-100">
                <span className="text-sm">📅</span>
              </div>
              Monthly
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                viewMode === 'daily'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <div className="w-5 h-5 rounded-md flex items-center justify-center bg-blue-100">
                <span className="text-sm">📊</span>
              </div>
              Daily
            </button>
          </div>

          {/* Year Selector for Monthly View - Matching Toggle Size */}
          {viewMode === 'monthly' && (
            <motion.div 
              className="flex items-center gap-2 bg-orange-100 rounded-lg px-3 py-2 shadow-sm border border-orange-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="w-5 h-5 rounded-md bg-orange-500 flex items-center justify-center">
                <span className="text-white text-sm">📆</span>
              </div>
              <span className="text-sm font-medium text-orange-900">Year</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1.5 text-sm font-medium bg-white border border-orange-400 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none cursor-pointer transition-all duration-200"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </motion.div>
          )}

          {/* Month and Year Selectors for Daily View - Matching Toggle Size */}
          {viewMode === 'daily' && (
            <>
              <motion.div 
                className="flex items-center gap-2 bg-indigo-100 rounded-lg px-3 py-2 shadow-sm border border-indigo-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center">
                  <span className="text-white text-sm">📅</span>
                </div>
                <span className="text-sm font-medium text-indigo-900">Month</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-1.5 text-sm font-medium bg-white border border-indigo-400 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none cursor-pointer transition-all duration-200"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-2 bg-emerald-100 rounded-lg px-3 py-2 shadow-sm border border-emerald-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-sm">📆</span>
                </div>
                <span className="text-sm font-medium text-emerald-900">Year</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-1.5 text-sm font-medium bg-white border border-emerald-400 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none cursor-pointer transition-all duration-200"
                >
                  {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Ultra Modern Chart Container */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 shadow-inner border border-gray-200/50">
          <div className="h-96">
            {loadingWeightData ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto mb-4"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                  <p className="text-gray-600 font-medium">Loading weight data...</p>
                  <p className="text-gray-500 text-sm mt-1">Fetching real-time analytics</p>
                </div>
              </div>
            ) : weightData ? (
              <Line data={weightData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📊</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-700">No weight data available</p>
                  <p className="text-sm text-gray-500 mt-1">No bookings found for the selected period</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ultra Modern Transporter Performance Cards */}
        {weightAnalyticsData?.transporters && weightAnalyticsData.transporters.length > 0 && (
          <div className="space-y-6">
            {/* Enhanced Header */}
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Transporter Performance</h4>
                <p className="text-sm text-gray-500">Market share and weight distribution analysis</p>
              </div>
            </motion.div>

            {/* Modern Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(() => {
                // First, calculate weights for all transporters and sort them by weight (highest first)
                const transportersWithWeights = weightAnalyticsData.transporters.map(transporterName => {
                  const totalWeight = viewMode === 'monthly' 
                    ? Object.values(weightAnalyticsData.data).reduce((sum, monthData) => sum + (monthData[transporterName] || 0), 0)
                    : Object.values(weightAnalyticsData.data).reduce((sum, dayData) => sum + (dayData[transporterName] || 0), 0);
                  return { name: transporterName, weight: totalWeight };
                }).sort((a, b) => b.weight - a.weight); // Sort by weight descending
                
                // Calculate total weight across ALL transporters
                const totalWeightAll = transportersWithWeights.reduce((sum, transporter) => sum + transporter.weight, 0);
                
                return transportersWithWeights.map((transporter, index) => {
                  const { name: transporterName, weight: totalWeight } = transporter;
                  const rank = index + 1; // Rank is now simply the index + 1 since we're already sorted
                  
                  // Calculate market share percentage
                  const marketShare = totalWeightAll > 0 ? (totalWeight / totalWeightAll) * 100 : 0;
                
                return (
                  <motion.div
                    key={transporterName}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: index * 0.1, 
                      duration: 0.5,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      y: -5,
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden"
                  >
                    {/* Gradient Background Overlay */}
                    <div 
                      className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                      style={{ 
                        background: `linear-gradient(135deg, ${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]})`
                      }}
                    ></div>
                    
                    {/* Rank Badge */}
                    <div className="relative flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        >
                          #{rank}
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 font-medium">Market Share</div>
                        <div className="text-base font-semibold text-gray-700">{marketShare.toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* Transporter Name */}
                    <div className="relative mb-4">
                      <h5 className="text-base font-semibold text-gray-800 truncate mb-2 group-hover:text-gray-700 transition-colors">
                        {transporterName}
                      </h5>
                      <div className="text-2xl font-bold text-gray-700 group-hover:text-gray-600 transition-colors">
                        {totalWeight.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
                      </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="relative mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Performance</span>
                        <span className="text-xs font-semibold text-gray-700">{marketShare.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          className="h-2 rounded-full relative"
                          initial={{ width: 0 }}
                          animate={{ width: `${marketShare}%` }}
                          transition={{ 
                            duration: 1,
                            delay: index * 0.1 + 0.5,
                            ease: "easeOut"
                          }}
                          style={{ 
                            background: `linear-gradient(90deg, ${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]})`
                          }}
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Enhanced Footer */}
                    <div className="relative flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-500 font-normal">
                          {viewMode === 'monthly' ? '12 months' : `${days.length} days`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-gray-500 font-normal">Active</span>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  </motion.div>
                );
                });
              })()}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WeightAnalytics;