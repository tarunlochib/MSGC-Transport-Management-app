const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        vehicle: {
          include: {
            transporter: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: req.params.id },
      include: {
        vehicle: {
          include: {
            transporter: true
          }
        }
      }
    });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create expense
router.post('/', async (req, res) => {
  try {
    const { 
      date, 
      expenseType, 
      amount, 
      description, 
      vehicleId, 
      location, 
      receiptNumber, 
      paymentMethod 
    } = req.body;
    
    if (!date || !expenseType || !amount) {
      return res.status(400).json({ error: 'Date, expense type, and amount are required' });
    }
    
    const validExpenseTypes = [
      'fuel', 'toll', 'maintenance', 'insurance', 'mobile_internet', 
      'household', 'emi', 'labour', 'salary', 'office_rent', 'vehicle_rent', 'utilities', 
      'marketing', 'legal', 'travel', 'stationery', 'repairs', 'taxes', 
      'bank_charges', 'gaadi_bhaada', 'misc'
    ];
    if (!validExpenseTypes.includes(expenseType)) {
      return res.status(400).json({ error: 'Invalid expense type' });
    }

    const validPaymentMethods = ['cash', 'card', 'upi', 'net_banking', 'cheque'];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }
    
    const expense = await prisma.expense.create({
      data: {
        date: new Date(date),
        expenseType,
        amount: parseFloat(amount),
        description: description || null,
        vehicleId: vehicleId || null,
        location: location || null,
        receiptNumber: receiptNumber || null,
        paymentMethod: paymentMethod || 'cash'
      },
      include: {
        vehicle: {
          include: {
            transporter: true
          }
        }
      }
    });
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { 
      date, 
      expenseType, 
      amount, 
      description, 
      vehicleId, 
      location, 
      receiptNumber, 
      paymentMethod 
    } = req.body;
    
    if (!date || !expenseType || !amount) {
      return res.status(400).json({ error: 'Date, expense type, and amount are required' });
    }
    
    const validExpenseTypes = [
      'fuel', 'toll', 'maintenance', 'insurance', 'mobile_internet', 
      'household', 'emi', 'labour', 'salary', 'office_rent', 'vehicle_rent', 'utilities', 
      'marketing', 'legal', 'travel', 'stationery', 'repairs', 'taxes', 
      'bank_charges', 'gaadi_bhaada', 'misc'
    ];
    if (!validExpenseTypes.includes(expenseType)) {
      return res.status(400).json({ error: 'Invalid expense type' });
    }

    const validPaymentMethods = ['cash', 'card', 'upi', 'net_banking', 'cheque'];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }
    
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        date: new Date(date),
        expenseType,
        amount: parseFloat(amount),
        description: description || null,
        vehicleId: vehicleId || null,
        location: location || null,
        receiptNumber: receiptNumber || null,
        paymentMethod: paymentMethod || 'cash'
      },
      include: {
        vehicle: {
          include: {
            transporter: true
          }
        }
      }
    });
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    await prisma.expense.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 