import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import AnalyticsHeader from './components/AnalyticsHeader';
import AnalyticsFilters from './components/AnalyticsFilters';
import KPICards from './components/KPICards';
import RevenueAnalytics from './components/RevenueAnalytics';
import WeightAnalytics from './components/WeightAnalytics';
import TransportTrackerAnalytics from './components/TransportTrackerAnalytics';
import VehicleUtilizationAnalytics from './components/VehicleUtilizationAnalytics';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import AnalyticsExport from './components/AnalyticsExport';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { validateDateRange, sanitizeInput } from '../../utils/validation';
import { analyticsLogger } from '../../utils/analyticsLogger';

const AnalyticsPage = () => {
  // State management
  const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'bookings', 'customers', 'transporters']);
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, comparison
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  // Custom hook for analytics data
  const {
    data: analyticsData,
    loading,
    error: dataError,
    refetch
  } = useAnalyticsData({
    period: selectedPeriod,
    dateRange,
    metrics: selectedMetrics
  });

  // Security and validation
  useEffect(() => {
    // Validate date range
    if (dateRange.start && dateRange.end) {
      const validation = validateDateRange(dateRange.start, dateRange.end);
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }
    }

    // Sanitize inputs
    setSelectedMetrics(prev => 
      prev.map(metric => sanitizeInput(metric))
    );

    // Log analytics access
    analyticsLogger.log('analytics_page_access', {
      period: selectedPeriod,
      dateRange,
      metrics: selectedMetrics,
      timestamp: new Date().toISOString()
    });
  }, [selectedPeriod, dateRange.start, dateRange.end, selectedMetrics.join(',')]);

  // Memoized calculations for performance
  const processedData = useMemo(() => {
    if (!analyticsData) return null;


    const result = {
      kpis: analyticsData.kpis || calculateKPIs(analyticsData), // Use backend KPIs if available
      revenue: processRevenueData(analyticsData),
      customers: processCustomerData(analyticsData),
      transporters: processTransporterData(analyticsData),
      predictions: processPredictiveData(analyticsData)
    };
    
    
    return result;
  }, [analyticsData]);

  // Error handling
  useEffect(() => {
    if (dataError) {
      setError(dataError.message);
      analyticsLogger.log('analytics_error', {
        error: dataError.message,
        timestamp: new Date().toISOString()
      });
    }
  }, [dataError]);

  // Handlers
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setError(null);
    analyticsLogger.log('analytics_period_change', { period });
  };

  const handleDateRangeChange = (newDateRange) => {
    const validation = validateDateRange(newDateRange.start, newDateRange.end);
    if (validation.isValid) {
      setDateRange(newDateRange);
      setError(null);
    } else {
      setError(validation.error);
    }
  };

  const handleMetricsChange = (metrics) => {
    const sanitizedMetrics = metrics.map(metric => sanitizeInput(metric));
    setSelectedMetrics(sanitizedMetrics);
    analyticsLogger.log('analytics_metrics_change', { metrics: sanitizedMetrics });
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      await exportAnalyticsData(processedData, format);
      analyticsLogger.log('analytics_export', { format });
    } catch (error) {
      setError('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading analytics data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error Loading Analytics</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Helmet>
        <title>Analytics Dashboard | Transport Management</title>
        <meta name="description" content="Comprehensive business analytics and insights" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Creative Header */}
        <div className="relative bg-gradient-to-r from-emerald-50 via-cyan-50 to-blue-50 border-b border-emerald-200/60">
          {/* Enhanced background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(16,185,129,0.15)_1px,transparent_0)] bg-[length:24px_24px] opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-100/20 to-cyan-100/30"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Left Section */}
              <div className="flex items-center space-x-5">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  {/* Enhanced glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl blur-md opacity-30 -z-10"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-800 bg-clip-text text-transparent">
                    Analytics
                  </h1>
                  <p className="text-base text-emerald-700 font-medium">Business insights and performance metrics</p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-3">
                {/* Refresh Button */}
                <button
                  onClick={refetch}
                  disabled={loading}
                  className="group relative inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-700 bg-white/90 backdrop-blur-sm border border-emerald-200/60 rounded-lg hover:bg-white hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg 
                    className={`w-4 h-4 mr-1.5 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>

                {/* Back to Dashboard */}
                <button
                  onClick={() => window.history.back()}
                  className="group relative inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 border border-emerald-500/20 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.01]"
                >
                  <svg className="w-4 h-4 mr-1.5 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Filters */}
        <AnalyticsFilters
          selectedPeriod={selectedPeriod}
          dateRange={dateRange}
          selectedMetrics={selectedMetrics}
          onPeriodChange={handlePeriodChange}
          onDateRangeChange={setDateRange}
          onMetricsChange={setSelectedMetrics}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* KPI Cards */}
          <KPICards 
            data={processedData?.kpis}
            loading={loading}
            error={error}
          />

          {/* Analytics Sections */}
          <div className="space-y-6 mt-6">
            {/* Revenue Analytics */}
            <RevenueAnalytics 
              data={processedData}
              period={selectedPeriod}
              dateRange={dateRange}
            />

            {/* Weight Analytics */}
            <WeightAnalytics 
              data={processedData}
              period={selectedPeriod}
            />

            {/* Transport Tracker Analytics */}
            <TransportTrackerAnalytics />

            {/* Vehicle Utilization Analytics */}
            <VehicleUtilizationAnalytics 
              data={analyticsData}
              period={selectedPeriod}
            />

          </div>

          {/* Predictive Analytics - Full Width */}
          <div className="mt-6">
            <PredictiveAnalytics />
          </div>

          {/* Export Section */}
          <AnalyticsExport 
            onExport={handleExport}
            isExporting={isExporting}
            data={processedData}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Helper functions for data processing
const calculateKPIs = (data) => {
  return {
    totalRevenue: data.revenue?.total || 0,
    totalBookings: data.bookings?.total || 0,
    totalCustomers: data.customers?.total || 0,
    totalTransporters: data.transporters?.total || 0,
    averageOrderValue: data.revenue?.total / (data.bookings?.total || 1),
    growthRate: data.growth?.rate || 0,
    profitMargin: data.revenue?.profitMargin || 0
  };
};

const processRevenueData = (data) => {
  return {
    trends: data.revenue?.trends || [],
    byTransporter: data.revenue?.byTransporter || [],
    byRoute: data.revenue?.byRoute || [],
    monthly: data.revenue?.monthly || [],
    daily: data.revenue?.daily || []
  };
};


const processCustomerData = (data) => {
  return {
    topCustomers: data.customers?.top || [],
    retention: data.customers?.retention || {},
    acquisition: data.customers?.acquisition || {}
  };
};

const processTransporterData = (data) => {
  return {
    performance: data.transporters?.performance || [],
    utilization: data.transporters?.utilization || {},
    rankings: data.transporters?.rankings || []
  };
};

const processPredictiveData = (data) => {
  return {
    forecasts: data.predictions?.forecasts || [],
    trends: data.predictions?.trends || [],
    recommendations: data.predictions?.recommendations || []
  };
};

const exportAnalyticsData = async (data, format) => {
  // Implementation for exporting analytics data
};

export default AnalyticsPage;
