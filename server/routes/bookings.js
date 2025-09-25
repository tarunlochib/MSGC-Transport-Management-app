const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        transporter: true,
        vehicle: true,
        driver: true,
        consignor: true,
        consignee: true,
        godown: true,
        packages: true,
        invoices: true
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single booking
router.get('/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        transporter: true,
        vehicle: true,
        driver: true,
        consignor: true,
        consignee: true,
        godown: true,
        packages: true,
        invoices: true
      }
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create booking
router.post('/', async (req, res) => {
  try {
    const {
      grNumber,
      bookingDate,
      consignorName,
      consignorAddress,
      consignorGST,
      consigneeName,
      consigneeAddress,
      consigneeGST,
      fromLocation,
      toLocation,
      weightKg,
      totalWeight,
      ewayBill,
      privateMarka,
      paymentMethod,
      paymentType,
      totalAmount,
      paidAmount,
      deliveryAgainst,
      freightCharges,
      localCartageCharges,
      doorDeliveryCharges,
      stationaryCharges,
      labourCharges,
      otherCharges,
      totalCharges,
      transporterId,
      vehicleId,
      driverId,
      consignorId,
      consigneeId,
      godownId,
      packages,
      invoices
    } = req.body;
    
    if (!grNumber || !bookingDate || !consignorName || !consigneeName || !fromLocation || !toLocation || !transporterId) {
      return res.status(400).json({ 
        error: 'GR Number, booking date, consignor name, consignee name, from location, to location, and transporter are required' 
      });
    }
    
    // Check if GR number already exists
    const existingBooking = await prisma.booking.findUnique({
      where: { grNumber }
    });
    
    if (existingBooking) {
      return res.status(400).json({ error: 'Booking with this GR number already exists' });
    }
    
    const booking = await prisma.booking.create({
      data: {
        grNumber,
        bookingDate: new Date(bookingDate),
        consignorName,
        consignorAddress,
        consignorGST,
        consigneeName,
        consigneeAddress,
        consigneeGST,
        fromLocation,
        toLocation,
        weightKg: Math.round(parseFloat(weightKg || totalWeight || 0)),
        ewayBill,
        privateMarka,
        paymentMethod,
        paymentType,
        totalAmount: Math.round(parseFloat(totalAmount || 0)),
        paidAmount: Math.round(parseFloat(paidAmount || 0)),
        deliveryAgainst,
        freightCharges: Math.round(parseFloat(freightCharges || 0)),
        localCartageCharges: Math.round(parseFloat(localCartageCharges || 0)),
        doorDeliveryCharges: Math.round(parseFloat(doorDeliveryCharges || 0)),
        stationaryCharges: Math.round(parseFloat(stationaryCharges || 0)),
        labourCharges: Math.round(parseFloat(labourCharges || 0)),
        otherCharges: Math.round(parseFloat(otherCharges || 0)),
        totalCharges: Math.round(parseFloat(totalCharges || 0)),
        transporterId,
        vehicleId: vehicleId || null,
        driverId: driverId || null,
        consignorId: consignorId || null,
        consigneeId: consigneeId || null,
        godownId: godownId || null,
        packages: {
          create: packages || []
        },
        invoices: {
          create: invoices || []
        }
      },
      include: {
        transporter: true,
        vehicle: true,
        driver: true,
        packages: true,
        invoices: true
      }
    });

    // Automatically create income entry for PAID bookings (excluding Cheque payments)
    if (paymentMethod === 'Paid' && totalCharges > 0 && paymentType !== 'Cheque') {
      await prisma.income.create({
        data: {
          date: new Date(bookingDate),
          amount: Math.round(parseFloat(totalCharges)), // Round to whole number
          source: `Booking Payment - GR: ${grNumber}`,
          description: `Payment received for booking from ${consignorName} to ${consigneeName}`,
          category: 'Booking Payment',
          paymentMethod: paymentType === 'UPI' ? 'upi' : 'cash', // Use actual payment type
          referenceNumber: grNumber,
          status: 'Received',
          transporterId: transporterId || null
        }
      });
    }
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking
router.put('/:id', async (req, res) => {
  try {
    const {
      grNumber,
      bookingDate,
      consignorName,
      consignorAddress,
      consignorGST,
      consigneeName,
      consigneeAddress,
      consigneeGST,
      fromLocation,
      toLocation,
      weightKg,
      totalWeight,
      ewayBill,
      privateMarka,
      paymentMethod,
      paymentType,
      totalAmount,
      paidAmount,
      deliveryAgainst,
      freightCharges,
      localCartageCharges,
      doorDeliveryCharges,
      stationaryCharges,
      labourCharges,
      otherCharges,
      totalCharges,
      transporterId,
      vehicleId,
      driverId,
      consignorId,
      consigneeId,
      godownId,
      packages,
      invoices
    } = req.body;
    
    if (!grNumber || !bookingDate || !consignorName || !consigneeName || !fromLocation || !toLocation || !transporterId) {
      return res.status(400).json({ 
        error: 'GR Number, booking date, consignor name, consignee name, from location, to location, and transporter are required' 
      });
    }
    
    // Check if GR number already exists for another booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        grNumber,
        id: { not: req.params.id }
      }
    });
    
    if (existingBooking) {
      return res.status(400).json({ error: 'Booking with this GR number already exists' });
    }
    
    // Delete existing packages and invoices
    await prisma.package.deleteMany({
      where: { bookingId: req.params.id }
    });
    
    await prisma.invoice.deleteMany({
      where: { bookingId: req.params.id }
    });
    
    // Get the existing booking to check if payment method changed
    const currentBooking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        grNumber,
        bookingDate: new Date(bookingDate),
        consignorName,
        consignorAddress,
        consignorGST,
        consigneeName,
        consigneeAddress,
        consigneeGST,
        fromLocation,
        toLocation,
        weightKg: Math.round(parseFloat(weightKg || totalWeight || 0)),
        ewayBill,
        privateMarka,
        paymentMethod,
        paymentType,
        totalAmount: Math.round(parseFloat(totalAmount || 0)),
        paidAmount: Math.round(parseFloat(paidAmount || 0)),
        deliveryAgainst,
        freightCharges: Math.round(parseFloat(freightCharges || 0)),
        localCartageCharges: Math.round(parseFloat(localCartageCharges || 0)),
        doorDeliveryCharges: Math.round(parseFloat(doorDeliveryCharges || 0)),
        stationaryCharges: Math.round(parseFloat(stationaryCharges || 0)),
        labourCharges: Math.round(parseFloat(labourCharges || 0)),
        otherCharges: Math.round(parseFloat(otherCharges || 0)),
        totalCharges: Math.round(parseFloat(totalCharges || 0)),
        transporterId,
        vehicleId: vehicleId || null,
        driverId: driverId || null,
        consignorId: consignorId || null,
        consigneeId: consigneeId || null,
        godownId: godownId || null,
        packages: {
          create: packages || []
        },
        invoices: {
          create: invoices || []
        }
      },
      include: {
        transporter: true,
        vehicle: true,
        driver: true,
        packages: true,
        invoices: true
      }
    });

    // Automatically create income entry if booking was updated to PAID and payment type is not Cheque
    if (paymentMethod === 'Paid' && currentBooking.paymentMethod !== 'Paid' && totalCharges > 0 && paymentType !== 'Cheque') {
      await prisma.income.create({
        data: {
          date: new Date(bookingDate),
          amount: Math.round(parseFloat(totalCharges)), // Round to whole number
          source: `Booking Payment - GR: ${grNumber}`,
          description: `Payment received for booking from ${consignorName} to ${consigneeName}`,
          category: 'Booking Payment',
          paymentMethod: paymentType === 'UPI' ? 'upi' : 'cash', // Use actual payment type
          referenceNumber: grNumber,
          status: 'Received',
          transporterId: transporterId || null
        }
      });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Delete dependent rows that do not have ON DELETE CASCADE at the DB level
    await prisma.$transaction([
      prisma.challanGoods.deleteMany({ where: { bookingId } }),
      prisma.booking.delete({ where: { id: bookingId } })
    ]);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Migration endpoint to create income entries for existing PAID bookings
router.post('/migrate-paid-bookings', async (req, res) => {
  try {
    // Find all existing PAID bookings that don't have corresponding income entries (excluding Cheque payments)
    const paidBookings = await prisma.booking.findMany({
      where: {
        paymentMethod: 'Paid',
        paymentType: {
          not: 'Cheque'
        },
        totalCharges: {
          gt: 0
        }
      },
      include: {
        transporter: true
      }
    });

    let createdCount = 0;
    let skippedCount = 0;

    for (const booking of paidBookings) {
      // Check if income entry already exists for this booking
      const existingIncome = await prisma.income.findFirst({
        where: {
          referenceNumber: booking.grNumber,
          category: 'Booking Payment'
        }
      });

      if (!existingIncome) {
        // Create income entry for this booking
        await prisma.income.create({
          data: {
            date: new Date(booking.bookingDate),
            amount: Math.round(parseFloat(booking.totalCharges)), // Round to whole number
            source: `Booking Payment - GR: ${booking.grNumber}`,
            description: `Payment received for booking from ${booking.consignorName} to ${booking.consigneeName}`,
            category: 'Booking Payment',
            paymentMethod: 'cash',
            referenceNumber: booking.grNumber,
            status: 'Received',
            transporterId: booking.transporterId || null
          }
        });
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    res.json({
      message: `Migration completed successfully`,
      totalPaidBookings: paidBookings.length,
      incomeEntriesCreated: createdCount,
      incomeEntriesSkipped: skippedCount
    });
  } catch (error) {
    console.error('Error migrating paid bookings:', error);
    res.status(500).json({ error: 'Failed to migrate paid bookings' });
  }
});

module.exports = router; 