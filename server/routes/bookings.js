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
      packages,
      invoices
    } = req.body;
    
    if (!grNumber || !bookingDate || !consignorName || !consigneeName || !fromLocation || !toLocation || !transporterId) {
      return res.status(400).json({ 
        error: 'GR Number, booking date, consignor name, consignee name, from location, to location, and transporter are required' 
      });
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
        weightKg: parseFloat(weightKg || totalWeight || 0),
        ewayBill,
        privateMarka,
        paymentMethod,
        totalAmount: parseFloat(totalAmount || 0),
        paidAmount: parseFloat(paidAmount || 0),
        deliveryAgainst,
        freightCharges: parseFloat(freightCharges || 0),
        localCartageCharges: parseFloat(localCartageCharges || 0),
        doorDeliveryCharges: parseFloat(doorDeliveryCharges || 0),
        stationaryCharges: parseFloat(stationaryCharges || 0),
        labourCharges: parseFloat(labourCharges || 0),
        otherCharges: parseFloat(otherCharges || 0),
        totalCharges: parseFloat(totalCharges || 0),
        transporterId,
        vehicleId: vehicleId || null,
        driverId: driverId || null,
        consignorId: consignorId || null,
        consigneeId: consigneeId || null,
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
      packages,
      invoices
    } = req.body;
    
    if (!grNumber || !bookingDate || !consignorName || !consigneeName || !fromLocation || !toLocation || !transporterId) {
      return res.status(400).json({ 
        error: 'GR Number, booking date, consignor name, consignee name, from location, to location, and transporter are required' 
      });
    }
    
    // Delete existing packages and invoices
    await prisma.package.deleteMany({
      where: { bookingId: req.params.id }
    });
    
    await prisma.invoice.deleteMany({
      where: { bookingId: req.params.id }
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
        weightKg: parseFloat(weightKg || totalWeight || 0),
        ewayBill,
        privateMarka,
        paymentMethod,
        totalAmount: parseFloat(totalAmount || 0),
        paidAmount: parseFloat(paidAmount || 0),
        deliveryAgainst,
        freightCharges: parseFloat(freightCharges || 0),
        localCartageCharges: parseFloat(localCartageCharges || 0),
        doorDeliveryCharges: parseFloat(doorDeliveryCharges || 0),
        stationaryCharges: parseFloat(stationaryCharges || 0),
        labourCharges: parseFloat(labourCharges || 0),
        otherCharges: parseFloat(otherCharges || 0),
        totalCharges: parseFloat(totalCharges || 0),
        transporterId,
        vehicleId: vehicleId || null,
        driverId: driverId || null,
        consignorId: consignorId || null,
        consigneeId: consigneeId || null,
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
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    await prisma.booking.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 