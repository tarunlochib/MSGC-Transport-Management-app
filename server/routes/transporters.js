const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all transporters
router.get('/', async (req, res) => {
  try {
    const transporters = await prisma.transporter.findMany({
      include: {
        _count: {
          select: {
            bookings: true,
            vehicles: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Parse contactInfo for each transporter
    const transportersWithParsedInfo = transporters.map(transporter => {
      let contactInfo = {};
      if (transporter.contactInfo) {
        try {
          contactInfo = JSON.parse(transporter.contactInfo);
        } catch (e) {
          contactInfo = {};
        }
      }
      
      return {
        ...transporter,
        email: contactInfo.email || null,
        gstNumber: contactInfo.gstNumber || null,
        panNumber: contactInfo.panNumber || null,
        status: contactInfo.status || 'Active',
        notes: contactInfo.notes || null
      };
    });
    
    res.json(transportersWithParsedInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single transporter
router.get('/:id', async (req, res) => {
  try {
    const transporter = await prisma.transporter.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: {
            bookings: true,
            vehicles: true
          }
        },
        bookings: {
          include: {
            vehicle: true,
            driver: true
          },
          orderBy: {
            bookingDate: 'desc'
          }
        },
        vehicles: {
          include: {
            driver: true
          }
        }
      }
    });
    
    if (!transporter) {
      return res.status(404).json({ error: 'Transporter not found' });
    }
    
    // Parse contactInfo
    let contactInfo = {};
    if (transporter.contactInfo) {
      try {
        contactInfo = JSON.parse(transporter.contactInfo);
      } catch (e) {
        contactInfo = {};
      }
    }
    
    const transporterWithParsedInfo = {
      ...transporter,
      email: contactInfo.email || null,
      gstNumber: contactInfo.gstNumber || null,
      panNumber: contactInfo.panNumber || null,
      status: contactInfo.status || 'Active',
      notes: contactInfo.notes || null
    };
    
    res.json(transporterWithParsedInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transporter
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, email, commissionRate, gstNumber, panNumber, status, notes } = req.body;
    
    if (!name || !commissionRate) {
      return res.status(400).json({ error: 'Name and commission rate are required' });
    }
    
    // Create contactInfo object with all the additional fields
    const contactInfo = {
      email: email || null,
      gstNumber: gstNumber || null,
      panNumber: panNumber || null,
      status: status || 'Active',
      notes: notes || null
    };
    
    const transporter = await prisma.transporter.create({
      data: {
        name,
        address,
        phone,
        commissionRate: parseFloat(commissionRate),
        contactInfo: JSON.stringify(contactInfo)
      }
    });
    
    // Return the transporter with parsed contactInfo
    const transporterWithContactInfo = {
      ...transporter,
      contactInfo: contactInfo
    };
    
    res.status(201).json(transporterWithContactInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update transporter
router.put('/:id', async (req, res) => {
  try {
    const { name, address, phone, email, commissionRate, gstNumber, panNumber, status, notes } = req.body;
    
    if (!name || !commissionRate) {
      return res.status(400).json({ error: 'Name and commission rate are required' });
    }
    
    // Create contactInfo object with all the additional fields
    const contactInfo = {
      email: email || null,
      gstNumber: gstNumber || null,
      panNumber: panNumber || null,
      status: status || 'Active',
      notes: notes || null
    };
    
    const transporter = await prisma.transporter.update({
      where: { id: req.params.id },
      data: {
        name,
        address,
        phone,
        commissionRate: parseFloat(commissionRate),
        contactInfo: JSON.stringify(contactInfo)
      }
    });
    
    // Return the transporter with parsed contactInfo
    const transporterWithContactInfo = {
      ...transporter,
      contactInfo: contactInfo
    };
    
    res.json(transporterWithContactInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete transporter
router.delete('/:id', async (req, res) => {
  try {
    await prisma.transporter.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Transporter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 