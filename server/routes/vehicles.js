const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        transporter: true,
        driver: true,
        _count: {
          select: {
            bookings: true,
            expenses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: {
        transporter: true,
        driver: true,
        bookings: {
          include: {
            transporter: true,
            driver: true
          },
          orderBy: {
            bookingDate: 'desc'
          }
        },
        expenses: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create vehicle
router.post('/', async (req, res) => {
  try {
    const { 
      vehicleNumber, 
      make, 
      model, 
      registrationNumber, 
      driverName, 
      status, 
      capacity, 
      year, 
      fuelType, 
      insuranceNumber,
      insuranceExpiry, 
      permitExpiry, 
      fitnessExpiry, 
      pucExpiry, 
      notes, 
      isOwned, 
      transporterId 
    } = req.body;
    
    if (!vehicleNumber || !make || !model || !registrationNumber || !capacity) {
      return res.status(400).json({ error: 'Vehicle number, make, model, registration number, and capacity are required' });
    }
    
    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleNumber,
        make,
        model,
        registrationNumber,
        driverName: driverName || null,
        status: status || 'Active',
        capacity: parseFloat(capacity),
        year: year ? parseInt(year) : null,
        fuelType: fuelType || 'Diesel',
        insuranceNumber: insuranceNumber || null,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
        permitExpiry: permitExpiry ? new Date(permitExpiry) : null,
        fitnessExpiry: fitnessExpiry ? new Date(fitnessExpiry) : null,
        pucExpiry: pucExpiry ? new Date(pucExpiry) : null,
        notes: notes || null,
        isOwned: isOwned !== undefined ? isOwned : true,
        transporterId: transporterId || null
      },
      include: {
        transporter: true,
        driver: true
      }
    });
    
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const { 
      vehicleNumber, 
      make, 
      model, 
      registrationNumber, 
      driverName, 
      status, 
      capacity, 
      year, 
      fuelType, 
      insuranceNumber,
      insuranceExpiry, 
      permitExpiry, 
      fitnessExpiry, 
      pucExpiry, 
      notes, 
      isOwned, 
      transporterId 
    } = req.body;
    
    if (!vehicleNumber || !make || !model || !registrationNumber || !capacity) {
      return res.status(400).json({ error: 'Vehicle number, make, model, registration number, and capacity are required' });
    }
    
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: {
        vehicleNumber,
        make,
        model,
        registrationNumber,
        driverName: driverName || null,
        status: status || 'Active',
        capacity: parseFloat(capacity),
        year: year ? parseInt(year) : null,
        fuelType: fuelType || 'Diesel',
        insuranceNumber: insuranceNumber || null,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
        permitExpiry: permitExpiry ? new Date(permitExpiry) : null,
        fitnessExpiry: fitnessExpiry ? new Date(fitnessExpiry) : null,
        pucExpiry: pucExpiry ? new Date(pucExpiry) : null,
        notes: notes || null,
        isOwned: isOwned !== undefined ? isOwned : true,
        transporterId: transporterId || null
      },
      include: {
        transporter: true,
        driver: true
      }
    });
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    await prisma.vehicle.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 