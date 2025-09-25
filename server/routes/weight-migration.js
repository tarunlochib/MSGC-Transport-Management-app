const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Migration endpoint to clean up weight values
router.post('/cleanup-weights', async (req, res) => {
  try {
    console.log('Starting weight cleanup migration...');
    
    // Get all bookings with weight values
    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        weightKg: true
      }
    });

    let updatedCount = 0;
    let skippedCount = 0;

    for (const booking of bookings) {
      if (booking.weightKg !== null && booking.weightKg !== undefined) {
        // Convert all weight values to whole numbers (round to nearest integer)
        const weight = Math.round(parseFloat(booking.weightKg));
        
        // Update to whole number
        await prisma.booking.update({
          where: { id: booking.id },
          data: { weightKg: weight }
        });
        updatedCount++;
        console.log(`Updated booking ${booking.id}: ${booking.weightKg} → ${weight}`);
      } else {
        skippedCount++;
      }
    }

    // Also clean up package weights
    const packages = await prisma.package.findMany({
      select: {
        id: true,
        weightKg: true
      }
    });

    let packageUpdatedCount = 0;
    let packageSkippedCount = 0;

    for (const pkg of packages) {
      if (pkg.weightKg !== null && pkg.weightKg !== undefined) {
        // Convert all weight values to whole numbers (round to nearest integer)
        const weight = Math.round(parseFloat(pkg.weightKg));
        
        await prisma.package.update({
          where: { id: pkg.id },
          data: { weightKg: weight }
        });
        packageUpdatedCount++;
        console.log(`Updated package ${pkg.id}: ${pkg.weightKg} → ${weight}`);
      } else {
        packageSkippedCount++;
      }
    }

    res.json({
      message: 'Weight cleanup completed successfully',
      summary: {
        bookings: {
          total: bookings.length,
          updated: updatedCount,
          skipped: skippedCount
        },
        packages: {
          total: packages.length,
          updated: packageUpdatedCount,
          skipped: packageSkippedCount
        }
      }
    });

  } catch (error) {
    console.error('Error during weight cleanup:', error);
    res.status(500).json({ error: 'Failed to cleanup weights' });
  }
});

// Migration endpoint to clean up income and booking charge values
router.post('/cleanup-charges', async (req, res) => {
  try {
    console.log('Starting charges cleanup migration...');
    
    // Get all bookings with totalCharges values
    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        totalCharges: true,
        freightCharges: true,
        localCartageCharges: true,
        doorDeliveryCharges: true,
        stationaryCharges: true,
        labourCharges: true,
        otherCharges: true
      }
    });

    let bookingUpdatedCount = 0;
    let bookingSkippedCount = 0;

    for (const booking of bookings) {
      // Calculate what the total charges should be (rounded)
      const freight = parseFloat(booking.freightCharges) || 0;
      const localCartage = parseFloat(booking.localCartageCharges) || 0;
      const doorDelivery = parseFloat(booking.doorDeliveryCharges) || 0;
      const stationary = parseFloat(booking.stationaryCharges) || 0;
      const labour = parseFloat(booking.labourCharges) || 0;
      const other = parseFloat(booking.otherCharges) || 0;
      
      const calculatedTotal = Math.round(freight + localCartage + doorDelivery + stationary + labour + other);
      const currentTotal = parseFloat(booking.totalCharges) || 0;
      
      // Only update if the calculated total is different from current total
      if (Math.abs(calculatedTotal - currentTotal) > 0.01) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { totalCharges: calculatedTotal }
        });
        bookingUpdatedCount++;
        console.log(`Updated booking ${booking.id}: totalCharges ${currentTotal} → ${calculatedTotal}`);
      } else {
        bookingSkippedCount++;
      }
    }

    // Get all income entries with amount values
    const incomeEntries = await prisma.income.findMany({
      select: {
        id: true,
        amount: true,
        category: true
      }
    });

    let incomeUpdatedCount = 0;
    let incomeSkippedCount = 0;

    for (const income of incomeEntries) {
      if (income.amount !== null && income.amount !== undefined) {
        const currentAmount = parseFloat(income.amount);
        const roundedAmount = Math.round(currentAmount);
        
        // Only update if the rounded amount is different from current amount
        if (Math.abs(roundedAmount - currentAmount) > 0.01) {
          await prisma.income.update({
            where: { id: income.id },
            data: { amount: roundedAmount }
          });
          incomeUpdatedCount++;
          console.log(`Updated income ${income.id}: ${currentAmount} → ${roundedAmount} (${income.category})`);
        } else {
          incomeSkippedCount++;
        }
      } else {
        incomeSkippedCount++;
      }
    }

    res.json({
      message: 'Charges cleanup completed successfully',
      summary: {
        bookings: {
          total: bookings.length,
          updated: bookingUpdatedCount,
          skipped: bookingSkippedCount
        },
        income: {
          total: incomeEntries.length,
          updated: incomeUpdatedCount,
          skipped: incomeSkippedCount
        }
      }
    });

  } catch (error) {
    console.error('Error during charges cleanup:', error);
    res.status(500).json({ error: 'Failed to cleanup charges' });
  }
});

module.exports = router;
