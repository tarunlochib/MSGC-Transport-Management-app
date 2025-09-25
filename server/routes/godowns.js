const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all godowns for a specific transporter
router.get('/transporter/:transporterId', async (req, res) => {
  try {
    const godowns = await prisma.godown.findMany({
      where: { 
        transporterId: req.params.transporterId,
        status: 'Active'
      },
      include: { 
        transporter: true 
      },
      orderBy: { name: 'asc' }
    });

    // Parse cities JSON string back to array for each godown
    const godownsWithCities = godowns.map(godown => ({
      ...godown,
      cities: JSON.parse(godown.cities || '[]')
    }));

    res.json(godownsWithCities);
  } catch (error) {
    console.error('Error fetching godowns:', error);
    res.status(500).json({ error: 'Failed to fetch godowns' });
  }
});

// Get all godowns
router.get('/', async (req, res) => {
  try {
    const godowns = await prisma.godown.findMany({
      include: { 
        transporter: true 
      },
      orderBy: { name: 'asc' }
    });

    // Parse cities JSON string back to array for each godown
    const godownsWithCities = godowns.map(godown => ({
      ...godown,
      cities: JSON.parse(godown.cities || '[]')
    }));

    res.json(godownsWithCities);
  } catch (error) {
    console.error('Error fetching godowns:', error);
    res.status(500).json({ error: 'Failed to fetch godowns' });
  }
});

// Get godown by ID
router.get('/:id', async (req, res) => {
  try {
    const godown = await prisma.godown.findUnique({
      where: { id: req.params.id },
      include: { 
        transporter: true,
        bookings: true
      }
    });

    if (!godown) {
      return res.status(404).json({ error: 'Godown not found' });
    }

    // Parse cities JSON string back to array
    const godownWithCities = {
      ...godown,
      cities: JSON.parse(godown.cities || '[]')
    };

    res.json(godownWithCities);
  } catch (error) {
    console.error('Error fetching godown:', error);
    res.status(500).json({ error: 'Failed to fetch godown' });
  }
});

// Create new godown
router.post('/', async (req, res) => {
  try {
    const { name, transporterId, cities, status = 'Active' } = req.body;

    if (!name || !transporterId || !cities) {
      return res.status(400).json({ error: 'Name, transporterId, and cities are required' });
    }

    // Validate transporter exists
    const transporter = await prisma.transporter.findUnique({
      where: { id: transporterId }
    });

    if (!transporter) {
      return res.status(400).json({ error: 'Transporter not found' });
    }

    const godown = await prisma.godown.create({
      data: {
        name,
        transporterId,
        cities: JSON.stringify(cities), // Store cities as JSON string
        status
      },
      include: { transporter: true }
    });

    // Parse cities JSON string back to array
    const godownWithCities = {
      ...godown,
      cities: JSON.parse(godown.cities || '[]')
    };

    res.status(201).json(godownWithCities);
  } catch (error) {
    console.error('Error creating godown:', error);
    res.status(500).json({ error: 'Failed to create godown' });
  }
});

// Update godown
router.put('/:id', async (req, res) => {
  try {
    const { name, cities, status } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (cities !== undefined) updateData.cities = JSON.stringify(cities);
    if (status !== undefined) updateData.status = status;

    const godown = await prisma.godown.update({
      where: { id: req.params.id },
      data: updateData,
      include: { transporter: true }
    });

    // Parse cities JSON string back to array
    const godownWithCities = {
      ...godown,
      cities: JSON.parse(godown.cities || '[]')
    };

    res.json(godownWithCities);
  } catch (error) {
    console.error('Error updating godown:', error);
    res.status(500).json({ error: 'Failed to update godown' });
  }
});

// Delete godown
router.delete('/:id', async (req, res) => {
  try {
    // Check if godown has any bookings
    const bookingsCount = await prisma.booking.count({
      where: { godownId: req.params.id }
    });

    if (bookingsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete godown with existing bookings. Please reassign bookings first.' 
      });
    }

    await prisma.godown.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Godown deleted successfully' });
  } catch (error) {
    console.error('Error deleting godown:', error);
    res.status(500).json({ error: 'Failed to delete godown' });
  }
});

// Get godown statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const godown = await prisma.godown.findUnique({
      where: { id: req.params.id },
      include: {
        bookings: {
          select: {
            weightKg: true,
            totalCharges: true,
            bookingDate: true
          }
        }
      }
    });

    if (!godown) {
      return res.status(404).json({ error: 'Godown not found' });
    }

    const stats = {
      totalBookings: godown.bookings.length,
      totalWeight: godown.bookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0),
      totalCharges: godown.bookings.reduce((sum, booking) => sum + (booking.totalCharges || 0), 0),
      cities: JSON.parse(godown.cities || '[]')
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching godown stats:', error);
    res.status(500).json({ error: 'Failed to fetch godown statistics' });
  }
});

module.exports = router;
