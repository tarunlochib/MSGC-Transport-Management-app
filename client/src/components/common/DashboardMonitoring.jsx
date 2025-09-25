import React, { useState, useEffect } from 'react';
import { useDashboardCache, usePerformanceMonitor, useDataQualityMonitor } from '../../hooks/useDashboardHooks';
import { errorTracker } from '../../utils/errorTracking';

/**
 * Dashboard Monitoring Component
 * Provides real-time monitoring of dashboard performance, errors, and data quality
 */
const DashboardMonitoring = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [monitoringData, setMonitoringData] = useState({
    performance: {},
    cache: {},
    errors: {},
    dataQuality: {}
  });

  const { getCacheStats } = useDashboardCache();
  const { getPerformanceReport } = usePerformanceMonitor();
  const { getQualityReport } = useDataQualityMonitor();

  useEffect(() => {
    const updateMonitoringData = () => {
      setMonitoringData({
        performance: getPerformanceReport(),
        cache: getCacheStats(),
        errors: errorTracker.getErrorStats(),
        dataQuality: getQualityReport()
      });
    };

    // Update every 5 seconds
    const interval = setInterval(updateMonitoringData, 5000);
    updateMonitoringData(); // Initial update

    return () => clearInterval(interval);
  }, [getPerformanceReport, getCacheStats, getQualityReport]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Open Monitoring Dashboard"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-96 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Dashboard Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
        {/* Performance Metrics */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Performance
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Operations</div>
              <div className="font-semibold">{monitoringData.performance.totalOperations || 0}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Slow Ops</div>
              <div className="font-semibold text-orange-600">{monitoringData.performance.slowOperations?.length || 0}</div>
            </div>
          </div>
        </div>

        {/* Cache Metrics */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            Cache
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Cached</div>
              <div className="font-semibold">{monitoringData.cache.totalCached || 0}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Valid</div>
              <div className="font-semibold text-green-600">{monitoringData.cache.validEntries || 0}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Stale</div>
              <div className="font-semibold text-orange-600">{monitoringData.cache.staleEntries || 0}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Loading</div>
              <div className="font-semibold text-blue-600">{monitoringData.cache.loadingEntries || 0}</div>
            </div>
          </div>
        </div>

        {/* Error Metrics */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center">
            <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Errors
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Total</div>
              <div className="font-semibold">{monitoringData.errors.total || 0}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">High</div>
              <div className="font-semibold text-red-600">{monitoringData.errors.high || 0}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Medium</div>
              <div className="font-semibold text-orange-600">{monitoringData.errors.medium || 0}</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Last 24h</div>
              <div className="font-semibold">{monitoringData.errors.last24Hours || 0}</div>
            </div>
          </div>
        </div>

        {/* Data Quality Metrics */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center">
            <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Data Quality
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overall</span>
              <span className={`font-semibold ${monitoringData.dataQuality.overallQuality >= 95 ? 'text-green-600' : monitoringData.dataQuality.overallQuality >= 90 ? 'text-orange-600' : 'text-red-600'}`}>
                {monitoringData.dataQuality.overallQuality?.toFixed(1) || 0}%
              </span>
            </div>
            {monitoringData.dataQuality.issues?.length > 0 && (
              <div className="text-red-600 text-xs">
                {monitoringData.dataQuality.issues.length} issues detected
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                errorTracker.clearErrors();
                setMonitoringData(prev => ({
                  ...prev,
                  errors: { total: 0, high: 0, medium: 0, low: 0, last24Hours: 0 }
                }));
              }}
              className="flex-1 px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
            >
              Clear Errors
            </button>
            <button
              onClick={() => {
                const errors = errorTracker.exportErrors();
                const blob = new Blob([errors], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dashboard-errors-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMonitoring;
