const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        vehicle: {
          include: {
            transporter: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single driver
router.get('/:id', async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id },
      include: {
        vehicle: {
          include: {
            transporter: true
          }
        },
        bookings: {
          include: {
            transporter: true,
            vehicle: true
          },
          orderBy: {
            bookingDate: 'desc'
          }
        }
      }
    });
    
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create driver
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      address, 
      licenseNumber, 
      licenseExpiry, 
      permitExpiry, 
      medicalExpiry, 
      status, 
      experience, 
      salary, 
      emergencyContact, 
      emergencyPhone, 
      bloodGroup, 
      vehicleId, 
      notes 
    } = req.body;
    
    if (!name || !phone || !licenseNumber) {
      return res.status(400).json({ error: 'Name, phone, and license number are required' });
    }
    
    const driver = await prisma.driver.create({
      data: {
        name,
        phone,
        email: email || null,
        address: address || null,
        licenseNumber,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
        permitExpiry: permitExpiry ? new Date(permitExpiry) : null,
        medicalExpiry: medicalExpiry ? new Date(medicalExpiry) : null,
        status: status || 'Active',
        experience: experience ? parseInt(experience) : null,
        salary: salary ? parseFloat(salary) : null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
        bloodGroup: bloodGroup || null,
        vehicleId: vehicleId || null,
        notes: notes || null
      },
      include: {
        vehicle: {
          include: {
            transporter: true
          }
        }
      }
    });
    
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update driver
router.put('/:id', async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      address, 
      licenseNumber, 
      licenseExpiry, 
      permitExpiry, 
      medicalExpiry, 
      status, 
      experience, 
      salary, 
      emergencyContact, 
      emergencyPhone, 
      bloodGroup, 
      vehicleId, 
      notes 
    } = req.body;
    
    if (!name || !phone || !licenseNumber) {
      return res.status(400).json({ error: 'Name, phone, and license number are required' });
    }
    
    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: {
        name,
        phone,
        email: email || null,
        address: address || null,
        licenseNumber,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
        permitExpiry: permitExpiry ? new Date(permitExpiry) : null,
        medicalExpiry: medicalExpiry ? new Date(medicalExpiry) : null,
        status: status || 'Active',
        experience: experience ? parseInt(experience) : null,
        salary: salary ? parseFloat(salary) : null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
        bloodGroup: bloodGroup || null,
        vehicleId: vehicleId || null,
        notes: notes || null
      },
      include: {
        vehicle: {
          include: {
            transporter: true
          }
        }
      }
    });
    
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete driver
router.delete('/:id', async (req, res) => {
  try {
    await prisma.driver.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 