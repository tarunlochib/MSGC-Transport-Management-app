const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: {
            consigneeBookings: true,
            consignorBookings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        consigneeBookings: {
          include: {
            transporter: true,
            driver: true,
            vehicle: true
          },
          orderBy: {
            bookingDate: 'desc'
          }
        },
        consignorBookings: {
          include: {
            transporter: true,
            driver: true,
            vehicle: true
          },
          orderBy: {
            bookingDate: 'desc'
          }
        }
      }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Get customer by GST number
router.get('/gst/:gstNumber', async (req, res) => {
  try {
    // For URP, we don't want to find by GST number since multiple customers can have URP
    if (req.params.gstNumber.toUpperCase() === 'URP') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customer = await prisma.customer.findFirst({
      where: { gstNumber: req.params.gstNumber }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer by GST:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      address, 
      gstNumber, 
      panNumber,
      phone, 
      email, 
      contactPerson, 
      alternatePhone, 
      customerType, 
      creditLimit, 
      paymentTerms, 
      status, 
      notes 
    } = req.body;
    
    // Check if GST number already exists (only if not URP)
    if (gstNumber && gstNumber.toUpperCase() !== 'URP') {
      const existingCustomer = await prisma.customer.findFirst({
        where: { gstNumber }
      });
      
      if (existingCustomer) {
        return res.status(400).json({ error: 'Customer with this GST number already exists' });
      }
    }
    
    // Check if PAN number already exists (when GST is URP)
    if (gstNumber && gstNumber.toUpperCase() === 'URP' && panNumber) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { 
          panNumber: panNumber.toUpperCase(),
          gstNumber: 'URP'
        }
      });
      
      if (existingCustomer) {
        return res.status(400).json({ error: 'Customer with this PAN number already exists' });
      }
    }
    
    const customer = await prisma.customer.create({
      data: {
        name,
        address,
        gstNumber,
        panNumber: panNumber || null,
        phone: phone || null,
        email: email || null,
        contactPerson: contactPerson || null,
        alternatePhone: alternatePhone || null,
        customerType: customerType || 'Regular',
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
        paymentTerms: paymentTerms || null,
        status: status || 'Active',
        notes: notes || null
      }
    });
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { 
      name, 
      address, 
      gstNumber, 
      panNumber,
      phone, 
      email, 
      contactPerson, 
      alternatePhone, 
      customerType, 
      creditLimit, 
      paymentTerms, 
      status, 
      notes 
    } = req.body;
    
    // Check if GST number already exists for another customer (only if not URP)
    if (gstNumber && gstNumber.toUpperCase() !== 'URP') {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          gstNumber,
          id: { not: req.params.id }
        }
      });
      
      if (existingCustomer) {
        return res.status(400).json({ error: 'Customer with this GST number already exists' });
      }
    }
    
    // Check if PAN number already exists for another customer (when GST is URP)
    if (gstNumber && gstNumber.toUpperCase() === 'URP' && panNumber) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          panNumber: panNumber.toUpperCase(),
          gstNumber: 'URP',
          id: { not: req.params.id }
        }
      });
      
      if (existingCustomer) {
        return res.status(400).json({ error: 'Customer with this PAN number already exists' });
      }
    }
    
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        name,
        address,
        gstNumber,
        panNumber: panNumber || null,
        phone: phone || null,
        email: email || null,
        contactPerson: contactPerson || null,
        alternatePhone: alternatePhone || null,
        customerType: customerType || 'Regular',
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
        paymentTerms: paymentTerms || null,
        status: status || 'Active',
        notes: notes || null
      }
    });
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router; 