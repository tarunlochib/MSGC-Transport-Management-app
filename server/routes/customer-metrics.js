const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Simple in-memory cache for better performance
const cache = new Map();
const CACHE_DURATION = 5000; // 5 seconds for debugging

// Get customer metrics data
router.get('/', async (req, res) => {
  try {
    const { 
      timeRange = 'monthly', 
      customStartDate, 
      customEndDate,
      specificMonth,
      specificYear
    } = req.query;

    // Create cache key
    const cacheKey = JSON.stringify({ timeRange, customStartDate, customEndDate, specificMonth, specificYear });
    
    console.log('Request received with params:', { timeRange, customStartDate, customEndDate, specificMonth, specificYear });
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached data for key:', cacheKey);
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      return res.json(cached.data);
    }
    
    console.log('Cache miss, processing fresh data for key:', cacheKey);
    
    // Fetch all necessary data in parallel with optimizations
    const [customers, bookings, transporters] = await Promise.all([
      prisma.customer.findMany({
        select: {
          id: true,
          name: true,
          status: true
        }
      }),
      prisma.booking.findMany({
        select: {
          id: true,
          bookingDate: true,
          weightKg: true,
          totalCharges: true,
          consignorId: true,
          transporterId: true,
          transporter: {
            select: {
              id: true,
              name: true
            }
          },
          consignor: {
            select: {
              id: true,
              name: true
            }
          }
        },
        // Optimize for specific time ranges
        ...(timeRange === 'weekly' && {
          orderBy: { bookingDate: 'desc' },
          take: 1000 // Limit to recent bookings for weekly view
        }),
        ...(timeRange === 'monthly' && {
          orderBy: { bookingDate: 'desc' },
          take: 2000 // Limit to recent bookings for monthly view
        })
      }),
      prisma.transporter.findMany({
        select: {
          id: true,
          name: true
        }
      })
    ]);

    // Calculate date range based on timeRange parameter or custom dates
    let startDate, endDate;
    
    if (customStartDate && customEndDate) {
      // Use custom date range
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
    } else if (specificMonth && specificYear) {
      // Use specific month and year
      const month = parseInt(specificMonth) - 1; // JavaScript months are 0-indexed
      const year = parseInt(specificYear);
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of the month
    } else if (specificYear) {
      // Use specific year
      const year = parseInt(specificYear);
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999); // Last day of the year
    } else {
      // Use predefined time range
      const now = new Date();
      endDate = now;
      
      switch (timeRange) {
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'yearly':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          // Show all time data
          startDate = new Date('1900-01-01');
          endDate = new Date('2100-12-31');
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    // Filter bookings by date range and additional filters
    let filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= startDate && bookingDate <= endDate;
    });

    console.log('Date range:', { startDate, endDate });
    console.log('Total bookings:', bookings.length);
    console.log('Filtered bookings:', filteredBookings.length);


    // Calculate customer metrics
    const customerMetrics = customers.map(customer => {
      // Get all bookings for this customer (ONLY as consignor - the one who makes the booking)
      const customerBookings = filteredBookings.filter(booking => 
        booking.consignorId === customer.id
      );

      // Calculate total weight
      const totalWeight = customerBookings.reduce((sum, booking) => 
        sum + (booking.weightKg || 0), 0
      );

      // Calculate total bookings
      const totalBookings = customerBookings.length;

      // Get transport types used
      const transportTypes = [...new Set(
        customerBookings
          .map(booking => booking.transporter?.name)
          .filter(Boolean)
      )];

      // Get most used transport
      const transportUsage = {};
      customerBookings.forEach(booking => {
        if (booking.transporter?.name) {
          transportUsage[booking.transporter.name] = (transportUsage[booking.transporter.name] || 0) + 1;
        }
      });

      const mostUsedTransport = Object.keys(transportUsage).reduce((a, b) => 
        transportUsage[a] > transportUsage[b] ? a : b, ''
      );

      // Calculate total amount
      const totalAmount = customerBookings.reduce((sum, booking) => 
        sum + (booking.totalCharges || 0), 0
      );

      // Get recent activity (last 5 bookings)
      const recentBookings = customerBookings
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
        .slice(0, 5);

      return {
        id: customer.id,
        name: customer.name,
        gstNumber: customer.gstNumber,
        address: customer.address,
        phone: customer.phone,
        email: customer.email,
        totalWeight,
        totalBookings,
        totalAmount,
        transportTypes,
        mostUsedTransport,
        recentBookings,
        customerType: customer.customerType,
        status: customer.status,
        createdAt: customer.createdAt
      };
    });

    // Sort by total weight to get top customers
    const sortedCustomers = customerMetrics.sort((a, b) => b.totalWeight - a.totalWeight);
    const topCustomers = sortedCustomers.slice(0, 5);

    // Calculate monthly trends for top 10 customers (optimized)
    const monthlyTrends = calculateMonthlyTrends(
      sortedCustomers.slice(0, 10), 
      filteredBookings, 
      timeRange,
      startDate,
      endDate
    );

    console.log('Monthly trends data:', JSON.stringify(monthlyTrends, null, 2));

    // Calculate transport usage breakdown
    const transportUsage = calculateTransportUsage(filteredBookings, transporters);

    // Calculate summary statistics based on ALL filtered bookings (not just top customers)
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'Active').length;
    const totalWeight = filteredBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
    const totalBookings = filteredBookings.length;
    const averageWeightPerCustomer = totalCustomers > 0 ? totalWeight / totalCustomers : 0;
    const averageBookingsPerCustomer = totalCustomers > 0 ? totalBookings / totalCustomers : 0;

    // Prepare response data
    const responseData = {
      customers: customerMetrics,
      topCustomers,
      monthlyTrends,
      transportUsage,
      summary: {
        totalCustomers,
        activeCustomers,
        totalWeight,
        totalBookings,
        averageWeightPerCustomer,
        averageBookingsPerCustomer
      },
      timeRange
    };

    // Cache the response
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    // Clean up old cache entries (keep cache size manageable)
    if (cache.size > 50) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    // Set response headers for better performance
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json(responseData);

  } catch (error) {
    console.error('Error fetching customer metrics data:', error);
    res.status(500).json({ error: 'Failed to fetch customer metrics' });
  }
});

// Get detailed customer metrics for modal
router.get('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { timeRange = 'monthly' } = req.query;

    const [customer, allBookings] = await Promise.all([
      prisma.customer.findUnique({
        where: { id: customerId }
      }),
      prisma.booking.findMany({
        include: {
          transporter: true,
          vehicle: true,
          driver: true,
          consignor: true,
          consignee: true
        }
      })
    ]);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Filter bookings for this customer (ONLY as consignor)
    const customerBookings = allBookings.filter(booking => 
      booking.consignorId === customerId
    );

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredBookings = customerBookings.filter(booking => 
      new Date(booking.bookingDate) >= startDate
    );

    // Calculate detailed metrics
    const totalWeight = filteredBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
    const totalBookings = filteredBookings.length;
    const totalAmount = filteredBookings.reduce((sum, booking) => sum + (booking.totalCharges || 0), 0);

    // Transport types used
    const transportTypes = [...new Set(
      filteredBookings
        .map(booking => booking.transporter?.name)
        .filter(Boolean)
    )];

    // Monthly breakdown
    const monthlyBreakdown = calculateMonthlyBreakdown(filteredBookings, timeRange);

    // Booking frequency analysis
    const bookingFrequency = analyzeBookingFrequency(filteredBookings);

    res.json({
      customer,
      metrics: {
        totalWeight,
        totalBookings,
        totalAmount,
        transportTypes,
        monthlyBreakdown,
        bookingFrequency
      }
    });

  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({ error: 'Failed to fetch customer details' });
  }
});

// Helper function to calculate monthly trends for top customers
const calculateMonthlyTrends = (topCustomers, bookings, timeRange, startDate, endDate) => {
  const months = [];
  
  // Generate time periods based on the actual date range
  if (timeRange === 'weekly') {
    // For weekly (last 7 days), generate individual days
    const current = new Date(startDate);
    let dayCount = 0;
    
    while (current <= endDate && dayCount < 7) {
      const dayStart = new Date(current);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(current);
      dayEnd.setHours(23, 59, 59, 999);
      
      months.push({
        month: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: new Date(current),
        start: dayStart,
        end: dayEnd
      });
      
      current.setDate(current.getDate() + 1);
      dayCount++;
    }
  } else {
    // For monthly/yearly/all, generate months within the date range
    const current = new Date(startDate);
    current.setDate(1); // Start from the first day of the month
    
    // For 'all' timeRange, we need to find the actual date range from bookings
    if (timeRange === 'all') {
      // Find the earliest and latest booking dates from the actual data
      const bookingDates = bookings.map(booking => new Date(booking.bookingDate)).filter(date => !isNaN(date));
      if (bookingDates.length > 0) {
        const earliestDate = new Date(Math.min(...bookingDates));
        const latestDate = new Date(Math.max(...bookingDates));
        
        // Set the current to the earliest month
        current.setFullYear(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
        
        // Generate months from earliest to latest booking date
        const endDateForAll = new Date(latestDate);
        endDateForAll.setMonth(endDateForAll.getMonth() + 1, 1); // Go to next month to include the latest month
        
        while (current < endDateForAll) {
          const monthStart = new Date(current);
          const monthEnd = new Date(current);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          monthEnd.setDate(0); // Last day of the current month
          
          months.push({
            month: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            date: new Date(current),
            start: monthStart,
            end: monthEnd
          });
          
          current.setMonth(current.getMonth() + 1);
        }
      }
    } else {
      // For monthly/yearly, generate months within the predefined date range
      while (current <= endDate) {
        const monthStart = new Date(current);
        const monthEnd = new Date(current);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0); // Last day of the current month
        
        months.push({
          month: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          date: new Date(current),
          start: monthStart,
          end: monthEnd
        });
        
        current.setMonth(current.getMonth() + 1);
      }
    }
  }

  // Calculate data for each customer
  return topCustomers.map(customer => {
    const customerData = months.map(month => {
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        return booking.consignorId === customer.id &&
               bookingDate >= month.start && bookingDate <= month.end;
      });

      const weight = monthBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
      const bookingCount = monthBookings.length;

      return {
        month: month.month,
        date: month.date,
        weight,
        bookings: bookingCount
      };
    });

    return {
      customerName: customer.name,
      data: customerData
    };
  });
};

// Helper function to calculate transport usage breakdown
const calculateTransportUsage = (bookings, transporters) => {
  const usage = {};
  
  bookings.forEach(booking => {
    if (booking.transporter?.name) {
      usage[booking.transporter.name] = (usage[booking.transporter.name] || 0) + 1;
    }
  });

  // Convert to array and sort by usage
  return Object.entries(usage)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / bookings.length) * 100
    }))
    .sort((a, b) => b.count - a.count);
};

// Helper function to calculate monthly breakdown
const calculateMonthlyBreakdown = (bookings, timeRange) => {
  const months = [];
  const now = new Date();
  
  let monthCount;
  switch (timeRange) {
    case 'weekly':
      monthCount = 4;
      break;
    case 'monthly':
      monthCount = 6;
      break;
    case 'yearly':
      monthCount = 12;
      break;
    default:
      monthCount = 6;
  }

  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(now);
    if (timeRange === 'weekly') {
      date.setDate(date.getDate() - (i * 7));
    } else {
      date.setMonth(date.getMonth() - i);
    }
    
    const monthLabel = timeRange === 'weekly' 
      ? `Week ${monthCount - i}`
      : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const monthStart = new Date(date);
    const monthEnd = new Date(date);
    
    if (timeRange === 'weekly') {
      monthEnd.setDate(monthStart.getDate() + 7);
    } else {
      monthEnd.setMonth(monthStart.getMonth() + 1);
    }

    const monthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= monthStart && bookingDate < monthEnd;
    });

    months.push({
      month: monthLabel,
      weight: monthBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0),
      bookings: monthBookings.length,
      amount: monthBookings.reduce((sum, booking) => sum + (booking.totalCharges || 0), 0)
    });
  }

  return months;
};

// Helper function to analyze booking frequency
const analyzeBookingFrequency = (bookings) => {
  const frequency = {
    daily: 0,
    weekly: 0,
    monthly: 0,
    irregular: 0
  };

  // Group bookings by date
  const bookingsByDate = {};
  bookings.forEach(booking => {
    const date = new Date(booking.bookingDate).toDateString();
    if (!bookingsByDate[date]) {
      bookingsByDate[date] = [];
    }
    bookingsByDate[date].push(booking);
  });

  const dates = Object.keys(bookingsByDate).sort();
  
  if (dates.length > 1) {
    // Analyze frequency patterns
    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
      intervals.push(diffDays);
    }

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    if (avgInterval <= 1) {
      frequency.daily = 1;
    } else if (avgInterval <= 7) {
      frequency.weekly = 1;
    } else if (avgInterval <= 30) {
      frequency.monthly = 1;
    } else {
      frequency.irregular = 1;
    }
  }

  return frequency;
};

module.exports = router;
