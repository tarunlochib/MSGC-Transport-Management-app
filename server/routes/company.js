const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/company - Get company profile
router.get('/', async (req, res) => {
  try {
    const company = await prisma.company.findFirst();
    
    if (!company) {
      // Create default company if none exists
      const defaultCompany = await prisma.company.create({
        data: {
          name: 'MSGC Transport Management',
          address: 'Your Company Address',
          city: 'Your City',
          state: 'Your State',
          phone: 'Your Phone Number',
          email: 'your@email.com',
          gstNumber: 'Your GST Number',
          panNumber: 'Your PAN Number'
        }
      });
      return res.json(defaultCompany);
    }
    
    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
});

// PUT /api/company - Update company profile
router.put('/', async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      gstNumber,
      panNumber,
      website,
      logo,
      bankName,
      bankAccount,
      ifscCode,
      termsAndConditions,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({ error: 'Company name and address are required' });
    }

    // Check if company exists
    const existingCompany = await prisma.company.findFirst();
    
    let company;
    if (existingCompany) {
      // Update existing company
      company = await prisma.company.update({
        where: { id: existingCompany.id },
        data: {
          name,
          address,
          city,
          state,
          pincode,
          phone,
          email,
          gstNumber,
          panNumber,
          website,
          logo,
          bankName,
          bankAccount,
          ifscCode,
          termsAndConditions,
          notes
        }
      });
    } else {
      // Create new company
      company = await prisma.company.create({
        data: {
          name,
          address,
          city,
          state,
          pincode,
          phone,
          email,
          gstNumber,
          panNumber,
          website,
          logo,
          bankName,
          bankAccount,
          ifscCode,
          termsAndConditions,
          notes
        }
      });
    }

    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company profile' });
  }
});

module.exports = router;