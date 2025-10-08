const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Security middleware
const validateAnalyticsRequest = (req, res, next) => {
  const { period, metrics, startDate, endDate } = req.query;
  
  // Validate period
  const validPeriods = ['today', 'yesterday', 'last7days', 'last30days', 'currentMonth', 'lastMonth', 'last3Months', 'last6Months', 'lastYear', 'last2Years', 'last5Years', 'allTime', 'custom'];
  if (period && !validPeriods.includes(period)) {
    return res.status(400).json({ error: 'Invalid period parameter' });
  }
  
  // Validate metrics
  if (metrics) {
    const validMetrics = ['revenue', 'bookings', 'customers', 'transporters', 'vehicles', 'drivers', 'expenses', 'profit', 'efficiency', 'utilization', 'operational', 'predictions'];
    const requestedMetrics = metrics.split(',');
    const invalidMetrics = requestedMetrics.filter(m => !validMetrics.includes(m));
    if (invalidMetrics.length > 0) {
      return res.status(400).json({ error: `Invalid metrics: ${invalidMetrics.join(', ')}` });
    }
  }
  
  // Validate date range for custom period
  if (period === 'custom') {
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required for custom period' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    if (start > end) {
      return res.status(400).json({ error: 'startDate must be before endDate' });
    }
    
    // Check if date range is not too large (max 2 years)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 730) {
      return res.status(400).json({ error: 'Date range cannot exceed 2 years' });
    }
  }
  
  next();
};

// Get analytics data
router.get('/', validateAnalyticsRequest, async (req, res) => {
  try {
    const { period, metrics, startDate, endDate } = req.query;
    const requestedMetrics = metrics ? metrics.split(',') : ['revenue', 'bookings', 'customers'];
    
    // Calculate date range based on period
    const dateRange = calculateDateRange(period, startDate, endDate);
    
    
    
    // Fetch data based on requested metrics
    const analyticsData = {};
    
    if (requestedMetrics.includes('revenue')) {
      analyticsData.revenue = await getRevenueAnalytics(dateRange);
    }
    
    
    if (requestedMetrics.includes('bookings')) {
      analyticsData.bookings = await getBookingAnalytics(dateRange);
    }
    
    if (requestedMetrics.includes('customers')) {
      analyticsData.customers = await getCustomerAnalytics(dateRange);
    }
    
    if (requestedMetrics.includes('transporters')) {
      analyticsData.transporters = await getTransporterAnalytics(dateRange);
    }
    
    if (requestedMetrics.includes('operational')) {
      analyticsData.operational = await getOperationalAnalytics(dateRange);
    }
    
    if (requestedMetrics.includes('predictions')) {
      analyticsData.predictions = await getPredictiveAnalytics(dateRange);
    }
    
    // Add raw data for route and vehicle analytics
    analyticsData.rawBookings = await getRawBookingsData(dateRange);
    analyticsData.challans = await getRawChallansData(dateRange);
    analyticsData.vehicles = await getRawVehiclesData();
    
    
    // Calculate KPIs
    analyticsData.kpis = await calculateKPIs(analyticsData, dateRange);
    
    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics API Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Helper function to calculate date range
function calculateDateRange(period, startDate, endDate) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return { start: yesterday, end: today };
    case 'last7days':
      return { start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), end: today };
    case 'last30days':
      return { start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), end: today };
    case 'currentMonth':
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: currentMonthStart, end: currentMonthEndDate };
    case 'lastMonth':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: lastMonthStart, end: lastMonthEnd };
    case 'last3Months':
      const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      // Include full current month instead of just up to today
      const last3MonthsEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: threeMonthsAgo, end: last3MonthsEnd };
    case 'last6Months':
      return { start: new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000), end: today };
    case 'lastYear':
      return { start: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000), end: today };
    case 'last2Years':
      return { start: new Date(today.getTime() - 730 * 24 * 60 * 60 * 1000), end: today };
    case 'last5Years':
      return { start: new Date(today.getTime() - 1825 * 24 * 60 * 60 * 1000), end: today };
    case 'allTime':
      return { start: new Date('2020-01-01'), end: today }; // Start from 2020
    case 'custom':
      return { start: new Date(startDate), end: new Date(endDate) };
    default:
      return { start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), end: today };
  }
}

// Revenue analytics
async function getRevenueAnalytics(dateRange) {
  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    include: {
      transporter: true,
      challanGoods: true
    }
  });

  // Get expenses for the same date range
  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    }
  });

  
  // Calculate revenue using the correct formula: Commission + Local Cartage
  const totalRevenue = bookings.reduce((sum, booking) => {
    const commissionAmount = (booking.weightKg || 0) * (booking.transporter?.commissionRate || 0);
    const localCartage = booking.localCartageCharges || 0;
    return sum + commissionAmount + localCartage;
  }, 0);
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => {
    return sum + (expense.amount || 0);
  }, 0);

  // Calculate profit as Revenue - Expenses
  const totalProfit = totalRevenue - totalExpenses;
  
  
  // Revenue by transporter
  const revenueByTransporter = {};
  bookings.forEach(booking => {
    const transporterName = booking.transporter?.name || 'Unknown';
    if (!revenueByTransporter[transporterName]) {
      revenueByTransporter[transporterName] = { revenue: 0, bookings: 0 };
    }
    const commissionAmount = (booking.weightKg || 0) * (booking.transporter?.commissionRate || 0);
    const localCartage = booking.localCartageCharges || 0;
    const bookingRevenue = commissionAmount + localCartage;
    revenueByTransporter[transporterName].revenue += bookingRevenue;
    revenueByTransporter[transporterName].bookings += 1;
  });
  
  // Revenue by route
  const revenueByRoute = {};
  bookings.forEach(booking => {
    const route = `${booking.fromLocation} → ${booking.toLocation}`;
    if (!revenueByRoute[route]) {
      revenueByRoute[route] = { revenue: 0, bookings: 0 };
    }
    const commissionAmount = (booking.weightKg || 0) * (booking.transporter?.commissionRate || 0);
    const localCartage = booking.localCartageCharges || 0;
    const bookingRevenue = commissionAmount + localCartage;
    revenueByRoute[route].revenue += bookingRevenue;
    revenueByRoute[route].bookings += 1;
  });
  
  // Monthly revenue and expenses data
  const monthlyData = {};
  
  // Initialize monthly data with revenue
  bookings.forEach(booking => {
    const month = booking.bookingDate.toISOString().substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { revenue: 0, expenses: 0, profit: 0 };
    }
    const commissionAmount = (booking.weightKg || 0) * (booking.transporter?.commissionRate || 0);
    const localCartage = booking.localCartageCharges || 0;
    const bookingRevenue = commissionAmount + localCartage;
    monthlyData[month].revenue += bookingRevenue;
  });

  // Add expenses to monthly data
  expenses.forEach(expense => {
    const month = expense.date.toISOString().substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { revenue: 0, expenses: 0, profit: 0 };
    }
    monthlyData[month].expenses += (expense.amount || 0);
  });

  // Calculate profit for each month (Revenue - Expenses)
  Object.keys(monthlyData).forEach(month => {
    monthlyData[month].profit = monthlyData[month].revenue - monthlyData[month].expenses;
  });

  // Daily revenue and expenses data - Initialize all days in range with zero values
  const dailyData = {};
  
  // Create entries for all days in the date range
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const day = d.toISOString().substring(0, 10);
    dailyData[day] = { revenue: 0, expenses: 0, profit: 0 };
  }
  
  // Populate with booking revenue data
  bookings.forEach(booking => {
    const day = booking.bookingDate.toISOString().substring(0, 10);
    if (dailyData[day]) { // Only process if day is in our range
      const commissionAmount = (booking.weightKg || 0) * (booking.transporter?.commissionRate || 0);
      const localCartage = booking.localCartageCharges || 0;
      const bookingRevenue = commissionAmount + localCartage;
      dailyData[day].revenue += bookingRevenue;
    }
  });

  // Populate with expenses data
  expenses.forEach(expense => {
    const day = expense.date.toISOString().substring(0, 10);
    if (dailyData[day]) { // Only process if day is in our range
      dailyData[day].expenses += (expense.amount || 0);
    }
  });

  // Calculate profit for each day (Revenue - Expenses)
  Object.keys(dailyData).forEach(day => {
    dailyData[day].profit = dailyData[day].revenue - dailyData[day].expenses;
  });
  
  return {
    total: totalRevenue,
    profit: totalProfit,
    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    byTransporter: Object.entries(revenueByTransporter).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      bookings: data.bookings,
      growth: 0 // Calculate growth rate
    })),
    byRoute: Object.entries(revenueByRoute).map(([route, data]) => ({
      route,
      revenue: data.revenue,
      bookings: data.bookings,
      growth: 0
    })),
    monthly: Object.entries(monthlyData).map(([month, data]) => ({
      period: month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.profit
    })),
    daily: Object.entries(dailyData)
      .sort(([a], [b]) => new Date(a) - new Date(b)) // Sort chronologically
      .map(([day, data]) => ({
        period: day,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.profit
      }))
  };
}

// Booking analytics
async function getBookingAnalytics(dateRange) {
  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    }
  });
  
  return {
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'completed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };
}

// Customer analytics
async function getCustomerAnalytics(dateRange) {
  
  const customers = await prisma.customer.findMany({
    include: {
      consigneeBookings: {
        include: {
          transporter: true
        }
      },
      consignorBookings: {
        include: {
          transporter: true
        }
      }
    }
  });
  
  
  const topCustomers = customers
    .map(customer => {
      // Only consider consignor bookings (customers who book/send shipments)
      const consignorBookings = customer.consignorBookings || [];
      
      // Filter consignor bookings by date range
      const filteredBookings = consignorBookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return bookingDate >= dateRange.start && bookingDate <= dateRange.end;
      });
      
      
      // Calculate revenue using correct formula: Commission + Local Cartage
      const revenue = filteredBookings.reduce((sum, booking) => {
        const commissionAmount = (booking.weightKg || 0) * (booking.transporter?.commissionRate || 0);
        const localCartage = booking.localCartageCharges || 0;
        return sum + commissionAmount + localCartage;
      }, 0);
      
      // Calculate total weight for ranking (only from consignor bookings)
      const totalWeight = filteredBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
      
      const result = {
        id: customer.id,
        name: customer.name,
        location: customer.city,
        revenue: revenue,
        weight: totalWeight,
        bookings: filteredBookings.length
      };
      
      return result;
    })
    .filter(customer => customer.weight > 0) // Only include customers with weight > 0
    .sort((a, b) => b.weight - a.weight) // Sort by weight as requested
    .slice(0, 10);
    
  
  // If no customers found in date range, try to get all customers with any bookings
  if (topCustomers.length === 0) {
    const allCustomers = await prisma.customer.findMany({
      include: {
        consigneeBookings: {
          include: {
            transporter: true
          }
        },
        consignorBookings: {
          include: {
            transporter: true
          }
        }
      }
    });
    
    const allTopCustomers = allCustomers
      .map(customer => {
        // Only consider consignor bookings (customers who book/send shipments)
        const consignorBookings = customer.consignorBookings || [];
        
        const revenue = consignorBookings.reduce((sum, booking) => {
          const commissionAmount = (booking.weightKg || 0) * (booking.transporter?.commissionRate || 0);
          const localCartage = booking.localCartageCharges || 0;
          return sum + commissionAmount + localCartage;
        }, 0);
        
        const totalWeight = consignorBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
        
        return {
          id: customer.id,
          name: customer.name,
          location: customer.city,
          revenue: revenue,
          weight: totalWeight,
          bookings: consignorBookings.length
        };
      })
      .filter(customer => customer.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10);
      
    return {
      total: allCustomers.length,
      top: allTopCustomers,
      retention: {
        retained: 0,
        churned: 0,
        atRisk: 0
      },
      acquisition: {
        total: 0,
        growthRate: 0,
        avgCost: 0
      }
    };
  }
  
  return {
    total: customers.length,
    top: topCustomers,
    retention: {
      retained: 0,
      churned: 0,
      atRisk: 0
    },
    acquisition: {
      total: 0,
      growthRate: 0,
      avgCost: 0
    }
  };
}

// Transporter analytics
async function getTransporterAnalytics(dateRange) {
  const transporters = await prisma.transporter.findMany({
    include: {
      bookings: true
    }
  });
  
  const performance = transporters.map(transporter => {
    // Filter bookings by date range
    const filteredBookings = transporter.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= dateRange.start && bookingDate <= dateRange.end;
    });
    
    // Calculate revenue using correct formula: Commission + Local Cartage
    const revenue = filteredBookings.reduce((sum, booking) => {
      const commissionAmount = (booking.weightKg || 0) * (transporter.commissionRate || 0);
      const localCartage = booking.localCartageCharges || 0;
      return sum + commissionAmount + localCartage;
    }, 0);
    
    // Calculate total weight
    const totalWeight = filteredBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
    
    return {
      id: transporter.id,
      name: transporter.name,
      score: Math.floor(Math.random() * 40) + 60, // Mock performance score
      revenue: revenue,
      weight: totalWeight,
      bookings: filteredBookings.length
    };
  });
  
  const utilization = {};
  transporters.forEach(transporter => {
    utilization[transporter.name] = Math.floor(Math.random() * 40) + 60; // Mock utilization
  });
  
  // Filter out transporters with no bookings in date range
  const filteredPerformance = performance.filter(transporter => transporter.bookings > 0);
  
  
  // If no transporters found in date range, try to get all transporters with any bookings
  if (filteredPerformance.length === 0) {
    const allTransporters = await prisma.transporter.findMany({
      include: {
        bookings: true
      }
    });
    
    const allPerformance = allTransporters.map(transporter => {
      const revenue = transporter.bookings.reduce((sum, booking) => {
        const commissionAmount = (booking.weightKg || 0) * (transporter.commissionRate || 0);
        const localCartage = booking.localCartageCharges || 0;
        return sum + commissionAmount + localCartage;
      }, 0);
      
      const totalWeight = transporter.bookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
      
      return {
        id: transporter.id,
        name: transporter.name,
        score: Math.floor(Math.random() * 40) + 60,
        revenue: revenue,
        weight: totalWeight,
        bookings: transporter.bookings.length
      };
    }).filter(transporter => transporter.bookings > 0);
    
    return {
      total: allTransporters.length,
      performance: allPerformance.sort((a, b) => b.revenue - a.revenue), // Sort by revenue descending
      utilization: {},
      rankings: allPerformance.sort((a, b) => b.revenue - a.revenue) // Sort by revenue descending
    };
  }
  
  return {
    total: transporters.length,
    performance: filteredPerformance.sort((a, b) => b.revenue - a.revenue), // Sort by revenue descending
    utilization,
    rankings: filteredPerformance.sort((a, b) => b.revenue - a.revenue) // Sort by revenue descending
  };
}

// Operational analytics
async function getOperationalAnalytics(dateRange) {
  try {
    console.log('getOperationalAnalytics - Date range:', dateRange);
    
    // Get challans with proper date filtering
    const challans = await prisma.challan.findMany({
      where: {
        dateGenerated: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    });
    
    const totalChallans = challans.length;
    const delivered = challans.filter(c => c.status === 'Delivered' || c.status === 'Completed').length;
    const inTransit = challans.filter(c => c.status === 'In Transit').length;
    const generated = challans.filter(c => c.status === 'Generated').length;
    
    // Calculate more relevant operational metrics
    const totalWeight = challans.reduce((sum, c) => sum + (c.totalWeight || 0), 0);
    const totalCharges = challans.reduce((sum, c) => sum + (c.totalCharges || 0), 0);
    const avgWeightPerChallan = totalChallans > 0 ? Math.round(totalWeight / totalChallans) : 0;
    const avgChargesPerChallan = totalChallans > 0 ? Math.round(totalCharges / totalChallans) : 0;
    
    console.log('getOperationalAnalytics - Challans:', { totalChallans, delivered, inTransit, generated });
    console.log('getOperationalAnalytics - Weight & Charges:', { totalWeight, totalCharges, avgWeightPerChallan, avgChargesPerChallan });
    
    // Get real transporter utilization data based on bookings
    const transporters = await prisma.transporter.findMany({
      include: {
        bookings: {
          where: {
            bookingDate: {
              gte: dateRange.start,
              lte: dateRange.end
            }
          }
        }
      }
    });
    
    // Calculate real utilization based on bookings
    const utilization = {};
    transporters.forEach(transporter => {
      const totalBookings = transporter.bookings.length;
      // For transport business, we consider bookings as "utilized" if they have weight > 0
      const utilizedBookings = transporter.bookings.filter(b => (b.weightKg || 0) > 0).length;
      const utilizationPercent = totalBookings > 0 ? Math.floor((utilizedBookings / totalBookings) * 100) : 0;
      utilization[transporter.name] = utilizationPercent;
    });
    
    // Calculate performance metrics based on actual booking data
    const totalBookings = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      }
    });
    
    // For transport business, "completed" means delivered (has challan with delivered status)
    const completedBookings = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: dateRange.start,
          lte: dateRange.end
        },
        challanGoods: {
          some: {
            challan: {
              status: {
                in: ['Delivered', 'Completed']
              }
            }
          }
        }
      }
    });
    
    // Calculate performance distribution
    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
    const performance = {
      excellent: Math.floor(completionRate * 0.8) || 0,
      good: Math.floor(completionRate * 0.6) || 0,
      average: Math.floor(completionRate * 0.4) || 0,
      poor: Math.floor(completionRate * 0.2) || 0
    };
    
    console.log('getOperationalAnalytics - Utilization:', utilization);
    console.log('getOperationalAnalytics - Performance:', performance);
    console.log('getOperationalAnalytics - Total bookings:', totalBookings, 'Completed:', completedBookings);
    
    return {
      efficiency: {
        totalWeight: totalWeight,           // Total weight handled (kg)
        totalCharges: totalCharges,         // Total charges collected (₹)
        avgWeightPerChallan: avgWeightPerChallan,  // Average weight per challan (kg)
        avgChargesPerChallan: avgChargesPerChallan // Average charges per challan (₹)
      },
      utilization,
      performance
    };
  } catch (error) {
    console.error('getOperationalAnalytics Error:', error);
    // Return default values in case of error
    return {
      efficiency: {
        onTime: 0,
        delayed: 0,
        cancelled: 0
      },
      utilization: {},
      performance: {
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0
      }
    };
  }
}

// Predictive analytics
async function getPredictiveAnalytics(dateRange) {
  return {
    forecasts: [
      {
        type: 'revenue',
        periods: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        historical: [100000, 120000, 110000, 130000, 125000, 140000],
        forecast: [null, null, null, 135000, 145000, 155000]
      },
      {
        type: 'bookings',
        periods: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        historical: [50, 60, 55, 65, 62, 70],
        forecast: [null, null, null, 68, 72, 75]
      }
    ],
    trends: [
      { period: 'Q1', score: 75 },
      { period: 'Q2', score: 82 },
      { period: 'Q3', score: 88 },
      { period: 'Q4', score: 85 }
    ],
    recommendations: [
      {
        title: 'Optimize Route Planning',
        description: 'Consider consolidating deliveries to reduce costs',
        impact: 15,
        category: 'Cost Optimization'
      },
      {
        title: 'Expand High-Performing Routes',
        description: 'Increase capacity on profitable routes',
        impact: 25,
        category: 'Revenue Growth'
      }
    ],
    growthPrediction: 12,
    confidenceLevel: 85,
    riskScore: 25
  };
}

// Calculate KPIs
async function calculateKPIs(analyticsData, dateRange) {
  try {
    const revenue = analyticsData.revenue?.total || 0;
    const bookings = analyticsData.bookings?.total || 0;
    const customers = analyticsData.customers?.total || 0;
    const transporters = analyticsData.transporters?.total || 0;
    
    // Calculate total weight from bookings
    const bookingsWithWeight = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      select: {
        weightKg: true
      }
    });
    
    const totalWeight = bookingsWithWeight.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
    
    // Calculate previous period for comparison
    const previousPeriodStart = new Date(dateRange.start.getTime() - (dateRange.end.getTime() - dateRange.start.getTime()));
    const previousPeriodEnd = new Date(dateRange.start);
    
    const previousBookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      },
      select: {
        weightKg: true
      }
    });
    
    const previousWeight = previousBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
    
    // Calculate weight change percentage
    const weightChange = previousWeight > 0 ? ((totalWeight - previousWeight) / previousWeight) * 100 : 0;
    
    return {
      totalRevenue: revenue,
      totalBookings: bookings,
      totalCustomers: customers,
      totalTransporters: transporters,
      totalWeight: totalWeight,
      weightChange: Math.round(weightChange * 100) / 100, // Round to 2 decimal places
      averageOrderValue: bookings > 0 ? revenue / bookings : 0,
      growthRate: 0, // Calculate based on previous period
      profitMargin: analyticsData.revenue?.profitMargin || 0
    };
  } catch (error) {
    console.error('Error in calculateKPIs:', error);
    // Return basic KPIs without weight data if there's an error
    return {
      totalRevenue: analyticsData.revenue?.total || 0,
      totalBookings: analyticsData.bookings?.total || 0,
      totalCustomers: analyticsData.customers?.total || 0,
      totalTransporters: analyticsData.transporters?.total || 0,
      totalWeight: 0,
      weightChange: 0,
      averageOrderValue: 0,
      growthRate: 0,
      profitMargin: analyticsData.revenue?.profitMargin || 0
    };
  }
}

// Get weight analytics with historical data
async function getWeightAnalytics(dateRange, viewMode = 'monthly', selectedYear, selectedMonth) {
  console.log('getWeightAnalytics - Date range:', dateRange, 'View mode:', viewMode, 'Year:', selectedYear, 'Month:', selectedMonth);
  
  try {
    // First, get all transporters to ensure we have a consistent list
    const allTransporters = await prisma.transporter.findMany({
      select: { name: true }
    });
    const transporterNames = allTransporters.map(t => t.name);
    
    if (viewMode === 'monthly') {
      // Get monthly data for the selected year
      const monthlyData = {};
      
      for (let month = 1; month <= 12; month++) {
        const monthStart = new Date(selectedYear, month - 1, 1);
        const monthEnd = new Date(selectedYear, month, 0, 23, 59, 59, 999);
        
        const monthBookings = await prisma.booking.findMany({
          where: {
            bookingDate: {
              gte: monthStart,
              lte: monthEnd
            }
          },
          include: {
            transporter: true
          }
        });
        
        // Group by transporter
        const transporterWeights = {};
        monthBookings.forEach(booking => {
          const transporterName = booking.transporter?.name || 'Unknown';
          if (!transporterWeights[transporterName]) {
            transporterWeights[transporterName] = 0;
          }
          transporterWeights[transporterName] += booking.weightKg || 0;
        });
        
        monthlyData[month] = transporterWeights;
      }
      
      // If no data found for the selected year, try to find data in other years
      const hasData = Object.values(monthlyData).some(monthData => Object.keys(monthData).length > 0);
      
      if (!hasData) {
        console.log('No data found for selected year, checking other years...');
        
        // Find years with data
        const yearsWithData = await prisma.booking.findMany({
          select: {
            bookingDate: true
          },
          distinct: ['bookingDate']
        });
        
        const availableYears = [...new Set(yearsWithData.map(booking => new Date(booking.bookingDate).getFullYear()))];
        console.log('Available years with data:', availableYears);
        
        if (availableYears.length > 0) {
          // Use the most recent year with data
          const latestYear = Math.max(...availableYears);
          console.log('Using latest year with data:', latestYear);
          
          // Fetch data for the latest year
          for (let month = 1; month <= 12; month++) {
            const monthStart = new Date(latestYear, month - 1, 1);
            const monthEnd = new Date(latestYear, month, 0, 23, 59, 59, 999);
            
            const monthBookings = await prisma.booking.findMany({
              where: {
                bookingDate: {
                  gte: monthStart,
                  lte: monthEnd
                }
              },
              include: {
                transporter: true
              }
            });
            
            const transporterWeights = {};
            monthBookings.forEach(booking => {
              const transporterName = booking.transporter?.name || 'Unknown';
              if (!transporterWeights[transporterName]) {
                transporterWeights[transporterName] = 0;
              }
              transporterWeights[transporterName] += booking.weightKg || 0;
            });
            
            monthlyData[month] = transporterWeights;
          }
        }
      }
      
      return {
        type: 'monthly',
        data: monthlyData,
        transporters: transporterNames,
        actualYear: hasData ? selectedYear : (availableYears.length > 0 ? Math.max(...availableYears) : selectedYear)
      };
    } else {
      // Get daily data for the selected month
      const dailyData = {};
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStart = new Date(selectedYear, selectedMonth - 1, day);
        const dayEnd = new Date(selectedYear, selectedMonth - 1, day, 23, 59, 59, 999);
        
        const dayBookings = await prisma.booking.findMany({
          where: {
            bookingDate: {
              gte: dayStart,
              lte: dayEnd
            }
          },
          include: {
            transporter: true
          }
        });
        
        // Group by transporter
        const transporterWeights = {};
        dayBookings.forEach(booking => {
          const transporterName = booking.transporter?.name || 'Unknown';
          if (!transporterWeights[transporterName]) {
            transporterWeights[transporterName] = 0;
          }
          transporterWeights[transporterName] += booking.weightKg || 0;
        });
        
        dailyData[day] = transporterWeights;
      }
      
      return {
        type: 'daily',
        data: dailyData,
        transporters: transporterNames,
        actualYear: selectedYear,
        actualMonth: selectedMonth
      };
    }
  } catch (error) {
    console.error('getWeightAnalytics Error:', error);
    return {
      type: viewMode,
      data: {},
      transporters: []
    };
  }
}

// Add weight analytics route
router.get('/weight', async (req, res) => {
  try {
    const { viewMode, year, month } = req.query;
    const selectedYear = parseInt(year) || new Date().getFullYear();
    const selectedMonth = parseInt(month) || new Date().getMonth() + 1;
    
    // Calculate date range based on view mode
    let dateRange;
    if (viewMode === 'monthly') {
      dateRange = {
        start: new Date(selectedYear, 0, 1),
        end: new Date(selectedYear, 11, 31, 23, 59, 59, 999)
      };
    } else {
      dateRange = {
        start: new Date(selectedYear, selectedMonth - 1, 1),
        end: new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999)
      };
    }
    
    const weightData = await getWeightAnalytics(dateRange, viewMode, selectedYear, selectedMonth);
    res.json(weightData);
  } catch (error) {
    console.error('Weight Analytics API Error:', error);
    res.status(500).json({ error: 'Failed to fetch weight analytics data' });
  }
});

// Get raw bookings data for route analytics
async function getRawBookingsData(dateRange) {
  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    select: {
      id: true,
      fromLocation: true,
      toLocation: true,
      weightKg: true,
      totalCharges: true,
      bookingDate: true,
      transporterId: true,
      vehicleId: true
    }
  });
  
  return bookings;
}

// Get raw challans data for delivery analytics
async function getRawChallansData(dateRange) {
    const challans = await prisma.challan.findMany({
      where: {
        dateGenerated: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      include: {
        transportCompany: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  
  return challans;
}

// Get raw vehicles data for vehicle analytics
async function getRawVehiclesData() {
  const vehicles = await prisma.vehicle.findMany({
    select: {
      id: true,
      vehicleNumber: true,
      capacity: true,
      status: true,
      fuelType: true,
      year: true,
      transporterId: true
    }
  });
  
  return vehicles;
}




module.exports = router;
