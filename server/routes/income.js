const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get income with optional filters. If no page/limit are provided, returns ALL records (no pagination),
// to match behavior of other resources used by the dashboard.
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      paymentMethod, 
      status, 
      startDate, 
      endDate,
      transporterId,
      page,
      limit,
      search
    } = req.query;
    
    const shouldPaginate = page !== undefined || limit !== undefined; // only paginate if explicitly requested
    const pageNum = shouldPaginate ? parseInt(page || 1) : 1;
    const pageLimit = shouldPaginate ? parseInt(limit || 10) : undefined;
    const skip = shouldPaginate ? (pageNum - 1) * pageLimit : undefined;
    
    // Build where clause
    const where = {};
    
    if (category) where.category = category;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (status) where.status = status;
    if (transporterId) where.transporterId = transporterId;
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    if (search) {
      where.OR = [
        { source: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    let income;
    let total;
    if (shouldPaginate) {
      [income, total] = await Promise.all([
        prisma.income.findMany({
          where,
          include: { transporter: true },
          orderBy: { date: 'desc' },
          skip,
          take: pageLimit
        }),
        prisma.income.count({ where })
      ]);
    } else {
      [income, total] = await Promise.all([
        prisma.income.findMany({
          where,
          include: { transporter: true },
          orderBy: { date: 'desc' }
        }),
        prisma.income.count({ where })
      ]);
    }

    res.json({
      data: income,
      pagination: shouldPaginate ? {
        page: pageNum,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit)
      } : {
        page: 1,
        limit: income.length,
        total,
        pages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ error: 'Failed to fetch income' });
  }
});

// Get income by ID
router.get('/:id', async (req, res) => {
  try {
    const income = await prisma.income.findUnique({
      where: { id: req.params.id },
      include: {
        transporter: true
      }
    });
    
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }
    
    res.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ error: 'Failed to fetch income' });
  }
});

// Create new income
router.post('/', async (req, res) => {
  try {
    const {
      date,
      amount,
      source,
      description,
      category,
      paymentMethod,
      referenceNumber,
      status,
      transporterId
    } = req.body;
    
    // Validation
    if (!date || !amount || !source || !category || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Date, amount, source, category, and payment method are required' 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Amount must be greater than 0' 
      });
    }
    
    // If category is "Transporter Credit", transporterId is required
    if (category === 'Transporter Credit' && !transporterId) {
      return res.status(400).json({ 
        error: 'Transporter is required for Transporter Credit category' 
      });
    }
    
    // If transporterId is provided, verify transporter exists
    if (transporterId) {
      const transporter = await prisma.transporter.findUnique({
        where: { id: transporterId }
      });
      
      if (!transporter) {
        return res.status(400).json({ 
          error: 'Invalid transporter selected' 
        });
      }
    }
    
    const income = await prisma.income.create({
      data: {
        date: new Date(date),
        amount: parseFloat(amount),
        source,
        description: description || null,
        category,
        paymentMethod,
        referenceNumber: referenceNumber || null,
        status: status || 'Received',
        transporterId: transporterId || null
      },
      include: {
        transporter: true
      }
    });
    
    res.status(201).json(income);
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ error: 'Failed to create income' });
  }
});

// Update income
router.put('/:id', async (req, res) => {
  try {
    const {
      date,
      amount,
      source,
      description,
      category,
      paymentMethod,
      referenceNumber,
      status,
      transporterId
    } = req.body;
    
    // Validation
    if (!date || !amount || !source || !category || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Date, amount, source, category, and payment method are required' 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Amount must be greater than 0' 
      });
    }
    
    // If category is "Transporter Credit", transporterId is required
    if (category === 'Transporter Credit' && !transporterId) {
      return res.status(400).json({ 
        error: 'Transporter is required for Transporter Credit category' 
      });
    }
    
    // If transporterId is provided, verify transporter exists
    if (transporterId) {
      const transporter = await prisma.transporter.findUnique({
        where: { id: transporterId }
      });
      
      if (!transporter) {
        return res.status(400).json({ 
          error: 'Invalid transporter selected' 
        });
      }
    }
    
    const income = await prisma.income.update({
      where: { id: req.params.id },
      data: {
        date: new Date(date),
        amount: parseFloat(amount),
        source,
        description: description || null,
        category,
        paymentMethod,
        referenceNumber: referenceNumber || null,
        status: status || 'Received',
        transporterId: transporterId || null
      },
      include: {
        transporter: true
      }
    });
    
    res.json(income);
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ error: 'Failed to update income' });
  }
});

// Delete income
router.delete('/:id', async (req, res) => {
  try {
    await prisma.income.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ error: 'Failed to delete income' });
  }
});

// Get income statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    const [
      totalIncome,
      incomeByCategory,
      incomeByPaymentMethod,
      incomeByStatus,
      recentIncome
    ] = await Promise.all([
      // Total income
      prisma.income.aggregate({
        where,
        _sum: { amount: true },
        _count: true
      }),
      
      // Income by category
      prisma.income.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
        _count: true
      }),
      
      // Income by payment method
      prisma.income.groupBy({
        by: ['paymentMethod'],
        where,
        _sum: { amount: true },
        _count: true
      }),
      
      // Income by status
      prisma.income.groupBy({
        by: ['status'],
        where,
        _sum: { amount: true },
        _count: true
      }),
      
      // Recent income (last 10)
      prisma.income.findMany({
        where,
        include: {
          transporter: true
        },
        orderBy: { date: 'desc' },
        take: 10
      })
    ]);
    
    res.json({
      totalIncome: totalIncome._sum.amount || 0,
      totalCount: totalIncome._count,
      incomeByCategory,
      incomeByPaymentMethod,
      incomeByStatus,
      recentIncome
    });
  } catch (error) {
    console.error('Error fetching income statistics:', error);
    res.status(500).json({ error: 'Failed to fetch income statistics' });
  }
});

module.exports = router;
