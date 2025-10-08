/**
 * Performance Optimization Utility
 * Provides caching, request deduplication, and performance monitoring
 */

class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      requests: 0,
      errors: 0
    };
  }

  // Cache with TTL (Time To Live)
  setCache(key, data, ttl = 300000) { // 5 minutes default
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      this.metrics.cacheMisses++;
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      return null;
    }

    this.metrics.cacheHits++;
    return cached.data;
  }

  clearCacheEntry(key) {
    this.cache.delete(key);
  }

  // Get cached data or fetch and cache
  async getCachedData(key, fetchFn, ttl = 300000) {
    // Check cache first
    const cached = this.getCache(key);
    if (cached) {
      return cached;
    }

    // If not in cache, fetch and cache the data
    try {
      this.metrics.requests++;
      const data = await fetchFn();
      this.setCache(key, data, ttl);
      return data;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  clearAllCache() {
    this.cache.clear();
  }

  // Request deduplication
  async deduplicateRequest(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Batch requests
  async batchRequests(requests, batchSize = 5) {
    const results = [];
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(batch);
      results.push(...batchResults);
    }
    return results;
  }

  // Performance monitoring
  startTimer(label) {
    return {
      label,
      start: performance.now(),
      end: () => {
        const duration = performance.now() - this.start;
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  }

  // Get performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size
    };
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      requests: 0,
      errors: 0
    };
  }
}

// Create singleton instance
const performanceOptimizer = new PerformanceOptimizer();

export default performanceOptimizer;