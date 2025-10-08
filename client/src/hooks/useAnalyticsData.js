import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../utils/api';
import { analyticsLogger } from '../utils/analyticsLogger';

export const useAnalyticsData = ({ period, dateRange, metrics }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the parameters to prevent infinite loops
  const memoizedParams = useMemo(() => ({
    period,
    startDate: dateRange.start,
    endDate: dateRange.end,
    metrics: metrics.join(',')
  }), [period, dateRange.start, dateRange.end, metrics.join(',')]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Log analytics request
      analyticsLogger.log('analytics_data_request', {
        period: memoizedParams.period,
        dateRange: { start: memoizedParams.startDate, end: memoizedParams.endDate },
        metrics: memoizedParams.metrics.split(','),
        timestamp: new Date().toISOString()
      });

      // Build query parameters
      const params = {
        period: memoizedParams.period,
        metrics: memoizedParams.metrics,
        ...(memoizedParams.startDate && { startDate: memoizedParams.startDate }),
        ...(memoizedParams.endDate && { endDate: memoizedParams.endDate })
      };

      // Fetch analytics data
      const response = await api.get('/analytics', { params });
      
      if (response.data) {
        setData(response.data);
        analyticsLogger.log('analytics_data_success', {
          dataSize: JSON.stringify(response.data).length,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('No analytics data received');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch analytics data';
      setError(new Error(errorMessage));
      
      analyticsLogger.log('analytics_data_error', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, [memoizedParams]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const refetch = useCallback(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};
