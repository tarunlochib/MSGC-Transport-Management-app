const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Function to clean up eway bills when GRs are included in challans
const cleanupChallanedEwayBills = async () => {
  try {
    // Find all challans (regardless of status) since any challan means eway bill is handled
    const allChallans = await prisma.challan.findMany({
      include: {
        challanGoods: {
          include: {
            booking: {
              include: {
                ewayBillRecord: true
              }
            }
          }
        }
      }
    });

    let deletedCount = 0;
    const processedBookings = new Set(); // To avoid duplicate processing

    // For each challan, check if bookings have eway bills and delete them
    for (const challan of allChallans) {
      for (const challanGood of challan.challanGoods) {
        const booking = challanGood.booking;
        
        // Skip if we've already processed this booking
        if (processedBookings.has(booking.id)) {
          continue;
        }
        
        if (booking.ewayBillRecord) {
          // Delete the eway bill record
          await prisma.ewayBill.delete({
            where: {
              id: booking.ewayBillRecord.id
            }
          });
          deletedCount++;
          processedBookings.add(booking.id);
          console.log(`Deleted eway bill ${booking.ewayBillRecord.ewayBillNumber} for challaned booking ${booking.grNumber} (Challan: ${challan.challanNumber})`);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} eway bills for challaned bookings`);
    }

    return { deletedCount };
  } catch (error) {
    console.error('Error cleaning up challaned eway bills:', error);
    throw error;
  }
};

// Cleanup challaned eway bills endpoint
router.post('/cleanup-challaned', async (req, res) => {
  try {
    const result = await cleanupChallanedEwayBills();
    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} eway bills for challaned bookings`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error in cleanup endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup challaned eway bills'
    });
  }
});

// Get expiring eway bills (within specified days)
router.get('/expiring', async (req, res) => {
  try {
    const { days = 1 } = req.query;
    const daysInt = parseInt(days);
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysInt);
    
    const expiringEwayBills = await prisma.ewayBill.findMany({
      where: {
        expiryDate: {
          lte: targetDate,
          gte: new Date() // Not expired yet
        }
      },
      include: {
        booking: {
          select: {
            grNumber: true,
            consignorName: true,
            fromLocation: true,
            toLocation: true
          }
        },
        transporter: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        expiryDate: 'asc'
      }
    });

    // Add calculated fields
    const ewayBillsWithStatus = expiringEwayBills.map(bill => {
      const now = new Date();
      const expiryDate = new Date(bill.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      return {
        ...bill,
        daysUntilExpiry,
        isExpiringToday: daysUntilExpiry === 0,
        isExpiringTomorrow: daysUntilExpiry === 1
      };
    });

    res.json(ewayBillsWithStatus);
  } catch (error) {
    console.error('Error fetching expiring eway bills:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch expiring eway bills'
    });
  }
});

// Get all eway bills with tracking information
router.get('/tracking', async (req, res) => {
  try {
    // Auto-cleanup challaned eway bills before fetching
    await cleanupChallanedEwayBills();
    
    const { status, transporterId, daysUntilExpiry } = req.query;
    
    let whereClause = {};
    
    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }
    
    // Filter by transporter if provided
    if (transporterId) {
      whereClause.transporterId = transporterId;
    }
    
    // Filter by days until expiry
    if (daysUntilExpiry) {
      const days = parseInt(daysUntilExpiry);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      
      whereClause.expiryDate = {
        lte: targetDate
      };
    }

    const ewayBills = await prisma.ewayBill.findMany({
      where: whereClause,
      include: {
        booking: {
          select: {
            grNumber: true,
            consignorName: true,
            consigneeName: true,
            fromLocation: true,
            toLocation: true,
            weightKg: true
          }
        },
        transporter: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        expiryDate: 'asc'
      }
    });

    // Add calculated fields
    const ewayBillsWithStatus = ewayBills.map(bill => {
      const now = new Date();
      const expiryDate = new Date(bill.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      let statusColor = 'green';
      let statusText = 'Valid';
      
      if (daysUntilExpiry < 0) {
        statusColor = 'red';
        statusText = 'Expired';
      } else if (daysUntilExpiry <= 3) {
        statusColor = 'red';
        statusText = 'Expires Soon';
      } else if (daysUntilExpiry <= 7) {
        statusColor = 'yellow';
        statusText = 'Expiring Soon';
      }
      
      return {
        ...bill,
        daysUntilExpiry,
        statusColor,
        statusText,
        isExpired: daysUntilExpiry < 0,
        isExpiringSoon: daysUntilExpiry <= 7
      };
    });

    res.json(ewayBillsWithStatus);
  } catch (error) {
    console.error('Error fetching eway bills:', error);
    res.status(500).json({ error: 'Failed to fetch eway bills' });
  }
});

// Get eway bill summary statistics
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    const [
      totalBills,
      activeBills,
      expiringInSevenDays,
      expiringInThreeDays,
      expiredBills
    ] = await Promise.all([
      prisma.ewayBill.count(),
      prisma.ewayBill.count({
        where: {
          status: 'Active',
          expiryDate: { gt: now }
        }
      }),
      prisma.ewayBill.count({
        where: {
          status: 'Active',
          expiryDate: { lte: sevenDaysFromNow, gt: now }
        }
      }),
      prisma.ewayBill.count({
        where: {
          status: 'Active',
          expiryDate: { lte: threeDaysFromNow, gt: now }
        }
      }),
      prisma.ewayBill.count({
        where: {
          OR: [
            { status: 'Expired' },
            { expiryDate: { lt: now } }
          ]
        }
      })
    ]);

    res.json({
      totalBills,
      activeBills,
      expiringInSevenDays,
      expiringInThreeDays,
      expiredBills
    });
  } catch (error) {
    console.error('Error fetching eway bill summary:', error);
    res.status(500).json({ error: 'Failed to fetch eway bill summary' });
  }
});

// Create new eway bill record
router.post('/', async (req, res) => {
  try {
    const { 
      bookingId, 
      ewayBillNumber, 
      generatedDate, 
      expiryDate, 
      billValue, 
      transporterId 
    } = req.body;

    // Validate required fields
    if (!bookingId || !ewayBillNumber || !generatedDate || !expiryDate || !transporterId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if booking exists and doesn't already have an eway bill record
    const existingEwayBill = await prisma.ewayBill.findUnique({
      where: { bookingId }
    });

    if (existingEwayBill) {
      return res.status(400).json({ error: 'Eway bill record already exists for this booking' });
    }

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Create eway bill record
    const ewayBill = await prisma.ewayBill.create({
      data: {
        bookingId,
        ewayBillNumber,
        generatedDate: new Date(generatedDate),
        expiryDate: new Date(expiryDate),
        billValue: parseFloat(billValue) || 0,
        transporterId,
        status: 'Active'
      },
      include: {
        booking: {
          select: {
            grNumber: true,
            consignorName: true,
            consigneeName: true
          }
        },
        transporter: {
          select: {
            name: true
          }
        }
      }
    });

    res.status(201).json(ewayBill);
  } catch (error) {
    console.error('Error creating eway bill:', error);
    res.status(500).json({ error: 'Failed to create eway bill record' });
  }
});

// Update eway bill record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      ewayBillNumber, 
      generatedDate, 
      expiryDate, 
      billValue, 
      status 
    } = req.body;

    // Check if eway bill exists
    const existingEwayBill = await prisma.ewayBill.findUnique({
      where: { id }
    });

    if (!existingEwayBill) {
      return res.status(404).json({ error: 'Eway bill record not found' });
    }

    // Update eway bill
    const updatedEwayBill = await prisma.ewayBill.update({
      where: { id },
      data: {
        ...(ewayBillNumber && { ewayBillNumber }),
        ...(generatedDate && { generatedDate: new Date(generatedDate) }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(billValue !== undefined && { billValue: parseFloat(billValue) }),
        ...(status && { status })
      },
      include: {
        booking: {
          select: {
            grNumber: true,
            consignorName: true,
            consigneeName: true
          }
        },
        transporter: {
          select: {
            name: true
          }
        }
      }
    });

    res.json(updatedEwayBill);
  } catch (error) {
    console.error('Error updating eway bill:', error);
    res.status(500).json({ error: 'Failed to update eway bill record' });
  }
});

// Delete eway bill record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if eway bill exists
    const existingEwayBill = await prisma.ewayBill.findUnique({
      where: { id }
    });

    if (!existingEwayBill) {
      return res.status(404).json({ error: 'Eway bill record not found' });
    }

    // Delete eway bill
    await prisma.ewayBill.delete({
      where: { id }
    });

    res.json({ message: 'Eway bill record deleted successfully' });
  } catch (error) {
    console.error('Error deleting eway bill:', error);
    res.status(500).json({ error: 'Failed to delete eway bill record' });
  }
});

// Get available bookings for eway bill creation (bookings with eway bill numbers but no eway bill record)
router.get('/available-bookings', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        ewayBill: {
          not: null,
          not: 'NO EWAY'
        },
        ewayBillRecord: null
      },
      select: {
        id: true,
        grNumber: true,
        ewayBill: true,
        consignorName: true,
        consigneeName: true,
        fromLocation: true,
        toLocation: true,
        weightKg: true,
        totalCharges: true,
        transporter: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching available bookings for eway bill:', error);
    res.status(500).json({ error: 'Failed to fetch available bookings' });
  }
});

module.exports = router;
