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
    const { grouped = 'false' } = req.query;
    const isGrouped = grouped === 'true';

    if (isGrouped) {
      // Return grouped challans
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
          },
          challanGoods: {
            include: {
              booking: {
                select: {
                  id: true,
                  grNumber: true,
                  godownId: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Group challans by date, vehicle, and destination
      const groupedChallans = {};
      
      challans.forEach(challan => {
        const normalizedStatus = challan.status === 'Completed' ? 'Delivered' : (challan.status || 'Generated');
        const dateKey = challan.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
        const vehicleNumber = challan.truck?.vehicleNumber || 'Unknown';
        const destination = challan.toLocation || 'Unknown';
        
        const groupKey = `${dateKey}_${vehicleNumber}_${destination}`;
        
        if (!groupedChallans[groupKey]) {
          groupedChallans[groupKey] = {
            groupKey,
            date: dateKey,
            vehicleNumber,
            destination,
            challans: [],
            totalWeight: 0,
            totalItems: 0,
            transporters: new Set(),
            statuses: new Set(),
            challanNumbers: [],
            createdAt: challan.createdAt,
            updatedAt: challan.updatedAt
          };
        }
        
        // Add challan to group
        groupedChallans[groupKey].challans.push({ ...challan, status: normalizedStatus });
        
        // Calculate totals
        groupedChallans[groupKey].totalWeight += challan.totalWeight || 0;
        groupedChallans[groupKey].totalItems += challan.totalPackages || 0;
        groupedChallans[groupKey].transporters.add(challan.transportCompany?.name || 'Unknown');
        groupedChallans[groupKey].statuses.add(normalizedStatus);
        groupedChallans[groupKey].challanNumbers.push(challan.challanNumber);
        
        // Update timestamps (use latest)
        if (challan.createdAt > groupedChallans[groupKey].createdAt) {
          groupedChallans[groupKey].createdAt = challan.createdAt;
        }
        if (challan.updatedAt > groupedChallans[groupKey].updatedAt) {
          groupedChallans[groupKey].updatedAt = challan.updatedAt;
        }
      });
      
      // Convert to array and sort by date (newest first)
      const groupedArray = Object.values(groupedChallans).map(group => ({
        ...group,
        transporters: Array.from(group.transporters),
        statuses: Array.from(group.statuses),
        transporterCount: group.transporters.size,
        hasMixedStatus: group.statuses.size > 1,
        overallStatus: group.statuses.has('Delivered') ? 'Delivered' : 
                      group.statuses.has('In Transit') ? 'In Transit' : 
                      'Generated'
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return res.json(groupedArray);
    }

    // Original individual challans endpoint
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
        },
        challanGoods: {
          include: {
            booking: {
              select: {
                id: true,
                grNumber: true,
                godownId: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Normalize status field for all results
    const normalized = challans.map(c => ({
      ...c,
      status: c.status === 'Completed' ? 'Delivered' : (c.status || 'Generated')
    }));

    res.json(normalized);
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
        grNumber: 'asc'
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
        weight: Math.round(booking.weightKg || 0),
        charges: Math.round(booking.totalCharges || 0),
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

    // Normalize status: treat Completed as Delivered
    const normalized = { ...challan, status: challan.status === 'Completed' ? 'Delivered' : (challan.status || 'Generated') };
    res.json(normalized);
  } catch (error) {
    console.error('Error fetching challan:', error);
    res.status(500).json({ error: 'Failed to fetch challan' });
  }
});

// Create new challan
router.post('/', async (req, res) => {
  try {
    const { transportCompanyId, truckId, driverId, fromLocation, toLocation, notes, selectedBookings, challanNumber } = req.body;

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
      totalWeight += Math.round(booking.weightKg || 0);
      totalCharges += Math.round(booking.totalCharges || 0);

      return {
        bookingId: booking.id,
        serialNumber: index + 1,
        packages: bookingPackages || 1,
        weight: Math.round(booking.weightKg || 0),
        destinationLocation: booking.toLocation || toLocation || 'Not specified',
        charges: Math.round(booking.totalCharges || 0)
      };
    });

    // Handle challan number - use custom or generate
    let finalChallanNumber;
    if (challanNumber && challanNumber.trim()) {
      // Check if custom challan number already exists
      const existingChallan = await prisma.challan.findUnique({
        where: { challanNumber: challanNumber.trim() }
      });
      
      if (existingChallan) {
        return res.status(400).json({ error: 'Challan number already exists. Please use a different number.' });
      }
      
      finalChallanNumber = challanNumber.trim();
    } else {
      // Generate automatic challan number
      finalChallanNumber = await generateChallanNumber();
    }

    // Create challan with goods
    const challan = await prisma.challan.create({
      data: {
        challanNumber: finalChallanNumber,
        transportCompanyId,
        truckId,
        driverId,
        fromLocation: fromLocation || 'Not specified',
        toLocation: toLocation || 'Not specified',
        totalPackages,
        totalWeight: Math.round(totalWeight),
        totalCharges: Math.round(totalCharges),
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

// Update challan
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { challanNumber, transportCompanyId, truckId, driverId, fromLocation, toLocation, notes, challanDate, status } = req.body;

    // Validate required fields
    if (!transportCompanyId || !truckId || !driverId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if challan exists
    const existingChallan = await prisma.challan.findUnique({
      where: { id }
    });

    if (!existingChallan) {
      return res.status(404).json({ error: 'Challan not found' });
    }

    // Handle challan number validation if provided
    if (challanNumber && challanNumber.trim()) {
      // Check if custom challan number already exists (excluding current challan)
      const duplicateChallan = await prisma.challan.findFirst({
        where: { 
          challanNumber: challanNumber.trim(),
          id: { not: id }
        }
      });
      
      if (duplicateChallan) {
        return res.status(400).json({ error: 'Challan number already exists. Please use a different number.' });
      }
    }

    // Update challan
    const updatedChallan = await prisma.challan.update({
      where: { id },
      data: {
        challanNumber: challanNumber && challanNumber.trim() ? challanNumber.trim() : existingChallan.challanNumber,
        transportCompanyId,
        truckId,
        driverId,
        fromLocation: fromLocation || 'Not specified',
        toLocation: toLocation || 'Not specified',
        notes: notes || null,
        ...(challanDate && { createdAt: new Date(challanDate) }),
        ...(status && { status })
      },
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

    res.json(updatedChallan);
  } catch (error) {
    console.error('Error updating challan:', error);
    res.status(500).json({ error: 'Failed to update challan' });
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

// Migration endpoint to clean up challan decimal values
router.post('/cleanup-decimals', async (req, res) => {
  try {
    console.log('Starting challan decimal cleanup migration...');
    
    // Get all challans with weight and charges values
    const challans = await prisma.challan.findMany({
      select: {
        id: true,
        totalWeight: true,
        totalCharges: true,
        challanGoods: {
          select: {
            id: true,
            weight: true,
            charges: true
          }
        }
      }
    });

    let challanUpdatedCount = 0;
    let challanSkippedCount = 0;
    let challanGoodsUpdatedCount = 0;
    let challanGoodsSkippedCount = 0;

    for (const challan of challans) {
      let needsUpdate = false;
      const updateData = {};

      // Check and round total weight
      if (challan.totalWeight !== null && challan.totalWeight !== undefined) {
        const roundedWeight = Math.round(parseFloat(challan.totalWeight));
        if (Math.abs(roundedWeight - challan.totalWeight) > 0.01) {
          updateData.totalWeight = roundedWeight;
          needsUpdate = true;
        }
      }

      // Check and round total charges
      if (challan.totalCharges !== null && challan.totalCharges !== undefined) {
        const roundedCharges = Math.round(parseFloat(challan.totalCharges));
        if (Math.abs(roundedCharges - challan.totalCharges) > 0.01) {
          updateData.totalCharges = roundedCharges;
          needsUpdate = true;
        }
      }

      // Update challan if needed
      if (needsUpdate) {
        await prisma.challan.update({
          where: { id: challan.id },
          data: updateData
        });
        challanUpdatedCount++;
        console.log(`Updated challan ${challan.id}: weight ${challan.totalWeight} → ${updateData.totalWeight || challan.totalWeight}, charges ${challan.totalCharges} → ${updateData.totalCharges || challan.totalCharges}`);
      } else {
        challanSkippedCount++;
      }

      // Update challan goods
      for (const challanGood of challan.challanGoods) {
        let goodNeedsUpdate = false;
        const goodUpdateData = {};

        // Check and round weight
        if (challanGood.weight !== null && challanGood.weight !== undefined) {
          const roundedWeight = Math.round(parseFloat(challanGood.weight));
          if (Math.abs(roundedWeight - challanGood.weight) > 0.01) {
            goodUpdateData.weight = roundedWeight;
            goodNeedsUpdate = true;
          }
        }

        // Check and round charges
        if (challanGood.charges !== null && challanGood.charges !== undefined) {
          const roundedCharges = Math.round(parseFloat(challanGood.charges));
          if (Math.abs(roundedCharges - challanGood.charges) > 0.01) {
            goodUpdateData.charges = roundedCharges;
            goodNeedsUpdate = true;
          }
        }

        // Update challan good if needed
        if (goodNeedsUpdate) {
          await prisma.challanGoods.update({
            where: { id: challanGood.id },
            data: goodUpdateData
          });
          challanGoodsUpdatedCount++;
          console.log(`Updated challan good ${challanGood.id}: weight ${challanGood.weight} → ${goodUpdateData.weight || challanGood.weight}, charges ${challanGood.charges} → ${goodUpdateData.charges || challanGood.charges}`);
        } else {
          challanGoodsSkippedCount++;
        }
      }
    }

    res.json({
      message: 'Challan decimal cleanup completed successfully',
      summary: {
        challans: {
          total: challans.length,
          updated: challanUpdatedCount,
          skipped: challanSkippedCount
        },
        challanGoods: {
          total: challans.reduce((sum, c) => sum + c.challanGoods.length, 0),
          updated: challanGoodsUpdatedCount,
          skipped: challanGoodsSkippedCount
        }
      }
    });

  } catch (error) {
    console.error('Error during challan decimal cleanup:', error);
    res.status(500).json({ error: 'Failed to cleanup challan decimals' });
  }
});

module.exports = router;
