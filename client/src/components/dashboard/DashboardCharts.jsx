import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  Legend
);

const DashboardCharts = ({ recentBookings, recentExpenses, loading }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'daily'
  const [selectedMonth, setSelectedMonth] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return `₹${parseInt(amount || 0).toLocaleString()}`;
  };

  const truncateText = (text, maxLength = 25) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Calculate real revenue data from bookings with fallback
  const revenueData = useMemo(() => {
    const now = new Date();
    const months = [];
    const monthlyRevenue = {};

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months.push(monthKey);
      monthlyRevenue[monthKey] = 0;
    }

    // Calculate revenue for each booking if available
    if (recentBookings && recentBookings.length > 0) {
      recentBookings.forEach(booking => {
        const bookingDate = new Date(booking.createdAt);
        const monthKey = bookingDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (monthlyRevenue.hasOwnProperty(monthKey)) {
          // Calculate total charges for this booking
          const totalCharges = booking.totalCharges || 0;
          monthlyRevenue[monthKey] += totalCharges;
        }
      });
    }

    // If no real data, create sample data for demonstration
    if (recentBookings && recentBookings.length === 0) {
      months.forEach((month, index) => {
        // Generate realistic sample data with smaller ranges
        const baseAmount = 8000 + (Math.random() * 12000); // ₹8,000 - ₹20,000
        const trend = Math.sin(index * 0.5) * 0.3 + 1; // Create a trend
        monthlyRevenue[month] = Math.floor(baseAmount * trend);
      });
    }

    const monthlyData = months.map(month => ({
      month,
      revenue: monthlyRevenue[month] || 0
    }));

    const totalRevenue = monthlyData.reduce((sum, data) => sum + data.revenue, 0);
    const maxRevenue = Math.max(...monthlyData.map(data => data.revenue), 1000);

    return { monthlyData, totalRevenue, maxRevenue };
  }, [recentBookings]);

  // Calculate expenses data with fallback
  const expensesData = useMemo(() => {
    const now = new Date();
    const months = [];
    const monthlyExpenses = {};

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months.push(monthKey);
      monthlyExpenses[monthKey] = 0;
    }

    // Calculate expenses for each expense if available
    if (recentExpenses && recentExpenses.length > 0) {
      recentExpenses.forEach(expense => {
        const expenseDate = new Date(expense.createdAt);
        const monthKey = expenseDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (monthlyExpenses.hasOwnProperty(monthKey)) {
          const amount = expense.amount || 0;
          monthlyExpenses[monthKey] += amount;
        }
      });
    }

    // If no real data, create sample data for demonstration
    if (recentExpenses && recentExpenses.length === 0) {
      months.forEach((month, index) => {
        // Generate realistic sample expense data with smaller ranges
        const baseAmount = 2000 + (Math.random() * 4000); // ₹2,000 - ₹6,000
        const trend = Math.sin(index * 0.3) * 0.2 + 1; // Create a trend
        monthlyExpenses[month] = Math.floor(baseAmount * trend);
      });
    }

    const monthlyData = months.map(month => ({
      month,
      expenses: monthlyExpenses[month] || 0
    }));

    const totalExpenses = monthlyData.reduce((sum, data) => sum + data.expenses, 0);
    const maxExpenses = Math.max(...monthlyData.map(data => data.expenses), 1000);

    return { monthlyData, totalExpenses, maxExpenses };
  }, [recentExpenses]);

  // Calculate profit data
  const profitData = useMemo(() => {
    const { monthlyData: revenueMonthlyData } = revenueData;
    const { monthlyData: expensesMonthlyData } = expensesData;

    return revenueMonthlyData.map((revenueItem, index) => {
      const expenseItem = expensesMonthlyData[index];
      const profit = (revenueItem.revenue || 0) - (expenseItem?.expenses || 0);
      return {
        month: revenueItem.month,
        profit: Math.max(0, profit) // Ensure profit is not negative for visualization
      };
    });
  }, [revenueData, expensesData]);

  // Calculate daily data for selected month
  const dailyData = useMemo(() => {
    if (viewMode !== 'daily' || !selectedMonth) {
      return { revenueData: [], expensesData: [], profitData: [] };
    }

    // Parse selected month to get year and month
    const [month, year] = selectedMonth.split(' ');
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const yearNum = parseInt(year);
    
    // Get number of days in the selected month
    const daysInMonth = new Date(yearNum, monthIndex + 1, 0).getDate();
    
    const dailyRevenue = {};
    const dailyExpenses = {};

    // Initialize daily data
    for (let day = 1; day <= daysInMonth; day++) {
      dailyRevenue[day] = 0;
      dailyExpenses[day] = 0;
    }

    // Calculate daily revenue from bookings
    if (recentBookings && recentBookings.length > 0) {
      recentBookings.forEach(booking => {
        const bookingDate = new Date(booking.createdAt);
        if (bookingDate.getMonth() === monthIndex && bookingDate.getFullYear() === yearNum) {
          const day = bookingDate.getDate();
          const totalCharges = booking.totalCharges || 0;
          dailyRevenue[day] += totalCharges;
        }
      });
    }

    // Calculate daily expenses
    if (recentExpenses && recentExpenses.length > 0) {
      recentExpenses.forEach(expense => {
        const expenseDate = new Date(expense.createdAt);
        if (expenseDate.getMonth() === monthIndex && expenseDate.getFullYear() === yearNum) {
          const day = expenseDate.getDate();
          const amount = expense.amount || 0;
          dailyExpenses[day] += amount;
        }
      });
    }

    // If no real data, create sample daily data
    if (recentBookings && recentBookings.length === 0) {
      for (let day = 1; day <= daysInMonth; day++) {
        const baseAmount = 300 + (Math.random() * 700); // ₹300 - ₹1,000 per day
        const trend = Math.sin(day * 0.2) * 0.3 + 1;
        dailyRevenue[day] = Math.floor(baseAmount * trend);
      }
    }

    if (recentExpenses && recentExpenses.length === 0) {
      for (let day = 1; day <= daysInMonth; day++) {
        const baseAmount = 100 + (Math.random() * 300); // ₹100 - ₹400 per day
        const trend = Math.sin(day * 0.15) * 0.2 + 1;
        dailyExpenses[day] = Math.floor(baseAmount * trend);
      }
    }

    const revenueData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      revenue: dailyRevenue[i + 1] || 0
    }));

    const expensesData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      expenses: dailyExpenses[i + 1] || 0
    }));

    const profitData = revenueData.map((revenueItem, index) => {
      const expenseItem = expensesData[index];
      const profit = (revenueItem.revenue || 0) - (expenseItem?.expenses || 0);
      return {
        day: revenueItem.day,
        profit: Math.max(0, profit)
      };
    });

    return { revenueData, expensesData, profitData };
  }, [viewMode, selectedMonth, recentBookings, recentExpenses]);

  // Get current period data based on selection
  const getCurrentPeriodData = () => {
    if (viewMode === 'daily') {
      return dailyData.revenueData;
    }

    const { monthlyData } = revenueData;
    
    switch (selectedPeriod) {
      case '6months':
        return monthlyData.slice(-6);
      case '3months':
        return monthlyData.slice(-3);
      default:
        return monthlyData;
    }
  };

  const currentData = getCurrentPeriodData();

  // Calculate current period totals
  const currentPeriodTotals = useMemo(() => {
    if (viewMode === 'daily') {
      // For daily view, calculate totals for the selected month
      const totalRevenue = dailyData.revenueData.reduce((sum, data) => sum + data.revenue, 0);
      const totalExpenses = dailyData.expensesData.reduce((sum, data) => sum + data.expenses, 0);
      const totalProfit = totalRevenue - totalExpenses;
      return { totalRevenue, totalExpenses, totalProfit };
    } else {
      // For monthly view, calculate totals for the selected period
      const totalRevenue = currentData.reduce((sum, data) => sum + data.revenue, 0);
      const totalExpenses = currentData.map((data, index) => expensesData.monthlyData[index]?.expenses || 0).reduce((sum, expense) => sum + expense, 0);
      const totalProfit = totalRevenue - totalExpenses;
      return { totalRevenue, totalExpenses, totalProfit };
    }
  }, [viewMode, currentData, dailyData, expensesData.monthlyData]);

  // Chart.js configuration
  const chartData = {
    labels: viewMode === 'daily' 
      ? currentData.map(data => `Day ${data.day}`)
      : currentData.map(data => data.month.split(' ')[0]),
    datasets: [
      {
        label: 'Revenue',
        data: viewMode === 'daily' 
          ? currentData.map(data => data.revenue)
          : currentData.map(data => data.revenue),
        backgroundColor: viewMode === 'daily' 
          ? 'rgba(59, 130, 246, 0.1)'
          : 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: viewMode === 'daily' ? 2 : 1,
        borderRadius: viewMode === 'daily' ? 0 : 4,
        borderSkipped: false,
        fill: viewMode === 'daily' ? true : false,
        tension: viewMode === 'daily' ? 0.4 : 0,
        pointBackgroundColor: viewMode === 'daily' ? 'rgba(59, 130, 246, 1)' : undefined,
        pointBorderColor: viewMode === 'daily' ? '#ffffff' : undefined,
        pointBorderWidth: viewMode === 'daily' ? 2 : undefined,
        pointRadius: viewMode === 'daily' ? 4 : undefined,
        pointHoverRadius: viewMode === 'daily' ? 6 : undefined,
      },
      {
        label: 'Expenses',
        data: viewMode === 'daily'
          ? currentData.map((data, index) => dailyData.expensesData[index]?.expenses || 0)
          : currentData.map((data, index) => expensesData.monthlyData[index]?.expenses || 0),
        backgroundColor: viewMode === 'daily' 
          ? 'rgba(239, 68, 68, 0.1)'
          : 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: viewMode === 'daily' ? 2 : 1,
        borderRadius: viewMode === 'daily' ? 0 : 4,
        borderSkipped: false,
        fill: viewMode === 'daily' ? true : false,
        tension: viewMode === 'daily' ? 0.4 : 0,
        pointBackgroundColor: viewMode === 'daily' ? 'rgba(239, 68, 68, 1)' : undefined,
        pointBorderColor: viewMode === 'daily' ? '#ffffff' : undefined,
        pointBorderWidth: viewMode === 'daily' ? 2 : undefined,
        pointRadius: viewMode === 'daily' ? 4 : undefined,
        pointHoverRadius: viewMode === 'daily' ? 6 : undefined,
      },
      {
        label: 'Profit',
        data: viewMode === 'daily'
          ? currentData.map((data, index) => dailyData.profitData[index]?.profit || 0)
          : currentData.map((data, index) => profitData[index]?.profit || 0),
        backgroundColor: viewMode === 'daily' 
          ? 'rgba(34, 197, 94, 0.1)'
          : 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: viewMode === 'daily' ? 2 : 1,
        borderRadius: viewMode === 'daily' ? 0 : 4,
        borderSkipped: false,
        fill: viewMode === 'daily' ? true : false,
        tension: viewMode === 'daily' ? 0.4 : 0,
        pointBackgroundColor: viewMode === 'daily' ? 'rgba(34, 197, 94, 1)' : undefined,
        pointBorderColor: viewMode === 'daily' ? '#ffffff' : undefined,
        pointBorderWidth: viewMode === 'daily' ? 2 : undefined,
        pointRadius: viewMode === 'daily' ? 4 : undefined,
        pointHoverRadius: viewMode === 'daily' ? 6 : undefined,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll show custom legend below
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
          maxTicksLimit: viewMode === 'daily' ? 15 : 12,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
          callback: function(value) {
            return formatCurrency(value);
          }
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  // Set default selected month when switching to daily view
  useEffect(() => {
    if (viewMode === 'daily' && !selectedMonth && revenueData.monthlyData.length > 0) {
      setSelectedMonth(revenueData.monthlyData[revenueData.monthlyData.length - 1].month);
    }
  }, [viewMode, selectedMonth, revenueData.monthlyData]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="mb-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4">
          {/* Title and Revenue Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
              <p className="text-sm text-gray-600 mt-1">
                Total Revenue: {formatCurrency(currentPeriodTotals.totalRevenue)}
                {recentBookings && recentBookings.length === 0 && (
                  <span className="text-xs text-gray-500 ml-2">(Sample Data)</span>
                )}
              </p>
            </div>
            <div className="px-3 py-1 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xs font-medium">Live Data</span>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col space-y-2 bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-white rounded-md p-0.5 shadow-sm border border-gray-200">
                  <button
                    onClick={() => setViewMode('monthly')}
                    className={`px-2 py-1 text-xs rounded transition-all duration-200 font-medium ${
                      viewMode === 'monthly'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setViewMode('daily')}
                    className={`px-2 py-1 text-xs rounded transition-all duration-200 font-medium ${
                      viewMode === 'daily'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Daily
                  </button>
                </div>

                {/* Period/Month Selector */}
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-600 font-medium">
                    {viewMode === 'monthly' ? 'Period:' : 'Month:'}
                  </span>
                  {viewMode === 'monthly' ? (
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm"
                    >
                      <option value="3months">3 Months</option>
                      <option value="6months">6 Months</option>
                      <option value="12months">12 Months</option>
                    </select>
                  ) : (
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm"
                    >
                      {revenueData.monthlyData.map((data) => (
                        <option key={data.month} value={data.month}>
                          {data.month}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Chart Info */}
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Revenue</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span>Expenses</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Profit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Interactive Chart */}
      <div className="mb-6">
        <div className="h-64 bg-gray-50 rounded-lg border border-gray-200 p-3">
          {viewMode === 'daily' ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {formatCurrency(currentPeriodTotals.totalRevenue)}
          </div>
          <div className="text-xs text-gray-600">Total Revenue</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-600">
            {formatCurrency(currentPeriodTotals.totalExpenses)}
          </div>
          <div className="text-xs text-gray-600">Total Expenses</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(currentPeriodTotals.totalProfit)}
          </div>
          <div className="text-xs text-gray-600">Net Profit</div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-4">
        {/* Recent Bookings */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Recent Bookings</h4>
            <Link to="/bookings" className="text-xs text-blue-600 hover:text-blue-700">View All</Link>
          </div>
          <div className="space-y-2">
            {recentBookings && recentBookings.length > 0 ? (
              recentBookings.slice(0, 3).map((booking, index) => (
                <div key={booking.id || index} className="flex items-center space-x-3 p-2 bg-white rounded border border-gray-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900">
                      {booking.grNumber || 'GR: N/A'}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {truncateText(`${booking.consignorName || 'N/A'} → ${booking.consigneeName || 'N/A'}`)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{formatDate(booking.createdAt)}</div>
                    <div className="text-xs font-medium text-gray-900 mt-0.5">{formatCurrency(booking.totalCharges)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <div className="text-gray-400 text-sm">No recent bookings</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Expenses */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Recent Expenses</h4>
            <Link to="/expenses" className="text-xs text-purple-600 hover:text-purple-700">View All</Link>
          </div>
          <div className="space-y-2">
            {recentExpenses && recentExpenses.length > 0 ? (
              recentExpenses.slice(0, 3).map((expense, index) => (
                <div key={expense.id || index} className="flex items-center space-x-3 p-2 bg-white rounded border border-gray-100">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900">
                      {expense.description || 'Expense'}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {expense.category || 'General'} • {expense.vehicleNumber || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{formatDate(expense.createdAt)}</div>
                    <div className="text-xs font-medium text-gray-900 mt-0.5">{formatCurrency(expense.amount)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <div className="text-gray-400 text-sm">No recent expenses</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts; 