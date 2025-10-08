const express = require('express');
const router = express.Router();
const predictiveAnalyticsService = require('../services/predictiveAnalytics');

/**
 * GET /api/predictive-analytics
 * Get predictive analytics data
 */
router.get('/', async (req, res) => {
  try {
    const { 
      period = 'next6Months',
      forecastMonths = 6,
      forecastStartMonth,
      forecastStartYear,
      startDate,
      endDate
    } = req.query;

    // Calculate date range
    const dateRange = calculateDateRange(period, startDate, endDate);
    
    // Prepare forecast options
    const forecastOptions = {
      forecastPeriod: period,
      forecastMonths: parseInt(forecastMonths),
      forecastStartMonth: forecastStartMonth ? parseInt(forecastStartMonth) : new Date().getMonth() + 1,
      forecastStartYear: forecastStartYear ? parseInt(forecastStartYear) : new Date().getFullYear()
    };

    console.log('Predictive Analytics Request:', { dateRange, forecastOptions });

    // Generate predictions
    const predictions = await predictiveAnalyticsService.generatePredictions(dateRange, forecastOptions);

    console.log('Predictive Analytics Response:', predictions);

    res.json({
      success: true,
      data: predictions
    });

  } catch (error) {
    console.error('Error in predictive analytics route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate predictive analytics',
      message: error.message
    });
  }
});

/**
 * Calculate date range based on period
 */
function calculateDateRange(period, startDate, endDate) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (startDate && endDate) {
    return {
      start: new Date(startDate),
      end: new Date(endDate)
    };
  }

  switch (period) {
    case 'currentMonth':
      const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: currentMonthStart, end: currentMonthEnd };

    case 'last3Months':
      const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      const last3MonthsEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: threeMonthsAgo, end: last3MonthsEnd };

    case 'lastYear':
      const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      return { start: lastYearStart, end: lastYearEnd };

    default:
      // Default to current month
      const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: defaultStart, end: defaultEnd };
  }
}

module.exports = router;

