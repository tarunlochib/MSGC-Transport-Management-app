const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Generate bill for transporter for specific month
router.post('/generate', async (req, res) => {
  try {
    const { transporterId, month, year } = req.body;
    
    if (!transporterId || !month || !year) {
      return res.status(400).json({ error: 'Transporter ID, month, and year are required' });
    }
    
    // Get transporter details
    const transporter = await prisma.transporter.findUnique({
      where: { id: transporterId }
    });
    
    if (!transporter) {
      return res.status(404).json({ error: 'Transporter not found' });
    }
    
    // Get bookings for the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const bookings = await prisma.booking.findMany({
      where: {
        transporterId,
        bookingDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        vehicle: true,
        driver: true
      },
      orderBy: {
        bookingDate: 'asc'
      }
    });
    
    // Calculate billing for each booking using the new logic
    const billItems = bookings.map(booking => {
      // Calculate commission amount using rupees per kg logic
      // Commission rate is in rupees per kg (e.g., ₹1.05 per kg)
      const commissionRate = transporter.commissionRate || 0; // This is rupees per kg
      const commissionAmount = booking.weightKg * commissionRate;
      
      // Add local cartage charges to commission amount
      const totalDue = commissionAmount + booking.localCartageCharges;
      
      // Calculate paid amount based on payment method
      const paidAmount = booking.paymentMethod === 'Paid' ? booking.totalCharges : 0;
      
      // Subtract paid amount to get remaining amount
      const remainingAmount = totalDue - paidAmount;
      
      return {
        ...booking,
        commissionAmount,
        totalDue,
        paidAmount,
        remainingAmount
      };
    });
    
    // Calculate totals
    const totalWeight = bookings.reduce((sum, booking) => sum + booking.weightKg, 0);
    const totalAmount = billItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalCommission = billItems.reduce((sum, item) => sum + item.commissionAmount, 0);
    const totalLocalCartage = billItems.reduce((sum, item) => sum + item.localCartageCharges, 0);
    const totalPaid = billItems.reduce((sum, item) => sum + item.paidAmount, 0);
    const totalDue = billItems.reduce((sum, item) => sum + item.totalDue, 0);
    const totalRemaining = billItems.reduce((sum, item) => sum + item.remainingAmount, 0);
    
    const bill = {
      transporter,
      month,
      year,
      startDate,
      endDate,
      bookings: billItems,
      summary: {
        totalBookings: bookings.length,
        totalWeight,
        totalAmount,
        totalCommission,
        totalLocalCartage,
        totalPaid,
        totalDue,
        totalRemaining
      }
    };
    
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get billing history for a transporter
router.get('/transporter/:transporterId', async (req, res) => {
  try {
    const { transporterId } = req.params;
    const { month, year } = req.query;
    
    const transporter = await prisma.transporter.findUnique({
      where: { id: transporterId }
    });
    
    if (!transporter) {
      return res.status(404).json({ error: 'Transporter not found' });
    }
    
    let whereClause = { transporterId };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      whereClause.bookingDate = {
        gte: startDate,
        lte: endDate
      };
    }
    
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        vehicle: true,
        driver: true
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });
    
    // Calculate billing for each booking using the new logic
    const billItems = bookings.map(booking => {
      // Calculate commission amount using rupees per kg logic
      // Commission rate is in rupees per kg (e.g., ₹1.05 per kg)
      const commissionRate = transporter.commissionRate || 0; // This is rupees per kg
      const commissionAmount = booking.weightKg * commissionRate;
      
      // Add local cartage charges to commission amount
      const totalDue = commissionAmount + booking.localCartageCharges;
      
      // Calculate paid amount based on payment method
      const paidAmount = booking.paymentMethod === 'Paid' ? booking.totalCharges : 0;
      
      // Subtract paid amount to get remaining amount
      const remainingAmount = totalDue - paidAmount;
      
      return {
        ...booking,
        commissionAmount,
        totalDue,
        paidAmount,
        remainingAmount
      };
    });
    
    res.json({
      transporter,
      bookings: billItems,
      totalBookings: bookings.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all transporters for billing
router.get('/transporters', async (req, res) => {
  try {
    const transporters = await prisma.transporter.findMany({
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json(transporters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 