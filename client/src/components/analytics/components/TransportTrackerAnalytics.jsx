import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../../../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const TransportTrackerAnalytics = () => {
  const [selectedView, setSelectedView] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customMonth, setCustomMonth] = useState(new Date().getMonth() + 1);
  const [customYear, setCustomYear] = useState(new Date().getFullYear());

  // Fetch data function
  const fetchData = async () => {
    try {
      setError(null);
      // Add small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 150));
      setLoading(true);
      
      let params = { period: selectedPeriod };
      
      // Handle custom month/year selection
      if (selectedPeriod === 'custom') {
        const startDate = new Date(customYear, customMonth - 1, 1);
        const endDate = new Date(customYear, customMonth, 0);
        params = {
          period: 'custom',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
      }
      
      const response = await api.get('/analytics', { params });
      
      setData(response.data);
    } catch (err) {
      console.error('Error fetching consignment data:', err);
      setError('Failed to load consignment data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data based on selected period (but not for custom until Apply is clicked)
  useEffect(() => {
    if (selectedPeriod !== 'custom') {
      fetchData();
    }
  }, [selectedPeriod]);

  // Helper function to determine activity limit based on actual data and period
  const getActivityLimit = () => {
    if (!transportData?.daily || transportData.daily.length === 0) {
      return 10; // Default fallback
    }

    const totalDays = transportData.daily.length;
    
    // Dynamic limits based on actual data availability and period
    switch (selectedPeriod) {
      case 'last7days':
        return Math.min(7, totalDays);
      case 'last30days':
        return Math.min(30, totalDays);
      case 'currentMonth':
      case 'lastMonth':
        return Math.min(31, totalDays); // Max days in a month
      case 'currentYear':
      case 'lastYear':
        return Math.min(100, totalDays); // Show more for yearly view
      case 'last90days':
        return Math.min(90, totalDays);
      case 'custom':
        return Math.min(31, totalDays); // Max days in a month
      default:
        // Smart default based on data size
        if (totalDays <= 7) return totalDays;
        if (totalDays <= 30) return Math.min(15, totalDays);
        if (totalDays <= 90) return Math.min(30, totalDays);
        return Math.min(50, totalDays);
    }
  };

  // Helper function to format weight with smart unit conversion
  const formatWeight = (weight) => {
    if (weight >= 100000) {
      const tons = (weight / 1000).toFixed(1);
      return `${tons} T`;
    } else if (weight >= 1000) {
      const kg = (weight / 1000).toFixed(1);
      return `${kg}K kg`;
    } else {
      return `${weight.toLocaleString()} kg`;
    }
  };

  // Process challan data for transport tracking
  const transportData = useMemo(() => {
    
    if (!data?.challans) {
      console.log('TransportTrackerAnalytics - No challans data available');
      return null;
    }

    // Group challans by date
    const dailyTransport = {};
    const transporterStats = {};
    const routeStats = {};
    const godownStats = {};

    data.challans.forEach(challan => {
      const challanDate = new Date(challan.createdAt).toISOString().split('T')[0];
      
      // Daily transport data
      if (!dailyTransport[challanDate]) {
        dailyTransport[challanDate] = {
          date: challanDate,
          totalChallans: 0,
          totalWeight: 0,
          totalCharges: 0,
          delivered: 0,
          inTransit: 0,
          generated: 0,
          challans: []
        };
      }
      
      dailyTransport[challanDate].totalChallans += 1;
      dailyTransport[challanDate].totalWeight += challan.totalWeight || 0;
      dailyTransport[challanDate].totalCharges += challan.totalCharges || 0;
      dailyTransport[challanDate].challans.push(challan);
      
      // Status tracking
      if (challan.status === 'Delivered' || challan.status === 'Completed') {
        dailyTransport[challanDate].delivered += 1;
      } else if (challan.status === 'In Transit') {
        dailyTransport[challanDate].inTransit += 1;
      } else {
        dailyTransport[challanDate].generated += 1;
      }

      // Transporter stats
      const transporterId = challan.transportCompanyId;
      if (!transporterStats[transporterId]) {
        transporterStats[transporterId] = {
          id: transporterId,
          name: challan.transportCompany?.name || 'Unknown',
          totalChallans: 0,
          totalWeight: 0,
          totalCharges: 0,
          delivered: 0,
          inTransit: 0
        };
      }
      
      transporterStats[transporterId].totalChallans += 1;
      transporterStats[transporterId].totalWeight += challan.totalWeight || 0;
      transporterStats[transporterId].totalCharges += challan.totalCharges || 0;
      
      if (challan.status === 'Delivered' || challan.status === 'Completed') {
        transporterStats[transporterId].delivered += 1;
      } else if (challan.status === 'In Transit') {
        transporterStats[transporterId].inTransit += 1;
      }

      // Route stats
      const route = `${challan.fromLocation} → ${challan.toLocation}`;
      if (!routeStats[route]) {
        routeStats[route] = {
          route,
          totalChallans: 0,
          totalWeight: 0,
          totalCharges: 0,
          delivered: 0,
          inTransit: 0
        };
      }
      
      routeStats[route].totalChallans += 1;
      routeStats[route].totalWeight += challan.totalWeight || 0;
      routeStats[route].totalCharges += challan.totalCharges || 0;
      
      if (challan.status === 'Delivered' || challan.status === 'Completed') {
        routeStats[route].delivered += 1;
      } else if (challan.status === 'In Transit') {
        routeStats[route].inTransit += 1;
      }
    });

    return {
      daily: Object.values(dailyTransport).sort((a, b) => new Date(b.date) - new Date(a.date)),
      transporters: Object.values(transporterStats).sort((a, b) => b.totalWeight - a.totalWeight),
      routes: Object.values(routeStats).sort((a, b) => b.totalWeight - a.totalWeight)
    };
  }, [data]);

  // Chart data for daily transport - Dynamic and responsive
  const dailyChartData = useMemo(() => {
    if (!transportData?.daily) return null;

    const totalDays = transportData.daily.length;
    
    // Dynamic days to show based on actual data and period
    let daysToShow;
    let dateFormat;
    
    switch (selectedPeriod) {
      case 'last7days':
        daysToShow = Math.min(7, totalDays);
        dateFormat = { weekday: 'short', day: 'numeric' };
        break;
      case 'last30days':
        daysToShow = Math.min(30, totalDays);
        dateFormat = { month: 'short', day: 'numeric' };
        break;
      case 'currentMonth':
      case 'lastMonth':
        daysToShow = Math.min(31, totalDays); // Max days in a month
        dateFormat = { month: 'short', day: 'numeric' };
        break;
      case 'currentYear':
      case 'lastYear':
        daysToShow = Math.min(365, totalDays);
        dateFormat = { month: 'short', day: 'numeric' };
        break;
      case 'last90days':
        daysToShow = Math.min(90, totalDays);
        dateFormat = { month: 'short', day: 'numeric' };
        break;
      case 'custom':
        daysToShow = Math.min(31, totalDays); // Max days in a month
        dateFormat = { month: 'short', day: 'numeric' };
        break;
      default:
        // Smart defaults based on data availability
        if (totalDays <= 7) {
          daysToShow = totalDays;
          dateFormat = { weekday: 'short', day: 'numeric' };
        } else if (totalDays <= 30) {
          daysToShow = Math.min(15, totalDays);
          dateFormat = { month: 'short', day: 'numeric' };
        } else if (totalDays <= 90) {
          daysToShow = Math.min(30, totalDays);
          dateFormat = { month: 'short', day: 'numeric' };
        } else {
          daysToShow = Math.min(50, totalDays);
          dateFormat = { month: 'short', day: 'numeric' };
        }
    }

    // Ensure we don't exceed available data
    daysToShow = Math.min(daysToShow, totalDays);
    const chartData = transportData.daily.slice(0, daysToShow).reverse();
    
    return {
      labels: chartData.map(day => {
        const date = new Date(day.date);
        return date.toLocaleDateString('en-IN', dateFormat);
      }),
      datasets: [
        {
          label: 'Weight (kg)',
          data: chartData.map(day => day.totalWeight),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Challans',
          data: chartData.map(day => day.totalChallans),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    };
  }, [transportData, selectedPeriod]);

  // Chart data for transporter performance - Dynamic based on data
  const transporterChartData = useMemo(() => {
    if (!transportData?.transporters) return null;

    const totalTransporters = transportData.transporters.length;
    // Dynamic limit based on available data
    const limit = Math.min(8, totalTransporters);
    const topTransporters = transportData.transporters.slice(0, limit);
    
    return {
      labels: topTransporters.map(t => t.name),
      datasets: [
        {
          label: 'Weight Transported (kg)',
          data: topTransporters.map(t => t.totalWeight),
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 2
        }
      ]
    };
  }, [transportData]);

  // Chart data for delivery status
  const statusData = useMemo(() => {
    if (!transportData?.daily) return null;

    const totalDelivered = transportData.daily.reduce((sum, day) => sum + day.delivered, 0);
    const totalInTransit = transportData.daily.reduce((sum, day) => sum + day.inTransit, 0);
    const totalGenerated = transportData.daily.reduce((sum, day) => sum + day.generated, 0);

    return {
      labels: ['Delivered', 'In Transit', 'Generated'],
      datasets: [
        {
          data: [totalDelivered, totalInTransit, totalGenerated],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(168, 85, 247, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(251, 146, 60)',
            'rgb(168, 85, 247)'
          ],
          borderWidth: 2
        }
      ]
    };
  }, [transportData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'Weight (kg)') {
              return `Weight: ${context.parsed.y.toLocaleString()} kg`;
            }
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Weight (kg)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Number of Challans'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-lg">📦</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Consignment Data</h3>
          <p className="text-gray-600">Fetching transport analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-lg">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-lg">📦</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Consignment Data</h3>
          <p className="text-gray-600">
            No challan data available for the selected period. Try selecting a different time period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 relative">
      {/* Loading Overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-lg flex items-center justify-center z-50"
        >
          <div className="flex flex-col items-center space-y-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
            />
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-gray-600 font-medium"
            >
              Loading data...
            </motion.p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">📦</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Consignment Tracking</h3>
            <p className="text-sm text-gray-500">
              {transportData?.daily && `${transportData.daily.length} days of data`}
              {selectedPeriod === 'custom' && ` • ${new Date(0, customMonth - 1).toLocaleString('default', { month: 'long' })} ${customYear}`}
            </p>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Period:</span>
          <div className="relative flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'last7days', label: '7D' },
              { key: 'last30days', label: '30D' },
              { key: 'currentMonth', label: 'This Month' },
              { key: 'lastMonth', label: 'Last Month' },
              { key: 'lastYear', label: 'Last Year' },
              { key: 'custom', label: 'Custom' }
            ].map((periodOption) => (
              <button
                key={periodOption.key}
                onClick={() => setSelectedPeriod(periodOption.key)}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 z-10 ${
                  selectedPeriod === periodOption.key
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {periodOption.label}
              </button>
            ))}
            {/* Sliding background */}
            <motion.div
              layoutId="activePeriod"
              className="absolute inset-y-1 bg-white rounded-md shadow-sm border border-blue-200"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          </div>
        </div>
      </div>

      {/* Custom Month/Year Selection */}
      <AnimatePresence>
        {selectedPeriod === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Select:</span>
                
                <select
                  value={customMonth}
                  onChange={(e) => setCustomMonth(parseInt(e.target.value))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>

                <select
                  value={customYear}
                  onChange={(e) => setCustomYear(parseInt(e.target.value))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>

                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Selector */}
      <div className="flex items-center space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'daily', label: 'Daily Consignments' },
          { key: 'transporters', label: 'Fleet Performance' },
          { key: 'status', label: 'Delivery Status' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedView(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedView === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border relative">
        {/* Chart Loading Overlay */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-20"
          >
            <div className="flex flex-col items-center space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
              />
              <p className="text-sm text-gray-600 font-medium">Loading chart...</p>
            </div>
          </motion.div>
        )}
        
        <div className="h-80">
          {selectedView === 'daily' && dailyChartData && (
            <Bar data={dailyChartData} options={chartOptions} />
          )}
          {selectedView === 'transporters' && transporterChartData && (
            <Bar data={transporterChartData} options={chartOptions} />
          )}
          {selectedView === 'status' && statusData && (
            <Doughnut data={statusData} options={doughnutOptions} />
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: 'Total Challans',
            value: transportData?.daily.reduce((sum, day) => sum + day.totalChallans, 0) || 0,
            icon: '📦',
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            textColor: 'text-blue-700',
            valueColor: 'text-blue-900'
          },
          {
            title: 'Total Weight',
            value: formatWeight(transportData?.daily.reduce((sum, day) => sum + day.totalWeight, 0) || 0),
            icon: '⚖️',
            gradient: 'from-red-500 to-red-600',
            bgGradient: 'from-red-50 to-red-100',
            textColor: 'text-red-700',
            valueColor: 'text-red-900'
          },
          {
            title: 'Delivered',
            value: transportData?.daily.reduce((sum, day) => sum + day.delivered, 0) || 0,
            icon: '✅',
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            textColor: 'text-purple-700',
            valueColor: 'text-purple-900'
          },
          {
            title: 'In Transit',
            value: transportData?.daily.reduce((sum, day) => sum + day.inTransit, 0) || 0,
            icon: '🚛',
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100',
            textColor: 'text-orange-700',
            valueColor: 'text-orange-900'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/30 overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            {/* Background Pattern */}
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${metric.gradient} rounded-lg flex items-center justify-center shadow-md`}>
                  <span className="text-white text-sm">{metric.icon}</span>
                </div>
                <div className="text-right">
                  <motion.p 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={`text-xl font-bold ${metric.valueColor} mb-1 leading-tight`}
                  >
                    {metric.value}
                  </motion.p>
                </div>
              </div>
              <motion.h3 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className={`text-xs font-medium ${metric.textColor} group-hover:text-gray-700 transition-colors uppercase tracking-wide`}
              >
                {metric.title}
              </motion.h3>
            </div>
            
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
          </motion.div>
        ))}
      </div>

      {/* Recent Transport Activity */}
      {transportData?.daily && transportData.daily.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Recent Consignment Activity</h4>
            {transportData?.daily && (
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                Showing {getActivityLimit()} of {transportData.daily.length} days
              </span>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {transportData.daily.slice(0, getActivityLimit()).map((day, index) => (
                <motion.div 
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-b border-gray-100 last:border-b-0 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg"
                      whileHover={{ rotate: 5 }}
                    >
                      {index + 1}
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {new Date(day.date).toLocaleDateString('en-IN', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">{day.totalChallans} challans</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatWeight(day.totalWeight)}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>{day.delivered} delivered</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span>{day.inTransit} in transit</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Transporters */}
      {transportData?.transporters && transportData.transporters.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Fleet Performers</h4>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="space-y-1">
              {transportData.transporters.slice(0, 5).map((transporter, index) => (
                <motion.div 
                  key={transporter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 border-b border-gray-100 last:border-b-0 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                        'bg-gradient-to-br from-purple-500 to-purple-600'
                      }`}
                      whileHover={{ rotate: 5 }}
                    >
                      <span className="text-white">{index + 1}</span>
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">{transporter.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{transporter.totalChallans} challans</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatWeight(transporter.totalWeight)}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>{transporter.delivered} delivered</span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportTrackerAnalytics;
