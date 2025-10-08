const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get stock exceptions summary
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000);

    // Get all bookings that are not delivered/completed (stock in godown)
    const stockBookings = await prisma.booking.findMany({
      where: {
        challanGoods: {
          none: {}
        }
      },
      include: {
        transporter: {
          select: { name: true, id: true }
        },
        godown: {
          select: { name: true, id: true }
        }
      },
      orderBy: {
        bookingDate: 'asc'
      }
    });

    // Get bookings that are in transit (have challans but not delivered)
    const inTransitBookings = await prisma.booking.findMany({
      where: {
        challanGoods: {
          some: {
            challan: {
              status: {
                in: ['Generated', 'In Transit']
              }
            }
          }
        }
      },
      include: {
        transporter: {
          select: { name: true, id: true }
        },
        godown: {
          select: { name: true, id: true }
        },
        challanGoods: {
          include: {
            challan: {
              select: { status: true, challanNumber: true }
            }
          }
        }
      }
    });

    // Get delivered bookings
    const deliveredBookings = await prisma.booking.findMany({
      where: {
        challanGoods: {
          some: {
            challan: {
              status: {
                in: ['Delivered', 'Completed']
              }
            }
          }
        }
      },
      include: {
        transporter: {
          select: { name: true, id: true }
        },
        godown: {
          select: { name: true, id: true }
        }
      }
    });

    // Categorize stock by age
    const categorizeByAge = (bookings) => {
      const oneDayOld = [];
      const twoDaysOld = [];
      const fourDaysOld = [];

      bookings.forEach(booking => {
        const bookingDate = new Date(booking.bookingDate);
        const daysDiff = Math.ceil((today - bookingDate) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
          oneDayOld.push(booking);
        } else if (daysDiff >= 2 && daysDiff <= 3) {
          twoDaysOld.push(booking);
        } else if (daysDiff >= 4) {
          fourDaysOld.push(booking);
        }
      });

      // Calculate weights for each category
      const oneDayOldWeight = oneDayOld.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
      const twoDaysOldWeight = twoDaysOld.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
      const fourDaysOldWeight = fourDaysOld.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);

      return { 
        oneDayOld, 
        twoDaysOld, 
        fourDaysOld,
        oneDayOldWeight: oneDayOldWeight,
        twoDaysOldWeight: twoDaysOldWeight,
        fourDaysOldWeight: fourDaysOldWeight
      };
    };

    // Group by transporter and godown
    const groupByTransporterAndGodown = (bookings) => {
      const grouped = {};
      
      bookings.forEach(booking => {
        const transporterId = booking.transporterId;
        const transporterName = booking.transporter.name;
        const godownId = booking.godownId || 'no-godown';
        const godownName = booking.godown?.name || 'No Godown';

        if (!grouped[transporterId]) {
          grouped[transporterId] = {
            transporterName,
            transporterId,
            godowns: {}
          };
        }

        if (!grouped[transporterId].godowns[godownId]) {
          grouped[transporterId].godowns[godownId] = {
            godownName,
            godownId,
            count: 0,
            weight: 0,
            bookings: []
          };
        }

        grouped[transporterId].godowns[godownId].count++;
        grouped[transporterId].godowns[godownId].weight += Math.round(booking.weightKg || 0);
        grouped[transporterId].godowns[godownId].bookings.push(booking);
      });

      return grouped;
    };

    const stockByAge = categorizeByAge(stockBookings);
    const stockByTransporter = groupByTransporterAndGodown(stockBookings);
    const inTransitByTransporter = groupByTransporterAndGodown(inTransitBookings);
    const deliveredByTransporter = groupByTransporterAndGodown(deliveredBookings);

    // Add age breakdown for each transporter
    Object.keys(stockByTransporter).forEach(transporterId => {
      const transporterBookings = [];
      Object.values(stockByTransporter[transporterId].godowns).forEach(godown => {
        transporterBookings.push(...godown.bookings);
      });
      
      const transporterAgeBreakdown = categorizeByAge(transporterBookings);
      stockByTransporter[transporterId].ageBreakdown = {
        fresh: transporterAgeBreakdown.oneDayOld.length,
        aging: transporterAgeBreakdown.twoDaysOld.length,
        critical: transporterAgeBreakdown.fourDaysOld.length,
        freshWeight: transporterAgeBreakdown.oneDayOldWeight,
        agingWeight: transporterAgeBreakdown.twoDaysOldWeight,
        criticalWeight: transporterAgeBreakdown.fourDaysOldWeight
      };
    });

    // Calculate totals
    const totals = {
      stock: {
        oneDayOld: stockByAge.oneDayOld.length,
        twoDaysOld: stockByAge.twoDaysOld.length,
        fourDaysOld: stockByAge.fourDaysOld.length,
        total: stockBookings.length,
        oneDayOldWeight: stockByAge.oneDayOldWeight,
        twoDaysOldWeight: stockByAge.twoDaysOldWeight,
        fourDaysOldWeight: stockByAge.fourDaysOldWeight,
        totalWeight: stockByAge.oneDayOldWeight + stockByAge.twoDaysOldWeight + stockByAge.fourDaysOldWeight
      },
      inTransit: inTransitBookings.length,
      delivered: deliveredBookings.length
    };


    res.json({
      summary: {
        totals,
        stockByAge: {
          oneDayOld: stockByAge.oneDayOld.length,
          twoDaysOld: stockByAge.twoDaysOld.length,
          fourDaysOld: stockByAge.fourDaysOld.length,
          oneDayOldWeight: stockByAge.oneDayOldWeight,
          twoDaysOldWeight: stockByAge.twoDaysOldWeight,
          fourDaysOldWeight: stockByAge.fourDaysOldWeight,
          totalWeight: stockByAge.oneDayOldWeight + stockByAge.twoDaysOldWeight + stockByAge.fourDaysOldWeight
        },
        stockByTransporter,
        inTransitByTransporter,
        deliveredByTransporter
      },
      details: {
        stockByAge,
        inTransitBookings,
        deliveredBookings
      }
    });

  } catch (error) {
    console.error('Error fetching stock exceptions:', error);
    res.status(500).json({ error: 'Failed to fetch stock exceptions' });
  }
});

// Get detailed bookings for specific category
router.get('/details/:category/:ageGroup?', async (req, res) => {
  try {
    const { category, ageGroup } = req.params;
    const { transporterId, godownId } = req.query;
    
    const today = new Date();
    let whereClause = {};

    if (category === 'stock') {
      // Stock bookings (not challaned)
      whereClause = {
        challanGoods: {
          none: {}
        }
      };

      // Add age filter - we'll filter after fetching to match the summary logic
      // This ensures consistency with the summary calculation
    } else if (category === 'in-transit') {
      // In transit bookings
      whereClause = {
        challanGoods: {
          some: {
            challan: {
              status: {
                in: ['Generated', 'Active']
              }
            }
          }
        }
      };
    } else if (category === 'delivered') {
      // Delivered bookings
      whereClause = {
        challanGoods: {
          some: {
            challan: {
              status: {
                in: ['Completed', 'Delivered']
              }
            }
          }
        }
      };
    }

    // Add transporter filter
    if (transporterId) {
      whereClause.transporterId = transporterId;
    }

    // Add godown filter
    if (godownId && godownId !== 'no-godown') {
      whereClause.godownId = godownId;
    } else if (godownId === 'no-godown') {
      whereClause.godownId = null;
    }

    let bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        transporter: {
          select: { name: true, id: true }
        },
        godown: {
          select: { name: true, id: true }
        },
        challanGoods: {
          include: {
            challan: {
              select: { 
                status: true, 
                challanNumber: true,
                createdAt: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'asc'
      }
    });

    // Apply age filter for stock category to match summary logic
    if (category === 'stock' && ageGroup) {
      bookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate);
        const daysDiff = Math.ceil((today - bookingDate) / (1000 * 60 * 60 * 24));
        
        if (ageGroup === 'one-day') {
          return daysDiff <= 1;
        } else if (ageGroup === 'two-days') {
          return daysDiff >= 2 && daysDiff <= 3;
        } else if (ageGroup === 'four-days') {
          return daysDiff >= 4;
        }
        return true;
      });
    }

    res.json(bookings);

  } catch (error) {
    console.error('Error fetching stock details:', error);
    res.status(500).json({ error: 'Failed to fetch stock details' });
  }
});

module.exports = router;
