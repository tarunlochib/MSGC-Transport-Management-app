import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Line, Bar } from 'react-chartjs-2';
import api from '../../../utils/api';

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

const PredictiveAnalytics = () => {
  const [selectedForecast, setSelectedForecast] = useState('revenue');
  const [selectedForecastPeriod, setSelectedForecastPeriod] = useState('next6Months');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customMonths, setCustomMonths] = useState(6);
  const [customStartMonth, setCustomStartMonth] = useState(new Date().getMonth() + 1);
  const [customStartYear, setCustomStartYear] = useState(new Date().getFullYear());

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For predictive analytics, we always fetch historical data to base predictions on
      // The forecast period determines how far into the future to project
      const params = { 
        period: 'currentMonth', // Use current month as base for predictions
        forecastPeriod: selectedForecastPeriod 
      };
      
      if (selectedForecastPeriod === 'custom') {
        params.forecastMonths = customMonths;
        params.forecastStartMonth = customStartMonth;
        params.forecastStartYear = customStartYear;
      }
      
      const response = await api.get('/predictive-analytics', { params });
      setData(response.data.data);
    } catch (err) {
      console.error('Error fetching predictive analytics:', err);
      setError('Failed to load predictive analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when forecast period changes
  useEffect(() => {
    if (selectedForecastPeriod !== 'custom') {
      fetchData();
    }
  }, [selectedForecastPeriod]);

  // Fetch data for custom forecast period
  const handleCustomApply = () => {
    fetchData();
    setShowCustomDate(false);
  };

  const forecastData = useMemo(() => {
    if (!data) {
      return null;
    }

    let forecast;
    switch (selectedForecast) {
      case 'revenue':
        forecast = data.revenueForecast;
        break;
      case 'weight':
        forecast = data.weightForecast;
        break;
      case 'efficiency':
        forecast = data.efficiencyForecast;
        break;
      default:
        forecast = data.revenueForecast;
    }

    if (!forecast) {
      return null;
    }

    // Check if we have any data at all
    const hasHistorical = forecast.historical && forecast.historical.length > 0;
    const hasForecast = forecast.forecast && forecast.forecast.length > 0;
    
    if (!hasHistorical && !hasForecast) {
      return null;
    }

    // Create fallback data if needed
    const historicalData = (forecast.historical && forecast.historical.length > 0) ? forecast.historical : [0];
    const forecastData = (forecast.forecast && forecast.forecast.length > 0) ? forecast.forecast : [0];
    const labels = (forecast.periods && forecast.periods.length > 0) ? forecast.periods : ['No Data'];

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Historical',
          data: historicalData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'AI Forecast',
          data: forecastData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          borderDash: [8, 4],
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };

    // Force chart to render with test data if needed
    if (!chartData.labels || chartData.labels.length === 0) {
      return {
        labels: ['Test 1', 'Test 2', 'Test 3'],
        datasets: [
          {
            label: 'Historical',
            data: [100, 200, 150],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'AI Forecast',
            data: [150, 250, 200],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 3,
            borderDash: [8, 4],
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      };
    }
    
    return chartData;
  }, [data, selectedForecast]);

  const seasonalData = useMemo(() => {
    if (!data?.seasonalTrends) return null;

    return {
      labels: data.seasonalTrends.map(t => t.season) || [],
      datasets: [
        {
          label: 'Revenue by Season',
          data: data.seasonalTrends.map(t => t.revenue) || [],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2
        }
      ]
    };
  }, [data]);

  const recommendations = useMemo(() => {
    if (!data?.recommendations) return [];
    return data.recommendations;
  }, [data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 11
          },
          callback: function(value) {
            if (selectedForecast === 'revenue') {
              return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                notation: 'compact'
              }).format(value);
            }
            return value;
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: {
            size: 11
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Predictive Analytics</h3>
          <p className="text-sm text-gray-600">AI-powered forecasts and recommendations</p>
        </div>
        
        {/* Forecast Period Selector */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {['next6Months', 'next12Months', 'next18Months', 'custom'].map((period) => (
              <button
                key={period}
                onClick={() => {
                  if (period === 'custom') {
                    setShowCustomDate(!showCustomDate);
                  } else {
                    setSelectedForecastPeriod(period);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  selectedForecastPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period === 'next6Months' ? 'Next 6 Months' :
                 period === 'next12Months' ? 'Next 12 Months' :
                 period === 'next18Months' ? 'Next 18 Months' : 'Custom'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Date Selector */}
      <AnimatePresence>
        {showCustomDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Duration</label>
                <select
                  value={customMonths}
                  onChange={(e) => setCustomMonths(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[3, 6, 9, 12, 18, 24].map((months) => (
                    <option key={months} value={months}>
                      {months} months
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Month</label>
                <select
                  value={customStartMonth}
                  onChange={(e) => setCustomStartMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                <select
                  value={customStartYear}
                  onChange={(e) => setCustomStartYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 3 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={handleCustomApply}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={() => setShowCustomDate(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forecast Selector */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => setSelectedForecast('revenue')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            selectedForecast === 'revenue'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Revenue Forecast
        </button>
        <button
          onClick={() => setSelectedForecast('weight')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            selectedForecast === 'weight'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Weight Forecast
        </button>
        <button
          onClick={() => setSelectedForecast('efficiency')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            selectedForecast === 'efficiency'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Efficiency Forecast
        </button>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-3 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">Loading predictive analytics...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : forecastData ? (
          <Line data={forecastData} options={chartOptions} />
        ) : data ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <p className="text-sm">No forecast data available</p>
              <p className="text-xs text-gray-400 mt-1">Insufficient historical data for predictions</p>
              <div className="mt-4 text-xs text-gray-400">
                <p>Data received: {data ? 'Yes' : 'No'}</p>
                <p>Selected forecast: {selectedForecast}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <p className="text-sm">Loading predictive analytics...</p>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">AI Recommendations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm">💡</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-1">{rec.title}</h5>
                    <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-blue-600">Impact: {rec.impact}%</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{rec.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-lg p-4 border ${
          (data?.revenueForecast?.growthRate || 0) >= 0 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                (data?.revenueForecast?.growthRate || 0) >= 0 ? 'text-green-800' : 'text-red-800'
              }`}>
                Growth Prediction
              </p>
              <p className={`text-2xl font-bold ${
                (data?.revenueForecast?.growthRate || 0) >= 0 ? 'text-green-900' : 'text-red-900'
              }`}>
                {(data?.revenueForecast?.growthRate || 0) >= 0 ? '+' : ''}{data?.revenueForecast?.growthRate || 0}%
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              (data?.revenueForecast?.growthRate || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className={`text-xl ${
                (data?.revenueForecast?.growthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(data?.revenueForecast?.growthRate || 0) >= 0 ? '📈' : '📉'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Confidence Level</p>
              <p className="text-2xl font-bold text-blue-900">
                {data?.confidenceLevel || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Risk Score</p>
              <p className="text-2xl font-bold text-purple-900">
                {data?.riskAssessment?.overallRiskScore || 0}/100
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictiveAnalytics;
