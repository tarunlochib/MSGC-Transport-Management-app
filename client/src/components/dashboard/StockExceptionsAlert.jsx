import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StockExceptionsAlert = () => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedCounts, setAnimatedCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const response = await axios.get('/api/stock-exceptions/summary');
      setStockData(response.data);
      // Animate counters after data loads
      setTimeout(() => {
        animateCounters(response.data.summary);
      }, 500);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateCounters = (summary) => {
    const targets = {
      fresh: summary.stockByAge.oneDayOld,
      aging: summary.stockByAge.twoDaysOld,
      critical: summary.stockByAge.fourDaysOld,
      total: summary.totals.stock.total,
      inTransit: summary.totals.inTransit,
      delivered: summary.totals.delivered,
      freshWeight: summary.stockByAge.oneDayOldWeight,
      agingWeight: summary.stockByAge.twoDaysOldWeight,
      criticalWeight: summary.stockByAge.fourDaysOldWeight,
      totalWeight: summary.stockByAge.totalWeight
    };

    Object.keys(targets).forEach(key => {
      let current = 0;
      const target = targets[key];
      const increment = Math.ceil(target / 20);
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedCounts(prev => ({ ...prev, [key]: current }));
      }, 50);
    });
  };

  const handleCardClick = (category, ageGroup = null, transporterId = null, godownId = null) => {
    const params = new URLSearchParams();
    params.append('category', category);
    if (ageGroup) params.append('ageGroup', ageGroup);
    if (transporterId) params.append('transporterId', transporterId);
    if (godownId) params.append('godownId', godownId);
    
    navigate(`/stock-exceptions?${params.toString()}`);
  };

  const getUrgencyLevel = () => {
    if (!stockData) return 'low';
    const { stockByAge } = stockData.summary;
    const criticalCount = stockByAge.fourDaysOld;
    const agingCount = stockByAge.twoDaysOld;
    
    if (criticalCount > 10) return 'critical';
    if (criticalCount > 5 || agingCount > 15) return 'high';
    if (criticalCount > 0 || agingCount > 5) return 'medium';
    return 'low';
  };

  const urgencyConfig = {
    critical: {
      headerBg: 'from-red-600 via-red-500 to-rose-600',
      headerText: 'text-white',
      alertIcon: '🚨',
      alertText: 'CRITICAL STOCK ALERT',
      alertSubtext: 'Immediate attention required',
      borderColor: 'border-red-200',
      glowColor: 'shadow-red-500/20'
    },
    high: {
      headerBg: 'from-orange-500 via-amber-500 to-yellow-500',
      headerText: 'text-white',
      alertIcon: '⚠️',
      alertText: 'HIGH PRIORITY ALERT',
      alertSubtext: 'Action needed soon',
      borderColor: 'border-orange-200',
      glowColor: 'shadow-orange-500/20'
    },
    medium: {
      headerBg: 'from-blue-600 via-indigo-500 to-purple-600',
      headerText: 'text-white',
      alertIcon: '📊',
      alertText: 'STOCK MONITORING',
      alertSubtext: 'Keep monitoring aging stock',
      borderColor: 'border-blue-200',
      glowColor: 'shadow-blue-500/20'
    },
    low: {
      headerBg: 'from-green-500 via-emerald-500 to-teal-500',
      headerText: 'text-white',
      alertIcon: '✅',
      alertText: 'STOCK STATUS GOOD',
      alertSubtext: 'All systems normal',
      borderColor: 'border-green-200',
      glowColor: 'shadow-green-500/20'
    }
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 animate-pulse"></div>
        <div className="relative p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse"></div>
            <div className="flex-1">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-2 animate-pulse"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3 animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-red-200">
        <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-rose-50"></div>
        <div className="relative p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500 animate-bounce">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
          <p className="text-gray-600">Unable to load stock data. Please check your connection.</p>
        </div>
      </div>
    );
  }

  const { summary } = stockData;
  const urgencyLevel = getUrgencyLevel();
  const config = urgencyConfig[urgencyLevel];

  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl shadow-2xl border ${config.borderColor} ${config.glowColor} shadow-xl`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50 opacity-60"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full translate-y-24 -translate-x-24"></div>

      {/* Header with Urgency Indicator */}
      <div className={`relative bg-gradient-to-r ${config.headerBg} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`text-3xl ${urgencyLevel === 'critical' ? 'animate-pulse' : ''}`}>
              {config.alertIcon}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${config.headerText} tracking-tight`}>
                {config.alertText}
              </h2>
              <p className={`text-sm ${config.headerText} opacity-90`}>
                {config.alertSubtext}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/stock-exceptions')}
            className={`px-6 py-2 bg-white/20 backdrop-blur-sm ${config.headerText} rounded-xl hover:bg-white/30 transition-all duration-300 font-medium border border-white/30`}
          >
            View Details →
          </button>
        </div>
      </div>

      <div className="relative p-6 space-y-6">
        {/* Critical Alert Bar */}
        {urgencyLevel === 'critical' && (
          <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-4 animate-pulse">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-6 h-6 animate-spin">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-bold">URGENT: {summary.stockByAge.fourDaysOld} items over 4 days old!</div>
                <div className="text-sm opacity-90">These items require immediate dispatch</div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Age Analysis */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-bold text-gray-900">Stock Age Analysis</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fresh Stock */}
            <div 
              onClick={() => handleCardClick('stock', 'one-day')}
              className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-lg border border-emerald-200"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-1 rounded-full">
                    FRESH
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-700 mb-1 font-mono">
                  {animatedCounts.fresh || 0}
                </div>
                <div className="text-sm text-emerald-600 font-medium">≤ 1 Day Old</div>
                <div className="text-xs text-emerald-500 mt-1">
                  {animatedCounts.freshWeight || 0} kg
                </div>
              </div>
            </div>

            {/* Aging Stock */}
            <div 
              onClick={() => handleCardClick('stock', 'two-days')}
              className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-lg border border-amber-200"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-1 rounded-full">
                    AGING
                  </div>
                </div>
                <div className="text-3xl font-black text-amber-700 mb-1 font-mono">
                  {animatedCounts.aging || 0}
                </div>
                <div className="text-sm text-amber-600 font-medium">2-3 Days Old</div>
                <div className="text-xs text-amber-500 mt-1">
                  {animatedCounts.agingWeight || 0} kg
                </div>
              </div>
            </div>

            {/* Critical Stock */}
            <div 
              onClick={() => handleCardClick('stock', 'four-days')}
              className={`group relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-lg border border-red-200 ${summary.stockByAge.fourDaysOld > 0 ? 'animate-pulse' : ''}`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="text-xs text-red-600 font-medium bg-red-100 px-2 py-1 rounded-full">
                    CRITICAL
                  </div>
                </div>
                <div className="text-3xl font-black text-red-700 mb-1 font-mono">
                  {animatedCounts.critical || 0}
                </div>
                <div className="text-sm text-red-600 font-medium">&gt;= 4 Days Old</div>
                <div className="text-xs text-red-500 mt-1">
                  {animatedCounts.criticalWeight || 0} kg
                </div>
              </div>
            </div>

            {/* Total Stock */}
            <div 
              onClick={() => handleCardClick('stock')}
              className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-lg border border-gray-200"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gray-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="text-xs text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full">
                    TOTAL
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-700 mb-1 font-mono">
                  {animatedCounts.total || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Stock</div>
                <div className="text-xs text-gray-500 mt-1">
                  {animatedCounts.totalWeight || 0} kg
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-bold text-gray-900">Movement Status</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div 
              onClick={() => handleCardClick('in-transit')}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-lg border border-blue-200"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div className="text-xs text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                      IN TRANSIT
                    </div>
                  </div>
                  <div className="text-4xl font-black text-blue-700 mb-2 font-mono">
                    {animatedCounts.inTransit || 0}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Active Shipments</div>
                  <div className="text-xs text-blue-500 mt-1">Currently moving</div>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleCardClick('delivered')}
              className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-lg border border-green-200"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-xs text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full">
                      DELIVERED
                    </div>
                  </div>
                  <div className="text-4xl font-black text-green-700 mb-2 font-mono">
                    {animatedCounts.delivered || 0}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Completed</div>
                  <div className="text-xs text-green-500 mt-1">Successfully delivered</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock by Transporter - Professional Table */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-bold text-gray-900">Stock by Transporter</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-indigo-200 to-transparent"></div>
          </div>

          <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-100 border-b border-gray-300">
              <div className="grid grid-cols-6 gap-4 px-4 py-3">
                <div className="col-span-2 text-sm font-semibold text-gray-700">Transporter</div>
                <div className="text-center text-sm font-semibold text-gray-700">Fresh</div>
                <div className="text-center text-sm font-semibold text-gray-700">Aging</div>
                <div className="text-center text-sm font-semibold text-gray-700">Critical</div>
                <div className="text-center text-sm font-semibold text-gray-700">Total</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {Object.values(summary.stockByTransporter).map((transporter, index) => {
                const totalCount = Object.values(transporter.godowns).reduce((sum, godown) => sum + godown.count, 0);
                const freshCount = transporter.ageBreakdown?.fresh || 0;
                const agingCount = transporter.ageBreakdown?.aging || 0;
                const criticalCount = transporter.ageBreakdown?.critical || 0;
                
                return (
                  <div key={transporter.transporterId}>
                    <div 
                      className="grid grid-cols-6 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => handleCardClick('stock', null, transporter.transporterId)}
                    >
                      {/* Transporter Name */}
                      <div className="col-span-2 flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center text-white text-sm font-medium">
                          {transporter.transporterName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transporter.transporterName}</div>
                          {Object.values(transporter.godowns).length > 1 && (
                            <div className="text-xs text-gray-500">
                              {Object.values(transporter.godowns).length} locations
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fresh Count */}
                      <div className="text-center flex flex-col items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick('stock', 'one-day', transporter.transporterId);
                          }}
                          className="w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-semibold hover:bg-green-200 transition-colors duration-150"
                        >
                          {freshCount}
                        </button>
                        <div className="text-xs text-green-600 mt-1 font-medium">
                          {transporter.ageBreakdown?.freshWeight || 0}kg
                        </div>
                      </div>

                      {/* Aging Count */}
                      <div className="text-center flex flex-col items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick('stock', 'two-days', transporter.transporterId);
                          }}
                          className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors duration-150 ${
                            agingCount > 0 
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {agingCount}
                        </button>
                        <div className={`text-xs mt-1 font-medium ${
                          agingCount > 0 ? 'text-yellow-600' : 'text-gray-400'
                        }`}>
                          {transporter.ageBreakdown?.agingWeight || 0}kg
                        </div>
                      </div>

                      {/* Critical Count */}
                      <div className="text-center flex flex-col items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick('stock', 'four-days', transporter.transporterId);
                          }}
                          className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors duration-150 ${
                            criticalCount > 0 
                              ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {criticalCount}
                        </button>
                        <div className={`text-xs mt-1 font-medium ${
                          criticalCount > 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {transporter.ageBreakdown?.criticalWeight || 0}kg
                        </div>
                      </div>

                      {/* Total Count */}
                      <div className="text-center flex flex-col items-center justify-center">
                        <div className="w-10 h-8 bg-blue-100 text-blue-800 rounded-md flex items-center justify-center text-sm font-semibold">
                          {totalCount}
                        </div>
                        <div className="text-xs text-blue-600 mt-1 font-medium">
                          {(transporter.ageBreakdown?.freshWeight || 0) + 
                           (transporter.ageBreakdown?.agingWeight || 0) + 
                           (transporter.ageBreakdown?.criticalWeight || 0)}kg
                        </div>
                      </div>
                    </div>

                    {/* Godown Breakdown */}
                    {Object.values(transporter.godowns).length > 1 && (
                      <div className="bg-gray-50 border-t border-gray-200">
                        <div className="px-4 py-2">
                          <div className="text-xs text-gray-600 font-medium mb-2">Locations:</div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {Object.values(transporter.godowns).map((godown) => (
                              <button
                                key={godown.godownId}
                                onClick={() => handleCardClick('stock', null, transporter.transporterId, godown.godownId)}
                                className="flex flex-col items-center justify-center p-2 bg-white rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-150"
                              >
                                <span className="text-xs font-medium text-gray-700 truncate mb-1">{godown.godownName}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                                    {godown.count}
                                  </span>
                                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                    {godown.weight || 0}kg
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Footer */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-700">
                Total: {Object.values(summary.stockByTransporter).length} Transporters
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-green-700">{summary.stockByAge.oneDayOld}</span>
                  <span className="text-xs text-gray-600">Fresh</span>
                  <span className="text-xs text-green-600 font-medium">({summary.stockByAge.oneDayOldWeight}kg)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-yellow-700">{summary.stockByAge.twoDaysOld}</span>
                  <span className="text-xs text-gray-600">Aging</span>
                  <span className="text-xs text-yellow-600 font-medium">({summary.stockByAge.twoDaysOldWeight}kg)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-red-700">{summary.stockByAge.fourDaysOld}</span>
                  <span className="text-xs text-gray-600">Critical</span>
                  <span className="text-xs text-red-600 font-medium">({summary.stockByAge.fourDaysOldWeight}kg)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-blue-700">{summary.totalStock}</span>
                  <span className="text-xs text-gray-600">Total</span>
                  <span className="text-xs text-blue-600 font-medium">({summary.stockByAge.totalWeight}kg)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #f3f4f6;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default StockExceptionsAlert;