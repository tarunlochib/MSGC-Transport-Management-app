const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Generate challan number
const generateChallanNumber = async () => {
  const currentYear = new Date().getFullYear();
  const lastChallan = await prisma.challan.findFirst({
    where: {
      challanNumber: {
        startsWith: `CH-${currentYear}-`
      }
    },
    orderBy: {
      challanNumber: 'desc'
    }
  });

  if (lastChallan) {
    const lastNumber = parseInt(lastChallan.challanNumber.split('-')[2]);
    return `CH-${currentYear}-${String(lastNumber + 1).padStart(3, '0')}`;
  } else {
    return `CH-${currentYear}-001`;
  }
};

// Get all challans
router.get('/', async (req, res) => {
  try {
    const challans = await prisma.challan.findMany({
      include: {
        transportCompany: {
          select: { name: true }
        },
        truck: {
          select: { vehicleNumber: true }
        },
        driver: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(challans);
  } catch (error) {
    console.error('Error fetching challans:', error);
    res.status(500).json({ error: 'Failed to fetch challans' });
  }
});

// Get available bookings for challan creation - MUST COME BEFORE /:id route
router.get('/available-bookings', async (req, res) => {
  try {
    const { fromLocation, toLocation, transporterId } = req.query;
    
    let whereClause = {};
    
    if (fromLocation) {
      whereClause.fromLocation = { contains: fromLocation, mode: 'insensitive' };
    }
    
    if (toLocation) {
      whereClause.toLocation = { contains: toLocation, mode: 'insensitive' };
    }

    // Filter by transporter if provided
    if (transporterId) {
      whereClause.transporterId = transporterId;
    }

    // Get bookings that are not already in a challan
    const availableBookings = await prisma.booking.findMany({
      where: {
        ...whereClause,
        challanGoods: {
          none: {}
        }
      },
      select: {
        id: true,
        grNumber: true,
        consigneeName: true,
        consigneeAddress: true,
        fromLocation: true,
        toLocation: true,
        weightKg: true,
        totalCharges: true,
        packages: {
          select: {
            numberOfItems: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to include calculated fields
    const transformedBookings = availableBookings.map(booking => {
      // Calculate total packages from the packages relation
      const totalPackages = booking.packages.reduce((sum, pkg) => sum + (pkg.numberOfItems || 0), 0);
      
      return {
        id: booking.id,
        grNumber: booking.grNumber,
        consigneeName: booking.consigneeName,
        consigneeAddress: booking.consigneeAddress,
        fromLocation: booking.fromLocation,
        toLocation: booking.toLocation,
        weight: booking.weightKg || 0,
        charges: booking.totalCharges || 0,
        packages: totalPackages || 1, // Use calculated packages or default to 1
        destinationLocation: booking.toLocation
      };
    });

    res.json(transformedBookings);
  } catch (error) {
    console.error('Error fetching available bookings:', error);
    res.status(500).json({ error: 'Failed to fetch available bookings' });
  }
});

// Get challan by ID with details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        transportCompany: {
          select: { name: true, address: true, phone: true }
        },
        truck: {
          select: { vehicleNumber: true, make: true, model: true }
        },
        driver: {
          select: { name: true, phone: true, licenseNumber: true }
        },
        challanGoods: {
          include: {
            booking: {
              select: {
                grNumber: true,
                consigneeName: true,
                consigneeAddress: true,
                packages: {
                  select: {
                    numberOfItems: true
                  }
                }
              }
            }
          },
          orderBy: {
            serialNumber: 'asc'
          }
        }
      }
    });

    if (!challan) {
      return res.status(404).json({ error: 'Challan not found' });
    }

    res.json(challan);
  } catch (error) {
    console.error('Error fetching challan:', error);
    res.status(500).json({ error: 'Failed to fetch challan' });
  }
});

// Create new challan
router.post('/', async (req, res) => {
  try {
    const { transportCompanyId, truckId, driverId, fromLocation, toLocation, notes, selectedBookings } = req.body;

    // Validate required fields
    if (!transportCompanyId || !truckId || !driverId || !selectedBookings || selectedBookings.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // First, fetch the actual booking data from the selected booking IDs
    const bookings = await prisma.booking.findMany({
      where: {
        id: { in: selectedBookings }
      },
      select: {
        id: true,
        packages: {
          select: {
            numberOfItems: true
          }
        },
        weightKg: true,
        totalCharges: true,
        toLocation: true
      }
    });

    if (bookings.length !== selectedBookings.length) {
      return res.status(400).json({ error: 'Some selected bookings were not found' });
    }

    // Calculate totals from selected bookings
    let totalPackages = 0;
    let totalWeight = 0;
    let totalCharges = 0;

    const challanGoodsData = bookings.map((booking, index) => {
      // Calculate total packages from the packages relation
      const bookingPackages = booking.packages.reduce((sum, pkg) => sum + (pkg.numberOfItems || 0), 0);
      
      totalPackages += bookingPackages || 1;
      totalWeight += booking.weightKg || 0;
      totalCharges += booking.totalCharges || 0;

      return {
        bookingId: booking.id,
        serialNumber: index + 1,
        packages: bookingPackages || 1,
        weight: booking.weightKg || 0,
        destinationLocation: booking.toLocation || toLocation || 'Not specified',
        charges: booking.totalCharges || 0
      };
    });

    // Generate challan number
    const challanNumber = await generateChallanNumber();

    // Create challan with goods
    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        transportCompanyId,
        truckId,
        driverId,
        fromLocation: fromLocation || 'Not specified',
        toLocation: toLocation || 'Not specified',
        totalPackages,
        totalWeight,
        totalCharges,
        notes,
        challanGoods: {
          create: challanGoodsData
        }
      },
      include: {
        transportCompany: {
          select: { name: true }
        },
        truck: {
          select: { vehicleNumber: true }
        },
        driver: {
          select: { name: true }
        },
        challanGoods: {
          include: {
            booking: {
              select: {
                grNumber: true,
                consigneeName: true,
                consigneeAddress: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(challan);
  } catch (error) {
    console.error('Error creating challan:', error);
    res.status(500).json({ error: 'Failed to create challan' });
  }
});

// Update challan status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const challan = await prisma.challan.update({
      where: { id },
      data: { status },
      include: {
        transportCompany: { select: { name: true } },
        truck: { select: { vehicleNumber: true } },
        driver: { select: { name: true } }
      }
    });

    res.json(challan);
  } catch (error) {
    console.error('Error updating challan status:', error);
    res.status(500).json({ error: 'Failed to update challan status' });
  }
});

// Delete challan
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.challan.delete({
      where: { id }
    });

    res.json({ message: 'Challan deleted successfully' });
  } catch (error) {
    console.error('Error deleting challan:', error);
    res.status(500).json({ error: 'Failed to delete challan' });
  }
});

module.exports = router;
