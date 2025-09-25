import { useState, useEffect, useCallback } from 'react';

/**
 * Dashboard Caching Hook
 * Provides intelligent caching for API calls without breaking existing logic
 */
export const useDashboardCache = () => {
  const [cache, setCache] = useState({});
  const [lastFetch, setLastFetch] = useState({});
  const [isLoading, setIsLoading] = useState({});

  // Cache duration for different data types (in milliseconds)
  const CACHE_DURATIONS = {
    bookings: 30000,    // 30 seconds
    expenses: 30000,    // 30 seconds
    income: 30000,      // 30 seconds
    vehicles: 60000,    // 1 minute
    transporters: 60000, // 1 minute
    drivers: 60000,     // 1 minute
    customers: 60000,   // 1 minute
    challans: 30000,    // 30 seconds
    default: 30000      // 30 seconds
  };

  const getCacheKey = (endpoint, params = {}) => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}${sortedParams ? `?${sortedParams}` : ''}`;
  };

  const getCacheDuration = (endpoint) => {
    const endpointName = endpoint.split('/')[1] || 'default';
    return CACHE_DURATIONS[endpointName] || CACHE_DURATIONS.default;
  };

  const isCacheValid = (key) => {
    const now = Date.now();
    const lastFetchTime = lastFetch[key];
    const duration = getCacheDuration(key);
    
    return lastFetchTime && (now - lastFetchTime) < duration;
  };

  const getCachedData = useCallback(async (endpoint, fetchFunction, params = {}) => {
    const key = getCacheKey(endpoint, params);
    
    // Return cached data if valid
    if (cache[key] && isCacheValid(key)) {
      return cache[key];
    }

    // Set loading state
    setIsLoading(prev => ({ ...prev, [key]: true }));

    try {
      // Fetch new data
      const data = await fetchFunction();
      
      // Cache the data
      setCache(prev => ({ ...prev, [key]: data }));
      setLastFetch(prev => ({ ...prev, [key]: Date.now() }));
      
      return data;
    } catch (error) {
      console.error(`Cache fetch error for ${key}:`, error);
      
      // Return cached data even if stale, or null if no cache
      return cache[key] || null;
    } finally {
      setIsLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [cache, lastFetch]);

  const invalidateCache = useCallback((endpoint, params = {}) => {
    const key = getCacheKey(endpoint, params);
    setCache(prev => {
      const newCache = { ...prev };
      delete newCache[key];
      return newCache;
    });
    setLastFetch(prev => {
      const newLastFetch = { ...prev };
      delete newLastFetch[key];
      return newLastFetch;
    });
  }, []);

  const clearAllCache = useCallback(() => {
    setCache({});
    setLastFetch({});
    setIsLoading({});
  }, []);

  const getCacheStats = useCallback(() => {
    const now = Date.now();
    const stats = {
      totalCached: Object.keys(cache).length,
      validEntries: 0,
      staleEntries: 0,
      loadingEntries: 0
    };

    Object.keys(cache).forEach(key => {
      if (isCacheValid(key)) {
        stats.validEntries++;
      } else {
        stats.staleEntries++;
      }
    });

    Object.values(isLoading).forEach(loading => {
      if (loading) stats.loadingEntries++;
    });

    return stats;
  }, [cache, lastFetch, isLoading]);

  return {
    getCachedData,
    invalidateCache,
    clearAllCache,
    getCacheStats,
    isLoading: Object.values(isLoading).some(loading => loading)
  };
};

/**
 * Performance Monitoring Hook
 * Tracks performance metrics without affecting existing logic
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({});
  const [isEnabled, setIsEnabled] = useState(true);

  const measurePerformance = useCallback((name, fn) => {
    if (!isEnabled) return fn();

    const start = performance.now();
    const result = fn();
    const end = performance.now();

    const duration = end - start;

    setMetrics(prev => ({
      ...prev,
      [name]: {
        duration,
        timestamp: new Date().toISOString(),
        count: (prev[name]?.count || 0) + 1,
        averageDuration: prev[name] 
          ? (prev[name].averageDuration * prev[name].count + duration) / (prev[name].count + 1)
          : duration
      }
    }));

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return result;
  }, [isEnabled]);

  const getPerformanceReport = useCallback(() => {
    const report = {
      totalOperations: Object.keys(metrics).length,
      slowOperations: Object.entries(metrics)
        .filter(([_, data]) => data.averageDuration > 500)
        .map(([name, data]) => ({ name, ...data })),
      fastestOperation: Object.entries(metrics)
        .reduce((min, [name, data]) => 
          data.averageDuration < min.averageDuration ? { name, ...data } : min,
          { name: '', averageDuration: Infinity }
        )
    };

    return report;
  }, [metrics]);

  const clearMetrics = useCallback(() => {
    setMetrics({});
  }, []);

  return {
    measurePerformance,
    getPerformanceReport,
    clearMetrics,
    metrics,
    isEnabled,
    setIsEnabled
  };
};

/**
 * Data Quality Monitoring Hook
 * Monitors data quality without affecting existing logic
 */
export const useDataQualityMonitor = () => {
  const [qualityMetrics, setQualityMetrics] = useState({});

  const checkDataQuality = useCallback((dataType, data) => {
    if (!data || !Array.isArray(data)) return;

    const metrics = {
      totalRecords: data.length,
      validRecords: 0,
      invalidRecords: 0,
      issues: []
    };

    data.forEach((record, index) => {
      const issues = [];
      
      // Check for required fields
      if (!record.id) issues.push('Missing ID');
      if (!record.createdAt) issues.push('Missing createdAt');
      
      // Check for data types
      if (record.weightKg && typeof record.weightKg !== 'number') {
        issues.push('Invalid weightKg type');
      }
      if (record.amount && typeof record.amount !== 'number') {
        issues.push('Invalid amount type');
      }
      
      // Check for valid dates
      if (record.createdAt && isNaN(new Date(record.createdAt).getTime())) {
        issues.push('Invalid createdAt date');
      }
      if (record.bookingDate && isNaN(new Date(record.bookingDate).getTime())) {
        issues.push('Invalid bookingDate');
      }

      if (issues.length === 0) {
        metrics.validRecords++;
      } else {
        metrics.invalidRecords++;
        metrics.issues.push({
          index,
          recordId: record.id,
          issues
        });
      }
    });

    setQualityMetrics(prev => ({
      ...prev,
      [dataType]: {
        ...metrics,
        lastChecked: new Date().toISOString(),
        qualityScore: metrics.totalRecords > 0 
          ? (metrics.validRecords / metrics.totalRecords) * 100 
          : 100
      }
    }));

    // Log quality issues
    if (metrics.invalidRecords > 0) {
      console.warn(`Data quality issues detected in ${dataType}:`, metrics.issues);
    }
  }, []);

  const getQualityReport = useCallback(() => {
    const report = {
      overallQuality: 0,
      dataTypes: {},
      issues: []
    };

    let totalRecords = 0;
    let totalValidRecords = 0;

    Object.entries(qualityMetrics).forEach(([dataType, metrics]) => {
      report.dataTypes[dataType] = metrics;
      totalRecords += metrics.totalRecords;
      totalValidRecords += metrics.validRecords;
      
      if (metrics.qualityScore < 95) {
        report.issues.push({
          dataType,
          qualityScore: metrics.qualityScore,
          invalidRecords: metrics.invalidRecords
        });
      }
    });

    report.overallQuality = totalRecords > 0 
      ? (totalValidRecords / totalRecords) * 100 
      : 100;

    return report;
  }, [qualityMetrics]);

  return {
    checkDataQuality,
    getQualityReport,
    qualityMetrics
  };
};
