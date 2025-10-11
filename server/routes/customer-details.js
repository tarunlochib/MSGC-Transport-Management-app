const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get detailed customer data
router.get('/', async (req, res) => {
  try {
    console.log('=== Customer Details API Called ===');
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    console.log('Fetching customer details data...');

    // Fetch all customers (consignors) with their booking data
    console.log('Step 1: Fetching customers from database...');
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    console.log('Step 1 Complete: Found', customers.length, 'customers');

    // Fetch all bookings with consignor information
    console.log('Step 2: Fetching bookings from database...');
    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        consignorId: true,
        weightKg: true,
        totalCharges: true,
        bookingDate: true,
        paymentMethod: true,
        consignor: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    console.log('Step 2 Complete: Found', bookings.length, 'bookings');

    // Process customer data with aggregated booking information
    console.log('Step 3: Processing customer statistics...');
    const customersWithStats = customers.map(customer => {
      // Filter bookings for this customer (consignor)
      const customerBookings = bookings.filter(booking => booking.consignorId === customer.id);
      
      // Calculate statistics
      const totalWeight = customerBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
      const totalBookings = customerBookings.length;
      const totalAmount = customerBookings.reduce((sum, booking) => sum + (booking.totalCharges || 0), 0);
      const averageWeight = totalBookings > 0 ? totalWeight / totalBookings : 0;
      const averageAmount = totalBookings > 0 ? totalAmount / totalBookings : 0;
      
      // Get recent bookings (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentBookings = customerBookings.filter(booking => 
        new Date(booking.bookingDate) >= thirtyDaysAgo
      ).length;

      // Get payment method breakdown instead of status
      const paymentMethodBreakdown = customerBookings.reduce((acc, booking) => {
        const method = booking.paymentMethod || 'Not Specified';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {});

      // Get monthly booking trend (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const monthlyTrend = {};
      customerBookings
        .filter(booking => new Date(booking.bookingDate) >= sixMonthsAgo)
        .forEach(booking => {
          const monthKey = new Date(booking.bookingDate).toISOString().substring(0, 7); // YYYY-MM
          monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + 1;
        });

      return {
        ...customer,
        totalWeight,
        totalBookings,
        totalAmount,
        averageWeight,
        averageAmount,
        recentBookings,
        paymentMethodBreakdown,
        monthlyTrend: Object.entries(monthlyTrend).map(([month, count]) => ({
          month,
          count
        })).sort((a, b) => a.month.localeCompare(b.month)),
        lastBookingDate: customerBookings.length > 0 
          ? customerBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))[0].bookingDate
          : null
      };
    });

    // Sort customers by total weight (descending)
    customersWithStats.sort((a, b) => b.totalWeight - a.totalWeight);

    console.log('Step 3 Complete: Processed', customersWithStats.length, 'customers with booking statistics');
    console.log('Step 4: Sending response...');

    // Calculate summary statistics
    const summary = {
      totalCustomers: customersWithStats.length,
      activeCustomers: customersWithStats.filter(c => c.status === 'Active').length,
      totalWeight: customersWithStats.reduce((sum, c) => sum + c.totalWeight, 0),
      totalBookings: customersWithStats.reduce((sum, c) => sum + c.totalBookings, 0),
      totalAmount: customersWithStats.reduce((sum, c) => sum + c.totalAmount, 0),
      averageWeightPerCustomer: customersWithStats.length > 0 
        ? customersWithStats.reduce((sum, c) => sum + c.totalWeight, 0) / customersWithStats.length 
        : 0,
      averageBookingsPerCustomer: customersWithStats.length > 0 
        ? customersWithStats.reduce((sum, c) => sum + c.totalBookings, 0) / customersWithStats.length 
        : 0,
      topCustomers: customersWithStats.slice(0, 5)
    };

    res.json(customersWithStats);

  } catch (error) {
    console.error('Error fetching customer details:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch customer details',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get detailed information for a specific customer
router.get('/:id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    
    if (isNaN(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    // Fetch customer details
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Fetch all bookings for this customer
    const bookings = await prisma.booking.findMany({
      where: { consignorId: customerId },
      select: {
        id: true,
        weightKg: true,
        totalCharges: true,
        bookingDate: true,
        paymentMethod: true,
        fromLocation: true,
        toLocation: true,
        transporter: {
          select: {
            id: true,
            name: true
          }
        },
        consignee: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });

    // Calculate detailed statistics
    const totalWeight = bookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
    const totalBookings = bookings.length;
    const totalAmount = bookings.reduce((sum, booking) => sum + (booking.totalCharges || 0), 0);
    const averageWeight = totalBookings > 0 ? totalWeight / totalBookings : 0;
    const averageAmount = totalBookings > 0 ? totalAmount / totalBookings : 0;

    // Get payment method breakdown
    const paymentMethodBreakdown = bookings.reduce((acc, booking) => {
      const method = booking.paymentMethod || 'Not Specified';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    // Get monthly booking trend
    const monthlyTrend = {};
    bookings.forEach(booking => {
      const monthKey = new Date(booking.bookingDate).toISOString().substring(0, 7);
      monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + 1;
    });

    // Get transporter usage
    const transporterUsage = {};
    bookings.forEach(booking => {
      if (booking.transporter) {
        const transporterName = booking.transporter.name;
        transporterUsage[transporterName] = (transporterUsage[transporterName] || 0) + 1;
      }
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBookings = bookings.filter(booking => 
      new Date(booking.bookingDate) >= thirtyDaysAgo
    );

    const customerDetails = {
      ...customer,
      totalWeight,
      totalBookings,
      totalAmount,
      averageWeight,
      averageAmount,
      paymentMethodBreakdown,
      monthlyTrend: Object.entries(monthlyTrend)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      transporterUsage: Object.entries(transporterUsage)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      recentBookings,
      lastBookingDate: bookings.length > 0 ? bookings[0].bookingDate : null,
      bookings: bookings.slice(0, 50) // Limit to recent 50 bookings
    };

    res.json(customerDetails);

  } catch (error) {
    console.error('Error fetching specific customer details:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch customer details',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
